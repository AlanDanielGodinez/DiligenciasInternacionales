const { pool } = require('../config/db');
const { positiveInteger, optionalPositiveInteger, trimString } = require('./solicitudes.service');
const { SATISFACTION_SURVEY_VERSION, SATISFACTION_SURVEY_FIELDS } = require('../surveys/satisfactionSurvey.definition');

const scoreFields = Object.fromEntries(SATISFACTION_SURVEY_FIELDS.filter((field) => field.type === 'scale').map((field) => [field.key, [field.min, field.max]]));
const badRequest = (message) => Object.assign(new Error(message), { status: 400 });
const notFound = (message) => Object.assign(new Error(message), { status: 404 });
const normalizeScore = (value, field, min, max) => {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw badRequest(`${field} must be an integer between ${min} and ${max}`);
  return number;
};
const normalizeResult = (value) => {
  const result = trimString(value);
  if (!result) return null;
  if (!['Negado', 'Aprobado'].includes(result)) throw badRequest('aprobado_negado must be Negado or Aprobado');
  return result;
};
const normalizePayload = (payload = {}) => ({
  ...Object.fromEntries(Object.entries(scoreFields).map(([field, [min, max]]) => [field, normalizeScore(payload[field], field, min, max)])),
  fortalezas_servicio: trimString(payload.fortalezas_servicio),
  punto_mejora: trimString(payload.punto_mejora),
  aprobado_negado: normalizeResult(payload.aprobado_negado),
});
const baseSelect = `SELECT es.*, e.nombre AS empleado_nombre, e.apellidos AS empleado_apellidos
  FROM public.encuestas_satisfaccion es LEFT JOIN public.empleados e ON e.id_empleado = es.id_empleado`;

async function assertParent(idCliente, idSolicitud, query) {
  const clientResult = await query('SELECT id_cliente FROM public.clientes WHERE id_cliente=$1', [idCliente]);
  if (!clientResult.rows[0]) throw notFound('Cliente not found');
  if (!idSolicitud) return;
  const requestResult = await query('SELECT id_solicitud FROM public.solicitudes WHERE id_solicitud=$1 AND id_cliente=$2', [idSolicitud, idCliente]);
  if (!requestResult.rows[0]) throw badRequest('La solicitud no pertenece al aplicante indicado');
}

async function listByCliente(idCliente, query = pool.query.bind(pool)) {
  const safeId = positiveInteger(idCliente, 'id_cliente');
  const { rows } = await query(`${baseSelect} WHERE es.id_cliente=$1 ORDER BY es.creado_en DESC, es.id_encuesta DESC`, [safeId]);
  return rows;
}
async function getByIdForCliente(idCliente, idEncuesta, query = pool.query.bind(pool)) {
  const safeClient = positiveInteger(idCliente, 'id_cliente');
  const safeSurvey = positiveInteger(idEncuesta, 'id_encuesta');
  const { rows } = await query(`${baseSelect} WHERE es.id_cliente=$1 AND es.id_encuesta=$2`, [safeClient, safeSurvey]);
  return rows[0] || null;
}
async function getEncuestaBySolicitud(idSolicitud, query = pool.query.bind(pool)) {
  const safeId = positiveInteger(idSolicitud, 'id_solicitud');
  const { rows } = await query(`${baseSelect} WHERE es.id_solicitud=$1 ORDER BY es.creado_en DESC, es.id_encuesta DESC LIMIT 1`, [safeId]);
  return rows[0] || null;
}
async function createForCliente(idCliente, payload = {}, db = pool) {
  const safeClient = positiveInteger(idCliente, 'id_cliente');
  const safeRequest = optionalPositiveInteger(payload.id_solicitud, 'id_solicitud');
  const safeEmployee = optionalPositiveInteger(payload.id_empleado, 'id_empleado');
  const values = normalizePayload(payload);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await assertParent(safeClient, safeRequest, client.query.bind(client));
    await client.query('LOCK TABLE public.encuestas_satisfaccion IN SHARE ROW EXCLUSIVE MODE');
    const idResult = await client.query('SELECT COALESCE(MAX(id_encuesta), 0) + 1 AS next_id FROM public.encuestas_satisfaccion');
    const { rows } = await client.query(`INSERT INTO public.encuestas_satisfaccion (
      id_encuesta,id_cliente,id_empleado,id_solicitud,version_definicion,satisfaccion_general,claridad_informacion,
      calidad_atencion,tiempo_respuesta,utilidad_asesoria,fortalezas_servicio,punto_mejora,
      probabilidad_recomendacion,aprobado_negado,creado_en,actualizado_en
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW()) RETURNING *`, [
      idResult.rows[0].next_id, safeClient, safeEmployee, safeRequest, SATISFACTION_SURVEY_VERSION, values.satisfaccion_general,
      values.claridad_informacion, values.calidad_atencion, values.tiempo_respuesta, values.utilidad_asesoria,
      values.fortalezas_servicio, values.punto_mejora, values.probabilidad_recomendacion, values.aprobado_negado,
    ]);
    await client.query('COMMIT');
    return rows[0];
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
async function createEncuesta(idSolicitud, payload = {}, db = pool) {
  const safeRequest = positiveInteger(idSolicitud, 'id_solicitud');
  const { rows } = await db.query('SELECT id_cliente FROM public.solicitudes WHERE id_solicitud=$1', [safeRequest]);
  if (!rows[0]) throw notFound('Solicitud not found');
  return createForCliente(rows[0].id_cliente, { ...payload, id_solicitud: safeRequest }, db);
}
async function updateForCliente(idCliente, idEncuesta, payload = {}, query = pool.query.bind(pool)) {
  const safeClient = positiveInteger(idCliente, 'id_cliente');
  const safeSurvey = positiveInteger(idEncuesta, 'id_encuesta');
  const values = normalizePayload(payload);
  const { rows } = await query(`UPDATE public.encuestas_satisfaccion SET
    satisfaccion_general=$3,claridad_informacion=$4,calidad_atencion=$5,tiempo_respuesta=$6,
    utilidad_asesoria=$7,fortalezas_servicio=$8,punto_mejora=$9,probabilidad_recomendacion=$10,
    aprobado_negado=$11,actualizado_en=NOW() WHERE id_cliente=$1 AND id_encuesta=$2 RETURNING *`,
  [safeClient, safeSurvey, values.satisfaccion_general, values.claridad_informacion, values.calidad_atencion,
    values.tiempo_respuesta, values.utilidad_asesoria, values.fortalezas_servicio, values.punto_mejora,
    values.probabilidad_recomendacion, values.aprobado_negado]);
  if (!rows[0]) throw notFound('Encuesta not found for cliente');
  return rows[0];
}

module.exports = { createEncuesta, createForCliente, getEncuestaBySolicitud, getByIdForCliente, listByCliente, updateForCliente, normalizePayload, assertParent };
