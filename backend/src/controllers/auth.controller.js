const service = require('../services/auth.service');

exports.login = async (req, res, next) => {
  try {
    const result = await service.login(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const result = await service.verify(req.headers.authorization || '');
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res) => {
  res.status(501).json({
    error: {
      message: 'Registro de usuarios no disponible en PostgreSQL hasta crear tabla de credenciales',
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
