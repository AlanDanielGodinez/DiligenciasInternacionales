const { pool } = require('../config/db');
const { ULTIMO_PAGO_ORDER } = require('./pagosResumen.sql');
const { ensureExpedienteFoldersBySolicitud } = require('./driveExpedientes.service');
const { uploadBufferToFolder } = require('./drive.service');
const {
  getResumenAvanceSolicitud,
  enviarSolicitudPostPago,
  optionalDate,
  optionalPositiveInteger,
  positiveInteger,
  resolverDestinoPostPago,
  resolveEstadoActual,
  trimString,
} = require('./solicitudes.service');

const ESTADO_PAGO_REGISTRADO = 'registrado';
const ESTADO_PAGO_VALIDADO = 'validado';
const ESTADO_PAGO_RECHAZADO = 'rechazado';

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

const sanitizeFileName = (value, fallback = 'comprobante') => {
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

const getExtension = (file = {}) => {
  const original = String(file.originalname || '');
  const match = original.toLowerCase().match(/(\.pdf|\.jpg|\.jpeg|\.png)$/);
  return match?.[1] || extensionByMimeType[String(file.mimetype || '').toLowerCase()] || '';
};

const ensureExtension = (fileName, extension) =>
  extension && !fileName.toLowerCase().endsWith(extension.toLowerCase())
    ? `${fileName}${extension}`
    : fileName;

const parseAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw badRequest('monto must be a positive numeric value');
  }
  return amount;
};

async function ensureSolicitudPagoData(idSolicitud, query = pool.query.bind(pool)) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const { rows } = await query(
    `SELECT
       s.id_solicitud,
       s.id_cliente,
       s.estado_actual,
       c.id_contacto
     FROM public.solicitudes s
     LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
     WHERE s.id_solicitud = $1
     LIMIT 1`,
    [safeIdSolicitud]
  );

  if (!rows[0]) throw notFound('Solicitud not found');
  return rows[0];
}

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

async function getEstadoIdByValue(values, fallback = null, query = pool.query.bind(pool)) {
  const candidates = Array.isArray(values) ? values : [values];

  for (const value of candidates) {
    try {
      return await resolveEstadoActual(value, query);
    } catch (error) {
      if (error.status !== 400 && error.status !== 404) throw error;
    }
  }

  return fallback;
}

