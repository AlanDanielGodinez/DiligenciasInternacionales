const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { pool } = require('../src/config/db');
const { resolveLegacyAppSheetPath } = require('../src/services/drive.service');

dotenv.config();

const LIMIT = Number(process.env.DRIVE_RECOVERY_DRY_RUN_LIMIT || 100);

const summary = {
  total: 0,
  recovered_matched: 0,
  matched_by_legacy_code_fallback: 0,
  still_folder_not_found: 0,
  file_not_found: 0,
  invalid_reference: 0,
  multiple_matches: 0,
  error: 0,
  other_status: 0,
};

const csvColumns = [
  'id_documento',
  'id_solicitud',
  'nombre_documento',
  'url_archivo',
  'previous_status',
  'result_status',
  'result_notes',
  'drive_file_id',
  'drive_folder_id',
  'web_view_link',
  'mime_type',
  'tamano_bytes',
  'matched_by_legacy_code_fallback',
];

const getTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const normalizeStatus = (status) => {
  if (status === 'invalid_path') return 'invalid_reference';
  return status || 'error';
};

const isMatchedByLegacyCodeFallback = (notes) =>
  String(notes || '').toLowerCase().includes('legacy code fallback');

const incrementSummary = (status, matchedByLegacyCodeFallback) => {
  if (status === 'matched') {
    summary.recovered_matched += 1;

    if (matchedByLegacyCodeFallback) {
      summary.matched_by_legacy_code_fallback += 1;
    }

    return;
  }

  if (status === 'folder_not_found') {
    summary.still_folder_not_found += 1;
    return;
  }

  if (Object.prototype.hasOwnProperty.call(summary, status)) {
    summary[status] += 1;
    return;
  }

  summary.other_status += 1;
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
    id_solicitud,
    nombre_documento,
    url_archivo,
    drive_match_status
    FROM public.documentos
    WHERE origen_documento = 'legacy_appsheet'
      AND drive_match_status = 'folder_not_found'
      AND drive_file_id IS NULL
      AND url_archivo IS NOT NULL
      AND trim(url_archivo) <> ''
    ORDER BY drive_matched_at DESC NULLS LAST, id_documento DESC
    LIMIT $1`;

  const { rows } = await pool.query(sql, [LIMIT]);
  return rows;
};

const buildResultRow = (documento, result, status, matchedByLegacyCodeFallback) => ({
  id_documento: documento.id_documento,
  id_solicitud: documento.id_solicitud,
  nombre_documento: documento.nombre_documento,
  url_archivo: documento.url_archivo,
  previous_status: documento.drive_match_status,
  result_status: status,
  result_notes: result.notes || '',
  drive_file_id: result.file?.drive_file_id || '',
  drive_folder_id: result.file?.drive_folder_id || '',
  web_view_link: result.file?.web_view_link || '',
  mime_type: result.file?.mime_type || '',
  tamano_bytes: result.file?.tamano_bytes || '',
  matched_by_legacy_code_fallback: matchedByLegacyCodeFallback,
});

const buildErrorRow = (documento, err) => ({
  id_documento: documento.id_documento,
  id_solicitud: documento.id_solicitud,
  nombre_documento: documento.nombre_documento,
  url_archivo: documento.url_archivo,
  previous_status: documento.drive_match_status,
  result_status: 'error',
  result_notes: err.message || String(err),
  drive_file_id: '',
  drive_folder_id: '',
  web_view_link: '',
  mime_type: '',
  tamano_bytes: '',
  matched_by_legacy_code_fallback: false,
});

const processDocumento = async (documento, index, total) => {
  try {
    const result = await resolveLegacyAppSheetPath(documento.url_archivo);
    const status = normalizeStatus(result.status);
    const matchedByLegacyCodeFallback = isMatchedByLegacyCodeFallback(result.notes);

    incrementSummary(status, matchedByLegacyCodeFallback);
    console.log(
      `[${index}/${total}] id_documento=${documento.id_documento} previous=folder_not_found result=${status} legacy_code_fallback=${matchedByLegacyCodeFallback}`
    );

    return buildResultRow(documento, result, status, matchedByLegacyCodeFallback);
  } catch (err) {
    summary.error += 1;
    console.log(`[${index}/${total}] id_documento=${documento.id_documento} previous=folder_not_found result=error`);
    console.error(err.message || err);

    return buildErrorRow(documento, err);
  }
};

const writeReports = (results) => {
  const backendRoot = path.resolve(__dirname, '..');
  const reportsDir = path.join(backendRoot, 'reports');
  const timestamp = getTimestamp();
  const jsonPath = path.join(reportsDir, `drive-folder-not-found-recovery-dry-run-${timestamp}.json`);
  const csvPath = path.join(reportsDir, `drive-folder-not-found-recovery-dry-run-${timestamp}.csv`);

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
      throw new Error('DRIVE_RECOVERY_DRY_RUN_LIMIT must be a positive integer.');
    }

    const documentos = await readDocumentos();
    summary.total = documentos.length;

    console.log(`Dry-run folder_not_found recovery. Limit=${LIMIT}`);
    console.log('No se actualizara PostgreSQL. Solo se generaran reportes locales.');
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
  console.error('Error en dry-run de recuperacion folder_not_found:');
  console.error(err);
  process.exitCode = 1;
});
