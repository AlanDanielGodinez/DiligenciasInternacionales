const service = require('../services/documentos.service');
const { downloadFileById } = require('../services/drive.service');

exports.listDocumentos = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await service.getDocumentos({ limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.listDocumentosBySolicitud = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.idSolicitud);

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({
        error: {
          message: 'idSolicitud must be a positive numeric value',
        },
      });
    }

    const documentos = await service.getDocumentosBySolicitud(idSolicitud);
    return res.json({ documentos });
  } catch (err) {
    next(err);
  }
};

exports.listDocumentosRequeridosBySolicitud = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.idSolicitud);

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({
        error: {
          message: 'idSolicitud must be a positive numeric value',
        },
      });
    }

    const result = await service.getDocumentosRequeridosBySolicitud(idSolicitud);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

exports.uploadDocumentoRequerido = async (req, res, next) => {
  try {
    const idSolicitud = Number(req.params.idSolicitud);

    if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) {
      return res.status(400).json({
        error: {
          message: 'idSolicitud must be a positive numeric value',
        },
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: {
          message: 'archivo is required',
        },
      });
    }

    const documento = await service.uploadDocumentoRequerido(
      idSolicitud,
      req.params.claveDocumento,
      req.file,
      req.body || {}
    );

    return res.status(201).json({ documento });
  } catch (err) {
    return next(err);
  }
};

const extensionByMimeType = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];

const getFileExtensionFromMimeType = (mimeType) => extensionByMimeType[String(mimeType || '').toLowerCase()] || '';

const getFileExtensionFromUrlArchivo = (urlArchivo) => {
  const lastSegment = String(urlArchivo || '').split('/').pop() || '';
  const match = lastSegment.toLowerCase().match(/(\.pdf|\.jpg|\.jpeg|\.png|\.doc|\.docx|\.xls|\.xlsx)$/);
  return match && allowedExtensions.includes(match[1]) ? match[1] : '';
};

const sanitizeDownloadFileName = (name, fallback) => {
  const sanitized = String(name || '').replace(/[\\/:*?"<>|]/g, '_').trim();
  return sanitized || fallback;
};

const ensureFileExtension = (fileName, extension) => {
  if (!extension) return fileName;
  return fileName.toLowerCase().endsWith(extension.toLowerCase()) ? fileName : `${fileName}${extension}`;
};

exports.downloadDocumento = async (req, res, next) => {
  try {
    const idDocumento = Number(req.params.idDocumento);

    if (!Number.isInteger(idDocumento) || idDocumento <= 0) {
      return res.status(400).json({
        error: {
          message: 'idDocumento must be a positive numeric value',
        },
      });
    }

    const documento = await service.getDocumentoById(idDocumento);

    if (!documento) {
      return res.status(404).json({
        error: {
          message: 'Documento not found',
        },
      });
    }

    if (!documento.drive_file_id) {
      return res.status(400).json({
        error: {
          message: 'Documento does not have a linked Google Drive file',
        },
      });
    }

    const stream = await downloadFileById(documento.drive_file_id);
    const baseName = sanitizeDownloadFileName(
      documento.nombre_documento || `documento-${documento.id_documento}`,
      `documento-${documento.id_documento}`
    );
    const extension = getFileExtensionFromUrlArchivo(documento.url_archivo) || getFileExtensionFromMimeType(documento.mime_type);
    const filename = ensureFileExtension(baseName, extension);

    res.setHeader('Content-Type', documento.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    stream.on('error', (err) => {
      if (!res.headersSent) {
        next(err);
      } else {
        res.destroy(err);
      }
    });

    return stream.pipe(res);
  } catch (err) {
    if (res.headersSent) {
      return res.destroy(err);
    }

    return next(err);
  }
};
