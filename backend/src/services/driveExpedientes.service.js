const { pool } = require('../config/db');
const {
  MIME_FOLDER,
  createFolder,
  findChildByName,
  updateFileName,
} = require('./drive.service');

const SUBFOLDERS = [
  { clave: 'documentos_recibidos', nombre: 'Documentos recibidos' },
  { clave: 'perfiles_generados', nombre: 'Perfiles generados' },
  { clave: 'pagos', nombre: 'Pagos' },
  { clave: 'documentos_finales', nombre: 'Documentos finales' },
];

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

const sanitizeFolderName = (value, fallback = 'Sin nombre') => {
  const sanitized = String(hasValue(value) ? value : fallback)
    .replace(/[\\/:*?"<>|{}%~&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return (sanitized || fallback).slice(0, 140);
};

const buildNombreCompleto = (...parts) =>
  parts
    .filter(hasValue)
    .map((part) => String(part).trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const getRootFolderId = () => {
  const rootFolderId = process.env.GOOGLE_DRIVE_EXPEDIENTES_ROOT_FOLDER_ID;
  if (!rootFolderId) {
    throw new Error('Missing GOOGLE_DRIVE_EXPEDIENTES_ROOT_FOLDER_ID in environment.');
  }
  return rootFolderId;
};

const mapFolder = (row) => row && ({
  id_drive_carpeta: row.id_drive_carpeta,
  tipo_entidad: row.tipo_entidad,
  id_contacto: row.id_contacto,
  id_cliente: row.id_cliente,
  id_solicitud: row.id_solicitud,
  nombre: row.nombre_carpeta,
  nombre_carpeta: row.nombre_carpeta,
  drive_folder_id: row.drive_folder_id,
  drive_folder_url: row.drive_folder_url,
  parent_drive_folder_id: row.parent_drive_folder_id,
  clave_subcarpeta: row.clave_subcarpeta,
});

async function getSolicitudExpedienteData(idSolicitud) {
  const safeIdSolicitud = positiveInteger(idSolicitud, 'id_solicitud');
  const { rows } = await pool.query(
    `SELECT
       s.id_solicitud,
       s.id_cliente,
       s.id_tipo_tramite,
       c.nombre AS cliente_nombre,
       c.apellido_paterno AS cliente_apellido_paterno,
       c.apellido_materno AS cliente_apellido_materno,
       c.id_contacto,
       co.nombre AS contacto_nombre,
       tt.nombre_tramite
     FROM public.solicitudes s
     JOIN public.clientes c ON c.id_cliente = s.id_cliente
     LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
     LEFT JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
     WHERE s.id_solicitud = $1
     LIMIT 1`,
    [safeIdSolicitud]
  );

  if (!rows[0]) {
    throw notFound('Solicitud not found');
  }

  if (!rows[0].id_contacto) {
    throw badRequest('Solicitud cliente does not have id_contacto; cannot create expediente Drive folder.');
  }

  return rows[0];
}

function buildLogicalWhere({ tipoEntidad, idContacto, idCliente, idSolicitud, claveSubcarpeta }) {
  return {
    sql: `tipo_entidad = $1
      AND COALESCE(id_contacto, 0) = COALESCE($2::int, 0)
      AND COALESCE(id_cliente, 0) = COALESCE($3::int, 0)
      AND COALESCE(id_solicitud, 0) = COALESCE($4::int, 0)
      AND COALESCE(clave_subcarpeta, '') = COALESCE($5::varchar, '')`,
    params: [
      tipoEntidad,
      idContacto || null,
      idCliente || null,
      idSolicitud || null,
      claveSubcarpeta || null,
    ],
  };
}

async function findMapping(client, payload) {
  const where = buildLogicalWhere(payload);
  const { rows } = await client.query(
    `SELECT *
     FROM public.drive_carpetas_expediente
     WHERE ${where.sql}
     LIMIT 1`,
    where.params
  );

  return rows[0] || null;
}

async function insertOrGetMapping(client, payload) {
  const where = buildLogicalWhere(payload);
  const insertResult = await client.query(
    `INSERT INTO public.drive_carpetas_expediente (
       tipo_entidad,
       id_contacto,
       id_cliente,
       id_solicitud,
       nombre_carpeta,
       drive_folder_id,
       drive_folder_url,
       parent_drive_folder_id,
       clave_subcarpeta,
       creado_en,
       actualizado_en
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [
      payload.tipoEntidad,
      payload.idContacto || null,
      payload.idCliente || null,
      payload.idSolicitud || null,
      payload.nombreCarpeta,
      payload.driveFolderId,
      payload.driveFolderUrl || null,
      payload.parentDriveFolderId || null,
      payload.claveSubcarpeta || null,
    ]
  );

  if (insertResult.rows[0]) return insertResult.rows[0];

  const { rows } = await client.query(
    `SELECT *
     FROM public.drive_carpetas_expediente
     WHERE ${where.sql}
     LIMIT 1`,
    where.params
  );
  return rows[0];
}

async function findOrCreateDriveFolder({ parentDriveFolderId, nombreCarpeta }) {
  const folderResult = await findChildByName(parentDriveFolderId, nombreCarpeta, {
    mimeType: MIME_FOLDER,
  });

  if (folderResult.status === 'multiple_matches') {
    throw new Error(`Multiple Drive folders found for "${nombreCarpeta}".`);
  }

  return folderResult.status === 'matched'
    ? folderResult.item
    : createFolder({
      name: nombreCarpeta,
      parentFolderId: parentDriveFolderId,
    });
}

async function ensureFolderMapping(payload) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const lockKey = [
      payload.tipoEntidad,
      payload.idContacto || '',
      payload.idCliente || '',
      payload.idSolicitud || '',
      payload.claveSubcarpeta || '',
    ].join(':');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1)::bigint)', [lockKey]);

    const existing = await findMapping(client, payload);
    if (existing) {
      if (existing.parent_drive_folder_id !== payload.parentDriveFolderId) {
        const driveFolder = await findOrCreateDriveFolder({
          parentDriveFolderId: payload.parentDriveFolderId,
          nombreCarpeta: payload.nombreCarpeta,
        });
        const updateResult = await client.query(
          `UPDATE public.drive_carpetas_expediente
           SET nombre_carpeta = $1,
               drive_folder_id = $2,
               drive_folder_url = $3,
               parent_drive_folder_id = $4,
               actualizado_en = NOW()
           WHERE id_drive_carpeta = $5
           RETURNING *`,
          [
            payload.nombreCarpeta,
            driveFolder.id,
            driveFolder.webViewLink || null,
            payload.parentDriveFolderId,
            existing.id_drive_carpeta,
          ]
        );
        await client.query('COMMIT');
        return mapFolder(updateResult.rows[0]);
      }

      if (existing.nombre_carpeta !== payload.nombreCarpeta) {
        const renamed = await updateFileName({
          fileId: existing.drive_folder_id,
          name: payload.nombreCarpeta,
        });
        const updateResult = await client.query(
          `UPDATE public.drive_carpetas_expediente
           SET nombre_carpeta = $1,
               drive_folder_url = COALESCE($2, drive_folder_url),
               actualizado_en = NOW()
           WHERE id_drive_carpeta = $3
           RETURNING *`,
          [
            payload.nombreCarpeta,
            renamed.webViewLink || null,
            existing.id_drive_carpeta,
          ]
        );
        await client.query('COMMIT');
        return mapFolder(updateResult.rows[0]);
      }
      await client.query('COMMIT');
      return mapFolder(existing);
    }

    const driveFolder = await findOrCreateDriveFolder({
      parentDriveFolderId: payload.parentDriveFolderId,
      nombreCarpeta: payload.nombreCarpeta,
    });

    const inserted = await insertOrGetMapping(client, {
      ...payload,
      driveFolderId: driveFolder.id,
      driveFolderUrl: driveFolder.webViewLink || null,
    });

    await client.query('COMMIT');
    return mapFolder(inserted);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function ensureContactoFolder(idContacto, data = null) {
  const safeIdContacto = positiveInteger(idContacto, 'id_contacto');
  const expedienteData = data || await getSolicitudExpedienteDataByContacto(safeIdContacto);
  const nombre = sanitizeFolderName(
    `Contacto #${safeIdContacto} - ${expedienteData.contacto_nombre || 'Sin nombre'}`
  );

  return ensureFolderMapping({
    tipoEntidad: 'contacto',
    idContacto: safeIdContacto,
    nombreCarpeta: nombre,
    parentDriveFolderId: getRootFolderId(),
  });
}

async function getSolicitudExpedienteDataByContacto(idContacto) {
  const { rows } = await pool.query(
    `SELECT id_contacto, nombre AS contacto_nombre
     FROM public.contacto
     WHERE id_contacto = $1
     LIMIT 1`,
    [idContacto]
  );
  if (!rows[0]) throw notFound('Contacto not found');
  return rows[0];
}

async function ensureClienteFolder(idCliente, data = null, contactoFolder = null) {
  const safeIdCliente = positiveInteger(idCliente, 'id_cliente');
  const expedienteData = data || await getSolicitudExpedienteDataByCliente(safeIdCliente);
  const parent = contactoFolder || await ensureContactoFolder(expedienteData.id_contacto, expedienteData);
  const nombreAplicante = buildNombreCompleto(
    expedienteData.cliente_nombre,
    expedienteData.cliente_apellido_paterno,
    expedienteData.cliente_apellido_materno
  );
  const nombre = sanitizeFolderName(`Aplicante #${safeIdCliente} - ${nombreAplicante || 'Sin nombre'}`);

  return ensureFolderMapping({
    tipoEntidad: 'cliente',
    idContacto: expedienteData.id_contacto,
    idCliente: safeIdCliente,
    nombreCarpeta: nombre,
    parentDriveFolderId: parent.drive_folder_id,
  });
}

async function getSolicitudExpedienteDataByCliente(idCliente) {
  const { rows } = await pool.query(
    `SELECT
       c.id_cliente,
       c.nombre AS cliente_nombre,
       c.apellido_paterno AS cliente_apellido_paterno,
       c.apellido_materno AS cliente_apellido_materno,
       c.id_contacto,
       co.nombre AS contacto_nombre
     FROM public.clientes c
     LEFT JOIN public.contacto co ON co.id_contacto = c.id_contacto
     WHERE c.id_cliente = $1
     LIMIT 1`,
    [idCliente]
  );
  if (!rows[0]) throw notFound('Cliente not found');
  if (!rows[0].id_contacto) {
    throw badRequest('Cliente does not have id_contacto; cannot create expediente Drive folder.');
  }
  return rows[0];
}

async function ensureSolicitudFolder(idSolicitud, data = null, clienteFolder = null) {
  const expedienteData = data || await getSolicitudExpedienteData(idSolicitud);
  const safeIdSolicitud = positiveInteger(expedienteData.id_solicitud, 'id_solicitud');
  const parent = clienteFolder || await ensureClienteFolder(expedienteData.id_cliente, expedienteData);
  const nombre = sanitizeFolderName(
    `Solicitud #${safeIdSolicitud} - ${expedienteData.nombre_tramite || 'Trámite'}`
  );

  return ensureFolderMapping({
    tipoEntidad: 'solicitud',
    idContacto: expedienteData.id_contacto,
    idCliente: expedienteData.id_cliente,
    idSolicitud: safeIdSolicitud,
    nombreCarpeta: nombre,
    parentDriveFolderId: parent.drive_folder_id,
  });
}

async function ensureSolicitudSubfolders(idSolicitud, solicitudFolder = null, data = null) {
  const expedienteData = data || await getSolicitudExpedienteData(idSolicitud);
  const parent = solicitudFolder || await ensureSolicitudFolder(expedienteData.id_solicitud, expedienteData);
  const subcarpetas = {};

  for (const subfolder of SUBFOLDERS) {
    subcarpetas[subfolder.clave] = await ensureFolderMapping({
      tipoEntidad: 'subcarpeta',
      idContacto: expedienteData.id_contacto,
      idCliente: expedienteData.id_cliente,
      idSolicitud: expedienteData.id_solicitud,
      claveSubcarpeta: subfolder.clave,
      nombreCarpeta: subfolder.nombre,
      parentDriveFolderId: parent.drive_folder_id,
    });
  }

  return subcarpetas;
}

async function ensureExpedienteFoldersBySolicitud(idSolicitud) {
  const expedienteData = await getSolicitudExpedienteData(idSolicitud);
  const contacto = await ensureContactoFolder(expedienteData.id_contacto, expedienteData);
  const cliente = await ensureClienteFolder(expedienteData.id_cliente, expedienteData, contacto);
  const solicitud = await ensureSolicitudFolder(expedienteData.id_solicitud, expedienteData, cliente);
  const subcarpetas = await ensureSolicitudSubfolders(expedienteData.id_solicitud, solicitud, expedienteData);

  return {
    ok: true,
    id_solicitud: expedienteData.id_solicitud,
    carpetas: {
      contacto,
      cliente,
      solicitud,
      subcarpetas,
    },
  };
}

module.exports = {
  ensureContactoFolder,
  ensureClienteFolder,
  ensureSolicitudFolder,
  ensureSolicitudSubfolders,
  ensureExpedienteFoldersBySolicitud,
  sanitizeFolderName,
};
