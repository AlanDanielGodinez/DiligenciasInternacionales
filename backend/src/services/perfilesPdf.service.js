const PDFDocument = require('pdfkit');
const { pool } = require('../config/db');
const { ensureExpedienteFoldersBySolicitud } = require('./driveExpedientes.service');
const { updateFileBuffer, uploadBufferToFolder } = require('./drive.service');
const { isV2Template, isFieldVisible } = require('./perfilesEngineV2');

const PDF_MIME_TYPE = 'application/pdf';
const PERFIL_GENERADO_TIPO = 'Perfil generado';
const COLORS = {
  navy: '#12324a',
  blue: '#1f5f8b',
  slate: '#334155',
  muted: '#64748b',
  line: '#d9e2ec',
  softLine: '#edf2f7',
  panel: '#f8fafc',
  panelAlt: '#f1f5f9',
  white: '#ffffff',
  text: '#111827',
};

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

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

const cleanText = (value, fallback = '-') => {
  if (!hasValue(value)) return fallback;
  return String(value).replace(/\s+/g, ' ').trim();
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return cleanText(value);
  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildNombreCompleto = (...parts) =>
  parts
    .filter(hasValue)
    .map((part) => String(part).trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const sanitizeFilename = (value) => {
  const sanitized = String(value || 'perfil.pdf')
    .replace(/[\\/:*?"<>|{}%~&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const withoutExtension = sanitized.replace(/\.pdf$/i, '').slice(0, 170).trim() || 'perfil';
  return `${withoutExtension}.pdf`;
};

const fieldLabel = (field) => cleanText(field?.label || field?.name || field?.key || 'Campo');

const normalizeAnswer = (value) => {
  if (value === undefined || value === null || value === '') return 'No proporcionado';
  if (Array.isArray(value)) return value.length ? value.map(normalizeAnswer).join(', ') : 'No proporcionado';
  if (typeof value === 'object') return Object.keys(value).length ? 'Dato capturado' : 'No proporcionado';
  return cleanText(value);
};

const isEmptyAnswer = (value) => value === undefined || value === null || String(value).trim() === '';

const sectionHasPrintableFields = (section) =>
  Array.isArray(section?.campos) && section.campos.some((field) => hasValue(field?.name));

const ensureRoom = (doc, neededHeight = 80) => {
  if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
};

const contentWidth = (doc) => doc.page.width - doc.page.margins.left - doc.page.margins.right;

const drawPageAccent = (doc) => {
  doc
    .rect(0, 0, doc.page.width, 18)
    .fill(COLORS.navy);
};

const drawHeader = (doc, { versionRow }) => {
  drawPageAccent(doc);
  doc
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .fontSize(18)
    .text('Diligencias Internacionales Inc.', doc.page.margins.left, 42, {
      width: contentWidth(doc) * 0.6,
    });
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text('Reporte institucional generado desde el expediente digital', doc.page.margins.left, 64);

  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(COLORS.navy)
    .text('Reporte de Perfil', doc.page.margins.left, 94);
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(COLORS.slate)
    .text(cleanText(versionRow.plantilla_nombre, 'Plantilla de perfil'), doc.page.margins.left, 120, {
      width: contentWidth(doc),
    });

  doc
    .roundedRect(doc.page.width - doc.page.margins.right - 96, 42, 96, 38, 6)
    .fill(COLORS.panel);
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text('VERSION', doc.page.width - doc.page.margins.right - 84, 50);
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor(COLORS.navy)
    .text(String(versionRow.version), doc.page.width - doc.page.margins.right - 84, 62);

  doc
    .moveTo(doc.page.margins.left, 144)
    .lineTo(doc.page.width - doc.page.margins.right, 144)
    .strokeColor(COLORS.line)
    .stroke();
  doc.y = 162;
};

const drawSummaryItem = (doc, x, y, width, label, value) => {
  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor(COLORS.muted)
    .text(String(label).toUpperCase(), x, y, { width });
  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor(COLORS.text)
    .text(normalizeAnswer(value), x, y + 12, {
      width,
      lineGap: 1,
    });
};

const drawSummaryBlock = (doc, items) => {
  const x = doc.page.margins.left;
  const y = doc.y;
  const width = contentWidth(doc);
  const padding = 14;
  const gap = 14;
  const colWidth = (width - padding * 2 - gap) / 2;
  const rowHeight = 43;
  const height = padding * 2 + rowHeight * 3;

  ensureRoom(doc, height + 14);
  doc
    .roundedRect(x, y, width, height, 8)
    .fillAndStroke(COLORS.panel, COLORS.line);

  items.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    drawSummaryItem(
      doc,
      x + padding + col * (colWidth + gap),
      y + padding + row * rowHeight,
      colWidth,
      item.label,
      item.value
    );
  });

  doc.y = y + height + 18;
};

const fieldIsFullWidth = (field, value) => {
  const type = String(field?.type || '').toLowerCase();
  return type === 'textarea' || String(value || '').length > 70;
};

const drawFieldCell = (doc, { x, y, width, label, value }) => {
  const normalizedValue = normalizeAnswer(value);
  const empty = isEmptyAnswer(value);
  const labelHeight = 9;
  const valueHeight = doc.heightOfString(normalizedValue, {
    width: width - 20,
    lineGap: 1.5,
  });
  const height = Math.max(44, 12 + labelHeight + 6 + valueHeight + 11);

  doc
    .roundedRect(x, y, width, height, 5)
    .fillAndStroke(COLORS.white, COLORS.softLine);
  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor(COLORS.muted)
    .text(label, x + 10, y + 9, { width: width - 20 });
  doc
    .font(empty ? 'Helvetica-Oblique' : 'Helvetica')
    .fontSize(9)
    .fillColor(empty ? '#94a3b8' : COLORS.text)
    .text(normalizedValue, x + 10, y + 24, {
      width: width - 20,
      lineGap: 1.5,
    });

  return height;
};

const drawSectionTitle = (doc, title) => {
  ensureRoom(doc, 54);
  const x = doc.page.margins.left;
  const y = doc.y;
  doc
    .roundedRect(x, y, contentWidth(doc), 28, 6)
    .fill(COLORS.navy);
  doc
    .rect(x, y, 6, 28)
    .fill(COLORS.blue);
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(COLORS.white)
    .text(cleanText(title, 'Seccion'), x + 14, y + 8, {
      width: contentWidth(doc) - 28,
    });
  doc.y = y + 38;
};

const drawSectionFields = (doc, fields, respuestas) => {
  const x = doc.page.margins.left;
  const gap = 10;
  const colWidth = (contentWidth(doc) - gap) / 2;
  let pendingHalf = null;

  const flushPending = () => {
    if (!pendingHalf) return;
    ensureRoom(doc, 62);
    const height = drawFieldCell(doc, {
      x,
      y: doc.y,
      width: colWidth,
      label: pendingHalf.label,
      value: pendingHalf.value,
    });
    doc.y += height + 9;
    pendingHalf = null;
  };

  fields.forEach((field) => {
    const fieldName = field?.name || field?.key;
    if (!hasValue(fieldName)) return;
    const value = respuestas[fieldName];
    const label = fieldLabel(field);

    if (fieldIsFullWidth(field, value)) {
      flushPending();
      const normalizedValue = normalizeAnswer(value);
      const estimated = Math.max(
        54,
        doc.heightOfString(normalizedValue, { width: contentWidth(doc) - 20, lineGap: 1.5 }) + 38
      );
      ensureRoom(doc, estimated + 10);
      const height = drawFieldCell(doc, {
        x,
        y: doc.y,
        width: contentWidth(doc),
        label,
        value,
      });
      doc.y += height + 9;
      return;
    }

    if (!pendingHalf) {
      pendingHalf = { label, value };
      return;
    }

    ensureRoom(doc, 62);
    const y = doc.y;
    const leftHeight = drawFieldCell(doc, {
      x,
      y,
      width: colWidth,
      label: pendingHalf.label,
      value: pendingHalf.value,
    });
    const rightHeight = drawFieldCell(doc, {
      x: x + colWidth + gap,
      y,
      width: colWidth,
      label,
      value,
    });
    doc.y = y + Math.max(leftHeight, rightHeight) + 9;
    pendingHalf = null;
  });

  flushPending();
};

const drawRepeater = (doc, field, items = []) => {
  drawSectionTitle(doc, field.label || field.key || 'Registros');
  if (!items.length) {
    doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.muted).text('Sin registros.');
    doc.y += 10;
    return;
  }
  items.forEach((item, index) => {
    ensureRoom(doc, 70);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.blue).text(`Registro ${index + 1}`);
    doc.y += 4;
    const data = item?.data && typeof item.data === 'object' ? item.data : item;
    drawSectionFields(doc, (field.fields || []).filter((child) => isFieldVisible(child, data)), data);
  });
};

