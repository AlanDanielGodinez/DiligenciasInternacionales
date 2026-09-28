const service = require('../services/gruposAma.service');

exports.listGrupos = async (req, res, next) => {
  try {
    const grupos = await service.listGrupos(req.query || {});
    res.json(grupos);
  } catch (err) {
    next(err);
  }
};

exports.getGrupo = async (req, res, next) => {
  try {
    const grupo = await service.getGrupoDetalle(req.params.idGrupo);
    res.json(grupo);
  } catch (err) {
    next(err);
  }
};

exports.createGrupo = async (req, res, next) => {
  try {
    const grupo = await service.createGrupo(req.body || {});
    res.status(201).json(grupo);
  } catch (err) {
    next(err);
  }
};

exports.updateGrupo = async (req, res, next) => {
  try {
    const grupo = await service.updateGrupo(req.params.idGrupo, req.body || {});
    res.json(grupo);
  } catch (err) {
    next(err);
  }
};

exports.listSolicitudes = async (req, res, next) => {
  try {
    const solicitudes = await service.listGrupoSolicitudes(req.params.idGrupo);
    res.json(solicitudes);
  } catch (err) {
    next(err);
  }
};

exports.addSolicitudes = async (req, res, next) => {
  try {
    const result = await service.addSolicitudesToGrupo(req.params.idGrupo, req.body || {});
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.removeSolicitud = async (req, res, next) => {
  try {
    const result = await service.removeSolicitudFromGrupo(req.params.idGrupo, req.params.idSolicitud);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.listCandidatos = async (req, res, next) => {
  try {
    const candidatos = await service.listCandidatos(req.query || {});
    res.json(candidatos);
  } catch (err) {
    next(err);
  }
};
exports.listAplicantes = async (req,res,next) => { try { res.json(await service.listAplicantesGlobal(req.query||{})); } catch(err) { next(err); } };
exports.terminarGrupo = async (req,res,next) => { try { res.json(await service.terminarGrupo(req.params.idGrupo,req.body||{})); } catch(err) { next(err); } };

exports.listChecklist = async (req, res, next) => {
  try {
    const checklist = await service.listChecklist(req.params.idGrupo);
    res.json(checklist);
  } catch (err) {
    next(err);
  }
};

exports.generateChecklist = async (req, res, next) => {
  try {
    const checklist = await service.generateChecklist(req.params.idGrupo);
    res.status(201).json(checklist);
  } catch (err) {
    next(err);
  }
};

exports.updateChecklistItem = async (req, res, next) => {
  try {
    const item = await service.updateChecklistItem(
      req.params.idGrupo,
      req.params.idChecklist,
      req.body || {}
    );
    res.json(item);
  } catch (err) {
    next(err);
  }
};
