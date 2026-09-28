const { pool } = require('../config/db');
const {
  getResumenAvanceSolicitud,
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

const normalizeBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'si', 'sí', 'yes'].includes(String(value).trim().toLowerCase());
};

async function ensureAreaExists(idArea) {
  const safeIdArea = positiveInteger(idArea, 'id_area');
  const { rows } = await pool.query(
    `SELECT id_area, clave, nombre
     FROM public.catalogo_areas
     WHERE id_area = $1 AND activo = true
     LIMIT 1`,
    [safeIdArea]
  );

  if (!rows[0]) {
    const error = new Error('Area not found');
    error.status = 404;
    throw error;
  }

  return rows[0];
}

async function resolveTipoTramite(value) {
  if (value === undefined || value === null || value === '') return null;

  const numericValue = Number(value);
  if (Number.isInteger(numericValue) && numericValue > 0) return numericValue;

  const nombre = trimString(value);
  if (!nombre) return null;

  const { rows } = await pool.query(
    `SELECT id_tipo_tramite
     FROM public.tipos_tramite
     WHERE lower(nombre_tramite) = lower($1)
     LIMIT 1`,
    [nombre]
  );

  if (!rows[0]) throw badRequest('tipo_tramite must match an existing tipo');
  return rows[0].id_tipo_tramite;
}

function buildCompactAvance(resumen) {
  if (!resumen) return null;
  return {
    perfil_porcentaje: resumen.perfil?.porcentaje_completado || 0,
    documentos_obligatorios_subidos: resumen.documentos?.obligatorios_subidos || 0,
    documentos_obligatorios_total: resumen.documentos?.obligatorios || 0,
    pdf_generado: Boolean(resumen.perfil?.pdf_generado),
    faltantes: Array.isArray(resumen.faltantes) ? resumen.faltantes.slice(0, 3) : [],
  };
}

async function getSolicitudesByArea(idArea, filters = {}) {
  const area = await ensureAreaExists(idArea);
  const values = [area.id_area];
  const where = ['s.id_area_actual = $1'];

  const idEmpleadoResponsable = optionalPositiveInteger(
    filters.id_empleado_responsable,
    'id_empleado_responsable'
  );
  const soloMisExpedientes = normalizeBoolean(filters.solo_mis_expedientes);

  if (soloMisExpedientes && !idEmpleadoResponsable) {
    throw badRequest('id_empleado_responsable is required when solo_mis_expedientes=true');
  }

  if (idEmpleadoResponsable) {
    values.push(idEmpleadoResponsable);
    where.push(`s.id_empleado_responsable = $${values.length}`);
  }

  if (filters.estado_actual !== undefined && filters.estado_actual !== null && filters.estado_actual !== '') {
    const estadoActual = await resolveEstadoActual(filters.estado_actual);
    values.push(estadoActual);
    where.push(`s.estado_actual = $${values.length}`);
  }

  if (filters.tipo_tramite !== undefined && filters.tipo_tramite !== null && filters.tipo_tramite !== '') {
    const idTipoTramite = await resolveTipoTramite(filters.tipo_tramite);
    values.push(idTipoTramite);
    where.push(`s.id_tipo_tramite = $${values.length}`);
  }

  const q = trimString(filters.q);
  if (q) {
    values.push(`%${q}%`);
    where.push(`(
      s.id_solicitud::text ILIKE $${values.length}
      OR c.nombre ILIKE $${values.length}
      OR c.apellido_paterno ILIKE $${values.length}
      OR c.apellido_materno ILIKE $${values.length}
      OR co.nombre ILIKE $${values.length}
      OR tt.nombre_tramite ILIKE $${values.length}
    )`);
  }

  const includeAvance = normalizeBoolean(filters.include_avance, true);

  const { rows } = await pool.query(
    `SELECT
       s.id_solicitud,
       s.id_solicitud AS folio,
       s.id_cliente,
       c.nombre AS cliente_nombre,
       c.apellido_paterno AS cliente_apellido_paterno,
       c.apellido_materno AS cliente_apellido_materno,
       c.id_contacto,
       co.nombre AS contacto_nombre,
       co.telefono AS contacto_telefono,
       co.correo AS contacto_correo,
       tt.id_tipo_tramite,
       tt.nombre_tramite AS tipo_tramite,
       s.estado_actual,
       ce.valor AS estado_actual_nombre,
       s.id_area_actual,
       ca.nombre AS area_actual_nombre,
       ca.clave AS area_actual_clave,
       s.id_empleado_responsable,
       e.nombre AS responsable_nombre,
       e.apellidos AS responsable_apellidos,
       e.area AS responsable_area,
       s.canal_contacto,
       s.fecha_inicio,
       s.fecha_ultimo_movimiento,
       s.fecha_proximo_contacto,
       s.resultado,
       (SELECT p.estado_pago FROM public.pagos p WHERE p.id_solicitud=s.id_solicitud ORDER BY COALESCE(p.fecha_validacion,p.fecha_pago,p.creado_en) DESC NULLS LAST,p.id_pago DESC LIMIT 1) AS estado_pago
     FROM public.solicitudes s
     LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
     LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
     LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
     LEFT JOIN public.empleados e ON e.id_empleado = s.id_empleado_responsable
     WHERE ${where.join('\n       AND ')}
     ORDER BY s.fecha_ultimo_movimiento DESC NULLS LAST, s.fecha_inicio DESC NULLS LAST, s.id_solicitud DESC`,
    values
  );

  const solicitudes = await Promise.all(rows.map(async (row) => {
    let avance = null;
    if (includeAvance) {
      try {
        avance = buildCompactAvance(await getResumenAvanceSolicitud(row.id_solicitud));
      } catch (error) {
        avance = null;
      }
    }

    const aplicante = [
      row.cliente_nombre,
      row.cliente_apellido_paterno,
      row.cliente_apellido_materno,
    ].filter(Boolean).join(' ');

    const responsable = [
      row.responsable_nombre,
      row.responsable_apellidos,
    ].filter(Boolean).join(' ');

    return {
      ...row,
      aplicante: aplicante || null,
      responsable_nombre_completo: responsable || null,
      avance,
    };
  }));

  return {
    area,
    solicitudes,
  };
}

module.exports = {
  getSolicitudesByArea,
};
