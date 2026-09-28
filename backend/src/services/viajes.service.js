const { pool } = require('../config/db');
const {
  optionalDate,
  optionalPositiveInteger,
  positiveInteger,
  trimString,
} = require('./solicitudes.service');

const COTIZACION_ESTADOS = new Set(['pendiente', 'enviada', 'aceptada', 'rechazada', 'cancelada']);
const ITINERARIO_ESTADOS = new Set(['pendiente', 'confirmado', 'enviado', 'cancelado']);
const SERVICIOS = new Set(['vuelo', 'hotel', 'transporte', 'paquete', 'tour', 'otro']);

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

const optionalBoolean = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'si', 'sí', 'yes'].includes(normalized)) return true;
  if (['0', 'false', 'no'].includes(normalized)) return false;
  throw badRequest('value must be boolean');
};

const optionalTimestamp = (value, fieldName) => {
  const dateValue = optionalDate(value, fieldName);
  return dateValue || null;
};

const optionalAmount = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw badRequest(`${fieldName} must be a non-negative numeric value`);
  }
  return numberValue;
};

async function ensureSolicitud(idSolicitud, query = pool.query.bind(pool)) {
  const safeId = positiveInteger(idSolicitud, 'id_solicitud');
  const { rows } = await query(
    `SELECT s.id_solicitud, s.id_cliente, s.id_tipo_tramite, s.id_area_actual
     FROM public.solicitudes s
     WHERE s.id_solicitud = $1
     LIMIT 1`,
    [safeId]
  );
  if (!rows[0]) throw notFound('Solicitud not found');
  return rows[0];
}

const buildViajeJoin = `
  LEFT JOIN public.solicitudes s ON s.id_solicitud = v.id_solicitud
  LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
  LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
  LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
  LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
  LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
  LEFT JOIN public.empleados e ON e.id_empleado = v.creado_por`;

const cotizacionSelect = `
  SELECT
    v.*,
    s.id_cliente,
    s.estado_actual,
    ce.valor AS estado_solicitud,
    ca.nombre AS area_actual_nombre,
    tt.nombre_tramite AS tipo_tramite,
    c.nombre AS cliente_nombre,
    c.apellido_paterno,
    c.apellido_materno,
    co.nombre AS contacto_nombre,
    co.telefono AS contacto_telefono,
    e.nombre AS creado_por_nombre,
    e.apellidos AS creado_por_apellidos
  FROM public.cotizaciones_viaje v
  ${buildViajeJoin}`;

const itinerarioSelect = `
  SELECT
    v.*,
    s.id_cliente,
    s.estado_actual,
    ce.valor AS estado_solicitud,
    ca.nombre AS area_actual_nombre,
    tt.nombre_tramite AS tipo_tramite,
    c.nombre AS cliente_nombre,
    c.apellido_paterno,
    c.apellido_materno,
    co.nombre AS contacto_nombre,
    co.telefono AS contacto_telefono,
    e.nombre AS creado_por_nombre,
    e.apellidos AS creado_por_apellidos
  FROM public.itinerarios_viaje v
  ${buildViajeJoin}`;

const mapViajeRow = (row) => ({
  ...row,
  aplicante: [row.cliente_nombre, row.apellido_paterno, row.apellido_materno]
    .filter(Boolean)
    .join(' ') || null,
  creado_por_nombre_completo: [row.creado_por_nombre, row.creado_por_apellidos]
    .filter(Boolean)
    .join(' ') || null,
});

function buildListWhere(filters = {}, alias = 'v') {
  const values = [];
  const where = [`${alias}.activo = true`];

  const q = trimString(filters.q);
  if (q) {
    values.push(`%${q}%`);
    where.push(`(
      ${alias}.id_solicitud::text ILIKE $${values.length}
      OR c.nombre ILIKE $${values.length}
      OR c.apellido_paterno ILIKE $${values.length}
      OR c.apellido_materno ILIKE $${values.length}
      OR co.nombre ILIKE $${values.length}
      OR tt.nombre_tramite ILIKE $${values.length}
    )`);
  }

  if (filters.id_solicitud) {
    values.push(positiveInteger(filters.id_solicitud, 'id_solicitud'));
    where.push(`${alias}.id_solicitud = $${values.length}`);
  }

  return { values, where };
}

