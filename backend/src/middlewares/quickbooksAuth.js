const authService = require('../services/auth.service');

const normalizeText = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();

const normalizeRole = (value) => {
  const role = normalizeText(value);
  if (['ADMIN', 'ADMINISTRADOR', 'AUDITORIA', 'DIRECCION', 'CONFIGURACION'].includes(role)) return 'ADMIN';
  if (['INFORMES', 'COORDINADOR DE INFORMES', 'AUXILIAR DE INFORMES'].includes(role)) return 'INFORMES';
  return role;
};

const rejectAuth = (res, error) => res.status(error.status || 401).json({
  error: { code: error.code || 'TOKEN_INVALID', message: error.message || 'No autorizado' },
});

async function requireQuickBooksAccess(req, res, next) {
  try {
    const result = await authService.verify(req.headers.authorization || '');
    const role = normalizeRole(result.user?.rol || result.user?.role);
    if (!['ADMIN', 'INFORMES'].includes(role)) return res.status(403).json({
      error: { code: 'INSUFFICIENT_ROLE', message: 'No autorizado para administrar QuickBooks' },
    });
    req.user = result.user;
    return next();
  } catch (error) { return rejectAuth(res, error); }
}

async function requireQuickBooksAdmin(req, res, next) {
  try {
    const result = await authService.verify(req.headers.authorization || '');
    const role = normalizeRole(result.user?.rol || result.user?.role);
    if (role !== 'ADMIN') return res.status(403).json({
      error: { code: 'INSUFFICIENT_ROLE', message: 'Solo un administrador puede gestionar la conexion de QuickBooks' },
    });
    req.user = result.user;
    return next();
  } catch (error) { return rejectAuth(res, error); }
}

module.exports = { normalizeRole, requireQuickBooksAccess, requireQuickBooksAdmin };
