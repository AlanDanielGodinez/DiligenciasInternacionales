const crypto = require('crypto');
const { pool } = require('../config/db');

const TOKEN_SECRET = process.env.JWT_SECRET || process.env.AUTH_TOKEN_SECRET || 'diligencias-local-session-secret';

const badRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const unauthorized = (message, code = 'TOKEN_INVALID') => {
  const error = new Error(message);
  error.status = 401;
  error.code = code;
  return error;
};

const forbidden = (message) => {
  const error = new Error(message);
  error.status = 403;
  return error;
};

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

const base64Url = (value) =>
  Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const decodeBase64Url = (value) => {
  const padded = String(value).replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
};

function sign(payload) {
  const encoded = base64Url(payload);
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encoded)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  const [encoded, signature] = String(token || '').split('.');
  if (!encoded || !signature) throw unauthorized('Token invalido', token ? 'TOKEN_INVALID' : 'TOKEN_MISSING');

  const expected = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encoded)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    throw unauthorized('Token invalido', 'TOKEN_INVALID');
  }

  const payload = decodeBase64Url(encoded);
  if (payload.exp && Number(payload.exp) < Math.floor(Date.now() / 1000)) {
    throw unauthorized('Token expirado', 'TOKEN_EXPIRED');
  }
  return payload;
}

async function resolveArea(areaValue) {
  const normalized = normalizeText(areaValue);
  if (!normalized) return { id_area: null, area: null };

  const { rows } = await pool.query(
    `SELECT id_area, clave, nombre
     FROM public.catalogo_areas
     WHERE activo = true
     ORDER BY id_area`
  );

  const area = rows.find((row) =>
    normalizeText(row.clave) === normalized ||
    normalizeText(row.nombre) === normalized ||
    normalized.includes(normalizeText(row.clave)) ||
    normalized.includes(normalizeText(row.nombre))
  );

  return {
    id_area: area?.id_area || null,
    area: area?.clave || trimString(areaValue),
  };
}

async function buildSessionUser(empleado) {
  const area = await resolveArea(empleado.area);
  const rol = trimString(empleado.rol) || area.area || 'Empleado';

  return {
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
  };
}

async function findEmpleadoByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id_empleado, nombre, apellidos, correo, area, rol, activo
     FROM public.empleados
     WHERE lower(correo) = lower($1)
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function login(payload = {}) {
  const email = trimString(payload.email || payload.correo);
  const password = trimString(payload.password);

  if (!email || !password) throw badRequest('Email y password son requeridos');

  const empleado = await findEmpleadoByEmail(email);
  if (!empleado) throw unauthorized('Usuario o contraseña incorrectos');
  if (empleado.activo === false) throw forbidden('Empleado inactivo');

  const user = await buildSessionUser(empleado);
  const now = Math.floor(Date.now() / 1000);
  const token = sign({
    sub: user.id_usuario,
    id_empleado: user.id_empleado,
    email: user.email,
    rol: user.rol,
    iat: now,
    exp: now + (24 * 60 * 60),
  });

  return {
    message: 'Login exitoso',
    token,
    user,
    auth_warning: 'PostgreSQL no tiene tabla de credenciales; se normalizo la sesion contra empleados.',
  };
}

async function verify(authHeader) {
  const token = String(authHeader || '').startsWith('Bearer ')
    ? String(authHeader).slice(7)
    : authHeader;
  const payload = verifyToken(token);
  const empleado = await findEmpleadoByEmail(payload.email);
  if (!empleado) throw unauthorized('Usuario no encontrado');
  if (empleado.activo === false) throw forbidden('Empleado inactivo');

  return {
    message: 'Token valido',
    user: await buildSessionUser(empleado),
  };
}

module.exports = {
  login,
  verify,
  tokenMetadata: {
    algorithm: 'HMAC-SHA256',
    format: 'payload.signature',
    secretSource: process.env.JWT_SECRET ? 'JWT_SECRET'
      : process.env.AUTH_TOKEN_SECRET ? 'AUTH_TOKEN_SECRET'
        : 'development fallback',
  },
};
