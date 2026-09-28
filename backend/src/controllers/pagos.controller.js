const service = require('../services/pagos.service');

exports.listPagos = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await service.getPagos({ limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.listSolicitudesPendientesPago = async (req, res, next) => {
  try {
    const result = await service.listSolicitudesPendientesPago(req.query || {});
    res.json({ solicitudes: result });
  } catch (err) {
    next(err);
  }
};

exports.listPagosFinanzas = async (req, res, next) => {
  try {
    const [result,resumen] = await Promise.all([service.listPagosFinanzas(req.query || {}),service.getResumenFinanzas()]);
    res.json({ pagos: result,resumen });
  } catch (err) {
    next(err);
  }
};

exports.listPagosBySolicitud = async (req, res, next) => {
  try {
    const result = await service.getPagosBySolicitud(req.params.idSolicitud);
    res.json({ pagos: result });
  } catch (err) {
    next(err);
  }
};

exports.createPago = async (req, res, next) => {
  try {
    const pago = await service.createPago(req.params.idSolicitud, req.body || {}, req.file || null);
    res.status(201).json({ pago });
  } catch (err) {
    next(err);
  }
};

exports.validarPago = async (req, res, next) => {
  try {
    const result = await service.validarPago(req.params.idPago, req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.rechazarPago = async (req, res, next) => {
  try {
    const result = await service.rechazarPago(req.params.idPago, req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
};
