const service = require('../services/seguimientos.service');

exports.listSeguimientosBySolicitud = async (req, res, next) => {
  try {
    const result = await service.getSeguimientosBySolicitud(req.params.idSolicitud);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.createSeguimiento = async (req, res, next) => {
  try {
    const seguimiento = await service.createSeguimiento(
      req.params.idSolicitud,
      req.body || {}
    );
    res.status(201).json(seguimiento);
  } catch (err) {
    next(err);
  }
};
