/**
 * Arnés para pruebas de autenticación/autorización sin base de datos real.
 * Sustituye src/config/db por un pool falso ANTES de cargar la app.
 */
process.env.JWT_SECRET = process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
  ? process.env.JWT_SECRET
  : 'test-secret-only-for-node-test-0123456789abcdef';
process.env.NODE_ENV = 'test';
delete process.env.DOCUMENT_ACCESS_POLICY;

const path = require('node:path');

const AREAS = [
  { id_area: 1, clave: 'INFORMES', nombre: 'Informes' },
  { id_area: 2, clave: 'PAGOS', nombre: 'Finanzas / Pagos' },
  { id_area: 3, clave: 'INDIVIDUALES', nombre: 'Individuales' },
  { id_area: 4, clave: 'AMA', nombre: 'AMA' },
  { id_area: 5, clave: 'LEGALES', nombre: 'Legales' },
  { id_area: 6, clave: 'PROTOCOLO', nombre: 'Protocolo' },
  { id_area: 7, clave: 'NEGADOS', nombre: 'Negados' },
  { id_area: 8, clave: 'LOGISTICA', nombre: 'Logística' },
  { id_area: 12, clave: 'ADMIN', nombre: 'Administración' },
];

const state = {
  empleados: new Map(), // id -> row
  queries: [],
  documentAccess: () => false,
  solicitudAccess: () => false,
  documentos: new Map(),
  audit: [],
  override: null, // (sql, params) => result | undefined
};

const result = (rows = []) => ({ rows, rowCount: rows.length });

async function query(sql, params = []) {
  const text = String(sql);
  state.queries.push({ sql: text, params });
  if (state.override) {
    const overridden = await state.override(text, params);
    if (overridden !== undefined) return overridden;
  }
  if (/FROM public\.catalogo_areas/i.test(text) && /WHERE activo = true/i.test(text)) return result(AREAS);
  if (/FROM public\.empleados/i.test(text) && /lower\(correo\) = lower\(\$1\)/i.test(text)) {
    const email = String(params[0]).toLowerCase();
    return result([...state.empleados.values()].filter((e) => String(e.correo).toLowerCase() === email).slice(0, 1));
  }
  if (/FROM public\.empleados/i.test(text) && /WHERE id_empleado = \$1/i.test(text)) {
    const row = state.empleados.get(Number(params[0]));
    return result(row ? [row] : []);
  }
  if (/UPDATE public\.empleados\s+SET password_hash/i.test(text)) {
    const row = state.empleados.get(Number(params[0]));
    if (!row) return result([]);
    const previous = row.password_actualizado_en ? row.password_actualizado_en.getTime() : 0;
    row.password_hash = params[1];
    row.password_actualizado_en = new Date(Math.max(Date.now(), previous + 1000) + 1000);
    row.debe_cambiar_password = params[2];
    return result([row]);
  }
  if (/UPDATE public\.empleados SET ultimo_login_en/i.test(text)) return result([]);
  if (/INSERT INTO public\.auditoria_accesos/i.test(text)) {
    state.audit.push({ evento: params[0], id_empleado: params[1], exito: params[3], recurso: params[4] });
    return result([]);
  }
  if (/FROM public\.documentos d\s+LEFT JOIN public\.solicitudes s/i.test(text) && /id_documento_comprobante/i.test(text)) {
    return result(state.documentAccess(params) ? [{ '?column?': 1 }] : []);
  }
  if (/FROM public\.solicitudes s\s+LEFT JOIN public\.catalogo_areas ca/i.test(text)) {
    return result(state.solicitudAccess(params) ? [{ '?column?': 1 }] : []);
  }
  if (/FROM public\.documentos\s+WHERE id_documento = \$1/i.test(text)) {
    const doc = state.documentos.get(Number(params[0]));
    return result(doc ? [doc] : []);
  }
  return result([]);
}

const fakePool = {
  query,
  connect: async () => ({ query, release: () => {} }),
  on: () => {},
  end: async () => {},
};

const dbPath = path.resolve(__dirname, '../../src/config/db.js');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { pool: fakePool } };

const passwords = require('../../src/services/password.service');
const authService = require('../../src/services/auth.service');

let nextId = 100;
async function addEmpleado({ password = 'ClaveSegura2026', ...fields } = {}) {
  const id = fields.id_empleado || nextId++;
  const row = {
    id_empleado: id,
    nombre: 'Prueba',
    apellidos: 'Empleado',
    correo: `empleado${id}@example.test`,
    area: 'INFORMES',
    rol: null,
    activo: true,
    password_hash: password ? await passwords.hashPassword(password) : null,
    password_actualizado_en: new Date('2026-10-01T00:00:00Z'),
    debe_cambiar_password: false,
    ...fields,
  };
  state.empleados.set(id, row);
  return row;
}

function tokenFor(empleado, overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return authService.__test.sign({
    typ: 'empleado',
    sub: empleado.id_empleado,
    id_empleado: empleado.id_empleado,
    email: empleado.correo,
    pwv: authService.__test.passwordVersion(empleado),
    iat: now,
    exp: now + 3600,
    ...overrides,
  });
}

function reset() {
  state.empleados.clear();
  state.queries.length = 0;
  state.audit.length = 0;
  state.documentos.clear();
  state.documentAccess = () => false;
  state.solicitudAccess = () => false;
  state.override = null;
  authService.__test.resetAreasCache();
}

module.exports = { state, fakePool, addEmpleado, tokenFor, reset, AREAS };
