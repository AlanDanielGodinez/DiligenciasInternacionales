const service = require('../services/empleados.service');

exports.listEmpleados = async (req, res, next) => {
  try {
    const empleados = await service.getEmpleadosActivos();
    res.json(empleados);
  } catch (err) {
    next(err);
  }
};
