const service = require('../services/viajes.service');

exports.listCotizaciones = async (req, res, next) => {
  try {
    const cotizaciones = await service.listCotizaciones(req.query || {});
    res.json({ cotizaciones });
  } catch (error) {
    next(error);
  }
};

exports.listCotizacionesBySolicitud = async (req, res, next) => {
  try {
    const cotizaciones = await service.listCotizacionesBySolicitud(req.params.idSolicitud);
    res.json({ cotizaciones });
  } catch (error) {
    next(error);
  }
};

exports.createCotizacion = async (req, res, next) => {
  try {
    const cotizacion = await service.createCotizacion(req.params.idSolicitud, req.body || {});
    res.status(201).json({ cotizacion });
  } catch (error) {
    next(error);
  }
};

exports.updateCotizacion = async (req, res, next) => {
  try {
    const cotizacion = await service.updateCotizacion(req.params.idCotizacion, req.body || {});
    res.json({ cotizacion });
  } catch (error) {
    next(error);
  }
};

exports.listItinerarios = async (req, res, next) => {
  try {
    const itinerarios = await service.listItinerarios(req.query || {});
    res.json({ itinerarios });
  } catch (error) {
    next(error);
  }
};

exports.getItinerarioBySolicitud = async (req, res, next) => {
  try {
    const itinerario = await service.getItinerarioBySolicitud(req.params.idSolicitud);
    res.json({ itinerario });
  } catch (error) {
    next(error);
  }
};

exports.createItinerario = async (req, res, next) => {
  try {
    const itinerario = await service.createItinerario(req.params.idSolicitud, req.body || {});
    res.status(201).json({ itinerario });
  } catch (error) {
    next(error);
  }
};

exports.updateItinerario = async (req, res, next) => {
  try {
    const itinerario = await service.updateItinerario(req.params.idItinerario, req.body || {});
    res.json({ itinerario });
  } catch (error) {
    next(error);
  }
};
