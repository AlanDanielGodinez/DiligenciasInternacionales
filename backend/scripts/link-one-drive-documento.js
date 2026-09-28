const dotenv = require('dotenv');
const { pool } = require('../src/config/db');
const { resolveLegacyAppSheetPath } = require('../src/services/drive.service');

dotenv.config();

const ID_DOCUMENTO = 21205;

const readDocumento = async () => {
  const sql = `SELECT
    id_documento,
    url_archivo,
    origen_documento,
    drive_file_id
    FROM public.documentos
    WHERE id_documento = $1
    LIMIT 1`;

  const { rows } = await pool.query(sql, [ID_DOCUMENTO]);
  return rows[0] || null;
};

const updateDocumentoDriveMetadata = async (file, notes) => {
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
    ID_DOCUMENTO,
  ];

  const result = await pool.query(sql, values);
  return result.rowCount;
};

const main = async () => {
  try {
    const documento = await readDocumento();

    console.log('Documento leído:');
    console.log(JSON.stringify(documento, null, 2));

    if (!documento) {
      console.log(`No existe documento con id_documento = ${ID_DOCUMENTO}.`);
      return;
    }

    if (documento.origen_documento !== 'legacy_appsheet') {
      console.log(`No se actualiza: origen_documento debe ser "legacy_appsheet" y actualmente es "${documento.origen_documento}".`);
      return;
    }

    if (!documento.url_archivo || String(documento.url_archivo).trim() === '') {
      console.log('No se actualiza: url_archivo está vacío.');
      return;
    }

    if (documento.drive_file_id) {
      console.log(`No se actualiza: drive_file_id ya existe (${documento.drive_file_id}).`);
      return;
    }

    const driveResult = await resolveLegacyAppSheetPath(documento.url_archivo);

    console.log('Resultado de Drive:');
    console.log(JSON.stringify(driveResult, null, 2));

    if (driveResult.status !== 'matched' || !driveResult.file) {
      console.log(`No se actualiza metadata: status=${driveResult.status}.`);
      console.log(`Notes: ${driveResult.notes}`);
      return;
    }

    const updatedRows = await updateDocumentoDriveMetadata(driveResult.file, driveResult.notes);

    console.log(`Filas actualizadas: ${updatedRows}`);

    const documentoActualizado = await readDocumento();
    console.log('Documento después de actualizar:');
    console.log(JSON.stringify(documentoActualizado, null, 2));
  } finally {
    await pool.end();
  }
};

main().catch((err) => {
  console.error('Error al vincular documento con Drive:');
  console.error(err);
  process.exitCode = 1;
});
