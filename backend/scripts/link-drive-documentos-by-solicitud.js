const dotenv = require('dotenv');
const { pool } = require('../src/config/db');
const { resolveLegacyAppSheetPath } = require('../src/services/drive.service');

dotenv.config();

const ID_SOLICITUD = 6034;

const summary = {
  total: 0,
  skipped: 0,
  matched: 0,
  not_found: 0,
  multiple_matches: 0,
  errors: 0,
};

const readDocumentos = async () => {
  const sql = `SELECT
    id_documento,
    id_solicitud,
    nombre_documento,
    url_archivo,
    origen_documento,
    drive_file_id
    FROM public.documentos
    WHERE id_solicitud = $1
      AND origen_documento = 'legacy_appsheet'
      AND url_archivo IS NOT NULL
      AND trim(url_archivo) <> ''
    ORDER BY id_documento DESC`;

  const { rows } = await pool.query(sql, [ID_SOLICITUD]);
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
    WHERE id_documento = $8`;

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
    WHERE id_documento = $3`;

  const result = await pool.query(sql, [status, notes, idDocumento]);
  return result.rowCount;
};

const countUnmatchedStatus = (status) => {
  if (status === 'multiple_matches') {
    summary.multiple_matches += 1;
  } else if (status === 'file_not_found' || status === 'folder_not_found' || status === 'not_found') {
    summary.not_found += 1;
  } else {
    summary.errors += 1;
  }
};

const processDocumento = async (documento) => {
  console.log(`\nDocumento ${documento.id_documento} - ${documento.nombre_documento || 'Sin nombre'}`);

  if (documento.drive_file_id) {
    summary.skipped += 1;
    console.log(`SKIP already linked: ${documento.drive_file_id}`);
    return;
  }

  const result = await resolveLegacyAppSheetPath(documento.url_archivo);
  console.log(`Drive status: ${result.status}`);
  console.log(`Notes: ${result.notes}`);

  if (result.status === 'matched' && result.file) {
    const updatedRows = await updateMatchedDocumento(documento.id_documento, result.file, result.notes);
    summary.matched += 1;
    console.log(`UPDATED matched rows: ${updatedRows}`);
    return;
  }

  const updatedRows = await updateUnmatchedDocumento(documento.id_documento, result.status, result.notes);
  countUnmatchedStatus(result.status);
  console.log(`UPDATED unmatched status rows: ${updatedRows}`);
};

const main = async () => {
  try {
    const documentos = await readDocumentos();
    summary.total = documentos.length;

    console.log(`Documentos encontrados para id_solicitud=${ID_SOLICITUD}: ${documentos.length}`);

    for (const documento of documentos) {
      try {
        await processDocumento(documento);
      } catch (err) {
        summary.errors += 1;
        console.error(`ERROR processing documento ${documento.id_documento}:`);
        console.error(err);
      }
    }

    console.log('\nResumen:');
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await pool.end();
  }
};

main().catch((err) => {
  console.error('Error al vincular documentos de solicitud con Drive:');
  console.error(err);
  process.exitCode = 1;
});
