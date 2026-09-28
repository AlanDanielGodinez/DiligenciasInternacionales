const { pool } = require('../config/db');
const { resolverPlantilla } = require('./perfiles.service');
const { ensureExpedienteFoldersBySolicitud } = require('./driveExpedientes.service');
const { uploadBufferToFolder } = require('./drive.service');

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

const trimString = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const normalizeClaveDocumento = (value) =>
  trimString(value)
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || null;

const sanitizeFileName = (value, fallback = 'documento') => {
  const sanitized = String(value || fallback)
    .replace(/[\\/:*?"<>|{}%~&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return sanitized || fallback;
};

const extensionByMimeType = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
};

const DEFAULT_DOCUMENTOS_REQUERIDOS_BY_TEMPLATE = {
  perfil_visa_individual: [
    { clave: 'curp', nombre: 'CURP', obligatorio: true },
    { clave: 'respaldo', nombre: 'Respaldo', obligatorio: false, grupo: 'respaldo_ds', grupo_nombre: 'Respaldo y DS' },
    { clave: 'ds', nombre: 'DS', obligatorio: false, grupo: 'respaldo_ds', grupo_nombre: 'Respaldo y DS' },
  ],
  perfil_visa_individual_v2: [
    { clave: 'curp', nombre: 'CURP', obligatorio: true },
    { clave: 'respaldo', nombre: 'Respaldo', obligatorio: false, grupo: 'respaldo_ds', grupo_nombre: 'Respaldo y DS' },
    { clave: 'ds', nombre: 'DS', obligatorio: false, grupo: 'respaldo_ds', grupo_nombre: 'Respaldo y DS' },
  ],
  perfil_visa_individual_v3: [
    { clave: 'curp', nombre: 'CURP', obligatorio: true },
    { clave: 'respaldo', nombre: 'Respaldo', obligatorio: false, grupo: 'respaldo_ds', grupo_nombre: 'Respaldo y DS' },
    { clave: 'ds', nombre: 'DS', obligatorio: false, grupo: 'respaldo_ds', grupo_nombre: 'Respaldo y DS' },
  ],
  perfil_pasaporte_mexico: [
    { clave: 'ine', nombre: 'INE', obligatorio: true },
    { clave: 'acta_nacimiento', nombre: 'Acta de nacimiento', obligatorio: true },
    { clave: 'comprobante_domicilio', nombre: 'Comprobante de domicilio', obligatorio: true },
    { clave: 'pasaporte_anterior', nombre: 'Pasaporte anterior', obligatorio: false },
    { clave: 'curp', nombre: 'CURP', obligatorio: false },
    { clave: 'documento_adicional', nombre: 'Documento adicional', obligatorio: false },
  ],
};

const getExtension = (file = {}) => {
  const original = String(file.originalname || '');
  const match = original.toLowerCase().match(/(\.pdf|\.jpg|\.jpeg|\.png)$/);
  return match?.[1] || extensionByMimeType[String(file.mimetype || '').toLowerCase()] || '';
};

const ensureExtension = (fileName, extension) =>
  extension && !fileName.toLowerCase().endsWith(extension.toLowerCase())
    ? `${fileName}${extension}`
    : fileName;

async function getOrCreateTipoDocumento(tipo, query = pool.query.bind(pool)) {
  const existing = await query(
    `SELECT id
     FROM public.catalogo_tipos_documento
     WHERE lower(tipo) = lower($1)
     LIMIT 1`,
    [tipo]
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const inserted = await query(
    `INSERT INTO public.catalogo_tipos_documento (id, tipo)
     SELECT COALESCE(MAX(id), 0) + 1, $1
     FROM public.catalogo_tipos_documento
     RETURNING id`,
    [tipo]
  );
  return inserted.rows[0].id;
}

async function getDocumentos({ limit = 50, offset = 0 }) {
  // Join documentos with solicitudes and clientes using real column names
  const sql = `SELECT d.*, 
    s.id_solicitud AS solicitud_id, s.id_cliente AS solicitud_id_cliente,
    c.id_cliente AS cliente_id, c.nombre AS cliente_nombre, c.apellido_paterno AS cliente_apellido_paterno, c.apellido_materno AS cliente_apellido_materno, c.telefono AS cliente_telefono, c.correo AS cliente_correo
    FROM documentos d
    LEFT JOIN solicitudes s ON s.id_solicitud = d.id_solicitud
    LEFT JOIN clientes c ON c.id_cliente = d.id_cliente
    ORDER BY d.id_documento DESC LIMIT $1 OFFSET $2`;
  const { rows } = await pool.query(sql, [limit, offset]);
  return rows;
}

async function getDocumentosBySolicitud(idSolicitud) {
  const sql = `SELECT
    d.id_documento,
    d.id_cliente,
    d.id_solicitud,
    d.tipo_documento,
    d.nombre_documento,
    d.url_archivo,
    d.estado_documento,
    d.fecha_subida,
    d.subido_por,
    d.observaciones,
    d.source_id,
    d.origen_documento,
    d.drive_file_id,
    d.drive_folder_id,
    d.web_view_link,
    d.web_content_link,
    d.mime_type,
    d.tamano_bytes,
    d.drive_match_status,
    d.drive_match_notes,
    d.drive_matched_at,
    d.clave_documento_requerido,
    d.reemplaza_a_id_documento,
    d.actualizado_en,
    EXISTS (
      SELECT 1 FROM public.documentos replacement
      WHERE replacement.reemplaza_a_id_documento = d.id_documento
        AND replacement.id_solicitud = d.id_solicitud
    ) AS es_reemplazado,
    c.nombre AS cliente_nombre,
    c.apellido_paterno AS cliente_apellido_paterno,
    c.apellido_materno AS cliente_apellido_materno,
    s.id_solicitud AS solicitud_id,
    s.estado_actual AS solicitud_estado_actual
    FROM public.documentos d
    LEFT JOIN public.clientes c ON c.id_cliente = d.id_cliente
    LEFT JOIN public.solicitudes s ON s.id_solicitud = d.id_solicitud
    WHERE d.id_solicitud = $1
    ORDER BY d.fecha_subida DESC, d.id_documento DESC`;

  const { rows } = await pool.query(sql, [idSolicitud]);
  return rows;
}

async function getDocumentoById(idDocumento) {
  const sql = `SELECT
    id_documento,
    nombre_documento,
    drive_file_id,
    mime_type,
    url_archivo,
    web_view_link,
    web_content_link,
    clave_documento_requerido,
    origen_documento
    FROM public.documentos
    WHERE id_documento = $1
    LIMIT 1`;

  const { rows } = await pool.query(sql, [idDocumento]);
  return rows[0] || null;
}

async function getSolicitudDocumentoData(idSolicitud) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const { rows } = await pool.query(
    `SELECT s.id_solicitud, s.id_cliente, s.id_tipo_tramite,
            c.id_pais
     FROM public.solicitudes s
     JOIN public.clientes c ON c.id_cliente = s.id_cliente
     WHERE s.id_solicitud = $1
     LIMIT 1`,
    [safeIdSolicitud]
  );

  if (!rows[0]) throw notFound('Solicitud not found');
  return rows[0];
}

const normalizeDocumentoRequerido = (documento, index) => {
  const item = typeof documento === 'object' && documento !== null ? documento : { nombre: documento };
  const nombre = trimString(item.nombre || item.label || item.name) || `Documento ${index + 1}`;
  const clave = normalizeClaveDocumento(item.clave || item.key || item.name || nombre);
  return {
    clave,
    nombre,
    obligatorio: Boolean(item.obligatorio || item.required),
    grupo: normalizeClaveDocumento(item.grupo || item.group),
    grupo_nombre: trimString(item.grupo_nombre || item.group_label),
  };
};

async function getDocumentosRequeridosBySolicitud(idSolicitud) {
  const solicitud = await getSolicitudDocumentoData(idSolicitud);
  const plantilla = await resolverPlantilla({
    id_tipo_tramite: solicitud.id_tipo_tramite,
    id_pais: solicitud.id_pais,
  });
  const documentosMetadata = Array.isArray(plantilla?.estructura_json?.documentos_requeridos)
    ? plantilla.estructura_json.documentos_requeridos
    : DEFAULT_DOCUMENTOS_REQUERIDOS_BY_TEMPLATE[plantilla?.clave] || [];
  const requeridos = documentosMetadata.map(normalizeDocumentoRequerido).filter((item) => item.clave);

  if (!requeridos.length) {
    return {
      id_solicitud: solicitud.id_solicitud,
      id_plantilla: plantilla?.id_plantilla || null,
      plantilla_nombre: plantilla?.nombre || null,
      documentos_requeridos: [],
    };
  }

  const { rows: documentos } = await pool.query(
    `SELECT DISTINCT ON (clave_documento_requerido)
       id_documento,
       id_cliente,
       id_solicitud,
       tipo_documento,
       nombre_documento,
       url_archivo,
       estado_documento,
       fecha_subida,
       subido_por,
       observaciones,
       origen_documento,
       drive_file_id,
       drive_folder_id,
       web_view_link,
       web_content_link,
       mime_type,
       tamano_bytes,
       drive_match_status,
       drive_match_notes,
       drive_matched_at,
       clave_documento_requerido,
       reemplaza_a_id_documento,
       actualizado_en
     FROM public.documentos
     WHERE id_solicitud = $1
       AND origen_documento = 'documento_requerido'
       AND clave_documento_requerido IS NOT NULL
     ORDER BY clave_documento_requerido, fecha_subida DESC NULLS LAST, id_documento DESC`,
    [solicitud.id_solicitud]
  );

  const documentosPorClave = new Map(documentos.map((documento) => [documento.clave_documento_requerido, documento]));

  return {
    id_solicitud: solicitud.id_solicitud,
    id_plantilla: plantilla?.id_plantilla || null,
    plantilla_nombre: plantilla?.nombre || null,
    documentos_requeridos: requeridos.map((requerido) => {
      const documento = documentosPorClave.get(requerido.clave) || null;
      return {
        ...requerido,
        estado: documento ? 'subido' : 'pendiente',
        documento,
      };
    }),
  };
}

async function uploadDocumentoRequerido(idSolicitud, claveDocumento, file, payload = {}) {
  const solicitud = await getSolicitudDocumentoData(idSolicitud);
  const clave = normalizeClaveDocumento(claveDocumento);
  if (!clave) throw badRequest('claveDocumento must be provided');
  if (!file?.buffer) throw badRequest('archivo is required');

  const requeridos = await getDocumentosRequeridosBySolicitud(solicitud.id_solicitud);
  const requerido = requeridos.documentos_requeridos.find((item) => item.clave === clave);
  if (!requerido) throw notFound('Documento requerido not found for this solicitud');

  const expediente = await ensureExpedienteFoldersBySolicitud(solicitud.id_solicitud);
  const documentosFolder = expediente.carpetas?.subcarpetas?.documentos_recibidos;
  if (!documentosFolder?.drive_folder_id) {
    throw new Error('Drive folder "Documentos recibidos" was not resolved.');
  }

  const previous = requerido.documento || null;
  const extension = getExtension(file);
  const baseName = sanitizeFileName(
    `${requerido.nombre} - Solicitud #${solicitud.id_solicitud}`,
    `Documento requerido - Solicitud #${solicitud.id_solicitud}`
  );
  const filename = ensureExtension(baseName, extension);
  const driveFile = await uploadBufferToFolder({
    buffer: file.buffer,
    filename,
    mimeType: file.mimetype || 'application/octet-stream',
    folderId: documentosFolder.drive_folder_id,
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tipoDocumento = await getOrCreateTipoDocumento(
      clave === 'documento_adicional' ? 'Documento adicional' : 'Documento requerido',
      client.query.bind(client)
    );
    const { rows } = await client.query(
      `INSERT INTO public.documentos (
         id_cliente,
         id_solicitud,
         tipo_documento,
         nombre_documento,
         url_archivo,
         estado_documento,
         fecha_subida,
         subido_por,
         observaciones,
         origen_documento,
         drive_file_id,
         drive_folder_id,
         web_view_link,
         web_content_link,
         mime_type,
         tamano_bytes,
         drive_match_status,
         drive_match_notes,
         drive_matched_at,
         clave_documento_requerido,
         reemplaza_a_id_documento,
         actualizado_en
       )
       VALUES ($1, $2, $3, $4, $5, NULL, NOW(), $6, $7, $8, $9, $10, $11, $12, $13, $14, 'matched', $15, NOW(), $16, $17, NOW())
       RETURNING *`,
      [
        solicitud.id_cliente,
        solicitud.id_solicitud,
        tipoDocumento,
        filename,
        filename,
        payload.subido_por || null,
        trimString(payload.observaciones) || `Documento requerido: ${requerido.nombre}`,
        'documento_requerido',
        driveFile.id,
        documentosFolder.drive_folder_id,
        driveFile.webViewLink || null,
        driveFile.webContentLink || null,
        file.mimetype || null,
        file.size || file.buffer.length,
        `Subido desde documentos requeridos, clave ${clave}`,
        clave,
        previous?.id_documento || null,
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

module.exports = {
  getDocumentos,
  getDocumentosBySolicitud,
  getDocumentoById,
  getDocumentosRequeridosBySolicitud,
  uploadDocumentoRequerido,
  __test: { DEFAULT_DOCUMENTOS_REQUERIDOS_BY_TEMPLATE, normalizeDocumentoRequerido },
};
