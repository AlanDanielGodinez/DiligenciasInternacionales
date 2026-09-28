const { pool } = require('../config/db');
const { randomUUID } = require('crypto');
const {
  isV2Template,
  validateProfile,
  calculateCompletion,
  validateEditableChanges,
} = require('./perfilesEngineV2');

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

const positiveInteger = (value, fieldName) => {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw badRequest(`${fieldName} must be a positive numeric value`);
  }
  return numberValue;
};

const optionalPositiveInteger = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return null;
  return positiveInteger(value, fieldName);
};

const trimString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const ensureJsonObject = (value, fieldName) => {
  const candidate = value === undefined || value === null ? {} : value;
  if (
    typeof candidate !== 'object' ||
    Array.isArray(candidate) ||
    candidate === null
  ) {
    throw badRequest(`${fieldName} must be a JSON object`);
  }
  return candidate;
};

const ensureRepeatersObject = (value) => {
  const repeaters = ensureJsonObject(value, 'repeaters');
  for (const [groupKey, items] of Object.entries(repeaters)) {
    if (!groupKey || !Array.isArray(items)) throw badRequest(`repeaters.${groupKey} must be an array`);
    items.forEach((item, index) => {
      const data = item?.data === undefined ? item : item.data;
      ensureJsonObject(data, `repeaters.${groupKey}[${index}].data`);
    });
  }
  return repeaters;
};

const canonicalizeRepeaters = (repeaters) => Object.fromEntries(
  Object.entries(repeaters).map(([groupKey, items]) => [
    groupKey,
    items.map((item, index) => ({
      item_uuid: /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(String(item?.item_uuid || ''))
        ? item.item_uuid
        : randomUUID(),
      orden: index,
      data: item?.data === undefined ? item : item.data,
    })),
  ])
);

const normalizeEstado = (value, fallback = 'borrador') => {
  const estado = String(value || fallback).trim().toLowerCase();
  if (!['borrador', 'completo'].includes(estado)) throw badRequest('estado must be borrador or completo');
  return estado;
};

const validationError = (inspection) => {
  const error = badRequest('El perfil contiene errores de validación');
  error.details = { errors: inspection.errors, completion: inspection.completion };
  return error;
};

async function loadRepeaters(idPerfil, query = pool.query.bind(pool)) {
  const { rows } = await query(
    `SELECT grupo_key, item_uuid::text, orden, datos_json, creado_por, actualizado_por, creado_en, actualizado_en
     FROM public.perfil_respuestas_repetibles
     WHERE id_perfil = $1
     ORDER BY grupo_key, orden, id_repetible`,
    [idPerfil]
  );
  return rows.reduce((result, row) => {
    if (!result[row.grupo_key]) result[row.grupo_key] = [];
    result[row.grupo_key].push({
      item_uuid: row.item_uuid,
      orden: row.orden,
      data: row.datos_json,
      creado_por: row.creado_por,
      actualizado_por: row.actualizado_por,
      creado_en: row.creado_en,
      actualizado_en: row.actualizado_en,
    });
    return result;
  }, {});
}

async function replaceRepeaters(query, idPerfil, repeaters, actor) {
  const retainedUuids = [];
  for (const [groupKey, items] of Object.entries(repeaters)) {
    for (const [index, item] of items.entries()) {
      const data = item?.data === undefined ? item : item.data;
      const itemUuid = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(String(item?.item_uuid || ''))
        ? item.item_uuid
        : randomUUID();
      retainedUuids.push(itemUuid);
      await query(
        `INSERT INTO public.perfil_respuestas_repetibles
           (id_perfil, grupo_key, item_uuid, orden, datos_json, creado_por, actualizado_por)
         VALUES ($1, $2, $3::uuid, $4, $5::jsonb, $6, $6)
         ON CONFLICT (id_perfil, grupo_key, item_uuid) DO UPDATE
           SET orden = EXCLUDED.orden,
               datos_json = EXCLUDED.datos_json,
               actualizado_por = EXCLUDED.actualizado_por,
               actualizado_en = NOW()`,
        [idPerfil, groupKey, itemUuid, index, JSON.stringify(data), actor]
      );
    }
  }
  if (retainedUuids.length) {
    await query(
      'DELETE FROM public.perfil_respuestas_repetibles WHERE id_perfil = $1 AND NOT (item_uuid = ANY($2::uuid[]))',
      [idPerfil, retainedUuids]
    );
  } else {
    await query('DELETE FROM public.perfil_respuestas_repetibles WHERE id_perfil = $1', [idPerfil]);
  }
}

