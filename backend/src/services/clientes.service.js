const { pool } = require('../config/db');
const solicitudesService = require('./solicitudes.service');

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

const trimString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const optionalPositiveInteger = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw badRequest(`${fieldName} must be a positive numeric value`);
  }
  return numberValue;
};

const positiveInteger = (value, fieldName) => {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw badRequest(`${fieldName} must be a positive numeric value`);
  }
  return numberValue;
};

const optionalDate = (value, fieldName) => {
  const trimmed = trimString(value);
  if (!trimmed) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    throw badRequest(`${fieldName} must be a valid date`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw badRequest(`${fieldName} must be a valid date`);
  }

  return trimmed;
};

const optionalBoolean = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'si', 'sí', 'yes'].includes(normalized)) return true;
  if (['false', '0', 'no'].includes(normalized)) return false;
  throw badRequest(`${fieldName} must be a boolean value`);
};

async function ensureContactoExists(idContacto, query = pool.query.bind(pool)) {
  const contactoResult = await query(
    'SELECT id_contacto FROM public.contacto WHERE id_contacto = $1 LIMIT 1',
    [idContacto]
  );

  if (contactoResult.rowCount === 0) {
    throw notFound('Contacto not found');
  }
}

async function getClientes({ q, limit = 50, offset = 0 }) {
  const safeLimit = positiveInteger(limit, 'limit');
  const safeOffset = Number(offset);
  if (!Number.isInteger(safeOffset) || safeOffset < 0) {
    throw badRequest('offset must be a non-negative numeric value');
  }

  const params = [];
  let where = '';
  const search = trimString(q);
  if (search) {
    params.push(
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`
    );
    where = `WHERE c.nombre ILIKE $1
      OR c.apellido_paterno ILIKE $2
      OR c.apellido_materno ILIKE $3
      OR c.telefono ILIKE $4
      OR c.correo ILIKE $5
      OR co.nombre ILIKE $6`;
  }

  params.push(safeLimit);
  params.push(safeOffset);
  const limitIndex = params.length - 1;
  const offsetIndex = params.length;

  const sql = `
    SELECT c.*,
      cp.nombre_pais AS pais_nombre,
      co.nombre AS contacto_nombre,
      co.telefono AS contacto_telefono,
      co.correo AS contacto_correo,
      COUNT(DISTINCT s.id_solicitud)::integer AS cantidad_solicitudes,
      MAX(COALESCE(s.fecha_ultimo_movimiento, s.actualizado_en, s.creado_en)) AS ultimo_movimiento
    FROM public.clientes c
    LEFT JOIN public.catalogo_paises cp ON cp.id_pais = c.id_pais
    LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
    LEFT JOIN public.solicitudes s ON s.id_cliente = c.id_cliente
    ${where}
    GROUP BY c.id_cliente, cp.nombre_pais, co.nombre, co.telefono, co.correo
    ORDER BY c.id_cliente DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}`;
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function getClienteById(id) {
  const idCliente = positiveInteger(id, 'id_cliente');
  const { rows } = await pool.query(
    `SELECT c.*,
      cp.nombre_pais AS pais_nombre,
      co.nombre AS contacto_nombre,
      co.telefono AS contacto_telefono,
      co.correo AS contacto_correo
     FROM public.clientes c
     LEFT JOIN public.catalogo_paises cp ON cp.id_pais = c.id_pais
     LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
     WHERE c.id_cliente = $1
     LIMIT 1`,
    [idCliente]
  );
  return rows[0];
}

const buildCompactAvance = (resumen) => {
  if (!resumen) return null;
  return {
    perfil_porcentaje: resumen.perfil?.porcentaje_completado || 0,
    documentos_obligatorios_subidos: resumen.documentos?.obligatorios_subidos || 0,
    documentos_obligatorios_total: resumen.documentos?.obligatorios || 0,
    pdf_generado: Boolean(resumen.perfil?.pdf_generado),
    faltantes: Array.isArray(resumen.faltantes) ? resumen.faltantes.slice(0, 3) : [],
  };
};

async function safeGetAvance(idSolicitud) {
  try {
    const resumen = await solicitudesService.getResumenAvanceSolicitud(idSolicitud);
    return buildCompactAvance(resumen);
  } catch (err) {
    return null;
  }
}

async function getClienteFicha(id) {
  const idCliente = positiveInteger(id, 'id_cliente');
  const cliente = await getClienteById(idCliente);
  if (!cliente) {
    throw notFound('Cliente not found');
  }

  const contactoResult = await pool.query(
    `SELECT *
     FROM public.contacto
     WHERE id_contacto = $1
     LIMIT 1`,
    [cliente.id_contacto]
  );

  const solicitudesResult = await pool.query(
    `SELECT s.id_solicitud,
        s.id_cliente,
        s.id_tipo_tramite,
        tt.nombre_tramite AS tipo_tramite,
        s.estado_actual,
        ce.valor AS estado_nombre,
        s.id_area_actual,
        ca.nombre AS area_actual,
        ca.clave AS area_actual_clave,
        s.id_empleado_responsable,
        e.nombre AS responsable_nombre,
        e.apellidos AS responsable_apellidos,
        s.canal_contacto,
        s.fecha_inicio,
        s.fecha_ultimo_movimiento,
        s.fecha_proximo_contacto,
        s.resultado,
        s.observaciones
     FROM public.solicitudes s
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
     LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
     LEFT JOIN public.empleados e ON e.id_empleado = s.id_empleado_responsable
     WHERE s.id_cliente = $1
     ORDER BY s.id_solicitud DESC`,
    [idCliente]
  );

  const solicitudes = await Promise.all(
    solicitudesResult.rows.map(async (solicitud) => ({
      ...solicitud,
      responsable: [solicitud.responsable_nombre, solicitud.responsable_apellidos]
        .filter(Boolean)
        .join(' ') || null,
      avance: await safeGetAvance(solicitud.id_solicitud),
    }))
  );

  const historialResult = await pool.query(
    `SELECT seg.id_seguimiento,
        seg.id_solicitud,
        seg.descripcion,
        seg.origen,
        seg.estado_anterior,
        seg.estado_nuevo,
        seg.fecha_seguimiento,
        seg.creado_en,
        tt.nombre_tramite AS tipo_tramite
     FROM public.solicitudes s
     JOIN public.seguimientos seg ON seg.id_solicitud = s.id_solicitud
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     WHERE s.id_cliente = $1
     ORDER BY COALESCE(seg.creado_en, seg.fecha_seguimiento) DESC NULLS LAST
     LIMIT 50`,
    [idCliente]
  );

  return {
    cliente,
    contacto: contactoResult.rows[0] || null,
    solicitudes,
    historial: historialResult.rows,
  };
}

async function createCliente(payload) {
  const nombre = trimString(payload.nombre);

  if (!nombre) {
    throw badRequest('nombre is required');
  }

  const idContacto = optionalPositiveInteger(payload.id_contacto, 'id_contacto');

  if (idContacto) {
    await ensureContactoExists(idContacto);
  }

  const values = [
    idContacto,
    nombre,
    trimString(payload.apellido_paterno),
    trimString(payload.apellido_materno),
    trimString(payload.telefono),
    trimString(payload.correo),
    optionalDate(payload.fecha_nacimiento, 'fecha_nacimiento'),
    optionalPositiveInteger(payload.id_pais, 'id_pais'),
    trimString(payload.estado),
    trimString(payload.ciudad),
    trimString(payload.direccion),
    trimString(payload.notas_generales),
    true,
    trimString(payload.source_id),
  ];

  const sql = `
    INSERT INTO public.clientes (
      id_contacto,
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      correo,
      fecha_nacimiento,
      id_pais,
      estado,
      ciudad,
      direccion,
      notas_generales,
      activo,
      source_id,
      creado_en,
      actualizado_en
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14, NOW(), NOW()
    )
    RETURNING *`;

  const { rows } = await pool.query(sql, values);
  const cliente = rows[0];
  await require('./quickbooksSyncTrigger.service').scheduleClientSync(cliente.id_cliente);
  return cliente;
}

async function createAplicanteForContacto(idContacto, payload) {
  const safeIdContacto = positiveInteger(idContacto, 'id_contacto');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await ensureContactoExists(safeIdContacto, client.query.bind(client));
    const aplicante = await createClienteWithQuery(
      { ...payload, id_contacto: safeIdContacto },
      client.query.bind(client)
    );
    await client.query('COMMIT');
    await require('./quickbooksSyncTrigger.service').scheduleClientSync(aplicante.id_cliente);
    return aplicante;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function createClienteWithQuery(payload, query) {
  const nombre = trimString(payload.nombre);

  if (!nombre) {
    throw badRequest('nombre is required');
  }

  const idContacto = optionalPositiveInteger(payload.id_contacto, 'id_contacto');
  const values = [
    idContacto,
    nombre,
    trimString(payload.apellido_paterno),
    trimString(payload.apellido_materno),
    trimString(payload.telefono),
    trimString(payload.correo),
    optionalDate(payload.fecha_nacimiento, 'fecha_nacimiento'),
    optionalPositiveInteger(payload.id_pais, 'id_pais'),
    trimString(payload.estado),
    trimString(payload.ciudad),
    trimString(payload.direccion),
    trimString(payload.notas_generales),
    true,
    trimString(payload.source_id),
  ];

  const sql = `
    INSERT INTO public.clientes (
      id_contacto,
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      correo,
      fecha_nacimiento,
      id_pais,
      estado,
      ciudad,
      direccion,
      notas_generales,
      activo,
      source_id,
      creado_en,
      actualizado_en
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14, NOW(), NOW()
    )
    RETURNING *`;

  const { rows } = await query(sql, values);
  return rows[0];
}

async function updateCliente(id, payload) {
  const idCliente = positiveInteger(id, 'id_cliente');
  const cliente = await getClienteById(idCliente);
  if (!cliente) {
    throw notFound('Cliente not found');
  }

  const allowedFields = {
    nombre: (value) => {
      const nombre = trimString(value);
      if (!nombre) throw badRequest('nombre cannot be empty');
      return nombre;
    },
    apellido_paterno: trimString,
    apellido_materno: trimString,
    telefono: trimString,
    correo: trimString,
    fecha_nacimiento: (value) => optionalDate(value, 'fecha_nacimiento'),
    id_pais: (value) => optionalPositiveInteger(value, 'id_pais'),
    estado: trimString,
    ciudad: trimString,
    direccion: trimString,
    notas_generales: trimString,
    activo: (value) => optionalBoolean(value, 'activo'),
  };

  const entries = Object.entries(allowedFields)
    .filter(([field]) => Object.prototype.hasOwnProperty.call(payload, field))
    .map(([field, parser]) => [field, parser(payload[field])]);

  if (entries.length === 0) {
    throw badRequest('No valid fields provided');
  }

  const setSql = entries
    .map(([field], index) => `${field} = $${index + 1}`)
    .concat(`actualizado_en = NOW()`)
    .join(', ');
  const values = entries.map(([, value]) => value);
  values.push(idCliente);

  const { rows } = await pool.query(
    `UPDATE public.clientes
     SET ${setSql}
     WHERE id_cliente = $${values.length}
     RETURNING *`,
    values
  );

  const updated = rows[0];
  await require('./quickbooksSyncTrigger.service').scheduleClientSync(updated.id_cliente);
  return updated;
}

module.exports = {
  getClientes,
  getClienteById,
  getClienteFicha,
  createCliente,
  createAplicanteForContacto,
  updateCliente,
};
