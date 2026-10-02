/**
 * Autenticación por defecto para toda la API y autorización por permisos.
 *
 * - `authenticateApi` se monta en /api: TODA ruta exige sesión salvo la lista pública explícita.
 * - `requirePermission('pagos.validar')` restringe por área/rol (ver security/permissions.js).
 * - `bindActor` hace que los campos de autoría (id_empleado, validado_por, registrado_por,
 *   subido_por) se tomen de la sesión y no del cuerpo de la petición.
 */
const authService = require('../services/auth.service');
const { hasPermission } = require('../security/permissions');
const { registrarAcceso } = require('../services/auditoria.service');

/** Rutas públicas (método + ruta exacta, relativas a /api). Mantener esta lista mínima. */
const PUBLIC_ROUTES = Object.freeze([
  { method: 'POST', path: '/auth/login' },
  { method: 'POST', path: '/auth/cliente-login' }, // responde 501 hasta implementar el portal cliente
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/noticias-migratorias' }, // noticias oficiales públicas para la landing (sin datos de clientes)
  { method: 'GET', path: '/integraciones/quickbooks/callback' }, // OAuth de Intuit; validado por `state`
]);

const normalizePath = (path) => {
  const trimmed = String(path || '').replace(/\/+$/, '');
  return trimmed || '/';
};

function isPublicRoute(method, path) {
  const safePath = normalizePath(path);
  const safeMethod = method === 'HEAD' ? 'GET' : method;
  return PUBLIC_ROUTES.some((route) => route.method === safeMethod && route.path === safePath);
}

function sendAuthError(res, error) {
  const status = error.status === 403 || error.status >= 500 ? error.status : 401;
  return res.status(status).json({
    error: { code: error.code || 'TOKEN_INVALID', message: error.message || 'No autorizado' },
  });
}

async function requireAuth(req, res, next) {
  if (req.user) return next();
  try {
    const { user } = await authService.verify(req.headers.authorization || '');
    req.user = user;
    return next();
  } catch (error) {
    // Errores esperados (401/403/503 de migración pendiente) se responden aquí; los inesperados van al errorHandler.
    if (error && error.status) return sendAuthError(res, error);
    return next(error);
  }
}

// Con contraseña temporal sólo se permite consultar la sesión y cambiar la contraseña.
const PASSWORD_CHANGE_ALLOWED = new Set(['GET /auth/verify', 'GET /auth/me', 'POST /auth/cambiar-password']);

function authenticateApi(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  if (isPublicRoute(req.method, req.path)) return next();
  return requireAuth(req, res, (error) => {
    if (error) return next(error);
    if (req.user?.debe_cambiar_password && !PASSWORD_CHANGE_ALLOWED.has(`${req.method} ${normalizePath(req.path)}`)) {
      return res.status(403).json({
        error: { code: 'PASSWORD_CHANGE_REQUIRED', message: 'Debe cambiar su contraseña temporal antes de continuar' },
      });
    }
    return next();
  });
}

function requirePermission(permission) {
  // Falla al cargar el módulo si el permiso no existe (evita errores tipográficos silenciosos).
  hasPermission({ grupos: [] }, permission);
  return function permissionGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'TOKEN_MISSING', message: 'Sesión requerida' } });
    }
    if (hasPermission(req.user, permission)) return next();
    registrarAcceso({
      evento: 'PERMISO_DENEGADO',
      idEmpleado: req.user.id_empleado,
      correo: req.user.email,
      req,
      recurso: `${req.method} ${req.originalUrl}`.slice(0, 500),
      detalle: { permiso: permission, grupos: req.user.grupos },
      exito: false,
    });
    return res.status(403).json({
      error: { code: 'INSUFFICIENT_PERMISSION', message: 'Su área o rol no tiene permiso para esta acción', permiso: permission },
    });
  };
}

/** Aplica el permiso sólo a métodos de escritura (POST/PUT/PATCH/DELETE). */
function requirePermissionForWrites(permission) {
  const guard = requirePermission(permission);
  return (req, res, next) => (['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? next() : guard(req, res, next));
}

const ACTOR_FIELDS = ['id_empleado', 'validado_por', 'registrado_por', 'subido_por'];

function bindActor(req, res, next) {
  if (!req.user || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    for (const field of ACTOR_FIELDS) req.body[field] = req.user.id_empleado;
  }
  return next();
}

module.exports = {
  PUBLIC_ROUTES,
  isPublicRoute,
  authenticateApi,
  requireAuth,
  requirePermission,
  requirePermissionForWrites,
  bindActor,
};
