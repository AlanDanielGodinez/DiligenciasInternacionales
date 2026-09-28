const service = require('../services/dashboard.service');

exports.getResumen = async (req, res, next) => {
  try {
    const resumen = await service.getDashboardResumen(req.query || {});
    res.json(resumen);
  } catch (err) {
    next(err);
  }
};
