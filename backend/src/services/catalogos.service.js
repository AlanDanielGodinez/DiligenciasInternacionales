const { pool } = require('../config/db');

async function getAreasActivas() {
  const { rows } = await pool.query(
    `SELECT id_area, clave, nombre, activo, creado_en
     FROM public.catalogo_areas
     WHERE activo = true
     ORDER BY id_area`
  );

  return rows;
}

async function getPaisesActivos() {
  const { rows } = await pool.query(
    `SELECT id_pais, nombre_pais, activo
     FROM public.catalogo_paises
     ORDER BY nombre_pais ASC NULLS LAST, id_pais ASC`
  );

  return rows;
}

async function getEstatus() {
  const { rows } = await pool.query(
    `SELECT id, valor, categoria
     FROM public.catalogo_estatus
     ORDER BY id`
  );

  return rows;
}

module.exports = {
  getAreasActivas,
  getPaisesActivos,
  getEstatus,
};
