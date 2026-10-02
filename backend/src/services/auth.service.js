const crypto = require('crypto');
const { pool } = require('../config/db');
const { getJwtSecret, getTokenTtlSeconds } = require('../config/security');
const passwords = require('./password.service');
const { resolveGroups } = require('../security/permissions');

const httpError = (status, message, code) => Object.assign(new Error(message), { status, ...(code ? { code } : {}) });
const badRequest = (message, code) => httpError(400, message, code);
const unauthorized = (message, code = 'TOKEN_INVALID') => httpError(401, message, code);
const forbidden = (message, code = 'FORBIDDEN') => httpError(403, message, code);

const INVALID_CREDENTIALS = 'Usuario o contraseña incorrectos';

const trimString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toBase64Url = (buffer) => buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const base64Url = (value) => toBase64Url(Buffer.from(JSON.stringify(value)));

const decodeBase64Url = (value) => {
  const padded = String(value).replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
};

const hmac = (encoded) => toBase64Url(crypto.createHmac('sha256', getJwtSecret()).update(encoded).digest());

// Formato compatible con el frontend actual: <payload base64url>.<firma HMAC-SHA256>
function sign(payload) {
  const encoded = base64Url(payload);
  return `${encoded}.${hmac(encoded)}`;
}

function verifyToken(token) {
  const parts = String(token || '').split('.');
  if (!token) throw unauthorized('Sesión requerida', 'TOKEN_MISSING');
  const [encoded, signature] = parts;
  if (parts.length !== 2 || !encoded || !signature) throw unauthorized('Token invalido', 'TOKEN_INVALID');

  const expected = hmac(encoded);
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    throw unauthorized('Token invalido', 'TOKEN_INVALID');
  }

  let payload;
  try { payload = decodeBase64Url(encoded); } catch (_) { throw unauthorized('Token invalido', 'TOKEN_INVALID'); }
  if (!payload || typeof payload !== 'object' || !payload.exp) throw unauthorized('Token invalido', 'TOKEN_INVALID');
  if (Number(payload.exp) < Math.floor(Date.now() / 1000)) throw unauthorized('Token expirado', 'TOKEN_EXPIRED');
  if (payload.typ && payload.typ !== 'empleado') throw unauthorized('Token invalido', 'TOKEN_INVALID');
  return payload;
}

let areasCache = { at: 0, rows: [] };
async function getAreas() {
  if (Date.now() - areasCache.at < 60_000) return areasCache.rows;
  const { rows } = await pool.query(
    `SELECT id_area, clave, nombre
     FROM public.catalogo_areas
     WHERE activo = true
     ORDER BY id_area`
  );
  areasCache = { at: Date.now(), rows };
  return rows;
}

async function resolveArea(areaValue) {
  const normalized = normalizeText(areaValue);
  if (!normalized) return { id_area: null, area: null };
  const rows = await getAreas();
  const area = rows.find((row) => normalizeText(row.clave) === normalized || normalizeText(row.nombre) === normalized)
    || rows.find((row) => normalized.includes(normalizeText(row.clave)) || normalized.includes(normalizeText(row.nombre)));

  return {
    id_area: area?.id_area || null,
    area: area?.clave || trimString(areaValue),
  };
}

async function buildSessionUser(empleado) {
  const area = await resolveArea(empleado.area);
  const rol = trimString(empleado.rol) || area.area || 'Empleado';

  const user = {
    id_usuario: empleado.id_empleado,
    id_empleado: empleado.id_empleado,
    nombre: trimString(empleado.nombre) || '',
    apellidos: trimString(empleado.apellidos) || '',
    correo: trimString(empleado.correo) || '',
    email: trimString(empleado.correo) || '',
    rol,
    role: rol,
    roles: [rol].filter(Boolean),
    area: area.area || trimString(empleado.area) || '',
    id_area: area.id_area,
    debe_cambiar_password: Boolean(empleado.debe_cambiar_password),
  };
  user.grupos = resolveGroups(user);
  return user;
}

const credentialsMigrationMissing = (error) => error && error.code === '42703';

async function queryEmpleado(whereSql, value) {
  try {
    const { rows } = await pool.query(
      `SELECT id_empleado, nombre, apellidos, correo, area, rol, activo,
              password_hash, password_actualizado_en, debe_cambiar_password
       FROM public.empleados
       WHERE ${whereSql}
       LIMIT 1`,
      [value]
    );
    return rows[0] || null;
  } catch (error) {
    if (credentialsMigrationMissing(error)) {
      throw httpError(503, 'Falta aplicar la migración de credenciales (sql/2026_10_02_auth_credenciales.sql)', 'AUTH_MIGRATION_PENDING');
    }
    throw error;
  }
}

const findEmpleadoByEmail = (email) => queryEmpleado('lower(correo) = lower($1)', email);
const findEmpleadoById = (id) => queryEmpleado('id_empleado = $1', id);

// Versión de contraseña (ms). Va dentro del token; si cambia, el token queda revocado.
const passwordVersion = (empleado) => {
  const value = empleado.password_actualizado_en ? new Date(empleado.password_actualizado_en).getTime() : 0;
  return Number.isFinite(value) ? value : 0;
};

