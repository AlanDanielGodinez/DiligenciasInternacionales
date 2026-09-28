const service = require('../services/catalogos.service');

exports.listAreas = async (req, res, next) => {
  try {
    const areas = await service.getAreasActivas();
    res.json(areas);
  } catch (err) {
    next(err);
  }
};

exports.listPaises = async (req, res, next) => {
  try {
    const paises = await service.getPaisesActivos();
    res.json(paises);
  } catch (err) {
    next(err);
  }
};

exports.listEstatus = async (req, res, next) => {
  try {
    const estatus = await service.getEstatus();
    res.json(estatus);
  } catch (err) {
    next(err);
  }
};
