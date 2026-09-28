const service = require('../services/contactos.service');
const clientesService = require('../services/clientes.service');

exports.createContacto = async (req, res, next) => {
  try {
    const contacto = await service.createContacto(req.body || {});
    res.status(201).json(contacto);
  } catch (err) {
    next(err);
  }
};

exports.listContactos = async (req, res, next) => {
  try {
    const q = req.query.q || null;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const contactos = await service.getContactos({ q, limit, offset });
    res.json(contactos);
  } catch (err) {
    next(err);
  }
};

exports.getContactoById = async (req, res, next) => {
  try {
    const contacto = await service.getContactoById(req.params.id);
    if (!contacto) return res.status(404).json({ error: { message: 'Contacto not found' } });
    return res.json(contacto);
  } catch (err) {
    return next(err);
  }
};

exports.updateContacto = async (req, res, next) => {
  try {
    const contacto = await service.updateContacto(req.params.idContacto, req.body || {});
    res.json(contacto);
  } catch (err) {
    next(err);
  }
};

exports.listAplicantesByContacto = async (req, res, next) => {
  try {
    const result = await service.getAplicantesByContacto(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.createAplicanteForContacto = async (req, res, next) => {
  try {
    const aplicante = await clientesService.createAplicanteForContacto(
      req.params.idContacto,
      req.body || {}
    );
    res.status(201).json(aplicante);
  } catch (err) {
    next(err);
  }
};
