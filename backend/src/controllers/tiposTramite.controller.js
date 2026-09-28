const service = require('../services/tiposTramite.service');

exports.listTiposTramite = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await service.getTiposTramite({ limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