const renderPerfilPdfBuffer = async ({ versionRow }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: {
        top: 54,
        right: 54,
        bottom: 54,
        left: 54,
      },
      bufferPages: true,
      info: {
        Title: `Reporte de perfil - Solicitud #${versionRow.id_solicitud}`,
        Author: 'Diligencias Internacionales Inc.',
      },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const estructura = versionRow.estructura_json || {};
    const respuestas = versionRow.respuestas_json || {};
    const isV2 = isV2Template(estructura);
    const secciones = isV2
      ? (Array.isArray(estructura.sections) ? estructura.sections : [])
      : (Array.isArray(estructura.secciones) ? estructura.secciones : []);
    const repeaters = versionRow.repetibles_snapshot_json || {};
    const nombreAplicante = buildNombreCompleto(
      versionRow.cliente_nombre,
      versionRow.apellido_paterno,
      versionRow.apellido_materno
    ) || `Aplicante #${versionRow.id_cliente}`;

    drawHeader(doc, { versionRow });

    drawSummaryBlock(doc, [
      { label: 'Folio de solicitud', value: `#${versionRow.id_solicitud}` },
      { label: 'Aplicante', value: `${nombreAplicante} (#${versionRow.id_cliente})` },
      { label: 'Contacto', value: versionRow.contacto_nombre },
      { label: 'Tipo de tramite', value: versionRow.nombre_tramite },
      { label: 'Version del perfil', value: versionRow.version },
      { label: 'Fecha de generacion', value: formatDate(new Date()) },
    ]);

    if (!secciones.length) {
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(COLORS.slate)
        .text('La plantilla no tiene secciones configuradas.');
    }

    for (const section of secciones) {
      const fields = isV2 ? (section.fields || []) : (section.campos || []);
      const scalarFields = isV2
        ? fields.filter((field) => field.type !== 'repeater' && isFieldVisible(field, respuestas)).map((field) => ({ ...field, name: field.key }))
        : fields;
      if (scalarFields.length) {
        drawSectionTitle(doc, section.label || section.titulo || section.nombre || 'Seccion');
        drawSectionFields(doc, scalarFields, respuestas);
      }
      if (isV2) fields.filter((field) => field.type === 'repeater' && isFieldVisible(field, respuestas)).forEach((field) => drawRepeater(doc, field, repeaters[field.key] || []));
      doc.y += 8;
    }

    const pageRange = doc.bufferedPageRange();
    for (let i = pageRange.start; i < pageRange.start + pageRange.count; i += 1) {
      doc.switchToPage(i);
      doc
        .moveTo(doc.page.margins.left, doc.page.height - 44)
        .lineTo(doc.page.width - doc.page.margins.right, doc.page.height - 44)
        .strokeColor(COLORS.line)
        .stroke();
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(
          'Diligencias Internacionales Inc.',
          doc.page.margins.left,
          doc.page.height - 34,
          { align: 'left', width: contentWidth(doc) / 2 }
        );
      doc
        .text(
          `Pagina ${i + 1} de ${pageRange.count}`,
          doc.page.margins.left,
          doc.page.height - 34,
          { align: 'right', width: contentWidth(doc) }
        );
    }

    doc.end();
  });

