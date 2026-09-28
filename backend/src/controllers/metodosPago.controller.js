const service = require('../services/metodosPago.service');

exports.listMetodosPago = async (req, res, next) => {
  try {
    const metodos = await service.listMetodosPago(req.query || {});
    res.json({ metodos });
  } catch (error) {
    next(error);
  }
};

exports.createMetodoPago = async (req, res, next) => {
  try {
    const metodo = await service.createMetodoPago(req.body || {});
    res.status(201).json({ metodo });
  } catch (error) {
    next(error);
  }
};

exports.updateMetodoPago = async (req, res, next) => {
  try {
    const metodo = await service.updateMetodoPago(req.params.idMetodoPago, req.body || {});
    res.json({ metodo });
  } catch (error) {
    next(error);
  }
};

exports.deactivateMetodoPago = async (req, res, next) => {
  try {
    const metodo = await service.deactivateMetodoPago(req.params.idMetodoPago);
    res.json({ metodo });
  } catch (error) {
    next(error);
  }
};
