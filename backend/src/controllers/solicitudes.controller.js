const service = require('../services/solicitudes.service');
const driveExpedientesService = require('../services/driveExpedientes.service');

exports.createSolicitud = async (req, res, next) => {
  try {
    const solicitud = await service.createSolicitud(req.body || {});
    res.status(201).json(solicitud);
  } catch (err) {
    next(err);
  }
};

exports.ensureDriveCarpetas = async (req, res, next) => {
  try {
    const result = await driveExpedientesService.ensureExpedienteFoldersBySolicitud(
      req.params.idSolicitud
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.listSolicitudes = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await service.getSolicitudes({ limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getSolicitudById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const solicitud = await service.getSolicitudById(id);
    if (!solicitud) return res.status(404).json({ error: { message: 'Solicitud not found' } });
    res.json(solicitud);
  } catch (err) {
    next(err);
  }
};

exports.getResumenAvance = async (req, res, next) => {
  try {
    const result = await service.getResumenAvanceSolicitud(req.params.idSolicitud);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getEstadosDisponibles = async (req, res, next) => {
  try {
    const result = await service.getEstadosDisponiblesSolicitud(req.params.idSolicitud);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.createSeguimientoOperativo = async (req, res, next) => {
  try {
    const result = await service.avanzarSeguimientoOperativo(
      req.params.idSolicitud,
      req.body || {}
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getMisExpedientes = async (req, res, next) => {
  try {
    const result = await service.getMisExpedientes(req.query || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getDestinoPostPago = async (req, res, next) => {
  try {
    const result = await service.resolverDestinoPostPago(req.params.idSolicitud, req.query || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.enviarSolicitudPostPago = async (req, res, next) => {
  try {
    const result = await service.enviarSolicitudPostPago(
      req.params.idSolicitud,
      req.body || {}
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateSolicitud = async (req, res, next) => {
  try {
    const result = await service.updateSolicitud(
      req.params.idSolicitud,
      req.body || {}
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateSolicitudEstado = async (req, res, next) => {
  try {
    const result = await service.updateSolicitudEstado(
      req.params.idSolicitud,
      req.body || {}
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.moverSolicitudArea = async (req, res, next) => {
  try {
    const result = await service.moverSolicitudArea(
      req.params.idSolicitud,
      req.body || {}
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateSolicitudResponsable = async (req, res, next) => {
  try {
    const result = await service.updateSolicitudResponsable(
      req.params.idSolicitud,
      req.body || {}
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};