const getVersionForPdf = async (client, idVersion, { forUpdate = true } = {}) => {
  const { rows } = await client.query(
    `SELECT
       psv.id_version,
       psv.id_perfil,
       psv.version,
       psv.respuestas_json,
       psv.repetibles_snapshot_json,
       psv.completitud_json,
       psv.estado_snapshot,
       psv.motivo_cambio,
       psv.creado_en,
       psv.id_documento_pdf,
       psv.pdf_drive_file_id,
       psv.pdf_generado_en,
       psv.pdf_nombre_archivo,
       ps.id_solicitud,
       ps.id_cliente,
       ps.id_plantilla,
       ps.estado AS perfil_estado,
       pp.nombre AS plantilla_nombre,
       pp.clave AS plantilla_clave,
       pp.estructura_json,
       s.id_tipo_tramite,
       tt.nombre_tramite,
       c.nombre AS cliente_nombre,
       c.apellido_paterno,
       c.apellido_materno,
       c.id_contacto,
       co.nombre AS contacto_nombre,
       co.telefono AS contacto_telefono,
       co.correo AS contacto_correo
     FROM public.perfiles_solicitud_versiones psv
     JOIN public.perfiles_solicitud ps ON ps.id_perfil = psv.id_perfil
     JOIN public.perfil_plantillas pp ON pp.id_plantilla = ps.id_plantilla
     JOIN public.solicitudes s ON s.id_solicitud = ps.id_solicitud
     JOIN public.clientes c ON c.id_cliente = ps.id_cliente
     LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     WHERE psv.id_version = $1
     ${forUpdate ? 'FOR UPDATE OF psv' : ''}`,
    [idVersion]
  );

  return rows[0] || null;
};

