const service = require('../services/calendarioAma.service');

exports.listCalendarioAma = async (req, res, next) => {
  try {
    const grupo = req.query.grupo || null;
    const tipo = req.query.tipo || null;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await service.getCalendarioAma({ grupo, tipo, limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.listLlamadas = async (req, res, next) => { try { res.json(await service.listLlamadas(req.query)); } catch (err) { next(err); } };
exports.createLlamada = async (req, res, next) => { try { res.status(201).json(await service.createLlamada(req.body)); } catch (err) { next(err); } };
exports.updateLlamada = async (req, res, next) => { try { res.json(await service.updateLlamada(req.params.idLlamada, req.body)); } catch (err) { next(err); } };
