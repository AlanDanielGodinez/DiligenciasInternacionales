const { pool } = require('../config/db');
const { enrichActividad, assertElegible } = require('./amaActividad.service');
const {
  optionalDate,
  optionalPositiveInteger,
  positiveInteger,
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

const optionalBoolean = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'si', 'sí', 'yes'].includes(String(value).trim().toLowerCase());
};

const optionalNonNegativeInteger = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw badRequest(`${fieldName} must be a non-negative numeric value`);
  }
  return numberValue;
};

const checklistDefaultItems = [
  ['confirmar_lista_aplicantes', 'Confirmar lista de aplicantes', 'Validar que el grupo tenga los aplicantes correctos.'],
  ['revisar_documentos_base', 'Revisar documentos base', 'Confirmar documentos esenciales de los aplicantes.'],
  ['confirmar_pagos', 'Confirmar pagos', 'Revisar que los pagos requeridos estén registrados o validados.'],
  ['completar_perfiles', 'Completar perfiles', 'Confirmar perfiles AMA completos.'],
  ['definir_fecha_salida', 'Definir fecha de salida', 'Establecer fecha tentativa o confirmada de salida.'],
  ['confirmar_protocolo', 'Confirmar protocolo', 'Validar protocolo operativo del grupo.'],
  ['confirmar_itinerario', 'Confirmar itinerario', 'Confirmar vuelos, hoteles o traslados si aplica.'],
  ['cerrar_grupo', 'Cerrar grupo', 'Cerrar administrativamente el grupo.'],
];

const buildGrupoSelect = `
  SELECT
    ga.id_grupo_ama,
    ga.nombre_grupo,
    ga.id_tipo_tramite,
    tt.nombre_tramite AS tipo_tramite,
    ga.id_pais,
    cp.nombre_pais AS pais,
    ga.fecha_tentativa_salida,
    ga.fecha_confirmada_salida,
    ga.estado_grupo,
    ga.cupo_estimado,
    ga.id_empleado_responsable,
    e.nombre AS responsable_nombre,
    e.apellidos AS responsable_apellidos,
    e.area AS responsable_area,
    ga.observaciones,
    ga.activo,
    ga.creado_en,
    ga.actualizado_en,
    COALESCE(COUNT(gas.id_grupo_ama_solicitud) FILTER (WHERE gas.activo = true), 0)::int AS cantidad_solicitudes,
    CASE
      WHEN ga.cupo_estimado IS NULL THEN NULL
      ELSE GREATEST(ga.cupo_estimado - COALESCE(COUNT(gas.id_grupo_ama_solicitud) FILTER (WHERE gas.activo = true), 0)::int, 0)
    END AS cupo_disponible,
    CASE
      WHEN ga.cupo_estimado IS NULL OR ga.cupo_estimado = 0 THEN 0
      ELSE ROUND((COALESCE(COUNT(gas.id_grupo_ama_solicitud) FILTER (WHERE gas.activo = true), 0)::numeric / ga.cupo_estimado::numeric) * 100, 0)::int
    END AS porcentaje_ocupacion,
    COALESCE((
      SELECT COUNT(*)
      FROM public.grupo_ama_checklist gac
      WHERE gac.id_grupo_ama = ga.id_grupo_ama AND gac.activo = true
    ), 0)::int AS checklist_total,
    COALESCE((
      SELECT COUNT(*)
      FROM public.grupo_ama_checklist gac
      WHERE gac.id_grupo_ama = ga.id_grupo_ama AND gac.activo = true AND gac.completado = true
    ), 0)::int AS checklist_completados,
    CASE
      WHEN COALESCE((
        SELECT COUNT(*)
        FROM public.grupo_ama_checklist gac
        WHERE gac.id_grupo_ama = ga.id_grupo_ama AND gac.activo = true
      ), 0) = 0 THEN 0
      ELSE ROUND((
        COALESCE((
          SELECT COUNT(*)
          FROM public.grupo_ama_checklist gac
          WHERE gac.id_grupo_ama = ga.id_grupo_ama AND gac.activo = true AND gac.completado = true
        ), 0)::numeric
        / COALESCE((
          SELECT COUNT(*)
          FROM public.grupo_ama_checklist gac
          WHERE gac.id_grupo_ama = ga.id_grupo_ama AND gac.activo = true
        ), 1)::numeric
      ) * 100, 0)::int
    END AS avance_checklist
  FROM public.grupos_ama ga
  LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = ga.id_tipo_tramite
  LEFT JOIN public.catalogo_paises cp ON cp.id_pais = ga.id_pais
  LEFT JOIN public.empleados e ON e.id_empleado = ga.id_empleado_responsable
  LEFT JOIN public.grupo_ama_solicitudes gas ON gas.id_grupo_ama = ga.id_grupo_ama
`;

