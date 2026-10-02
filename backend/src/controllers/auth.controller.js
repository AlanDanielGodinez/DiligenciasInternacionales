const service = require('../services/auth.service');
const { registrarAcceso } = require('../services/auditoria.service');

exports.login = async (req, res, next) => {
  const correo = String(req.body?.email || req.body?.correo || '').trim().toLowerCase().slice(0, 254) || null;
  try {
    const result = await service.login(req.body || {});
    registrarAcceso({ evento: 'LOGIN_OK', idEmpleado: result.user.id_empleado, correo, req });
    res.json(result);
  } catch (err) {
    if (err && err.status && err.status < 500) {
      registrarAcceso({ evento: 'LOGIN_FALLIDO', correo, req, exito: false, detalle: { code: err.code || null } });
    }
    next(err);
  }
};

// requireAuth ya validó el token y cargó req.user con datos vigentes del empleado.
exports.verify = async (req, res) => {
  res.json({ message: 'Token valido', user: req.user });
};

exports.changePassword = async (req, res, next) => {
  try {
    const result = await service.changePassword(req.user, req.body || {});
    registrarAcceso({ evento: 'PASSWORD_CAMBIADA', idEmpleado: req.user.id_empleado, correo: req.user.email, req });
    res.json(result);
  } catch (err) {
    if (err && err.status && err.status < 500) {
      registrarAcceso({ evento: 'PASSWORD_CAMBIO_FALLIDO', idEmpleado: req.user.id_empleado, correo: req.user.email, req, exito: false, detalle: { code: err.code || null } });
    }
    next(err);
  }
};

exports.register = async (req, res) => {
  res.status(501).json({
    error: {
      message: 'El alta de empleados la realiza un administrador (scripts/auth-set-password.js)',
    },
  });
};

exports.clienteLogin = async (req, res) => {
  res.status(501).json({
    error: {
      message: 'Login de clientes no disponible en este backend PostgreSQL',
    },
  });
};
