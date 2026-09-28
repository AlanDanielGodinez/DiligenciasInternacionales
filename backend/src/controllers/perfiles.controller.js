const service = require('../services/perfiles.service');
const perfilesPdfService = require('../services/perfilesPdf.service');

exports.listPlantillas = async (req, res, next) => {
  try {
    const plantillas = await service.getPlantillas({
      includeInactive: req.query.include_inactive === 'true',
    });
    res.json(plantillas);
  } catch (err) {
    next(err);
  }
};

exports.resolverPlantilla = async (req, res, next) => {
  try {
    const plantilla = await service.resolverPlantilla(req.query || {});
    res.json(plantilla);
  } catch (err) {
    next(err);
  }
};

exports.getPerfilBySolicitud = async (req, res, next) => {
  try {
    const perfil = await service.getPerfilBySolicitud(req.params.idSolicitud);
    if (!perfil) {
      return res.status(404).json({ error: { message: 'Perfil not found' } });
    }
    return res.json(perfil);
  } catch (err) {
    return next(err);
  }
};

exports.createPerfilForSolicitud = async (req, res, next) => {
  try {
    const perfil = await service.createPerfilForSolicitud(
      req.params.idSolicitud,
      req.body || {}
    );
    res.status(201).json(perfil);
  } catch (err) {
    next(err);
  }
};

exports.updatePerfil = async (req, res, next) => {
  try {
    const perfil = await service.updatePerfil(req.params.idPerfil, req.body || {});
    res.json(perfil);
  } catch (err) {
    next(err);
  }
};

exports.listVersiones = async (req, res, next) => {
  try {
    const versiones = await service.getPerfilVersiones(req.params.idPerfil);
    res.json(versiones);
  } catch (err) {
    next(err);
  }
};

exports.generarPdfVersion = async (req, res, next) => {
  try {
    const result = await perfilesPdfService.generarPdfPerfilVersion(
      req.params.idVersion,
      {
        force: req.query.force === 'true' || req.body?.force === true,
      }
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};