const mapGrupoRow = (row) => ({
  ...row,
  responsable: [row.responsable_nombre, row.responsable_apellidos].filter(Boolean).join(' ') || null,
});

const validateForeignKeys = async ({ idTipoTramite, idPais, idEmpleadoResponsable }, query = pool.query.bind(pool)) => {
  if (idTipoTramite) {
    const { rowCount } = await query(
      'SELECT 1 FROM public.tipos_tramite WHERE id_tipo_tramite = $1 LIMIT 1',
      [idTipoTramite]
    );
    if (!rowCount) throw notFound('Tipo de tramite not found');
  }

  if (idPais) {
    const { rowCount } = await query(
      'SELECT 1 FROM public.catalogo_paises WHERE id_pais = $1 LIMIT 1',
      [idPais]
    );
    if (!rowCount) throw notFound('Pais not found');
  }

  if (idEmpleadoResponsable) {
    const { rowCount } = await query(
      `SELECT 1 FROM public.empleados
       WHERE id_empleado = $1 AND COALESCE(activo, true) = true
       LIMIT 1`,
      [idEmpleadoResponsable]
    );
    if (!rowCount) throw notFound('Empleado active not found');
  }
};

const normalizeGrupoPayload = (payload = {}, partial = false) => {
  const normalized = {};

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'nombre_grupo')) {
    const nombreGrupo = trimString(payload.nombre_grupo);
    if (!nombreGrupo) throw badRequest('nombre_grupo is required');
    normalized.nombre_grupo = nombreGrupo;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'id_tipo_tramite')) {
    normalized.id_tipo_tramite = optionalPositiveInteger(payload.id_tipo_tramite, 'id_tipo_tramite');
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'id_pais')) {
    normalized.id_pais = optionalPositiveInteger(payload.id_pais, 'id_pais');
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'fecha_tentativa_salida')) {
    normalized.fecha_tentativa_salida = optionalDate(payload.fecha_tentativa_salida, 'fecha_tentativa_salida');
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'fecha_confirmada_salida')) {
    normalized.fecha_confirmada_salida = optionalDate(payload.fecha_confirmada_salida, 'fecha_confirmada_salida');
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'estado_grupo')) {
    normalized.estado_grupo = trimString(payload.estado_grupo) || 'activo';
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'cupo_estimado')) {
    normalized.cupo_estimado = optionalNonNegativeInteger(payload.cupo_estimado, 'cupo_estimado');
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'id_empleado_responsable')) {
    normalized.id_empleado_responsable = optionalPositiveInteger(
      payload.id_empleado_responsable,
      'id_empleado_responsable'
    );
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, 'observaciones')) {
    normalized.observaciones = trimString(payload.observaciones);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'activo')) {
    normalized.activo = optionalBoolean(payload.activo, true);
  }

  return normalized;
};