async function insertSeguimiento(client, payload) {
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
     SELECT
       COALESCE((SELECT MAX(id_seguimiento) FROM public.seguimientos), 0) + 1,
       $1, $2, $3, $4, $5, CURRENT_DATE, $6, NOW()
     RETURNING *`,
    [
      payload.idSolicitud,
      payload.estadoAnterior || null,
      payload.estadoNuevo || null,
      trimString(payload.descripcion),
      payload.idEmpleadoResponsable || null,
      trimString(payload.origen),
    ]
  );
  return rows[0];
}

const PAGO_SELECT = `
  SELECT
    p.*,
    d.nombre_documento AS comprobante_nombre,
    d.drive_file_id AS comprobante_drive_file_id,
    d.mime_type AS comprobante_mime_type,
    d.fecha_subida AS comprobante_fecha_subida
  FROM public.pagos p
  LEFT JOIN public.documentos d ON d.id_documento = p.id_documento_comprobante`;

async function getPagos({ limit = 50, offset = 0 }) {
  const safeLimit = positiveInteger(limit, 'limit');
  const safeOffset = Number(offset);
  if (!Number.isInteger(safeOffset) || safeOffset < 0) {
    throw badRequest('offset must be a non-negative numeric value');
  }

  const { rows } = await pool.query(
    `${PAGO_SELECT}
     ORDER BY p.id_pago DESC
     LIMIT $1 OFFSET $2`,
    [safeLimit, safeOffset]
  );
  return rows;
}

async function getPagosBySolicitud(idSolicitud) {
  const solicitud = await ensureSolicitudPagoData(idSolicitud);
  const { rows } = await pool.query(
    `${PAGO_SELECT}
     WHERE p.id_solicitud = $1
     ORDER BY ${ULTIMO_PAGO_ORDER}`,
    [solicitud.id_solicitud]
  );
  return rows;
}

async function listPagosFinanzas(filters = {}) {
  const values = [];
  const where = [];

  const q = trimString(filters.q);
  if (q) {
    values.push(`%${q}%`);
    where.push(`(
      p.id_pago::text ILIKE $${values.length}
      OR p.id_solicitud::text ILIKE $${values.length}
      OR p.metodo_pago ILIKE $${values.length}
      OR p.estado_pago ILIKE $${values.length}
      OR p.concepto ILIKE $${values.length}
      OR p.referencia ILIKE $${values.length}
      OR c.nombre ILIKE $${values.length}
      OR c.apellido_paterno ILIKE $${values.length}
      OR c.apellido_materno ILIKE $${values.length}
      OR co.nombre ILIKE $${values.length}
      OR co.telefono ILIKE $${values.length}
      OR co.correo ILIKE $${values.length}
      OR tt.nombre_tramite ILIKE $${values.length}
    )`);
  }

  const estadoPago = trimString(filters.estado_pago);
  if (estadoPago) {
    values.push(estadoPago);
    where.push(`p.estado_pago = $${values.length}`);
  }

  const metodoPago = trimString(filters.metodo_pago);
  if (metodoPago) {
    values.push(metodoPago);
    where.push(`p.metodo_pago = $${values.length}`);
  }

  if (filters.id_solicitud) {
    values.push(positiveInteger(filters.id_solicitud, 'id_solicitud'));
    where.push(`p.id_solicitud = $${values.length}`);
  }
  if (filters.id_tipo_tramite) { values.push(positiveInteger(filters.id_tipo_tramite,'id_tipo_tramite')); where.push(`s.id_tipo_tramite = $${values.length}`); }
  if (filters.id_area) { values.push(positiveInteger(filters.id_area,'id_area')); where.push(`s.id_area_actual = $${values.length}`); }
  if (filters.id_responsable) { values.push(positiveInteger(filters.id_responsable,'id_responsable')); where.push(`s.id_empleado_responsable = $${values.length}`); }

  const fechaDesde = optionalDate(filters.fecha_desde, 'fecha_desde');
  if (fechaDesde) {
    values.push(fechaDesde);
    where.push(`p.fecha_pago >= $${values.length}::date`);
  }

  const fechaHasta = optionalDate(filters.fecha_hasta, 'fecha_hasta');
  if (fechaHasta) {
    values.push(fechaHasta);
    where.push(`p.fecha_pago <= $${values.length}::date`);
  }

  const limit = filters.limit ? positiveInteger(filters.limit, 'limit') : 100;
  const safeOffset = filters.offset === undefined ? 0 : Number(filters.offset);
  if (!Number.isInteger(safeOffset) || safeOffset < 0) {
    throw badRequest('offset must be a non-negative numeric value');
  }

  values.push(limit);
  const limitIndex = values.length;
  values.push(safeOffset);
  const offsetIndex = values.length;

  const { rows } = await pool.query(
    `SELECT
       p.*,
       s.id_solicitud AS folio,
       s.canal_contacto,
       s.estado_actual,
       ce.valor AS estado_actual_valor,
       c.id_cliente,
       c.nombre AS cliente_nombre,
       c.apellido_paterno AS cliente_apellido_paterno,
       c.apellido_materno AS cliente_apellido_materno,
       c.id_contacto,
       co.nombre AS contacto_nombre,
       co.telefono AS contacto_telefono,
       co.correo AS contacto_correo,
       tt.nombre_tramite AS tipo_tramite,
       ca.nombre AS area_nombre,
       concat_ws(' ',er.nombre,er.apellidos) AS responsable,
       concat_ws(' ',ev.nombre,ev.apellidos) AS validado_por_nombre,
       d.nombre_documento AS comprobante_nombre,
       d.drive_file_id AS comprobante_drive_file_id,
       d.mime_type AS comprobante_mime_type,
       d.fecha_subida AS comprobante_fecha_subida
     FROM public.pagos p
     LEFT JOIN public.solicitudes s ON s.id_solicitud = p.id_solicitud
     LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
     LEFT JOIN public.clientes c ON c.id_cliente = COALESCE(p.id_cliente, s.id_cliente)
     LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
     LEFT JOIN public.empleados er ON er.id_empleado = s.id_empleado_responsable
     LEFT JOIN public.empleados ev ON ev.id_empleado = p.validado_por
     LEFT JOIN public.documentos d ON d.id_documento = p.id_documento_comprobante
     ${where.length ? `WHERE ${where.join('\n       AND ')}` : ''}
     ORDER BY p.fecha_pago DESC NULLS LAST, p.creado_en DESC NULLS LAST, p.id_pago DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values
  );

  return rows.map((row) => ({
    ...row,
    aplicante: [
      row.cliente_nombre,
      row.cliente_apellido_paterno,
      row.cliente_apellido_materno,
    ].filter(Boolean).join(' '),
  }));
}

