const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { pool } = require('../src/config/db');
const { resolveLegacyAppSheetPath } = require('../src/services/drive.service');

dotenv.config();

const LIMIT = Number(process.env.DRIVE_DRY_RUN_LIMIT || 100);

const summary = {
  total: 0,
  matched: 0,
  not_found: 0,
  folder_not_found: 0,
  file_not_found: 0,
  multiple_matches: 0,
  invalid_reference: 0,
  error: 0,
};

const csvColumns = [
  'id_documento',
  'id_cliente',
  'id_solicitud',
  'nombre_documento',
  'url_archivo',
  'status',
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

const incrementSummary = (status) => {
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
    ORDER BY id_documento DESC
    LIMIT $1`;

  const { rows } = await pool.query(sql, [LIMIT]);
  return rows;
};

const buildMatchedResult = (documento, result, status) => ({
  id_documento: documento.id_documento,
  id_cliente: documento.id_cliente,
  id_solicitud: documento.id_solicitud,
  nombre_documento: documento.nombre_documento,
  url_archivo: documento.url_archivo,
  status,
  notes: result.notes || '',
  drive_file_id: result.file?.drive_file_id || '',
  drive_folder_id: result.file?.drive_folder_id || '',
  web_view_link: result.file?.web_view_link || '',
  mime_type: result.file?.mime_type || '',
  tamano_bytes: result.file?.tamano_bytes || '',
  candidates_count: Array.isArray(result.candidates) ? result.candidates.length : '',
  error: '',
});

const buildErrorResult = (documento, err) => ({
  id_documento: documento.id_documento,
  id_cliente: documento.id_cliente,
  id_solicitud: documento.id_solicitud,
  nombre_documento: documento.nombre_documento,
  url_archivo: documento.url_archivo,
  status: 'error',
  notes: '',
  drive_file_id: '',
  drive_folder_id: '',
  web_view_link: '',
  mime_type: '',
  tamano_bytes: '',
  candidates_count: '',
  error: err.message || String(err),
});

const processDocumento = async (documento, index, total) => {
  try {
    const driveResult = await resolveLegacyAppSheetPath(documento.url_archivo);
    const status = normalizeStatus(driveResult.status);
    const result = buildMatchedResult(documento, driveResult, status);

    incrementSummary(status);
    console.log(`[${index}/${total}] id_documento=${documento.id_documento} status=${status}`);

    return result;
  } catch (err) {
    const result = buildErrorResult(documento, err);
    incrementSummary('error');
    console.log(`[${index}/${total}] id_documento=${documento.id_documento} status=error`);
    console.error(err.message || err);

    return result;
  }
};

const writeReports = (results) => {
  const backendRoot = path.resolve(__dirname, '..');
  const reportsDir = path.join(backendRoot, 'reports');
  const timestamp = getTimestamp();
  const jsonPath = path.join(reportsDir, `drive-legacy-dry-run-${timestamp}.json`);
  const csvPath = path.join(reportsDir, `drive-legacy-dry-run-${timestamp}.csv`);

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
      throw new Error('DRIVE_DRY_RUN_LIMIT must be a positive integer.');
    }

    const documentos = await readDocumentos();
    summary.total = documentos.length;

    console.log(`Dry-run legacy AppSheet Drive documents. Limit=${LIMIT}`);
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
  console.error('Error en dry-run de documentos legacy AppSheet:');
  console.error(err);
  process.exitCode = 1;
});