async function listGrupos(filters = {}) {
  const values = [];
  const where = [];

  if (filters.activo !== undefined && filters.activo !== '') {
    values.push(optionalBoolean(filters.activo, true));
    where.push(`ga.activo = $${values.length}`);
  } else {
    where.push('ga.activo = true');
  }

  const q = trimString(filters.q);
  if (q) {
    values.push(`%${q}%`);
    where.push(`(
      ga.nombre_grupo ILIKE $${values.length}
      OR tt.nombre_tramite ILIKE $${values.length}
      OR cp.nombre_pais ILIKE $${values.length}
      OR ga.estado_grupo ILIKE $${values.length}
      OR e.nombre ILIKE $${values.length}
      OR e.apellidos ILIKE $${values.length}
    )`);
  }

  const idTipoTramite = optionalPositiveInteger(filters.id_tipo_tramite, 'id_tipo_tramite');
  if (idTipoTramite) {
    values.push(idTipoTramite);
    where.push(`ga.id_tipo_tramite = $${values.length}`);
  }

  const idPais = optionalPositiveInteger(filters.id_pais, 'id_pais');
  if (idPais) {
    values.push(idPais);
    where.push(`ga.id_pais = $${values.length}`);
  }

  const estadoGrupo = trimString(filters.estado_grupo);
  if (estadoGrupo) {
    values.push(estadoGrupo);
    where.push(`lower(ga.estado_grupo) = lower($${values.length})`);
  }

  const idEmpleadoResponsable = optionalPositiveInteger(
    filters.id_empleado_responsable,
    'id_empleado_responsable'
  );
  if (idEmpleadoResponsable) {
    values.push(idEmpleadoResponsable);
    where.push(`ga.id_empleado_responsable = $${values.length}`);
  }

  const { rows } = await pool.query(
    `${buildGrupoSelect}
     ${where.length ? `WHERE ${where.join('\n       AND ')}` : ''}
     GROUP BY ga.id_grupo_ama, tt.nombre_tramite, cp.nombre_pais, e.nombre, e.apellidos, e.area
     ORDER BY ga.actualizado_en DESC NULLS LAST, ga.creado_en DESC NULLS LAST, ga.id_grupo_ama DESC`,
    values
  );

  return rows.map(mapGrupoRow);
}

async function getGrupoById(idGrupo, query = pool.query.bind(pool)) {
  const safeIdGrupo = positiveInteger(idGrupo, 'id_grupo_ama');
  const { rows } = await query(
    `${buildGrupoSelect}
     WHERE ga.id_grupo_ama = $1
     GROUP BY ga.id_grupo_ama, tt.nombre_tramite, cp.nombre_pais, e.nombre, e.apellidos, e.area
     LIMIT 1`,
    [safeIdGrupo]
  );

  if (!rows[0]) throw notFound('Grupo AMA not found');
  return mapGrupoRow(rows[0]);
}

async function createGrupo(payload = {}) {
  const data = normalizeGrupoPayload(payload);
  await validateForeignKeys({
    idTipoTramite: data.id_tipo_tramite,
    idPais: data.id_pais,
    idEmpleadoResponsable: data.id_empleado_responsable,
  });

  const { rows } = await pool.query(
    `INSERT INTO public.grupos_ama (
       nombre_grupo, id_tipo_tramite, id_pais, fecha_tentativa_salida,
       fecha_confirmada_salida, estado_grupo, cupo_estimado,
       id_empleado_responsable, observaciones, activo
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10, true))
     RETURNING id_grupo_ama`,
    [
      data.nombre_grupo,
      data.id_tipo_tramite,
      data.id_pais,
      data.fecha_tentativa_salida,
      data.fecha_confirmada_salida,
      data.estado_grupo,
      data.cupo_estimado,
      data.id_empleado_responsable,
      data.observaciones,
      data.activo,
    ]
  );

  return getGrupoById(rows[0].id_grupo_ama);
}

