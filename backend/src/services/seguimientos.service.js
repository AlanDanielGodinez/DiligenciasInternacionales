const { pool } = require('../config/db');
const {
  optionalDate,
  optionalPositiveInteger,
  positiveInteger,
  resolveEstadoActual,
  trimString,
} = require('./solicitudes.service');

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

const EVENTOS_SEGUIMIENTO = new Set([
  'contacto_creado',
  'aplicante_creado',
  'solicitud_creada',
  'tramite_adicional_creado',
  'enviado_a_finanzas',
  'pago_inicial_validado',
  'enviado_a_individuales',
  'enviado_a_ama',
  'asesor_asignado',
  'perfil_iniciado',
  'perfil_completado',
  'enviado_a_legal',
  'foia_requerido',
  'cita_agendada',
  'enviado_a_protocolos',
  'protocolo_completado',
  'aprobado',
  'negado',
  'enviado_a_negados',
  'recontacto_programado',
  'enviado_a_logistica',
]);

async function ensureSolicitudExists(idSolicitud, query = pool.query.bind(pool)) {
  const result = await query(
    'SELECT id_solicitud FROM public.solicitudes WHERE id_solicitud = $1 LIMIT 1',
    [idSolicitud]
  );

  if (result.rowCount === 0) {
    throw notFound('Solicitud not found');
  }
}

async function ensureEmpleadoExists(idEmpleado, query = pool.query.bind(pool)) {
  if (!idEmpleado) return;
  const result = await query(
    'SELECT id_empleado FROM public.empleados WHERE id_empleado = $1 LIMIT 1',
    [idEmpleado]
  );

  if (result.rowCount === 0) {
    throw notFound('Empleado not found');
  }
}

async function getSeguimientosBySolicitud(idSolicitud) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  await ensureSolicitudExists(safeIdSolicitud);

  const { rows } = await pool.query(
    `SELECT *
     FROM public.seguimientos
     WHERE id_solicitud = $1
     ORDER BY fecha_seguimiento DESC NULLS LAST, creado_en DESC NULLS LAST, id_seguimiento DESC`,
    [safeIdSolicitud]
  );

  return rows;
}

async function createSeguimiento(idSolicitud, payload) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const evento = trimString(payload.evento || payload.origen);

  if (!evento) {
    throw badRequest('evento is required');
  }

  if (!EVENTOS_SEGUIMIENTO.has(evento)) {
    throw badRequest('evento is not supported');
  }

  const idEmpleadoResponsable = optionalPositiveInteger(
    payload.id_empleado_responsable,
    'id_empleado_responsable'
  );
  const fechaSeguimiento = optionalDate(payload.fecha_seguimiento, 'fecha_seguimiento');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await ensureSolicitudExists(safeIdSolicitud, client.query.bind(client));
    await ensureEmpleadoExists(idEmpleadoResponsable, client.query.bind(client));

    const estadoAnterior = await resolveEstadoActual(
      payload.estado_anterior,
      client.query.bind(client)
    );
    let estadoNuevo = await resolveEstadoActual(payload.estado_nuevo, client.query.bind(client));

    if (!estadoNuevo && (evento === 'aprobado' || evento === 'negado' || evento === 'pago_inicial_validado')) {
      estadoNuevo = await resolveEstadoActual(evento, client.query.bind(client));
    }

    await client.query('SELECT pg_advisory_xact_lock(9021001)');

    const { rows } = await client.query(
      `INSERT INTO public.seguimientos (
         id_seguimiento,
         id_solicitud,
         estado_anterior,
         estado_nuevo,
         descripcion,
         id_empleado_responsable,
         fecha_seguimiento,
         origen,
         creado_en
       )
       VALUES (
         COALESCE((SELECT MAX(id_seguimiento) FROM public.seguimientos), 0) + 1,
         $1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE), $7, NOW()
       )
       RETURNING *`,
      [
        safeIdSolicitud,
        estadoAnterior,
        estadoNuevo,
        trimString(payload.descripcion) || evento,
        idEmpleadoResponsable,
        fechaSeguimiento,
        evento,
      ]
    );

    if (estadoNuevo) {
      await client.query(
        'UPDATE public.solicitudes SET estado_actual = $1, actualizado_en = NOW() WHERE id_solicitud = $2',
        [estadoNuevo, safeIdSolicitud]
      );
    }

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  EVENTOS_SEGUIMIENTO,
  createSeguimiento,
  getSeguimientosBySolicitud,
};