function issueToken(empleado, user) {
  const now = Math.floor(Date.now() / 1000);
  return sign({
    typ: 'empleado',
    sub: user.id_empleado,
    id_empleado: user.id_empleado,
    email: user.email,
    rol: user.rol,
    pwv: passwordVersion(empleado),
    jti: crypto.randomBytes(8).toString('hex'),
    iat: now,
    exp: now + getTokenTtlSeconds(),
  });
}

async function login(payload = {}) {
  const email = trimString(payload.email || payload.correo);
  const password = typeof payload.password === 'string' ? payload.password : null;

  if (!email || !password) throw badRequest('Email y password son requeridos');
  if (email.length > 254 || password.length > 256) throw unauthorized(INVALID_CREDENTIALS, 'INVALID_CREDENTIALS');

  const empleado = await findEmpleadoByEmail(email);
  // Siempre se ejecuta la verificación (con hash ficticio si no existe) para no filtrar
  // por tiempo de respuesta qué correos están dados de alta.
  const valid = await passwords.verifyPassword(password, empleado?.password_hash || null);

  if (!empleado || !empleado.password_hash || !valid) {
    throw unauthorized(INVALID_CREDENTIALS, 'INVALID_CREDENTIALS');
  }
  if (empleado.activo === false) throw forbidden('Empleado inactivo', 'EMPLOYEE_INACTIVE');

  const user = await buildSessionUser(empleado);
  const token = issueToken(empleado, user);

  pool.query('UPDATE public.empleados SET ultimo_login_en = NOW() WHERE id_empleado = $1', [empleado.id_empleado])
    .catch(() => null);

  return {
    message: 'Login exitoso',
    token,
    user,
    debe_cambiar_password: user.debe_cambiar_password,
  };
}

const extractBearer = (authHeader) => {
  const value = String(authHeader || '').trim();
  if (!value) return '';
  return /^Bearer\s+/i.test(value) ? value.replace(/^Bearer\s+/i, '').trim() : value;
};

/** Valida el token y recarga al empleado (estado activo, rol y área vigentes). */
async function verify(authHeader) {
  const payload = verifyToken(extractBearer(authHeader));
  const idEmpleado = Number(payload.id_empleado || payload.sub);
  if (!Number.isInteger(idEmpleado) || idEmpleado <= 0) throw unauthorized('Token invalido', 'TOKEN_INVALID');

  const empleado = await findEmpleadoById(idEmpleado);
  if (!empleado) throw unauthorized('Usuario no encontrado', 'TOKEN_INVALID');
  if (empleado.activo === false) throw forbidden('Empleado inactivo', 'EMPLOYEE_INACTIVE');
  if (!empleado.password_hash) throw unauthorized('Sesión revocada', 'TOKEN_REVOKED');
  // Cambiar o restablecer la contraseña invalida todas las sesiones anteriores.
  if (Number(payload.pwv || 0) !== passwordVersion(empleado)) throw unauthorized('Sesión revocada', 'TOKEN_REVOKED');

  return {
    message: 'Token valido',
    user: await buildSessionUser(empleado),
  };
}

async function setPassword(idEmpleado, newPassword, { mustChange = false } = {}) {
  const hash = await passwords.hashPassword(newPassword);
  const { rows } = await pool.query(
    `UPDATE public.empleados
     SET password_hash = $2,
         -- Siempre avanza (al menos 1 ms) para que la versión de contraseña cambie y revoque sesiones.
         password_actualizado_en = GREATEST(
           date_trunc('milliseconds', clock_timestamp()),
           COALESCE(date_trunc('milliseconds', password_actualizado_en), '-infinity'::timestamptz) + interval '1 millisecond'
         ),
         debe_cambiar_password = $3
     WHERE id_empleado = $1
     RETURNING id_empleado, nombre, apellidos, correo, area, rol, activo,
               password_hash, password_actualizado_en, debe_cambiar_password`,
    [idEmpleado, hash, Boolean(mustChange)]
  );
  return rows[0] || null;
}

async function changePassword(sessionUser, payload = {}) {
  const currentPassword = typeof payload.password_actual === 'string' ? payload.password_actual : payload.currentPassword;
  const newPassword = typeof payload.password_nueva === 'string' ? payload.password_nueva : payload.newPassword;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    throw badRequest('password_actual y password_nueva son requeridos');
  }

  const empleado = await findEmpleadoById(sessionUser.id_empleado);
  if (!empleado || !(await passwords.verifyPassword(currentPassword, empleado.password_hash))) {
    throw httpError(400, 'La contraseña actual no es correcta', 'INVALID_CURRENT_PASSWORD');
  }
  if (currentPassword === newPassword) throw badRequest('La nueva contraseña debe ser distinta de la actual');
  const policyError = passwords.validatePasswordPolicy(newPassword, { email: empleado.correo });
  if (policyError) throw badRequest(policyError, 'WEAK_PASSWORD');

  const updated = await setPassword(empleado.id_empleado, newPassword, { mustChange: false });
  const user = await buildSessionUser(updated);
  return { message: 'Contraseña actualizada', token: issueToken(updated, user), user };
}

module.exports = {
  login,
  verify,
  verifyToken,
  changePassword,
  setPassword,
  findEmpleadoByEmail,
  buildSessionUser,
  tokenMetadata: {
    algorithm: 'HMAC-SHA256',
    format: 'payload.signature',
    secretSource: 'JWT_SECRET (obligatorio, sin respaldo)',
  },
  __test: { sign, extractBearer, passwordVersion, resetAreasCache: () => { areasCache = { at: 0, rows: [] }; } },
};
