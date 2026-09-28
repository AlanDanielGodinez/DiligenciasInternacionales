const { pool } = require('../config/db');

async function getEmpleadosActivos() {
  const { rows } = await pool.query(
    `SELECT id_empleado, nombre, apellidos, correo, area, rol, activo
     FROM public.empleados
     WHERE activo = true
     ORDER BY nombre ASC NULLS LAST, apellidos ASC NULLS LAST, id_empleado ASC`
  );

  return rows;
}

module.exports = {
  getEmpleadosActivos,
};
