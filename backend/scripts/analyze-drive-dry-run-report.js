const fs = require('fs');
const path = require('path');

const REPORT_PREFIX = 'drive-legacy-dry-run-';
const REPORT_SUFFIX = '.json';
const LEGACY_ROOT_PREFIX = 'FOTOS DE TRAMITES';

const reportsDir = path.resolve(__dirname, '..', 'reports');

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const isLegacyRootSegment = (segment) => normalizeText(segment) === normalizeText(LEGACY_ROOT_PREFIX);

const getLatestReportPath = () => {
  if (!fs.existsSync(reportsDir)) {
    throw new Error(`Reports directory does not exist: ${reportsDir}`);
  }

  const reportFiles = fs
    .readdirSync(reportsDir)
    .filter((fileName) => fileName.startsWith(REPORT_PREFIX) && fileName.endsWith(REPORT_SUFFIX))
    .map((fileName) => {
      const fullPath = path.join(reportsDir, fileName);
      return {
        fileName,
        fullPath,
        modifiedAt: fs.statSync(fullPath).mtimeMs,
      };
    })
    .sort((a, b) => b.modifiedAt - a.modifiedAt);

  if (reportFiles.length === 0) {
    throw new Error(`No ${REPORT_PREFIX}*${REPORT_SUFFIX} files found in ${reportsDir}`);
  }

  return reportFiles[0].fullPath;
};

const loadReport = (reportPath) => {
  const raw = fs.readFileSync(reportPath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed.results)) {
    throw new Error(`Report does not contain a results array: ${reportPath}`);
  }

  return parsed;
};

const increment = (map, key) => {
  const safeKey = key || 'unknown';
  map[safeKey] = (map[safeKey] || 0) + 1;
};

const summarizeByStatus = (results) =>
  results.reduce((summary, row) => {
    increment(summary, row.status);
    return summary;
  }, {});

const getPathParts = (urlArchivo) =>
  String(urlArchivo || '')
    .replace(/\\/g, '/')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

const getFirstSegmentAfterLegacyPrefix = (urlArchivo) => {
  const parts = getPathParts(urlArchivo);

  if (parts.length === 0) return 'empty_or_null';
  if (isLegacyRootSegment(parts[0])) return parts[1] || 'missing_after_root';

  return parts[0];
};

const getInvalidReferencePattern = (row) => {
  const urlArchivo = row.url_archivo;

  if (urlArchivo === null || urlArchivo === undefined || String(urlArchivo).trim() === '') {
    return 'empty_or_null';
  }

  const value = String(urlArchivo).trim();

  if (/^\d+$/.test(value)) {
    return 'numeric_only';
  }

  if (!value.includes('/') && !value.includes('\\')) {
    return 'no_slash';
  }

  const fileName = getPathParts(value).pop() || '';

  if (!/\.[a-z0-9]+$/i.test(fileName)) {
    return 'no_extension';
  }

  return 'other';
};

const groupBy = (rows, getKey) =>
  rows.reduce((groups, row) => {
    increment(groups, getKey(row));
    return groups;
  }, {});

const sortGroupEntries = (groups) =>
  Object.entries(groups).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

const printRows = (title, rows, limit) => {
  console.log(`\n${title}`);

  if (rows.length === 0) {
    console.log('No hay registros.');
    return;
  }

  rows.slice(0, limit).forEach((row, index) => {
    console.log(`\n${index + 1}. id_documento=${row.id_documento} id_solicitud=${row.id_solicitud}`);
    console.log(`   nombre_documento: ${row.nombre_documento || 'N/A'}`);
    console.log(`   url_archivo: ${row.url_archivo || 'N/A'}`);
    console.log(`   notes: ${row.notes || 'N/A'}`);
  });
};

const printGroups = (title, groups) => {
  console.log(`\n${title}`);

  const entries = sortGroupEntries(groups);

  if (entries.length === 0) {
    console.log('No hay registros.');
    return;
  }

  entries.forEach(([key, count]) => {
    console.log(`${key}: ${count}`);
  });
};

const main = () => {
  const latestReportPath = getLatestReportPath();
  const report = loadReport(latestReportPath);
  const results = report.results;
  const failedResults = results.filter((row) => row.status !== 'matched');
  const invalidReferences = results.filter((row) => row.status === 'invalid_reference');
  const folderNotFound = results.filter((row) => row.status === 'folder_not_found');
  const fileNotFound = results.filter((row) => row.status === 'file_not_found');

  console.log(`Reporte analizado: ${latestReportPath}`);
  console.log(`Generado en: ${report.generated_at || 'N/A'}`);
  console.log(`Total resultados: ${results.length}`);
  console.log(`Total no matched: ${failedResults.length}`);

  printGroups('Resumen por status', summarizeByStatus(results));
  printRows('Primeros 30 invalid_reference', invalidReferences, 30);
  printRows('Primeros 30 folder_not_found', folderNotFound, 30);
  printRows('Primeros 10 file_not_found', fileNotFound, 10);
  printGroups(
    'folder_not_found por primer segmento despues de FOTOS DE TRAMITES',
    groupBy(folderNotFound, (row) => getFirstSegmentAfterLegacyPrefix(row.url_archivo))
  );
  printGroups(
    'invalid_reference por patron',
    groupBy(invalidReferences, (row) => getInvalidReferencePattern(row))
  );
};

try {
  main();
} catch (err) {
  console.error('Error al analizar reporte dry-run de Drive legacy:');
  console.error(err);
  process.exitCode = 1;
}