const PROFILE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS public.perfil_plantillas (
  id_plantilla serial PRIMARY KEY,
  nombre varchar NOT NULL,
  id_tipo_tramite integer NULL REFERENCES public.tipos_tramite(id_tipo_tramite),
  id_pais integer NULL REFERENCES public.catalogo_paises(id_pais),
  clave varchar NOT NULL UNIQUE,
  version integer NOT NULL DEFAULT 1,
  estructura_json jsonb NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamp DEFAULT now(),
  actualizado_en timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.perfiles_solicitud (
  id_perfil serial PRIMARY KEY,
  id_solicitud integer NOT NULL REFERENCES public.solicitudes(id_solicitud),
  id_cliente integer NOT NULL REFERENCES public.clientes(id_cliente),
  id_plantilla integer NOT NULL REFERENCES public.perfil_plantillas(id_plantilla),
  version_actual integer NOT NULL DEFAULT 1,
  respuestas_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  estado varchar NOT NULL DEFAULT 'borrador',
  creado_por integer NULL REFERENCES public.empleados(id_empleado),
  actualizado_por integer NULL REFERENCES public.empleados(id_empleado),
  creado_en timestamp DEFAULT now(),
  actualizado_en timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.perfiles_solicitud_versiones (
  id_version serial PRIMARY KEY,
  id_perfil integer NOT NULL REFERENCES public.perfiles_solicitud(id_perfil) ON DELETE CASCADE,
  version integer NOT NULL,
  respuestas_json jsonb NOT NULL,
  motivo_cambio text,
  creado_por integer NULL REFERENCES public.empleados(id_empleado),
  creado_en timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_perfiles_solicitud_id_solicitud
  ON public.perfiles_solicitud(id_solicitud);

CREATE INDEX IF NOT EXISTS idx_perfiles_solicitud_id_cliente
  ON public.perfiles_solicitud(id_cliente);

CREATE INDEX IF NOT EXISTS idx_perfil_plantillas_tipo_pais_activo
  ON public.perfil_plantillas(id_tipo_tramite, id_pais, activo);

CREATE INDEX IF NOT EXISTS idx_perfiles_solicitud_versiones_perfil_version
  ON public.perfiles_solicitud_versiones(id_perfil, version);

CREATE UNIQUE INDEX IF NOT EXISTS uq_perfiles_solicitud_activo_principal
  ON public.perfiles_solicitud(id_solicitud)
  WHERE estado <> 'archivado';
`;

async function runMigration(query = pool.query.bind(pool)) {
  await query(PROFILE_SCHEMA_SQL);
}

async function diagnosePerfilTables() {
  const { rows: tables } = await pool.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND (
         table_name ILIKE '%perfil%'
         OR table_name IN (
           'perfil_ama',
           'perfiles',
           'perfiles_solicitud',
           'perfil_plantillas',
           'perfiles_solicitud_versiones'
         )
       )
     ORDER BY table_name`
  );

  const result = {};

  for (const table of tables) {
    const { rows: columns } = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = $1
       ORDER BY ordinal_position`,
      [table.table_name]
    );

    const { rows: primaryKey } = await pool.query(
      `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = 'public'
         AND tc.table_name = $1
         AND tc.constraint_type = 'PRIMARY KEY'
       ORDER BY kcu.ordinal_position`,
      [table.table_name]
    );

    result[table.table_name] = {
      columns,
      primary_key: primaryKey.map((row) => row.column_name),
    };
  }

  return result;
}

async function getPlantillas({ includeInactive = false } = {}) {
  const { rows } = await pool.query(
    `SELECT id_plantilla, nombre, id_tipo_tramite, id_pais, clave, version,
            estructura_json, activo, creado_en, actualizado_en
     FROM public.perfil_plantillas
     WHERE ($1::boolean = true OR activo = true)
     ORDER BY id_tipo_tramite NULLS LAST, id_pais NULLS LAST, clave`,
    [Boolean(includeInactive)]
  );

  return rows;
}

async function resolverPlantilla({ id_tipo_tramite: idTipoTramite, id_pais: idPais }) {
  const safeIdTipoTramite = positiveInteger(idTipoTramite, 'id_tipo_tramite');
  const safeIdPais = optionalPositiveInteger(idPais, 'id_pais');

  const params = [safeIdTipoTramite];
  let specificCountrySql = 'false';
  if (safeIdPais) {
    params.push(safeIdPais);
    specificCountrySql = `id_pais = $${params.length}`;
  }

  const { rows } = await pool.query(
    `SELECT id_plantilla, nombre, id_tipo_tramite, id_pais, clave, version,
            estructura_json, activo, creado_en, actualizado_en
     FROM public.perfil_plantillas
     WHERE activo = true
       AND id_tipo_tramite = $1
       AND (${specificCountrySql} OR id_pais IS NULL)
     ORDER BY
       CASE WHEN ${specificCountrySql} THEN 0 ELSE 1 END,
       version DESC,
       id_plantilla DESC
     LIMIT 1`,
    params
  );

  return rows[0] || null;
}

async function getSolicitudForPerfil(idSolicitud, query = pool.query.bind(pool)) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const { rows } = await query(
    `SELECT id_solicitud, id_cliente
     FROM public.solicitudes
     WHERE id_solicitud = $1
     LIMIT 1`,
    [safeIdSolicitud]
  );

  if (!rows[0]) {
    throw notFound('Solicitud not found');
  }

  return rows[0];
}

async function getPlantillaActiva(idPlantilla, query = pool.query.bind(pool)) {
  const safeIdPlantilla = positiveInteger(idPlantilla, 'id_plantilla');
  const { rows } = await query(
    `SELECT id_plantilla, version, estructura_json
     FROM public.perfil_plantillas
     WHERE id_plantilla = $1
       AND activo = true
     LIMIT 1`,
    [safeIdPlantilla]
  );

  if (!rows[0]) {
    throw notFound('Plantilla not found or inactive');
  }

  return rows[0];
}

async function getPerfilBySolicitud(idSolicitud) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const { rows } = await pool.query(
    `SELECT ps.id_perfil, ps.id_solicitud, ps.id_cliente, ps.id_plantilla,
            ps.version_actual, ps.respuestas_json, ps.estado,
            ps.creado_por, ps.actualizado_por, ps.creado_en, ps.actualizado_en,
            ps.completitud_porcentaje, ps.completitud_json,
            pp.nombre AS plantilla_nombre, pp.clave AS plantilla_clave,
            pp.version AS plantilla_version, pp.estructura_json
     FROM public.perfiles_solicitud ps
     JOIN public.perfil_plantillas pp ON pp.id_plantilla = ps.id_plantilla
     WHERE ps.id_solicitud = $1
       AND ps.estado <> 'archivado'
     ORDER BY ps.id_perfil DESC
     LIMIT 1`,
    [safeIdSolicitud]
  );

  if (!rows[0]) return null;
  if (isV2Template(rows[0].estructura_json)) rows[0].repeaters = await loadRepeaters(rows[0].id_perfil);
  return rows[0];
}

async function createPerfilForSolicitud(idSolicitud, payload) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const idPlantilla = positiveInteger(payload.id_plantilla, 'id_plantilla');
  const respuestasJson = ensureJsonObject(payload.respuestas_json, 'respuestas_json');
  const creadoPor = optionalPositiveInteger(payload.creado_por, 'creado_por');
  const estado = normalizeEstado(payload.estado);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const solicitud = await getSolicitudForPerfil(safeIdSolicitud, client.query.bind(client));
    if (
      payload.id_cliente !== undefined &&
      payload.id_cliente !== null &&
      Number(payload.id_cliente) !== Number(solicitud.id_cliente)
    ) {
      throw badRequest('id_cliente must match solicitud.id_cliente');
    }

    const plantilla = await getPlantillaActiva(idPlantilla, client.query.bind(client));
    const isV2 = isV2Template(plantilla.estructura_json);
    const repeaters = isV2 ? canonicalizeRepeaters(ensureRepeatersObject(payload.repeaters || {})) : {};
    const inspection = isV2
      ? validateProfile(plantilla.estructura_json, respuestasJson, repeaters, { complete: estado === 'completo' })
      : { valid: true, errors: [], completion: { percentage: 0, sections: [] } };
    if (!inspection.valid) throw validationError(inspection);

    const existingPerfil = await client.query(
      `SELECT id_perfil
       FROM public.perfiles_solicitud
       WHERE id_solicitud = $1
         AND estado <> 'archivado'
       LIMIT 1`,
      [solicitud.id_solicitud]
    );

    if (existingPerfil.rowCount > 0) {
      throw badRequest('Solicitud already has an active perfil');
    }

    const { rows } = await client.query(
      `INSERT INTO public.perfiles_solicitud (
         id_solicitud,
         id_cliente,
         id_plantilla,
         version_actual,
         respuestas_json,
         estado,
         creado_por,
         actualizado_por,
         creado_en,
         actualizado_en,
         completitud_porcentaje,
         completitud_json
       )
       VALUES ($1, $2, $3, 1, $4::jsonb, $5, $6, $6, NOW(), NOW(), $7, $8::jsonb)
       RETURNING id_perfil, id_solicitud, id_cliente, id_plantilla,
                 version_actual, respuestas_json, estado,
                 creado_por, actualizado_por, creado_en, actualizado_en`,
      [
        solicitud.id_solicitud,
        solicitud.id_cliente,
        plantilla.id_plantilla,
        JSON.stringify(respuestasJson),
        estado,
        creadoPor,
        inspection.completion.percentage,
        JSON.stringify(inspection.completion),
      ]
    );

    if (isV2) await replaceRepeaters(client.query.bind(client), rows[0].id_perfil, repeaters, creadoPor);

    await client.query(
      `INSERT INTO public.perfiles_solicitud_versiones (
         id_perfil,
         version,
         respuestas_json,
         motivo_cambio,
         creado_por,
         creado_en,
         repetibles_snapshot_json,
         completitud_json,
         estado_snapshot
       )
       VALUES ($1, 1, $2::jsonb, $3, $4, NOW(), $5::jsonb, $6::jsonb, $7)`,
      [
        rows[0].id_perfil,
        JSON.stringify(respuestasJson),
        trimString(payload.motivo_cambio) || 'perfil_creado',
        creadoPor,
        JSON.stringify(repeaters),
        JSON.stringify(inspection.completion),
        estado,
      ]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updatePerfil(idPerfil, payload) {
  const safeIdPerfil = positiveInteger(idPerfil, 'id_perfil');
  const respuestasJson = ensureJsonObject(payload.respuestas_json, 'respuestas_json');
  const actualizadoPor = optionalPositiveInteger(payload.actualizado_por, 'actualizado_por');
  const motivoCambio = trimString(payload.motivo_cambio) || 'perfil_actualizado';
  const requestedEstado = payload.estado === undefined ? null : normalizeEstado(payload.estado);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const currentResult = await client.query(
      `SELECT ps.id_perfil, ps.version_actual, ps.estado, ps.respuestas_json, pp.estructura_json
       FROM public.perfiles_solicitud ps
       JOIN public.perfil_plantillas pp ON pp.id_plantilla = ps.id_plantilla
       WHERE ps.id_perfil = $1
       FOR UPDATE`,
      [safeIdPerfil]
    );

    if (currentResult.rowCount === 0) {
      throw notFound('Perfil not found');
    }

    const current = currentResult.rows[0];
    const nextVersion = Number(current.version_actual) + 1;
    const isV2 = isV2Template(current.estructura_json);
    const currentRepeaters = isV2
      ? await loadRepeaters(safeIdPerfil, client.query.bind(client))
      : {};
    const repeaters = isV2
      ? canonicalizeRepeaters(ensureRepeatersObject(payload.repeaters === undefined ? currentRepeaters : payload.repeaters))
      : {};
    const estado = requestedEstado || (current.estado === 'completo' ? 'completo' : 'borrador');
    const inspection = isV2
      ? validateProfile(current.estructura_json, respuestasJson, repeaters, { complete: estado === 'completo' })
      : { valid: true, errors: [], completion: { percentage: 0, sections: [] } };
    if (isV2) inspection.errors.push(...validateEditableChanges(
      current.estructura_json,
      current.respuestas_json,
      respuestasJson,
      currentRepeaters,
      repeaters
    ));
    inspection.valid = inspection.errors.length === 0;
    if (!inspection.valid) throw validationError(inspection);
    const updateParams = [
      JSON.stringify(respuestasJson),
      nextVersion,
      actualizadoPor,
      safeIdPerfil,
      inspection.completion.percentage,
      JSON.stringify(inspection.completion),
    ];
    updateParams.push(estado);

    const { rows } = await client.query(
      `UPDATE public.perfiles_solicitud
       SET respuestas_json = $1::jsonb,
           version_actual = $2,
           actualizado_por = $3,
           actualizado_en = NOW(),
           completitud_porcentaje = $5,
           completitud_json = $6::jsonb,
           estado = $7
       WHERE id_perfil = $4
       RETURNING id_perfil, id_solicitud, id_cliente, id_plantilla,
                 version_actual, respuestas_json, estado,
                 creado_por, actualizado_por, creado_en, actualizado_en`,
      updateParams
    );

    if (isV2) await replaceRepeaters(client.query.bind(client), safeIdPerfil, repeaters, actualizadoPor);

    await client.query(
      `INSERT INTO public.perfiles_solicitud_versiones (
         id_perfil,
         version,
         respuestas_json,
         motivo_cambio,
         creado_por,
         creado_en,
         repetibles_snapshot_json,
         completitud_json,
         estado_snapshot
       )
       VALUES ($1, $2, $3::jsonb, $4, $5, NOW(), $6::jsonb, $7::jsonb, $8)`,
      [
        safeIdPerfil,
        nextVersion,
        JSON.stringify(respuestasJson),
        motivoCambio,
        actualizadoPor,
        JSON.stringify(repeaters),
        JSON.stringify(inspection.completion),
        estado,
      ]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getPerfilVersiones(idPerfil) {
  const safeIdPerfil = positiveInteger(idPerfil, 'id_perfil');
  const { rows } = await pool.query(
    `SELECT id_version, id_perfil, version, respuestas_json,
            motivo_cambio, creado_por, creado_en,
            repetibles_snapshot_json, completitud_json, estado_snapshot,
            id_documento_pdf, pdf_drive_file_id, pdf_generado_en, pdf_nombre_archivo
     FROM public.perfiles_solicitud_versiones
     WHERE id_perfil = $1
     ORDER BY version DESC, id_version DESC`,
    [safeIdPerfil]
  );

  return rows;
}

module.exports = {
  PROFILE_SCHEMA_SQL,
  runMigration,
  diagnosePerfilTables,
  getPlantillas,
  resolverPlantilla,
  getPerfilBySolicitud,
  createPerfilForSolicitud,
  updatePerfil,
  getPerfilVersiones,
  loadRepeaters,
  calculateCompletion,
};
