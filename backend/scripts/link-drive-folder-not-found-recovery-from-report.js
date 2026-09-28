const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { pool } = require('../src/config/db');

dotenv.config();

const REPORT_PATH = process.env.DRIVE_RECOVERY_REPORT_PATH;

const summary = {
  total_rows_in_report: 0,
  matched_rows_in_report: 0,
  updated: 0,
  already_updated: 0,
  skipped_not_eligible: 0,
  missing_drive_file_id: 0,
  error: 0,
};

const csvColumns = [
  'id_documento',
  'id_solicitud',
  'nombre_documento',
  'previous_db_status',
  'report_result_status',
  'updated',
  'reason',
  'drive_file_id',
  'drive_folder_id',
  'web_view_link',
  'mime_type',
  'tamano_bytes',
  'matched_by_legacy_code_fallback',
];

const getTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

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

const resolveReportPath = () => {
  if (!REPORT_PATH || !REPORT_PATH.trim()) {
    throw new Error('Missing DRIVE_RECOVERY_REPORT_PATH environment variable.');
  }

  return path.isAbsolute(REPORT_PATH) ? REPORT_PATH : path.resolve(__dirname, '..', REPORT_PATH);
};

const loadReportRows = () => {
  const reportPath = resolveReportPath();

  if (!fs.existsSync(reportPath)) {
    throw new Error(`Recovery report not found: ${reportPath}`);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  if (!Array.isArray(report.results)) {
    throw new Error(`Recovery report does not contain a results array: ${reportPath}`);
  }

  return {
    reportPath,
    rows: report.results,
  };
};

const getMatchedRows = (rows) =>
  rows.filter((row) => {
    if (row.result_status !== 'matched') {
      return false;
    }

    if (!row.id_documento) {
      return false;
    }

    if (!row.drive_file_id) {
      summary.missing_drive_file_id += 1;
      return false;
    }

    return true;
  });

const getDocumentoStatus = async (idDocumento) => {
  const sql = `SELECT
    id_documento,
    origen_documento,
    drive_match_status,
    drive_file_id
    FROM public.documentos
    WHERE id_documento = $1
    LIMIT 1`;

  const { rows } = await pool.query(sql, [idDocumento]);
  return rows[0] || null;
};

const updateDocumentoFromReportRow = async (row) => {
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
      AND origen_documento = 'legacy_appsheet'
      AND drive_match_status = 'folder_not_found'
      AND drive_file_id IS NULL`;

  const values = [
    row.drive_file_id,
    row.drive_folder_id || null,
    row.web_view_link || null,
    row.web_content_link || null,
    row.mime_type || null,
    row.tamano_bytes || null,
    row.result_notes || null,
    row.id_documento,
  ];

  const result = await pool.query(sql, values);
  return result.rowCount;
};

const buildReportRow = ({ row, dbStatus, updated, reason }) => ({
  id_documento: row.id_documento,
  id_solicitud: row.id_solicitud,
  nombre_documento: row.nombre_documento,
  previous_db_status: dbStatus?.drive_match_status || '',
  report_result_status: row.result_status,
  updated,
  reason,
  drive_file_id: row.drive_file_id || '',
  drive_folder_id: row.drive_folder_id || '',
  web_view_link: row.web_view_link || '',
  mime_type: row.mime_type || '',
  tamano_bytes: row.tamano_bytes || '',
  matched_by_legacy_code_fallback: Boolean(row.matched_by_legacy_code_fallback),
});

const processMatchedRow = async (row, index, total) => {
  try {
    const dbStatus = await getDocumentoStatus(row.id_documento);

    if (!dbStatus) {
      summary.skipped_not_eligible += 1;
      console.log(`[${index}/${total}] id_documento=${row.id_documento} SKIP not_found_in_db`);
      return buildReportRow({ row, dbStatus, updated: false, reason: 'not_found_in_db' });
    }

    if (dbStatus.drive_file_id) {
      summary.already_updated += 1;
      console.log(`[${index}/${total}] id_documento=${row.id_documento} SKIP already_updated`);
      return buildReportRow({ row, dbStatus, updated: false, reason: 'already_updated' });
    }

    if (dbStatus.origen_documento !== 'legacy_appsheet' || dbStatus.drive_match_status !== 'folder_not_found') {
      summary.skipped_not_eligible += 1;
      console.log(`[${index}/${total}] id_documento=${row.id_documento} SKIP not_eligible`);
      return buildReportRow({ row, dbStatus, updated: false, reason: 'not_eligible' });
    }

    const updatedRows = await updateDocumentoFromReportRow(row);
    const updated = updatedRows > 0;

    if (updated) {
      summary.updated += 1;
      console.log(`[${index}/${total}] id_documento=${row.id_documento} UPDATED`);
      return buildReportRow({ row, dbStatus, updated: true, reason: 'updated' });
    }

    summary.skipped_not_eligible += 1;
    console.log(`[${index}/${total}] id_documento=${row.id_documento} SKIP update_condition_not_met`);
    return buildReportRow({ row, dbStatus, updated: false, reason: 'update_condition_not_met' });
  } catch (err) {
    summary.error += 1;
    console.log(`[${index}/${total}] id_documento=${row.id_documento} ERROR`);
    console.error(err.message || err);

    return buildReportRow({
      row,
      dbStatus: null,
      updated: false,
      reason: err.message || String(err),
    });
  }
};

const writeReports = (rows, sourceReportPath) => {
  const backendRoot = path.resolve(__dirname, '..');
  const reportsDir = path.join(backendRoot, 'reports');
  const timestamp = getTimestamp();
  const jsonPath = path.join(reportsDir, `drive-folder-not-found-recovery-from-report-${timestamp}.json`);
  const csvPath = path.join(reportsDir, `drive-folder-not-found-recovery-from-report-${timestamp}.csv`);

  fs.mkdirSync(reportsDir, { recursive: true });

  fs.writeFileSync(
    jsonPath,
    `${JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        source_report_path: sourceReportPath,
        summary,
        results: rows,
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  fs.writeFileSync(csvPath, toCsv(rows), 'utf8');

  return { jsonPath, csvPath };
};

const main = async () => {
  try {
    const { reportPath, rows } = loadReportRows();
    const matchedRows = getMatchedRows(rows);

    summary.total_rows_in_report = rows.length;
    summary.matched_rows_in_report = matchedRows.length;

    console.log(`Reporte origen: ${reportPath}`);
    console.log(`Filas totales en reporte: ${rows.length}`);
    console.log(`Filas matched elegibles por reporte: ${matchedRows.length}`);
    console.log('No se llamara a Google Drive. Solo se actualizaran matched del reporte que sigan elegibles en PostgreSQL.');

    const results = [];

    for (let index = 0; index < matchedRows.length; index += 1) {
      const result = await processMatchedRow(matchedRows[index], index + 1, matchedRows.length);
      results.push(result);
    }

    const reportPaths = writeReports(results, reportPath);

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
  console.error('Error en vinculacion folder_not_found desde reporte:');
  console.error(err);
  process.exitCode = 1;
});
