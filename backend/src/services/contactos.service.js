const { pool } = require('../config/db');

const CONTACTO_TABLE = 'contacto';
const CONTACTO_PRIMARY_KEY = 'id_contacto';

const badRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const trimString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
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

async function getContactos({ q, limit = 50, offset = 0 }) {
  const safeLimit = positiveInteger(limit, 'limit');
  const safeOffset = Number(offset);
  if (!Number.isInteger(safeOffset) || safeOffset < 0) {
    throw badRequest('offset must be a non-negative numeric value');
  }

  const params = [];
  let where = '';

  if (trimString(q)) {
    params.push(`%${trimString(q)}%`, `%${trimString(q)}%`, `%${trimString(q)}%`);
    where = `
      WHERE co.nombre ILIKE $1
         OR co.telefono ILIKE $2
         OR co.correo ILIKE $3`;
  }

  params.push(safeLimit, safeOffset);
  const limitIndex = params.length - 1;
  const offsetIndex = params.length;

  const { rows } = await pool.query(
    `SELECT co.*,
        COUNT(DISTINCT c.id_cliente)::integer AS cantidad_aplicantes,
        COUNT(DISTINCT s.id_solicitud)::integer AS cantidad_solicitudes,
        MAX(GREATEST(
          COALESCE(s.actualizado_en, s.creado_en, co.fecha_ingreso::timestamp),
          COALESCE(seg.creado_en, seg.fecha_seguimiento, co.fecha_ingreso::timestamp)
        )) AS ultimo_movimiento,
        (
          SELECT seg2.descripcion
          FROM public.clientes c2
          JOIN public.solicitudes s2 ON s2.id_cliente = c2.id_cliente
          JOIN public.seguimientos seg2 ON seg2.id_solicitud = s2.id_solicitud
          WHERE c2.id_contacto = co.id_contacto
          ORDER BY COALESCE(seg2.creado_en, seg2.fecha_seguimiento) DESC NULLS LAST
          LIMIT 1
        ) AS ultimo_seguimiento
     FROM public.contacto co
     LEFT JOIN public.clientes c ON c.id_contacto = co.id_contacto
     LEFT JOIN public.solicitudes s ON s.id_cliente = c.id_cliente
     LEFT JOIN public.seguimientos seg ON seg.id_solicitud = s.id_solicitud
     ${where}
     GROUP BY co.id_contacto
     ORDER BY co.id_contacto DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    params
  );

  return rows;
}

async function getContactoById(id) {
  const idContacto = positiveInteger(id, CONTACTO_PRIMARY_KEY);
  const { rows } = await pool.query(
    'SELECT * FROM public.contacto WHERE id_contacto = $1 LIMIT 1',
    [idContacto]
  );
  return rows[0] || null;
}

async function getAplicantesByContacto(id) {
  const idContacto = positiveInteger(id, CONTACTO_PRIMARY_KEY);
  const contacto = await getContactoById(idContacto);

  if (!contacto) {
    const error = new Error('Contacto not found');
    error.status = 404;
    throw error;
  }

  const { rows } = await pool.query(
    `SELECT c.*,
        cp.nombre_pais AS pais_nombre,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id_solicitud', s.id_solicitud,
              'id_tipo_tramite', s.id_tipo_tramite,
              'tipo_tramite', tt.nombre_tramite,
              'estado_actual', s.estado_actual,
              'estado_actual_valor', ce.valor,
              'id_area_actual', s.id_area_actual,
              'area_actual_nombre', ca.nombre,
              'canal_contacto', s.canal_contacto,
              'fecha_inicio', s.fecha_inicio,
              'fecha_ultimo_movimiento', s.fecha_ultimo_movimiento,
              'observaciones', s.observaciones
            )
          ) FILTER (WHERE s.id_solicitud IS NOT NULL),
          '[]'::json
        ) AS solicitudes
     FROM public.clientes c
     LEFT JOIN public.catalogo_paises cp ON cp.id_pais = c.id_pais
     LEFT JOIN public.solicitudes s ON s.id_cliente = c.id_cliente
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
     LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
     WHERE c.id_contacto = $1
     GROUP BY c.id_cliente, cp.nombre_pais
     ORDER BY c.id_cliente DESC`,
    [idContacto]
  );

  const historyResult = await pool.query(
    `SELECT seg.id_seguimiento,
        seg.id_solicitud,
        seg.descripcion,
        seg.origen,
        seg.estado_anterior,
        seg.estado_nuevo,
        seg.fecha_seguimiento,
        seg.creado_en,
        c.id_cliente,
        c.nombre AS cliente_nombre,
        c.apellido_paterno AS cliente_apellido_paterno,
        c.apellido_materno AS cliente_apellido_materno,
        tt.nombre_tramite AS tipo_tramite
     FROM public.clientes c
     JOIN public.solicitudes s ON s.id_cliente = c.id_cliente
     JOIN public.seguimientos seg ON seg.id_solicitud = s.id_solicitud
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     WHERE c.id_contacto = $1
     ORDER BY COALESCE(seg.creado_en, seg.fecha_seguimiento) DESC NULLS LAST
     LIMIT 30`,
    [idContacto]
  );

  return {
    contacto,
    aplicantes: rows,
    historial: historyResult.rows,
  };
}

async function createContacto(payload) {
  const nombreContacto = trimString(payload.nombre || payload.nombre_contacto);

  if (!nombreContacto) {
    throw badRequest('nombre is required');
  }

  const telefono = trimString(payload.telefono || payload.numero_contacto);
  const correo = trimString(payload.correo || payload.email);
  if (!telefono && !correo) {
    throw badRequest('telefono or correo is required');
  }

  const { rows } = await pool.query(
     `INSERT INTO public.contacto (
       nombre,
       telefono,
       correo,
       fecha_ingreso,
       telefono_emergencia,
      source_id
     )
     VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5, $6)
     RETURNING *`,
    [
      nombreContacto,
      telefono,
      correo,
      optionalDate(payload.fecha_ingreso, 'fecha_ingreso'),
      trimString(
        payload.telefono_emergencia ||
          payload.numero_emergencia ||
          payload.telefono_alternativo
      ),
      trimString(payload.source_id),
    ]
  );

  return rows[0];
}

async function updateContacto(id, payload) {
  const idContacto = positiveInteger(id, CONTACTO_PRIMARY_KEY);
  const allowedFields = {
    nombre: (value) => {
      const nombre = trimString(value);
      if (!nombre) throw badRequest('nombre cannot be empty');
      return nombre;
    },
    telefono: trimString,
    telefono_emergencia: trimString,
    correo: trimString,
    fecha_ingreso: (value) => optionalDate(value, 'fecha_ingreso'),
  };

  const entries = Object.entries(allowedFields)
    .filter(([field]) => Object.prototype.hasOwnProperty.call(payload, field))
    .map(([field, parser]) => [field, parser(payload[field])]);

  if (entries.length === 0) {
    throw badRequest('No valid fields provided');
  }

  const exists = await getContactoById(idContacto);
  if (!exists) {
    const error = new Error('Contacto not found');
    error.status = 404;
    throw error;
  }

  const setSql = entries.map(([field], index) => `${field} = $${index + 1}`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(idContacto);

  const { rows } = await pool.query(
    `UPDATE public.contacto
     SET ${setSql}
     WHERE id_contacto = $${values.length}
     RETURNING *`,
    values
  );

  return rows[0];
}

module.exports = {
  createContacto,
  getContactos,
  getContactoById,
  getAplicantesByContacto,
  updateContacto,
};
