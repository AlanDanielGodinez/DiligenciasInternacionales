const { pool } = require('../config/db');

const CALL_STATES = new Set(['PENDIENTE', 'REALIZADA', 'CANCELADA']);
const positive = (value, field) => { const number = Number(value); if (!Number.isInteger(number) || number <= 0) { const error = new Error(`${field} inválido`); error.status = 400; throw error; } return number; };
const optionalPositive = (value, field) => value == null || value === '' ? null : positive(value, field);
const civilDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : null;
const localTime = (value) => /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(String(value || '')) ? String(value).slice(0, 5) : null;

function normalizeCall(payload = {}, partial = false) {
  const data = {};
  if (!partial || Object.hasOwn(payload, 'id_solicitud')) data.id_solicitud = positive(payload.id_solicitud, 'id_solicitud');
  if (!partial || Object.hasOwn(payload, 'id_empleado_responsable')) data.id_empleado_responsable = positive(payload.id_empleado_responsable, 'id_empleado_responsable');
  if (!partial || Object.hasOwn(payload, 'id_grupo_ama')) data.id_grupo_ama = optionalPositive(payload.id_grupo_ama, 'id_grupo_ama');
  if (!partial || Object.hasOwn(payload, 'fecha')) { data.fecha = civilDate(payload.fecha); if (!data.fecha) { const error = new Error('fecha inválida'); error.status = 400; throw error; } }
  if (!partial || Object.hasOwn(payload, 'hora')) { data.hora = localTime(payload.hora); if (!data.hora) { const error = new Error('hora inválida'); error.status = 400; throw error; } }
  if (!partial || Object.hasOwn(payload, 'tipo')) data.tipo = String(payload.tipo || 'LLAMADA').trim().toUpperCase();
  if (!partial || Object.hasOwn(payload, 'notas')) data.notas = String(payload.notas || '').trim() || null;
  if (!partial || Object.hasOwn(payload, 'estado')) { data.estado = String(payload.estado || 'PENDIENTE').toUpperCase(); if (!CALL_STATES.has(data.estado)) { const error = new Error('estado inválido'); error.status = 400; throw error; } }
  return data;
}

const CALL_SELECT = `SELECT l.*, c.nombre AS aplicante_nombre, c.apellido_paterno AS aplicante_apellido_paterno,
  c.telefono AS aplicante_telefono, e.nombre AS responsable_nombre, e.apellidos AS responsable_apellidos,
  ga.nombre_grupo FROM public.ama_llamadas_agendadas l
  JOIN public.solicitudes s ON s.id_solicitud=l.id_solicitud JOIN public.clientes c ON c.id_cliente=s.id_cliente
  JOIN public.empleados e ON e.id_empleado=l.id_empleado_responsable
  LEFT JOIN public.grupos_ama ga ON ga.id_grupo_ama=l.id_grupo_ama`;

async function listLlamadas(filters = {}) {
  const clauses = [], params = [];
  const add = (sql, value) => { params.push(value); clauses.push(`${sql} $${params.length}`); };
  if (filters.desde) add('l.fecha >=', filters.desde);
  if (filters.hasta) add('l.fecha <=', filters.hasta);
  if (filters.id_empleado) add('l.id_empleado_responsable =', positive(filters.id_empleado, 'id_empleado'));
  if (filters.id_grupo) add('l.id_grupo_ama =', positive(filters.id_grupo, 'id_grupo'));
  const { rows } = await pool.query(`${CALL_SELECT} ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''} ORDER BY l.fecha,l.hora`, params);
  return rows;
}

async function createLlamada(payload) {
  const data = normalizeCall(payload);
  const client = await pool.connect();
  try { await client.query('BEGIN');
    const valid = await client.query(`SELECT s.id_solicitud, gas.id_grupo_ama AS grupo_real FROM solicitudes s
      JOIN empleados e ON e.id_empleado=$2 LEFT JOIN grupo_ama_solicitudes gas ON gas.id_solicitud=s.id_solicitud AND gas.activo=true
      WHERE s.id_solicitud=$1 LIMIT 1`, [data.id_solicitud, data.id_empleado_responsable]);
    if (!valid.rowCount) { const error = new Error('Solicitud o responsable no encontrado'); error.status = 404; throw error; }
    if (data.id_grupo_ama && Number(valid.rows[0].grupo_real) !== data.id_grupo_ama) { const error = new Error('La solicitud no pertenece al grupo indicado'); error.status = 400; throw error; }
    const result = await client.query(`INSERT INTO ama_llamadas_agendadas(id_solicitud,id_empleado_responsable,id_grupo_ama,fecha,hora,tipo,notas,estado)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [data.id_solicitud,data.id_empleado_responsable,data.id_grupo_ama,data.fecha,data.hora,data.tipo,data.notas,data.estado]);
    await client.query('COMMIT'); return result.rows[0];
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}

async function updateLlamada(id, payload) {
  const safeId = positive(id, 'id_llamada'); const data = normalizeCall(payload, true); const keys = Object.keys(data);
  if (!keys.length) { const error = new Error('Sin cambios'); error.status = 400; throw error; }
  const values = keys.map((key) => data[key]); const sets = keys.map((key, index) => `${key}=$${index + 1}`);
  values.push(safeId); const { rows } = await pool.query(`UPDATE ama_llamadas_agendadas SET ${sets.join(',')},actualizado_en=NOW() WHERE id_llamada=$${values.length} RETURNING *`, values);
  if (!rows[0]) { const error = new Error('Llamada no encontrada'); error.status = 404; throw error; } return rows[0];
}

async function getCalendarioAma({ grupo = null, tipo = null, desde = null, hasta = null, limit = 50, offset = 0 }) {
  const clauses = [];
  const params = [];
  let idx = 1;

  if (grupo) {
    clauses.push(`grupo = $${idx}`);
    params.push(grupo);
    idx++;
  }
  if (tipo) {
    clauses.push(`tipo = $${idx}`);
    params.push(tipo);
    idx++;
  }
  if (desde) {
    clauses.push(`fecha >= $${idx}`);
    params.push(desde);
    idx++;
  }
  if (hasta) {
    clauses.push(`fecha <= $${idx}`);
    params.push(hasta);
    idx++;
  }

  params.push(limit);
  params.push(offset);

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `SELECT * FROM calendario_ama ${where} ORDER BY fecha DESC, hora DESC LIMIT $${idx} OFFSET $${idx + 1}`;
  const { rows } = await pool.query(sql, params);
  return rows;
}

module.exports = { getCalendarioAma, listLlamadas, createLlamada, updateLlamada, __test: { normalizeCall, civilDate, localTime } };
