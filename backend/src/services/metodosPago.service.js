const { pool } = require('../config/db');
const { positiveInteger, trimString } = require('./solicitudes.service');

const badRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const notFound = (message) => {
  const error = new Error(message);
  error.status = 404;
  return error;
};

const optionalBoolean = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'si', 'sí', 'yes'].includes(normalized)) return true;
  if (['false', '0', 'no'].includes(normalized)) return false;
  throw badRequest('activo must be a boolean value');
};

async function listMetodosPago(filters = {}) {
  const values = [];
  const where = [];

  const includeInactive = optionalBoolean(filters.include_inactive);
  if (!includeInactive) {
    where.push('activo = true');
  }

  const q = trimString(filters.q);
  if (q) {
    values.push(`%${q}%`);
    where.push(`(nombre_metodo ILIKE $${values.length} OR descripcion ILIKE $${values.length})`);
  }

  const { rows } = await pool.query(
    `SELECT
       id_metodo_pago,
       nombre_metodo,
       descripcion,
       activo,
       creado_en,
       actualizado_en
     FROM public.metodos_pago
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY activo DESC, nombre_metodo ASC`,
    values
  );

  return rows;
}

async function ensureMetodoExists(idMetodoPago) {
  const safeId = positiveInteger(idMetodoPago, 'id_metodo_pago');
  const { rows } = await pool.query(
    `SELECT *
     FROM public.metodos_pago
     WHERE id_metodo_pago = $1
     LIMIT 1`,
    [safeId]
  );

  if (!rows[0]) throw notFound('Metodo de pago not found');
  return rows[0];
}

async function createMetodoPago(payload = {}) {
  const nombreMetodo = trimString(payload.nombre_metodo || payload.nombre);
  if (!nombreMetodo) throw badRequest('nombre_metodo is required');

  const descripcion = trimString(payload.descripcion);
  const activo = optionalBoolean(payload.activo);

  try {
    const { rows } = await pool.query(
      `INSERT INTO public.metodos_pago (
         nombre_metodo,
         descripcion,
         activo,
         creado_en,
         actualizado_en
       )
       VALUES ($1, $2, COALESCE($3, true), NOW(), NOW())
       RETURNING *`,
      [nombreMetodo, descripcion, activo]
    );
    return rows[0];
  } catch (error) {
    if (error.code === '23505') throw badRequest('Ya existe un método de pago con ese nombre');
    throw error;
  }
}

async function updateMetodoPago(idMetodoPago, payload = {}) {
  await ensureMetodoExists(idMetodoPago);
  const safeId = positiveInteger(idMetodoPago, 'id_metodo_pago');
  const set = [];
  const values = [];

  if (payload.nombre_metodo !== undefined || payload.nombre !== undefined) {
    const nombreMetodo = trimString(payload.nombre_metodo || payload.nombre);
    if (!nombreMetodo) throw badRequest('nombre_metodo cannot be empty');
    values.push(nombreMetodo);
    set.push(`nombre_metodo = $${values.length}`);
  }

  if (payload.descripcion !== undefined) {
    values.push(trimString(payload.descripcion));
    set.push(`descripcion = $${values.length}`);
  }

  if (payload.activo !== undefined) {
    values.push(optionalBoolean(payload.activo));
    set.push(`activo = $${values.length}`);
  }

  if (!set.length) {
    return ensureMetodoExists(safeId);
  }

  values.push(safeId);

  try {
    const { rows } = await pool.query(
      `UPDATE public.metodos_pago
       SET ${set.join(', ')},
           actualizado_en = NOW()
       WHERE id_metodo_pago = $${values.length}
       RETURNING *`,
      values
    );
    return rows[0];
  } catch (error) {
    if (error.code === '23505') throw badRequest('Ya existe un método de pago con ese nombre');
    throw error;
  }
}

async function deactivateMetodoPago(idMetodoPago) {
  const safeId = positiveInteger(idMetodoPago, 'id_metodo_pago');
  const { rows } = await pool.query(
    `UPDATE public.metodos_pago
     SET activo = false,
         actualizado_en = NOW()
     WHERE id_metodo_pago = $1
     RETURNING *`,
    [safeId]
  );

  if (!rows[0]) throw notFound('Metodo de pago not found');
  return rows[0];
}

module.exports = {
  createMetodoPago,
  deactivateMetodoPago,
  listMetodosPago,
  updateMetodoPago,
};
