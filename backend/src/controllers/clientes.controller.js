const service = require('../services/clientes.service');
const solicitudesService = require('../services/solicitudes.service');

exports.createCliente = async (req, res, next) => {
  try {
    const cliente = await service.createCliente(req.body || {});
    res.status(201).json(cliente);
  } catch (err) {
    next(err);
  }
};

exports.listClientes = async (req, res, next) => {
  try {
    const q = req.query.q || null;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await service.getClientes({ q, limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getClienteById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const cliente = await service.getClienteById(id);
    if (!cliente) return res.status(404).json({ error: { message: 'Cliente not found' } });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
};

exports.getClienteFicha = async (req, res, next) => {
  try {
    const ficha = await service.getClienteFicha(req.params.idCliente);
    res.json(ficha);
  } catch (err) {
    next(err);
  }
};

exports.updateCliente = async (req, res, next) => {
  try {
    const cliente = await service.updateCliente(req.params.idCliente, req.body || {});
    res.json(cliente);
  } catch (err) {
    next(err);
  }
};

exports.createSolicitudForCliente = async (req, res, next) => {
  try {
    const solicitud = await solicitudesService.createSolicitudForCliente(
      req.params.idCliente,
      req.body || {}
    );
    res.status(201).json(solicitud);
  } catch (err) {
    next(err);
  }
};