async function listCotizaciones(filters = {}) {
  const { values, where } = buildListWhere(filters, 'v');

  const estado = trimString(filters.estado_cotizacion);
  if (estado) {
    values.push(estado);
    where.push(`lower(v.estado_cotizacion) = lower($${values.length})`);
  }

  const tipoServicio = trimString(filters.tipo_servicio);
  if (tipoServicio) {
    values.push(tipoServicio);
    where.push(`lower(v.tipo_servicio) = lower($${values.length})`);
  }

  const { rows } = await pool.query(
    `${cotizacionSelect}
     WHERE ${where.join('\n       AND ')}
     ORDER BY v.actualizado_en DESC NULLS LAST, v.creado_en DESC NULLS LAST, v.id_cotizacion DESC`,
    values
  );

  return rows.map(mapViajeRow);
}

async function listCotizacionesBySolicitud(idSolicitud) {
  const solicitud = await ensureSolicitud(idSolicitud);
  const { rows } = await pool.query(
    `${cotizacionSelect}
     WHERE v.id_solicitud = $1 AND v.activo = true
     ORDER BY v.creado_en DESC NULLS LAST, v.id_cotizacion DESC`,
    [solicitud.id_solicitud]
  );
  return rows.map(mapViajeRow);
}

async function createCotizacion(idSolicitud, payload = {}) {
  const solicitud = await ensureSolicitud(idSolicitud);
  const tipoServicio = trimString(payload.tipo_servicio).toLowerCase();
  if (!SERVICIOS.has(tipoServicio)) throw badRequest('tipo_servicio is invalid');

  const estado = trimString(payload.estado_cotizacion || 'pendiente').toLowerCase();
  if (!COTIZACION_ESTADOS.has(estado)) throw badRequest('estado_cotizacion is invalid');

  const creadoPor = optionalPositiveInteger(payload.creado_por, 'creado_por');
  const { rows } = await pool.query(
    `INSERT INTO public.cotizaciones_viaje (
       id_solicitud, tipo_servicio, descripcion, proveedor, monto_estimado,
       moneda, estado_cotizacion, fecha_envio, fecha_respuesta,
       observaciones, creado_por, creado_en, actualizado_en, activo
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW(),true)
     RETURNING id_cotizacion`,
    [
      solicitud.id_solicitud,
      tipoServicio,
      trimString(payload.descripcion),
      trimString(payload.proveedor),
      optionalAmount(payload.monto_estimado, 'monto_estimado'),
      trimString(payload.moneda) || 'MXN',
      estado,
      optionalTimestamp(payload.fecha_envio, 'fecha_envio'),
      optionalTimestamp(payload.fecha_respuesta, 'fecha_respuesta'),
      trimString(payload.observaciones),
      creadoPor,
    ]
  );

  return getCotizacionById(rows[0].id_cotizacion);
}

async function getCotizacionById(idCotizacion) {
  const safeId = positiveInteger(idCotizacion, 'id_cotizacion');
  const { rows } = await pool.query(
    `${cotizacionSelect}
     WHERE v.id_cotizacion = $1
     LIMIT 1`,
    [safeId]
  );
  if (!rows[0]) throw notFound('Cotizacion not found');
  return mapViajeRow(rows[0]);
}

async function updateCotizacion(idCotizacion, payload = {}) {
  await getCotizacionById(idCotizacion);
  const safeId = positiveInteger(idCotizacion, 'id_cotizacion');
  const fields = [];
  const values = [];

  const setters = {
    tipo_servicio: (value) => {
      const normalized = trimString(value).toLowerCase();
      if (!SERVICIOS.has(normalized)) throw badRequest('tipo_servicio is invalid');
      return normalized;
    },
    descripcion: trimString,
    proveedor: trimString,
    monto_estimado: (value) => optionalAmount(value, 'monto_estimado'),
    moneda: (value) => trimString(value) || 'MXN',
    estado_cotizacion: (value) => {
      const normalized = trimString(value).toLowerCase();
      if (!COTIZACION_ESTADOS.has(normalized)) throw badRequest('estado_cotizacion is invalid');
      return normalized;
    },
    fecha_envio: (value) => optionalTimestamp(value, 'fecha_envio'),
    fecha_respuesta: (value) => optionalTimestamp(value, 'fecha_respuesta'),
    observaciones: trimString,
    activo: (value) => optionalBoolean(value, true),
  };

  Object.entries(setters).forEach(([key, normalize]) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      values.push(normalize(payload[key]));
      fields.push(`${key} = $${values.length}`);
    }
  });

  if (!fields.length) throw badRequest('No valid fields provided');
  values.push(safeId);
  await pool.query(
    `UPDATE public.cotizaciones_viaje
     SET ${fields.join(', ')}, actualizado_en = NOW()
     WHERE id_cotizacion = $${values.length}`,
    values
  );

  return getCotizacionById(safeId);
}

