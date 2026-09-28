const service = require('../services/citas.service');

exports.listCitas = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await service.getCitas({ limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
