const service = require('../services/encuestasSatisfaccion.service');

exports.getBySolicitud = async (req, res, next) => { try { res.json({ encuesta: await service.getEncuestaBySolicitud(req.params.idSolicitud) }); } catch (error) { next(error); } };
exports.createForSolicitud = async (req, res, next) => { try { res.status(201).json({ encuesta: await service.createEncuesta(req.params.idSolicitud, req.body || {}) }); } catch (error) { next(error); } };
exports.listByCliente = async (req, res, next) => { try { res.json({ encuestas: await service.listByCliente(req.params.idCliente) }); } catch (error) { next(error); } };
exports.createForCliente = async (req, res, next) => { try { res.status(201).json({ encuesta: await service.createForCliente(req.params.idCliente, req.body || {}) }); } catch (error) { next(error); } };
exports.updateForCliente = async (req, res, next) => { try { res.json({ encuesta: await service.updateForCliente(req.params.idCliente, req.params.idEncuesta, req.body || {}) }); } catch (error) { next(error); } };