const getDocumentoById = async (client, idDocumento) => {
  if (!idDocumento) return null;
  const { rows } = await client.query(
    `SELECT id_documento, nombre_documento, drive_file_id, drive_folder_id,
            web_view_link, web_content_link, mime_type, tamano_bytes,
            origen_documento, fecha_subida
     FROM public.documentos
     WHERE id_documento = $1
     LIMIT 1`,
    [idDocumento]
  );
  return rows[0] || null;
};

const getOrCreateTipoDocumentoPerfil = async (client) => {
  await client.query(
    `SELECT pg_advisory_xact_lock(hashtext('catalogo_tipos_documento:perfil_generado')::bigint)`
  );

  const existing = await client.query(
    `SELECT id
     FROM public.catalogo_tipos_documento
     WHERE lower(tipo) = lower($1)
     LIMIT 1`,
    [PERFIL_GENERADO_TIPO]
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const inserted = await client.query(
    `INSERT INTO public.catalogo_tipos_documento (id, tipo)
     SELECT COALESCE(MAX(id), 0) + 1, $1
     FROM public.catalogo_tipos_documento
     RETURNING id`,
    [PERFIL_GENERADO_TIPO]
  );

  return inserted.rows[0].id;
};

const insertDocumentoPerfil = async (client, { versionRow, filename, folderId, driveFile, bufferLength }) => {
  const tipoDocumento = await getOrCreateTipoDocumentoPerfil(client);
  const { rows } = await client.query(
    `INSERT INTO public.documentos (
       id_cliente,
       id_solicitud,
       tipo_documento,
       nombre_documento,
       url_archivo,
       estado_documento,
       fecha_subida,
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
       drive_matched_at
     )
     VALUES ($1, $2, $3, $4, $5, NULL, NOW(), $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
     RETURNING id_documento, nombre_documento, drive_file_id, drive_folder_id,
               web_view_link, web_content_link, mime_type, tamano_bytes,
               origen_documento, fecha_subida`,
    [
      versionRow.id_cliente,
      versionRow.id_solicitud,
      tipoDocumento,
      filename,
      filename,
      `PDF generado desde perfil #${versionRow.id_perfil}, version ${versionRow.version}`,
      'perfil_generado',
      driveFile.id,
      folderId,
      driveFile.webViewLink || null,
      driveFile.webContentLink || null,
      PDF_MIME_TYPE,
      bufferLength,
      'matched',
      `Generado desde perfil version id ${versionRow.id_version}`,
    ]
  );

  return rows[0];
};

const updateDocumentoPerfil = async (client, { idDocumento, versionRow, filename, folderId, driveFile, bufferLength }) => {
  const { rows } = await client.query(
    `UPDATE public.documentos
     SET nombre_documento = $1,
         url_archivo = $1,
         fecha_subida = NOW(),
         observaciones = $2,
         origen_documento = $3,
         drive_file_id = $4,
         drive_folder_id = $5,
         web_view_link = $6,
         web_content_link = $7,
         mime_type = $8,
         tamano_bytes = $9,
         drive_match_status = $10,
         drive_match_notes = $11,
         drive_matched_at = NOW()
     WHERE id_documento = $12
     RETURNING id_documento, nombre_documento, drive_file_id, drive_folder_id,
               web_view_link, web_content_link, mime_type, tamano_bytes,
               origen_documento, fecha_subida`,
    [
      filename,
      `PDF regenerado desde perfil #${versionRow.id_perfil}, version ${versionRow.version}`,
      'perfil_generado',
      driveFile.id,
      folderId,
      driveFile.webViewLink || null,
      driveFile.webContentLink || null,
      PDF_MIME_TYPE,
      bufferLength,
      'matched',
      `Regenerado desde perfil version id ${versionRow.id_version}`,
      idDocumento,
    ]
  );

  return rows[0] || null;
};

async function generarPdfPerfilVersion(idVersion, options = {}) {
  const safeIdVersion = positiveInteger(idVersion, 'id_version');
  const force = options.force === true || options.force === 'true';
  let versionRow;

  const readClient = await pool.connect();
  try {
    await readClient.query('BEGIN');

    versionRow = await getVersionForPdf(readClient, safeIdVersion);
    if (!versionRow) {
      throw notFound('Perfil version not found');
    }

    if (!force && versionRow.id_documento_pdf && versionRow.pdf_drive_file_id) {
      const documento = await getDocumentoById(readClient, versionRow.id_documento_pdf);
      await readClient.query('COMMIT');
      return {
        ok: true,
        existing: true,
        id_version: versionRow.id_version,
        id_perfil: versionRow.id_perfil,
        id_solicitud: versionRow.id_solicitud,
        version: versionRow.version,
        documento: documento && {
          id_documento: documento.id_documento,
          nombre: documento.nombre_documento,
          drive_file_id: documento.drive_file_id,
          mime_type: documento.mime_type,
        },
        pdf_generado_en: versionRow.pdf_generado_en,
        pdf_nombre_archivo: versionRow.pdf_nombre_archivo,
      };
    }

    await readClient.query('COMMIT');
  } catch (err) {
    await readClient.query('ROLLBACK');
    throw err;
  } finally {
    readClient.release();
  }

  const expediente = await ensureExpedienteFoldersBySolicitud(versionRow.id_solicitud);
  const perfilesFolder = expediente.carpetas?.subcarpetas?.perfiles_generados;
  if (!perfilesFolder?.drive_folder_id) {
    throw new Error('Drive folder "Perfiles generados" was not resolved.');
  }

  const filename = sanitizeFilename(
    `Perfil - Solicitud #${versionRow.id_solicitud} - ${versionRow.nombre_tramite || versionRow.plantilla_nombre} - v${versionRow.version}.pdf`
  );
  const pdfBuffer = await renderPerfilPdfBuffer({ versionRow });
  const shouldUpdateExisting = Boolean(force && versionRow.id_documento_pdf && versionRow.pdf_drive_file_id);
  const driveFile = shouldUpdateExisting
    ? await updateFileBuffer({
      fileId: versionRow.pdf_drive_file_id,
      buffer: pdfBuffer,
      filename,
      mimeType: PDF_MIME_TYPE,
    })
    : await uploadBufferToFolder({
      buffer: pdfBuffer,
      filename,
      mimeType: PDF_MIME_TYPE,
      folderId: perfilesFolder.drive_folder_id,
    });

  const writeClient = await pool.connect();
  try {
    await writeClient.query('BEGIN');

    const currentVersionRow = await getVersionForPdf(writeClient, safeIdVersion);
    if (!currentVersionRow) {
      throw notFound('Perfil version not found');
    }

    if (!force && currentVersionRow.id_documento_pdf && currentVersionRow.pdf_drive_file_id) {
      const documento = await getDocumentoById(writeClient, currentVersionRow.id_documento_pdf);
      await writeClient.query('COMMIT');
      return {
        ok: true,
        existing: true,
        id_version: currentVersionRow.id_version,
        id_perfil: currentVersionRow.id_perfil,
        id_solicitud: currentVersionRow.id_solicitud,
        version: currentVersionRow.version,
        documento: documento && {
          id_documento: documento.id_documento,
          nombre: documento.nombre_documento,
          drive_file_id: documento.drive_file_id,
          mime_type: documento.mime_type,
        },
        pdf_generado_en: currentVersionRow.pdf_generado_en,
        pdf_nombre_archivo: currentVersionRow.pdf_nombre_archivo,
      };
    }

    versionRow = currentVersionRow;

    const documento = shouldUpdateExisting
      ? await updateDocumentoPerfil(writeClient, {
        idDocumento: versionRow.id_documento_pdf,
        versionRow,
        filename,
        folderId: perfilesFolder.drive_folder_id,
        driveFile,
        bufferLength: pdfBuffer.length,
      })
      : await insertDocumentoPerfil(writeClient, {
        versionRow,
        filename,
        folderId: perfilesFolder.drive_folder_id,
        driveFile,
        bufferLength: pdfBuffer.length,
      });

    if (!documento) {
      throw new Error('Generated PDF document record could not be saved.');
    }

    const { rows: updatedRows } = await writeClient.query(
      `UPDATE public.perfiles_solicitud_versiones
       SET id_documento_pdf = $1,
           pdf_drive_file_id = $2,
           pdf_generado_en = NOW(),
           pdf_nombre_archivo = $3
       WHERE id_version = $4
       RETURNING pdf_generado_en, pdf_nombre_archivo`,
      [documento.id_documento, driveFile.id, filename, versionRow.id_version]
    );

    await writeClient.query('COMMIT');

    return {
      ok: true,
      existing: false,
      regenerated: shouldUpdateExisting,
      id_version: versionRow.id_version,
      id_perfil: versionRow.id_perfil,
      id_solicitud: versionRow.id_solicitud,
      version: versionRow.version,
      documento: {
        id_documento: documento.id_documento,
        nombre: documento.nombre_documento,
        drive_file_id: documento.drive_file_id,
        mime_type: documento.mime_type,
      },
      pdf_generado_en: updatedRows[0]?.pdf_generado_en,
      pdf_nombre_archivo: updatedRows[0]?.pdf_nombre_archivo,
    };
  } catch (err) {
    await writeClient.query('ROLLBACK');
    throw err;
  } finally {
    writeClient.release();
  }
}

module.exports = {
  generarPdfPerfilVersion,
  renderPerfilPdfBuffer,
};
