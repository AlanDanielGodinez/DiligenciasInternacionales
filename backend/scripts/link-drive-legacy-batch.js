const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { pool } = require('../src/config/db');
const { resolveLegacyAppSheetPath } = require('../src/services/drive.service');

dotenv.config();

const LIMIT = Number(process.env.DRIVE_LINK_BATCH_LIMIT || 100);

const summary = {
  total: 0,
  matched_updated: 0,
  status_only_updated: 0,
  invalid_reference: 0,
  folder_not_found: 0,
  file_not_found: 0,
  multiple_matches: 0,
  error: 0,
};

const csvColumns = [
  'id_documento',
  'id_cliente',
  'id_solicitud',
  'nombre_documento',
  'url_archivo',
  'status',
  'action',
  'updated_rows',
  'notes',
  'drive_file_id',
  'drive_folder_id',
  'web_view_link',
  'mime_type',
  'tamano_bytes',
  'candidates_count',
  'error',
];

const getTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const normalizeStatus = (status) => {
  if (status === 'invalid_path') return 'invalid_reference';
  return status || 'error';
};

const incrementStatusSummary = (status) => {
  if (Object.prototype.hasOwnProperty.call(summary, status)) {
    summary[status] += 1;
    return;
  }

  summary.error += 1;
};

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
};

const toCsv = (rows) => {
  const header = csvColumns.map(escapeCsvValue).join(',');
  const body = rows
    .map((row) => csvColumns.map((column) => escapeCsvValue(row[column])).join(','))
    .join('\n');

  return body ? `${header}\n${body}\n` : `${header}\n`;
};

const readDocumentos = async () => {
  const sql = `SELECT
    id_documento,
    id_cliente,
    id_solicitud,
    nombre_documento,
    url_archivo
    FROM public.documentos
    WHERE origen_documento = 'legacy_appsheet'
      AND drive_file_id IS NULL
      AND url_archivo IS NOT NULL
      AND trim(url_archivo) <> ''
      AND (
        drive_match_status IS NULL
        OR trim(drive_match_status) = ''
        OR drive_match_status = 'error'
      )
    ORDER BY id_documento DESC
    LIMIT $1`;

  const { rows } = await pool.query(sql, [LIMIT]);
  return rows;
};

const updateMatchedDocumento = async (idDocumento, file, notes) => {
  const sql = `UPDATE public.documentos
    SET
      drive_file_id = $1,
      drive_folder_id = $2,
      web_view_link = $3,
      web_content_link = $4,
      mime_type = $5,
      tamano_bytes = $6,
      drive_match_status = 'matched',
      drive_match_notes = $7,
      drive_matched_at = NOW()
    WHERE id_documento = $8
      AND drive_file_id IS NULL`;

  const values = [
    file.drive_file_id,
    file.drive_folder_id,
    file.web_view_link,
    file.web_content_link,
    file.mime_type,
    file.tamano_bytes,
    notes,
    idDocumento,
  ];

  const result = await pool.query(sql, values);
  return result.rowCount;
};

const updateUnmatchedDocumento = async (idDocumento, status, notes) => {
  const sql = `UPDATE public.documentos
    SET
      drive_match_status = $1,
      drive_match_notes = $2,
      drive_matched_at = NOW()
    WHERE id_documento = $3
      AND drive_file_id IS NULL`;

  const result = await pool.query(sql, [status, notes, idDocumento]);
  return result.rowCount;
};

const buildResultRow = ({ documento, status, action, updatedRows, driveResult, error }) => ({
  id_documento: documento.id_documento,
  id_cliente: documento.id_cliente,
  id_solicitud: documento.id_solicitud,
  nombre_documento: documento.nombre_documento,
  url_archivo: documento.url_archivo,
  status,
  action,
  updated_rows: updatedRows,
  notes: driveResult?.notes || '',
  drive_file_id: driveResult?.file?.drive_file_id || '',
  drive_folder_id: driveResult?.file?.drive_folder_id || '',
  web_view_link: driveResult?.file?.web_view_link || '',
  mime_type: driveResult?.file?.mime_type || '',
  tamano_bytes: driveResult?.file?.tamano_bytes || '',
  candidates_count: Array.isArray(driveResult?.candidates) ? driveResult.candidates.length : '',
  error: error ? error.message || String(error) : '',
});

const processDocumento = async (documento, index, total) => {
  try {
    const driveResult = await resolveLegacyAppSheetPath(documento.url_archivo);
    const status = normalizeStatus(driveResult.status);

    if (status === 'matched' && driveResult.file) {
      const updatedRows = await updateMatchedDocumento(documento.id_documento, driveResult.file, driveResult.notes);
      summary.matched_updated += updatedRows;
      console.log(`[${index}/${total}] id_documento=${documento.id_documento} status=matched UPDATED`);

      return buildResultRow({
        documento,
        status,
        action: 'UPDATED',
        updatedRows,
        driveResult,
      });
    }

    const updatedRows = await updateUnmatchedDocumento(documento.id_documento, status, driveResult.notes);
    summary.status_only_updated += updatedRows;
    incrementStatusSummary(status);
    console.log(`[${index}/${total}] id_documento=${documento.id_documento} status=${status} STATUS_ONLY`);

    return buildResultRow({
      documento,
      status,
      action: 'STATUS_ONLY',
      updatedRows,
      driveResult,
    });
  } catch (err) {
    summary.error += 1;
    console.log(`[${index}/${total}] id_documento=${documento.id_documento} status=error ERROR`);
    console.error(err.message || err);

    return buildResultRow({
      documento,
      status: 'error',
      action: 'ERROR',
      updatedRows: 0,
      error: err,
    });
  }
};

const writeReports = (results) => {
  const backendRoot = path.resolve(__dirname, '..');
  const reportsDir = path.join(backendRoot, 'reports');
  const timestamp = getTimestamp();
  const jsonPath = path.join(reportsDir, `drive-legacy-link-batch-${timestamp}.json`);
  const csvPath = path.join(reportsDir, `drive-legacy-link-batch-${timestamp}.csv`);

  fs.mkdirSync(reportsDir, { recursive: true });

  fs.writeFileSync(
    jsonPath,
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        limit: LIMIT,
        summary,
        results,
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  fs.writeFileSync(csvPath, toCsv(results), 'utf8');

  return { jsonPath, csvPath };
};

const main = async () => {
  try {
    if (!Number.isInteger(LIMIT) || LIMIT <= 0) {
      throw new Error('DRIVE_LINK_BATCH_LIMIT must be a positive integer.');
    }

    const documentos = await readDocumentos();
    summary.total = documentos.length;

    console.log(`Link legacy AppSheet Drive documents batch. Limit=${LIMIT}`);
    console.log('Procesando documentos legacy sin drive_file_id y sin drive_match_status final.');
    console.log(`Documentos encontrados: ${documentos.length}`);

    const results = [];

    for (let index = 0; index < documentos.length; index += 1) {
      const result = await processDocumento(documentos[index], index + 1, documentos.length);
      results.push(result);
    }

    const reportPaths = writeReports(results);

    console.log('\nResumen final:');
    console.log(JSON.stringify(summary, null, 2));
    console.log('\nReportes generados:');
    console.log(`JSON: ${reportPaths.jsonPath}`);
    console.log(`CSV: ${reportPaths.csvPath}`);
  } finally {
    await pool.end();
  }
};

main().catch((err) => {
  console.error('Error en vinculacion por lote de documentos legacy AppSheet:');
  console.error(err);
  process.exitCode = 1;
});