async function getResumenFinanzas(){const {rows}=await pool.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE estado_pago='registrado')::int por_validar,COUNT(*) FILTER(WHERE estado_pago='rechazado')::int rechazados,COUNT(*) FILTER(WHERE estado_pago='validado')::int validados,COALESCE(SUM(monto) FILTER(WHERE estado_pago='validado'),0) total_validado FROM pagos`);return rows[0]}

const normalizeBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'si', 'sí', 'yes'].includes(String(value).trim().toLowerCase());
};

async function listSolicitudesPendientesPago(filters = {}) {
  const estadosPendientes = await Promise.all([
    getEstadoIdByValue('Falta de pago inicial'),
    getEstadoIdByValue('Pendiente de pago'),
    getEstadoIdByValue('Pendiente de anticipo'),
  ]);
  const idsEstado = estadosPendientes.filter(Boolean);

  if (!idsEstado.length) return [];

  const values = [idsEstado];
  const where = ['s.estado_actual = ANY($1::int[])'];
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
      OR s.canal_contacto ILIKE $${values.length}
      OR ce.valor ILIKE $${values.length}
    )`);
  }

  const includeAvance = normalizeBoolean(filters.include_avance, true);

  const { rows } = await pool.query(
    `WITH ultimo_pago AS (
       SELECT DISTINCT ON (p.id_solicitud)
         p.*
       FROM public.pagos p
       WHERE p.id_solicitud IS NOT NULL
       ORDER BY p.id_solicitud, ${ULTIMO_PAGO_ORDER}
     )
     SELECT
       s.id_solicitud,
       s.id_solicitud AS folio,
       s.id_cliente,
       s.estado_actual,
       ce.valor AS estado_actual_valor,
       ca.nombre AS area_actual_nombre,
       ca.clave AS area_actual_clave,
       s.canal_contacto,
       s.fecha_inicio,
       c.nombre AS cliente_nombre,
       c.apellido_paterno AS cliente_apellido_paterno,
       c.apellido_materno AS cliente_apellido_materno,
       c.id_contacto,
       co.nombre AS contacto_nombre,
       co.telefono AS contacto_telefono,
       co.correo AS contacto_correo,
       tt.nombre_tramite AS tipo_tramite,
       up.id_pago AS ultimo_id_pago,
       up.monto AS ultimo_pago_monto,
       up.moneda AS ultimo_pago_moneda,
       up.concepto AS ultimo_pago_concepto,
       up.estado_pago AS ultimo_pago_estado,
       up.id_documento_comprobante AS ultimo_pago_id_documento_comprobante,
       up.fecha_pago AS ultimo_pago_fecha
     FROM public.solicitudes s
     LEFT JOIN public.catalogo_estatus ce ON ce.id = s.estado_actual
     LEFT JOIN public.catalogo_areas ca ON ca.id_area = s.id_area_actual
     LEFT JOIN public.clientes c ON c.id_cliente = s.id_cliente
     LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     LEFT JOIN ultimo_pago up ON up.id_solicitud = s.id_solicitud
     WHERE ${where.join('\n       AND ')}
     ORDER BY s.fecha_inicio DESC NULLS LAST, s.id_solicitud DESC`,
    values
  );

  return Promise.all(rows.map(async (row) => {
    let avance = null;
    if (includeAvance) {
      try {
        avance = await getResumenAvanceSolicitud(row.id_solicitud);
      } catch (error) {
        avance = null;
      }
    }

    return {
      ...row,
      aplicante: [
        row.cliente_nombre,
        row.cliente_apellido_paterno,
        row.cliente_apellido_materno,
      ].filter(Boolean).join(' '),
      pago: row.ultimo_id_pago
        ? {
          id_pago: row.ultimo_id_pago,
          monto: row.ultimo_pago_monto,
          moneda: row.ultimo_pago_moneda,
          concepto: row.ultimo_pago_concepto,
          estado_pago: row.ultimo_pago_estado,
          id_documento_comprobante: row.ultimo_pago_id_documento_comprobante,
          fecha_pago: row.ultimo_pago_fecha,
        }
        : null,
      avance,
    };
  }));
}

