const service = require('../services/areas.service');

exports.listSolicitudesByArea = async (req, res, next) => {
  try {
    const result = await service.getSolicitudesByArea(req.params.idArea, req.query || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
};