async function updateGrupo(idGrupo, payload = {}) {
  const safeIdGrupo = positiveInteger(idGrupo, 'id_grupo_ama');
  const data = normalizeGrupoPayload(payload, true);

  if (!Object.keys(data).length) throw badRequest('No valid fields provided');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT id_grupo_ama FROM public.grupos_ama WHERE id_grupo_ama=$1 FOR UPDATE', [safeIdGrupo]);
    await getGrupoById(safeIdGrupo, client.query.bind(client));
    await validateForeignKeys({
      idTipoTramite: data.id_tipo_tramite,
      idPais: data.id_pais,
      idEmpleadoResponsable: data.id_empleado_responsable,
    }, client.query.bind(client));

    if (Object.prototype.hasOwnProperty.call(data, 'cupo_estimado') && data.cupo_estimado !== null) {
      const { rows } = await client.query(
        `SELECT COUNT(*)::int AS cantidad
         FROM public.grupo_ama_solicitudes
         WHERE id_grupo_ama = $1 AND activo = true`,
        [safeIdGrupo]
      );
      if (data.cupo_estimado < rows[0].cantidad) {
        throw badRequest('cupo_estimado cannot be less than current active solicitudes count');
      }
    }

    const fields = [];
    const values = [];
    Object.entries(data).forEach(([key, value]) => {
      values.push(value);
      fields.push(`${key} = $${values.length}`);
    });
    values.push(safeIdGrupo);

    await client.query(
      `UPDATE public.grupos_ama
       SET ${fields.join(', ')}, actualizado_en = NOW()
       WHERE id_grupo_ama = $${values.length}`,
      values
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return getGrupoById(safeIdGrupo);
}

async function listChecklist(idGrupo, query = pool.query.bind(pool)) {
  const safeIdGrupo = positiveInteger(idGrupo, 'id_grupo_ama');
  await getGrupoById(safeIdGrupo, query);

  const { rows } = await query(
    `SELECT
       id_checklist,
       id_grupo_ama,
       clave_item,
       titulo,
       descripcion,
       completado,
       fecha_completado,
       completado_por,
       orden,
       activo,
       creado_en,
       actualizado_en
     FROM public.grupo_ama_checklist
     WHERE id_grupo_ama = $1 AND activo = true
     ORDER BY orden ASC, id_checklist ASC`,
    [safeIdGrupo]
  );

  return rows;
}

async function generateChecklist(idGrupo) {
  const safeIdGrupo = positiveInteger(idGrupo, 'id_grupo_ama');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await getGrupoById(safeIdGrupo, client.query.bind(client));

    for (const [index, [claveItem, titulo, descripcion]] of checklistDefaultItems.entries()) {
      await client.query(
        `INSERT INTO public.grupo_ama_checklist (
           id_grupo_ama,
           clave_item,
           titulo,
           descripcion,
           completado,
           orden,
           activo,
           creado_en,
           actualizado_en
         )
         SELECT $1::integer, $2::varchar, $3::varchar, $4::text, false, $5::integer, true, NOW(), NOW()
         WHERE NOT EXISTS (
           SELECT 1
           FROM public.grupo_ama_checklist
           WHERE id_grupo_ama = $1::integer AND clave_item = $2::varchar AND activo = true
         )`,
        [safeIdGrupo, claveItem, titulo, descripcion, index + 1]
      );
    }

    await client.query(
      'UPDATE public.grupos_ama SET actualizado_en = NOW() WHERE id_grupo_ama = $1',
      [safeIdGrupo]
    );

    await client.query('COMMIT');
    return listChecklist(safeIdGrupo);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateChecklistItem(idGrupo, idChecklist, payload = {}) {
  const safeIdGrupo = positiveInteger(idGrupo, 'id_grupo_ama');
  const safeIdChecklist = positiveInteger(idChecklist, 'id_checklist');
  const fields = [];
  const values = [];

  await getGrupoById(safeIdGrupo);

  if (Object.prototype.hasOwnProperty.call(payload, 'titulo')) {
    const titulo = trimString(payload.titulo);
    if (!titulo) throw badRequest('titulo cannot be empty');
    values.push(titulo);
    fields.push(`titulo = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'descripcion')) {
    values.push(trimString(payload.descripcion));
    fields.push(`descripcion = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'orden')) {
    values.push(optionalNonNegativeInteger(payload.orden, 'orden') || 0);
    fields.push(`orden = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'completado')) {
    const completado = optionalBoolean(payload.completado, false);
    values.push(completado);
    fields.push(`completado = $${values.length}`);
    values.push(completado ? new Date() : null);
    fields.push(`fecha_completado = $${values.length}`);
    values.push(completado ? optionalPositiveInteger(payload.completado_por, 'completado_por') : null);
    fields.push(`completado_por = $${values.length}`);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'activo')) {
    values.push(optionalBoolean(payload.activo, true));
    fields.push(`activo = $${values.length}`);
  }

  if (!fields.length) throw badRequest('No valid checklist fields provided');

  values.push(safeIdGrupo);
  values.push(safeIdChecklist);

  const { rows } = await pool.query(
    `UPDATE public.grupo_ama_checklist
     SET ${fields.join(', ')}, actualizado_en = NOW()
     WHERE id_grupo_ama = $${values.length - 1}
       AND id_checklist = $${values.length}
     RETURNING *`,
    values
  );

  if (!rows[0]) throw notFound('Checklist item not found');

  await pool.query(
    'UPDATE public.grupos_ama SET actualizado_en = NOW() WHERE id_grupo_ama = $1',
    [safeIdGrupo]
  );

  return rows[0];
}

async function listGrupoSolicitudes(idGrupo, query = pool.query.bind(pool)) {
  const safeIdGrupo = positiveInteger(idGrupo, 'id_grupo_ama');
  await getGrupoById(safeIdGrupo, query);

  const { rows } = await query(
    `SELECT
       gas.id_grupo_ama_solicitud,
       gas.id_grupo_ama,
       gas.id_solicitud,
       gas.id_cliente,
       gas.agregado_en,
       s.fecha_inicio,
       s.estado_actual,
       s.resultado,
       s.ama_visa_recibida,
       EXISTS(SELECT 1 FROM actividades_solicitud a WHERE a.id_solicitud=s.id_solicitud AND a.tipo='DS' AND a.resultado='TERMINADA') AS ds_terminada,
       EXISTS(SELECT 1 FROM notas_solicitud n WHERE n.id_solicitud=s.id_solicitud AND n.contexto='PROTOCOLO') AS protocolo_registrado,
       EXISTS(SELECT 1 FROM ama_llamadas_agendadas l WHERE l.id_solicitud=s.id_solicitud AND l.tipo='ENTREVISTA_CONSULAR') AS cita_registrada,
       ce.valor AS estado,
       s.id_empleado_responsable,
       e.nombre AS responsable_nombre,
       e.apellidos AS responsable_apellidos,
       tt.nombre_tramite AS tipo_tramite,
       c.nombre AS cliente_nombre,
       c.apellido_paterno,
       c.apellido_materno,
       co.nombre AS contacto_nombre
     FROM public.grupo_ama_solicitudes gas
     JOIN public.solicitudes s ON s.id_solicitud = gas.id_solicitud
     LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
     LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
     LEFT JOIN public.empleados e ON e.id_empleado = s.id_empleado_responsable
     WHERE gas.id_grupo_ama = $1 AND gas.activo = true
     ORDER BY gas.agregado_en DESC, gas.id_grupo_ama_solicitud DESC`,
    [safeIdGrupo]
  );

  return enrichActividad(rows.map((row) => ({
    ...row,
    aplicante: [row.cliente_nombre, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(' ') || null,
    responsable: [row.responsable_nombre, row.responsable_apellidos].filter(Boolean).join(' ') || null,
  })), query);
}

async function listCandidatos(filters = {}) {
  const values = [];
  const where = [
    `s.id_area_actual = 4`,
    `NOT EXISTS (
       SELECT 1
       FROM public.grupo_ama_solicitudes gas
       WHERE gas.id_solicitud = s.id_solicitud AND gas.activo = true
     )`,
  ];

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

  const idTipoTramite = optionalPositiveInteger(filters.id_tipo_tramite, 'id_tipo_tramite');
  if (idTipoTramite) {
    values.push(idTipoTramite);
    where.push(`s.id_tipo_tramite = $${values.length}`);
  }

  const { rows } = await pool.query(
    `SELECT
       s.id_solicitud,
       s.id_cliente,
       s.fecha_inicio,
       ce.valor AS estado,
       tt.nombre_tramite AS tipo_tramite,
       c.nombre AS cliente_nombre,
       c.apellido_paterno,
       c.apellido_materno,
       co.nombre AS contacto,
       e.nombre AS responsable_nombre,
       e.apellidos AS responsable_apellidos
     FROM public.solicitudes s
     LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
     LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
     LEFT JOIN public.empleados e ON e.id_empleado = s.id_empleado_responsable
     WHERE ${where.join('\n       AND ')}
     ORDER BY s.fecha_inicio DESC NULLS LAST, s.id_solicitud DESC`,
    values
  );

  return enrichActividad(rows.map((row) => ({
    ...row,
    aplicante: [row.cliente_nombre, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(' ') || null,
    responsable: [row.responsable_nombre, row.responsable_apellidos].filter(Boolean).join(' ') || null,
  })));
}

async function addSolicitudesToGrupo(idGrupo, payload = {}) {
  const safeIdGrupo = positiveInteger(idGrupo, 'id_grupo_ama');
  const ids = Array.isArray(payload.id_solicitudes)
    ? payload.id_solicitudes
    : [payload.id_solicitud].filter((value) => value !== undefined);

  const idSolicitudes = [...new Set(ids.map((value) => positiveInteger(value, 'id_solicitud')))].sort((a,b)=>a-b);
  if (!idSolicitudes.length) throw badRequest('id_solicitudes is required');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT id_grupo_ama FROM public.grupos_ama WHERE id_grupo_ama=$1 FOR UPDATE', [safeIdGrupo]);
    const grupo = await getGrupoById(safeIdGrupo, client.query.bind(client));
    if (!grupo.activo) throw badRequest('El grupo AMA está inactivo');

    if (grupo.cupo_estimado !== null && grupo.cupo_estimado !== undefined) {
      const activeResult = await client.query(
        `SELECT id_solicitud
         FROM public.grupo_ama_solicitudes
         WHERE id_grupo_ama = $1 AND activo = true`,
        [safeIdGrupo]
      );
      const actuales = new Set(activeResult.rows.map((row) => Number(row.id_solicitud)));
      const nuevas = idSolicitudes.filter((idSolicitud) => !actuales.has(Number(idSolicitud)));
      if (actuales.size + nuevas.length > Number(grupo.cupo_estimado)) {
        throw badRequest('El cupo del grupo está lleno o no permite agregar todas las solicitudes seleccionadas');
      }
    }

    const agregadas = [];
    for (const idSolicitud of idSolicitudes) {
      const solicitudResult = await client.query(
        `SELECT s.id_solicitud, s.id_cliente, s.id_area_actual
         FROM public.solicitudes s
         WHERE s.id_solicitud = $1
         LIMIT 1 FOR UPDATE`,
        [idSolicitud]
      );
      const solicitud = solicitudResult.rows[0];
      if (!solicitud) throw notFound(`Solicitud ${idSolicitud} not found`);
      if (solicitud.id_area_actual !== 4) {
        throw badRequest(`Solicitud ${idSolicitud} is not assigned to AMA`);
      }
      await assertElegible(idSolicitud, client.query.bind(client));

      const activeGroupResult = await client.query(
        `SELECT id_grupo_ama
         FROM public.grupo_ama_solicitudes
         WHERE id_solicitud = $1 AND activo = true
         LIMIT 1`,
        [idSolicitud]
      );
      if (activeGroupResult.rows[0]) {
        if (Number(activeGroupResult.rows[0].id_grupo_ama) === safeIdGrupo) {
          throw badRequest(`Solicitud ${idSolicitud} already belongs to this AMA group`);
        }
        throw badRequest(`Solicitud ${idSolicitud} already belongs to another active AMA group`);
      }

      const existingResult = await client.query(
        `SELECT id_grupo_ama_solicitud
         FROM public.grupo_ama_solicitudes
         WHERE id_grupo_ama = $1 AND id_solicitud = $2
         LIMIT 1`,
        [safeIdGrupo, idSolicitud]
      );

      if (existingResult.rows[0]) {
        await client.query(
          `UPDATE public.grupo_ama_solicitudes
           SET activo = true, id_cliente = $3, agregado_en = NOW()
           WHERE id_grupo_ama = $1 AND id_solicitud = $2`,
          [safeIdGrupo, idSolicitud, solicitud.id_cliente]
        );
      } else {
        await client.query(
          `INSERT INTO public.grupo_ama_solicitudes (id_grupo_ama, id_solicitud, id_cliente)
           VALUES ($1, $2, $3)`,
          [safeIdGrupo, idSolicitud, solicitud.id_cliente]
        );
      }
      agregadas.push(idSolicitud);
    }

    await client.query(
      'UPDATE public.grupos_ama SET actualizado_en = NOW() WHERE id_grupo_ama = $1',
      [safeIdGrupo]
    );

    await client.query('COMMIT');
    return {
      grupo: await getGrupoById(safeIdGrupo),
      solicitudes: await listGrupoSolicitudes(safeIdGrupo),
      agregadas,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function removeSolicitudFromGrupo(idGrupo, idSolicitud) {
  const safeIdGrupo = positiveInteger(idGrupo, 'id_grupo_ama');
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');

  const { rowCount } = await pool.query(
    `UPDATE public.grupo_ama_solicitudes
     SET activo = false
     WHERE id_grupo_ama = $1 AND id_solicitud = $2 AND activo = true`,
    [safeIdGrupo, safeIdSolicitud]
  );

  if (!rowCount) throw notFound('Solicitud not found in active AMA group');

  await pool.query(
    'UPDATE public.grupos_ama SET actualizado_en = NOW() WHERE id_grupo_ama = $1',
    [safeIdGrupo]
  );

  return { ok: true, id_grupo_ama: safeIdGrupo, id_solicitud: safeIdSolicitud };
}

async function getGrupoDetalle(idGrupo) {
  const grupo = await getGrupoById(idGrupo);
  const [solicitudes, checklist] = await Promise.all([
    listGrupoSolicitudes(grupo.id_grupo_ama),
    listChecklist(grupo.id_grupo_ama),
  ]);

  return {
    ...grupo,
    solicitudes,
    checklist,
    resumen_cupo: {
      cupo_estimado: grupo.cupo_estimado,
      cantidad_solicitudes: grupo.cantidad_solicitudes,
      cupo_disponible: grupo.cupo_disponible,
      porcentaje_ocupacion: grupo.porcentaje_ocupacion,
    },
    resumen_checklist: {
      total: grupo.checklist_total,
      completados: grupo.checklist_completados,
      porcentaje: grupo.avance_checklist,
    },
    proximas_fechas: {
      fecha_tentativa_salida: grupo.fecha_tentativa_salida,
      fecha_confirmada_salida: grupo.fecha_confirmada_salida,
    },
  };
}

async function listAplicantesGlobal(filters = {}) {
  const values = [], where = ['gas.activo=true'];
  const add = (sql, value) => { values.push(value); where.push(`${sql} $${values.length}`); };
  if (filters.id_grupo) add('gas.id_grupo_ama =', positiveInteger(filters.id_grupo, 'id_grupo'));
  if (filters.id_empleado) add('s.id_empleado_responsable =', positiveInteger(filters.id_empleado, 'id_empleado'));
  if (trimString(filters.estado)) { values.push(trimString(filters.estado)); where.push(`lower(ce.valor) = lower($${values.length})`); }
  const q = trimString(filters.q); if (q) { values.push(`%${q}%`); where.push(`(c.nombre ILIKE $${values.length} OR c.apellido_paterno ILIKE $${values.length} OR ga.nombre_grupo ILIKE $${values.length})`); }
  const { rows } = await pool.query(`SELECT gas.id_grupo_ama_solicitud,gas.id_grupo_ama,s.id_solicitud,
    concat_ws(' ',c.nombre,c.apellido_paterno,c.apellido_materno) aplicante,ga.nombre_grupo,
    tt.nombre_tramite tipo_tramite,ce.valor estado,e.id_empleado,e.nombre responsable_nombre,e.apellidos responsable_apellidos,
    s.fecha_inicio,s.resultado,s.ama_visa_recibida,
    EXISTS(SELECT 1 FROM actividades_solicitud a WHERE a.id_solicitud=s.id_solicitud AND a.tipo='DS' AND a.resultado='TERMINADA') ds_terminada,
    EXISTS(SELECT 1 FROM notas_solicitud n WHERE n.id_solicitud=s.id_solicitud AND n.contexto='PROTOCOLO') protocolo_registrado,
    EXISTS(SELECT 1 FROM ama_llamadas_agendadas l WHERE l.id_solicitud=s.id_solicitud AND l.tipo='ENTREVISTA_CONSULAR') cita_registrada
    FROM grupo_ama_solicitudes gas JOIN grupos_ama ga ON ga.id_grupo_ama=gas.id_grupo_ama
    JOIN solicitudes s ON s.id_solicitud=gas.id_solicitud JOIN clientes c ON c.id_cliente=s.id_cliente
    LEFT JOIN tipos_tramite tt ON tt.id_tipo_tramite=s.id_tipo_tramite LEFT JOIN catalogo_estatus ce ON ce.id=s.estado_actual
    LEFT JOIN empleados e ON e.id_empleado=s.id_empleado_responsable WHERE ${where.join(' AND ')}
    ORDER BY ga.nombre_grupo,c.nombre,c.apellido_paterno`, values);
  return rows;
}

async function terminarGrupo(idGrupo,payload={}){const id=positiveInteger(idGrupo,'id_grupo_ama'),employee=optionalPositiveInteger(payload.id_empleado,'id_empleado');const client=await pool.connect();try{await client.query('BEGIN');const group=(await client.query('SELECT * FROM grupos_ama WHERE id_grupo_ama=$1 FOR UPDATE',[id])).rows[0];if(!group)throw notFound('Grupo AMA not found');const appointment=await client.query(`SELECT 1 FROM grupo_ama_solicitudes gas JOIN ama_llamadas_agendadas l ON l.id_solicitud=gas.id_solicitud WHERE gas.id_grupo_ama=$1 AND gas.activo=true AND l.tipo='ENTREVISTA_CONSULAR' LIMIT 1`,[id]);if(!appointment.rowCount)throw badRequest('El grupo requiere una entrevista consular registrada');await client.query("UPDATE grupos_ama SET estado_grupo='GRUPO TERMINADO',actualizado_en=NOW() WHERE id_grupo_ama=$1",[id]);await client.query(`INSERT INTO seguimientos(id_seguimiento,id_solicitud,estado_anterior,estado_nuevo,descripcion,id_empleado_responsable,fecha_seguimiento,origen,creado_en) SELECT COALESCE((SELECT MAX(id_seguimiento) FROM seguimientos),0)+ROW_NUMBER() OVER(),s.id_solicitud,s.estado_actual,s.estado_actual,'Grupo AMA terminado',$2,CURRENT_DATE,'ama_grupo_terminado',NOW() FROM grupo_ama_solicitudes gas JOIN solicitudes s ON s.id_solicitud=gas.id_solicitud WHERE gas.id_grupo_ama=$1 AND gas.activo=true`,[id,employee]);await client.query('COMMIT');return getGrupoById(id)}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}}

module.exports = {
  addSolicitudesToGrupo,
  createGrupo,
  generateChecklist,
  getGrupoById,
  getGrupoDetalle,
  listCandidatos,
  listAplicantesGlobal,
  listChecklist,
  listGrupoSolicitudes,
  listGrupos,
  removeSolicitudFromGrupo,
  updateChecklistItem,
  updateGrupo,
  terminarGrupo,
};