async function uploadComprobantePago(solicitud, file) {
  if (!file?.buffer) return null;

  const expediente = await ensureExpedienteFoldersBySolicitud(solicitud.id_solicitud);
  const pagosFolder = expediente.carpetas?.subcarpetas?.pagos;
  if (!pagosFolder?.drive_folder_id) {
    throw new Error('Drive folder "Pagos" was not resolved.');
  }

  const extension = getExtension(file);
  const filename = ensureExtension(
    sanitizeFileName(`Comprobante de pago - Solicitud #${solicitud.id_solicitud}`),
    extension
  );

  const driveFile = await uploadBufferToFolder({
    buffer: file.buffer,
    filename,
    mimeType: file.mimetype || 'application/octet-stream',
    folderId: pagosFolder.drive_folder_id,
  });

  return {
    ...driveFile,
    filename,
    folderId: pagosFolder.drive_folder_id,
    mimeType: file.mimetype || null,
    size: file.size || file.buffer.length,
  };
}

async function createPago(idSolicitud, payload = {}, file = null) {
  const solicitud = await ensureSolicitudPagoData(idSolicitud);
  const monto = parseAmount(payload.monto);
  const moneda = trimString(payload.moneda) || 'MXN';
  const concepto = trimString(payload.concepto);
  if (!concepto) throw badRequest('concepto is required');

  const fechaPago = optionalDate(payload.fecha_pago, 'fecha_pago');
  const registradoPor = optionalPositiveInteger(payload.registrado_por, 'registrado_por');
  const comprobanteDrive = file ? await uploadComprobantePago(solicitud, file) : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let idDocumentoComprobante = null;
    if (comprobanteDrive) {
      const tipoDocumento = await getOrCreateTipoDocumento('Comprobante de pago', client.query.bind(client));
      const documentoResult = await client.query(
        `INSERT INTO public.documentos (
           id_cliente,
           id_solicitud,
           tipo_documento,
           nombre_documento,
           url_archivo,
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
           actualizado_en
         )
         VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, 'comprobante_pago',
                 $8, $9, $10, $11, $12, $13, 'matched', $14, NOW(), NOW())
         RETURNING *`,
        [
          solicitud.id_cliente,
          solicitud.id_solicitud,
          tipoDocumento,
          comprobanteDrive.filename,
          comprobanteDrive.filename,
          registradoPor,
          trimString(payload.observaciones) || 'Comprobante de pago',
          comprobanteDrive.id,
          comprobanteDrive.folderId,
          comprobanteDrive.webViewLink || null,
          comprobanteDrive.webContentLink || null,
          comprobanteDrive.mimeType,
          comprobanteDrive.size,
          `Subido desde Finanzas/Pagos para solicitud ${solicitud.id_solicitud}`,
        ]
      );
      idDocumentoComprobante = documentoResult.rows[0].id_documento;
    }

    const { rows } = await client.query(
      `INSERT INTO public.pagos (
         id_solicitud,
         id_cliente,
         monto,
         moneda,
         concepto,
         metodo_pago,
         referencia,
         fecha_pago,
         estado_pago,
         id_documento_comprobante,
         registrado_por,
         observaciones,
         comprobante_url,
         creado_en,
         actualizado_en
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9, $10, $11, $12, $13, NOW(), NOW())
       RETURNING *`,
      [
        solicitud.id_solicitud,
        solicitud.id_cliente,
        monto,
        moneda,
        concepto,
        trimString(payload.metodo_pago),
        trimString(payload.referencia),
        fechaPago,
        ESTADO_PAGO_REGISTRADO,
        idDocumentoComprobante,
        registradoPor,
        trimString(payload.observaciones),
        comprobanteDrive?.filename || null,
      ]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function validarPago(idPago, payload = {}) {
  const safeIdPago = positiveInteger(idPago, 'id_pago');
  const validadoPor = optionalPositiveInteger(payload.validado_por, 'validado_por');
  const client = await pool.connect();
  let committed = false;

  try {
    await client.query('BEGIN');
    const pagoResult = await client.query(
      `SELECT p.*, s.estado_actual
       FROM public.pagos p
       JOIN public.solicitudes s ON s.id_solicitud = p.id_solicitud
       WHERE p.id_pago = $1
       FOR UPDATE`,
      [safeIdPago]
    );
    if (pagoResult.rowCount === 0) throw notFound('Pago not found');

    const pago = pagoResult.rows[0];
    // Repeating validation is idempotent and must not renew its activity date.
    if (String(pago.estado_pago || '').toLowerCase() === ESTADO_PAGO_VALIDADO) {
      const result = await client.query(`${PAGO_SELECT} WHERE p.id_pago = $1 LIMIT 1`, [safeIdPago]);
      await client.query('COMMIT');
      committed = true;
      return { pago: result.rows[0], seguimiento: null, destino_sugerido: await resolverDestinoPostPago(pago.id_solicitud), envio_post_pago: null };
    }
    const estadoNuevo = await getEstadoIdByValue('Pago validado', pago.estado_actual, client.query.bind(client));

    await client.query(
      `UPDATE public.pagos
       SET estado_pago = $1,
           validado_por = $2,
           fecha_validacion = NOW(),
           observaciones = COALESCE($3, observaciones),
           actualizado_en = NOW()
       WHERE id_pago = $4`,
      [
        ESTADO_PAGO_VALIDADO,
        validadoPor,
        trimString(payload.observaciones),
        safeIdPago,
      ]
    );

    await client.query(
      `UPDATE public.solicitudes
       SET estado_actual = $1,
           fecha_ultimo_movimiento = NOW(),
           actualizado_en = NOW()
       WHERE id_solicitud = $2`,
      [estadoNuevo, pago.id_solicitud]
    );

    const seguimiento = await insertSeguimiento(client, {
      idSolicitud: pago.id_solicitud,
      estadoAnterior: pago.estado_actual,
      estadoNuevo,
      descripcion: trimString(payload.descripcion) || 'Finanzas validó el pago inicial',
      idEmpleadoResponsable: validadoPor,
      origen: 'pago_inicial_validado',
    });

    const result = await client.query(`${PAGO_SELECT} WHERE p.id_pago = $1 LIMIT 1`, [safeIdPago]);
    await client.query('COMMIT');
    committed = true;
    const destinoSugerido = await resolverDestinoPostPago(pago.id_solicitud);
    let envioPostPago = null;

    if (payload.enviar_post_pago === true || payload.enviar_post_pago === 'true') {
      envioPostPago = await enviarSolicitudPostPago(pago.id_solicitud, {
        id_empleado_responsable: payload.id_empleado_responsable,
        id_area_destino: payload.id_area_destino,
        area_destino: payload.area_destino,
        forzar: true,
        observaciones: payload.observaciones_post_pago || 'Envio automatico posterior a validacion de pago',
      });
    }

    return {
      pago: result.rows[0],
      seguimiento,
      destino_sugerido: destinoSugerido,
      envio_post_pago: envioPostPago,
    };
  } catch (error) {
    if (!committed) {
      await client.query('ROLLBACK');
    }
    throw error;
  } finally {
    client.release();
  }
}

async function rechazarPago(idPago, payload = {}) {
  const safeIdPago = positiveInteger(idPago, 'id_pago');
  const validadoPor = optionalPositiveInteger(payload.validado_por, 'validado_por');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const pagoResult = await client.query(
      `SELECT p.*, s.estado_actual
       FROM public.pagos p
       JOIN public.solicitudes s ON s.id_solicitud = p.id_solicitud
       WHERE p.id_pago = $1
       FOR UPDATE`,
      [safeIdPago]
    );
    if (pagoResult.rowCount === 0) throw notFound('Pago not found');

    const pago = pagoResult.rows[0];
    // Repeating a rejection is idempotent, just like repeating a validation.
    // It must not renew the validation timestamp or append another seguimiento.
    if (String(pago.estado_pago || '').toLowerCase() === ESTADO_PAGO_RECHAZADO) {
      const result = await client.query(`${PAGO_SELECT} WHERE p.id_pago = $1 LIMIT 1`, [safeIdPago]);
      await client.query('COMMIT');
      return { pago: result.rows[0], seguimiento: null };
    }
    const estadoNuevo = await getEstadoIdByValue(
      ['Pago rechazado', 'Falta de pago inicial'],
      pago.estado_actual,
      client.query.bind(client)
    );

    await client.query(
      `UPDATE public.pagos
       SET estado_pago = $1,
           validado_por = $2,
           fecha_validacion = NOW(),
           observaciones = COALESCE($3, observaciones),
           actualizado_en = NOW()
       WHERE id_pago = $4`,
      [
        ESTADO_PAGO_RECHAZADO,
        validadoPor,
        trimString(payload.observaciones),
        safeIdPago,
      ]
    );

    const validadoResult = await client.query(
      `SELECT id_pago
       FROM public.pagos
       WHERE id_solicitud = $1
         AND id_pago <> $2
         AND estado_pago = $3
       LIMIT 1`,
      [pago.id_solicitud, safeIdPago, ESTADO_PAGO_VALIDADO]
    );

    const shouldUpdateSolicitudEstado = estadoNuevo && validadoResult.rowCount === 0;

    if (shouldUpdateSolicitudEstado) {
      await client.query(
        `UPDATE public.solicitudes
         SET estado_actual = $1,
             fecha_ultimo_movimiento = NOW(),
             actualizado_en = NOW()
         WHERE id_solicitud = $2`,
        [estadoNuevo, pago.id_solicitud]
      );
    }

    const seguimiento = await insertSeguimiento(client, {
      idSolicitud: pago.id_solicitud,
      estadoAnterior: pago.estado_actual,
      estadoNuevo: shouldUpdateSolicitudEstado ? estadoNuevo : pago.estado_actual,
      descripcion: trimString(payload.descripcion) || trimString(payload.observaciones) || 'Finanzas rechazó el pago',
      idEmpleadoResponsable: validadoPor,
      origen: 'pago_rechazado',
    });

    const result = await client.query(`${PAGO_SELECT} WHERE p.id_pago = $1 LIMIT 1`, [safeIdPago]);
    await client.query('COMMIT');
    return { pago: result.rows[0], seguimiento };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createPago,
  getPagos,
  getPagosBySolicitud,
  getResumenFinanzas,
  listPagosFinanzas,
  listSolicitudesPendientesPago,
  rechazarPago,
  validarPago,
  __test: {
    ESTADO_PAGO_REGISTRADO,
    ESTADO_PAGO_VALIDADO,
    ESTADO_PAGO_RECHAZADO,
    PAGO_SELECT,
    parseAmount,
  },
};