async function listItinerarios(filters = {}) {
  const { values, where } = buildListWhere(filters, 'v');

  const estado = trimString(filters.estado_itinerario);
  if (estado) {
    values.push(estado);
    where.push(`lower(v.estado_itinerario) = lower($${values.length})`);
  }

  const { rows } = await pool.query(
    `${itinerarioSelect}
     WHERE ${where.join('\n       AND ')}
     ORDER BY v.actualizado_en DESC NULLS LAST, v.creado_en DESC NULLS LAST, v.id_itinerario DESC`,
    values
  );

  return rows.map(mapViajeRow);
}

async function getItinerarioBySolicitud(idSolicitud) {
  const solicitud = await ensureSolicitud(idSolicitud);
  const { rows } = await pool.query(
    `${itinerarioSelect}
     WHERE v.id_solicitud = $1 AND v.activo = true
     ORDER BY v.creado_en DESC NULLS LAST, v.id_itinerario DESC
     LIMIT 1`,
    [solicitud.id_solicitud]
  );
  return rows[0] ? mapViajeRow(rows[0]) : null;
}

async function getItinerarioById(idItinerario) {
  const safeId = positiveInteger(idItinerario, 'id_itinerario');
  const { rows } = await pool.query(
    `${itinerarioSelect}
     WHERE v.id_itinerario = $1
     LIMIT 1`,
    [safeId]
  );
  if (!rows[0]) throw notFound('Itinerario not found');
  return mapViajeRow(rows[0]);
}

async function createItinerario(idSolicitud, payload = {}) {
  const solicitud = await ensureSolicitud(idSolicitud);
  const existing = await getItinerarioBySolicitud(solicitud.id_solicitud);
  if (existing) throw badRequest('Solicitud already has an active travel itinerary');

  const estado = trimString(payload.estado_itinerario || 'pendiente').toLowerCase();
  if (!ITINERARIO_ESTADOS.has(estado)) throw badRequest('estado_itinerario is invalid');

  const { rows } = await pool.query(
    `INSERT INTO public.itinerarios_viaje (
       id_solicitud, fecha_salida, fecha_regreso, origen, destino, aerolinea,
       numero_vuelo, hotel, direccion_hotel, transporte_incluido, detalles,
       estado_itinerario, creado_por, creado_en, actualizado_en, activo
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,false),$11,$12,$13,NOW(),NOW(),true)
     RETURNING id_itinerario`,
    [
      solicitud.id_solicitud,
      optionalTimestamp(payload.fecha_salida, 'fecha_salida'),
      optionalTimestamp(payload.fecha_regreso, 'fecha_regreso'),
      trimString(payload.origen),
      trimString(payload.destino),
      trimString(payload.aerolinea),
      trimString(payload.numero_vuelo),
      trimString(payload.hotel),
      trimString(payload.direccion_hotel),
      optionalBoolean(payload.transporte_incluido, false),
      trimString(payload.detalles),
      estado,
      optionalPositiveInteger(payload.creado_por, 'creado_por'),
    ]
  );

  return getItinerarioById(rows[0].id_itinerario);
}

async function updateItinerario(idItinerario, payload = {}) {
  await getItinerarioById(idItinerario);
  const safeId = positiveInteger(idItinerario, 'id_itinerario');
  const fields = [];
  const values = [];

  const setters = {
    fecha_salida: (value) => optionalTimestamp(value, 'fecha_salida'),
    fecha_regreso: (value) => optionalTimestamp(value, 'fecha_regreso'),
    origen: trimString,
    destino: trimString,
    aerolinea: trimString,
    numero_vuelo: trimString,
    hotel: trimString,
    direccion_hotel: trimString,
    transporte_incluido: (value) => optionalBoolean(value, false),
    detalles: trimString,
    estado_itinerario: (value) => {
      const normalized = trimString(value).toLowerCase();
      if (!ITINERARIO_ESTADOS.has(normalized)) throw badRequest('estado_itinerario is invalid');
      return normalized;
    },
    activo: (value) => optionalBoolean(value, true),
  };

  Object.entries(setters).forEach(([key, normalize]) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      values.push(normalize(payload[key]));
      fields.push(`${key} = $${values.length}`);
    }
  });

  if (!fields.length) throw badRequest('No valid fields provided');
  values.push(safeId);
  await pool.query(
    `UPDATE public.itinerarios_viaje
     SET ${fields.join(', ')}, actualizado_en = NOW()
     WHERE id_itinerario = $${values.length}`,
    values
  );

  return getItinerarioById(safeId);
}

module.exports = {
  createCotizacion,
  createItinerario,
  getItinerarioBySolicitud,
  listCotizaciones,
  listCotizacionesBySolicitud,
  listItinerarios,
  updateCotizacion,
  updateItinerario,
};
