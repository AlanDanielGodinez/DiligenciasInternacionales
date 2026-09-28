const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const dotenv = require('dotenv');
const { google } = require('googleapis');

dotenv.config();

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
const MIME_FOLDER = 'application/vnd.google-apps.folder';
const LEGACY_ROOT_PREFIX = 'FOTOS DE TRAMITES';
const VALID_LEGACY_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx'];

const getBackendRoot = () => path.resolve(__dirname, '..', '..');

const resolveKeyFilePath = () => {
  const keyFile = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_FILE;

  if (!keyFile) {
    throw new Error('Missing GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_FILE in environment.');
  }

  return path.isAbsolute(keyFile) ? keyFile : path.resolve(getBackendRoot(), keyFile);
};

const getDriveClient = async () => {
  const keyFilePath = resolveKeyFilePath();

  if (!fs.existsSync(keyFilePath)) {
    throw new Error(`Google Drive service account key file not found: ${keyFilePath}`);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: [DRIVE_SCOPE],
  });

  const authClient = await auth.getClient();

  return google.drive({
    version: 'v3',
    auth: authClient,
  });
};

const listChildren = async (folderId) => {
  if (!folderId) {
    throw new Error('Missing folderId for Google Drive listChildren.');
  }

  const drive = await getDriveClient();
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    pageSize: 100,
    fields: 'files(id, name, mimeType, webViewLink, webContentLink, size, parents)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return response.data.files || [];
};

const downloadFileById = async (fileId) => {
  if (!fileId) {
    throw new Error('Missing fileId for Google Drive download.');
  }

  const drive = await getDriveClient();
  const response = await drive.files.get(
    {
      fileId,
      alt: 'media',
      supportsAllDrives: true,
    },
    {
      responseType: 'stream',
    }
  );

  return response.data;
};

const createFolder = async ({ name, parentFolderId }) => {
  if (!name) {
    throw new Error('Missing name for Google Drive createFolder.');
  }

  if (!parentFolderId) {
    throw new Error('Missing parentFolderId for Google Drive createFolder.');
  }

  const drive = await getDriveClient();
  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: MIME_FOLDER,
      parents: [parentFolderId],
    },
    fields: 'id, name, mimeType, webViewLink, parents',
    supportsAllDrives: true,
  });

  return response.data;
};

const updateFileName = async ({ fileId, name }) => {
  if (!fileId) {
    throw new Error('Missing fileId for Google Drive updateFileName.');
  }

  if (!name) {
    throw new Error('Missing name for Google Drive updateFileName.');
  }

  const drive = await getDriveClient();
  const response = await drive.files.update({
    fileId,
    requestBody: { name },
    fields: 'id, name, mimeType, webViewLink, parents',
    supportsAllDrives: true,
  });

  return response.data;
};

const updateFileBuffer = async ({ fileId, buffer, filename, mimeType }) => {
  if (!fileId) {
    throw new Error('Missing fileId for Google Drive updateFileBuffer.');
  }

  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Missing buffer for Google Drive updateFileBuffer.');
  }

  if (!filename) {
    throw new Error('Missing filename for Google Drive updateFileBuffer.');
  }

  if (!mimeType) {
    throw new Error('Missing mimeType for Google Drive updateFileBuffer.');
  }

  const drive = await getDriveClient();
  const response = await drive.files.update({
    fileId,
    requestBody: {
      name: filename,
      mimeType,
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id, name, mimeType, webViewLink, webContentLink, size, parents',
    supportsAllDrives: true,
  });

  return response.data;
};

const uploadBufferToFolder = async ({ buffer, filename, mimeType, folderId }) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Missing buffer for Google Drive upload.');
  }

  if (!filename) {
    throw new Error('Missing filename for Google Drive upload.');
  }

  if (!mimeType) {
    throw new Error('Missing mimeType for Google Drive upload.');
  }

  if (!folderId) {
    throw new Error('Missing folderId for Google Drive upload.');
  }

  const drive = await getDriveClient();
  const response = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id, name, mimeType, webViewLink, webContentLink, size, parents',
    supportsAllDrives: true,
  });

  return response.data;
};

const repairCommonMojibake = (value) =>
  String(value)
    .replace(/Pe±a/g, 'Peña')
    .replace(/pe±a/g, 'peña')
    .replace(/Hernßndez/g, 'Hernández')
    .replace(/hernßndez/g, 'hernández')
    .replace(/JosÚ/g, 'José')
    .replace(/josÚ/g, 'josé')
    .replace(/MÚxico/g, 'México')
    .replace(/mÚxico/g, 'méxico')
    .replace(/AsesorÝa/g, 'Asesoría')
    .replace(/asesorÝa/g, 'asesoría')
    .replace(/±/g, 'ñ')
    .replace(/ß/g, 'á')
    .replace(/Ú/g, 'é')
    .replace(/Ý/g, 'í');

const normalizeDriveName = (value) =>
  repairCommonMojibake(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

const parseLegacyAppSheetPath = (urlArchivo) => {
  const originalPath = typeof urlArchivo === 'string' ? urlArchivo : '';

  if (typeof urlArchivo !== 'string') {
    return {
      isValid: false,
      reason: 'urlArchivo must be a string',
      originalPath,
      relativeParts: [],
      folderParts: [],
      fileName: '',
      rootPrefixRemoved: false,
    };
  }

  const trimmedPath = urlArchivo.trim();

  if (!trimmedPath) {
    return {
      isValid: false,
      reason: 'urlArchivo is empty',
      originalPath,
      relativeParts: [],
      folderParts: [],
      fileName: '',
      rootPrefixRemoved: false,
    };
  }

  if (/^\d+$/.test(trimmedPath)) {
    return {
      isValid: false,
      reason: 'urlArchivo is numeric only',
      originalPath,
      relativeParts: [],
      folderParts: [],
      fileName: '',
      rootPrefixRemoved: false,
    };
  }

  if (!trimmedPath.includes('/')) {
    return {
      isValid: false,
      reason: 'urlArchivo does not contain path separators',
      originalPath,
      relativeParts: [],
      folderParts: [],
      fileName: '',
      rootPrefixRemoved: false,
    };
  }

  const rawParts = trimmedPath
    .replace(/\\/g, '/')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  let relativeParts = rawParts;
  let rootPrefixRemoved = false;

  if (rawParts.length > 0 && normalizeDriveName(rawParts[0]) === normalizeDriveName(LEGACY_ROOT_PREFIX)) {
    relativeParts = rawParts.slice(1);
    rootPrefixRemoved = true;
  }

  const fileName = relativeParts[relativeParts.length - 1] || '';
  const extensionMatch = fileName.match(/\.([^.]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';

  if (!extension || !VALID_LEGACY_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      reason: 'fileName does not have a supported document extension',
      originalPath,
      relativeParts,
      folderParts: relativeParts.slice(0, -1),
      fileName,
      rootPrefixRemoved,
    };
  }

  return {
    isValid: true,
    reason: null,
    originalPath,
    relativeParts,
    folderParts: relativeParts.slice(0, -1),
    fileName,
    rootPrefixRemoved,
  };
};

const findChildByName = async (parentFolderId, name, { mimeType } = {}) => {
  const children = await listChildren(parentFolderId);
  const candidates = mimeType ? children.filter((child) => child.mimeType === mimeType) : children;
  const exactMatches = candidates.filter((child) => child.name === name);

  if (exactMatches.length === 1) {
    return { status: 'matched', item: exactMatches[0], candidates: exactMatches };
  }

  if (exactMatches.length > 1) {
    return { status: 'multiple_matches', item: null, candidates: exactMatches };
  }

  const normalizedName = normalizeDriveName(name);
  const normalizedMatches = candidates.filter((child) => normalizeDriveName(child.name) === normalizedName);

  if (normalizedMatches.length === 1) {
    return { status: 'matched', item: normalizedMatches[0], candidates: normalizedMatches };
  }

  if (normalizedMatches.length > 1) {
    return { status: 'multiple_matches', item: null, candidates: normalizedMatches };
  }

  return { status: 'not_found', item: null, candidates: [] };
};

const extractLegacyFolderCode = (folderName) => {
  const value = String(folderName || '').trim();
  const lastDotIndex = value.lastIndexOf('.');

  if (lastDotIndex < 0 || lastDotIndex === value.length - 1) {
    return null;
  }

  const code = value.slice(lastDotIndex + 1).trim();

  return /^[a-z0-9][a-z0-9-]{5,19}$/i.test(code) ? code : null;
};

const findChildFolderByLegacyCode = async (parentFolderId, targetFolderName) => {
  const targetCode = extractLegacyFolderCode(targetFolderName);

  if (!targetCode) {
    return null;
  }

  const normalizedTargetCode = targetCode.toLowerCase();
  const children = await listChildren(parentFolderId);
  const folderCandidates = children.filter((child) => child.mimeType === MIME_FOLDER);
  const matches = folderCandidates.filter((child) => {
    const childCode = extractLegacyFolderCode(child.name);
    return childCode && childCode.toLowerCase() === normalizedTargetCode;
  });

  if (matches.length === 1) {
    return { status: 'matched', item: matches[0], candidates: matches, legacyCode: targetCode };
  }

  if (matches.length > 1) {
    return { status: 'multiple_matches', item: null, candidates: matches, legacyCode: targetCode };
  }

  return null;
};

const mapDriveFile = (file, folderId) => ({
  drive_file_id: file.id,
  drive_folder_id: folderId,
  web_view_link: file.webViewLink || null,
  web_content_link: file.webContentLink || null,
  mime_type: file.mimeType || null,
  tamano_bytes: file.size ? Number(file.size) : null,
  name: file.name,
});

const resolveLegacyAppSheetPath = async (urlArchivo) => {
  try {
    const rootFolderId = process.env.GOOGLE_DRIVE_APPSHEET_ROOT_FOLDER_ID;
    const parsed = parseLegacyAppSheetPath(urlArchivo);

    if (!rootFolderId) {
      return {
        status: 'error',
        file: null,
        parsed,
        notes: 'Missing GOOGLE_DRIVE_APPSHEET_ROOT_FOLDER_ID in environment.',
      };
    }

    if (!parsed.isValid) {
      return {
        status: 'invalid_path',
        file: null,
        parsed,
        notes: parsed.reason,
      };
    }

    let currentFolderId = rootFolderId;
    const resolutionNotes = [];

    for (const folderName of parsed.folderParts) {
      let folderResult = await findChildByName(currentFolderId, folderName, { mimeType: MIME_FOLDER });

      if (folderResult.status === 'multiple_matches') {
        return {
          status: 'multiple_matches',
          file: null,
          parsed,
          notes: `Multiple matching folders found for "${folderName}".`,
          candidates: folderResult.candidates,
        };
      }

      if (folderResult.status !== 'matched') {
        const legacyCodeResult = await findChildFolderByLegacyCode(currentFolderId, folderName);

        if (legacyCodeResult?.status === 'multiple_matches') {
          return {
            status: 'multiple_matches',
            file: null,
            parsed,
            notes: `Multiple matching folders found by legacy code "${legacyCodeResult.legacyCode}" for "${folderName}".`,
            candidates: legacyCodeResult.candidates,
          };
        }

        if (legacyCodeResult?.status === 'matched') {
          folderResult = legacyCodeResult;
          resolutionNotes.push(`Matched folder by legacy code fallback: "${folderName}" -> "${folderResult.item.name}".`);
        }
      }

      if (folderResult.status !== 'matched') {
        return {
          status: 'folder_not_found',
          file: null,
          parsed,
          notes: `Folder not found under current parent: "${folderName}".`,
        };
      }

      currentFolderId = folderResult.item.id;
    }

    const fileResult = await findChildByName(currentFolderId, parsed.fileName);

    if (fileResult.status === 'multiple_matches') {
      return {
        status: 'multiple_matches',
        file: null,
        parsed,
        notes: `Multiple matching files found for "${parsed.fileName}".`,
        candidates: fileResult.candidates,
      };
    }

    if (fileResult.status !== 'matched') {
      return {
        status: 'file_not_found',
        file: null,
        parsed,
        notes: `File not found in resolved folder: "${parsed.fileName}".`,
      };
    }

    return {
      status: 'matched',
      file: mapDriveFile(fileResult.item, currentFolderId),
      parsed,
      notes: ['Matched legacy AppSheet path to a unique Google Drive file.', ...resolutionNotes].join(' '),
    };
  } catch (err) {
    return {
      status: 'error',
      file: null,
      parsed: parseLegacyAppSheetPath(urlArchivo),
      notes: err.message || String(err),
    };
  }
};

module.exports = {
  MIME_FOLDER,
  getDriveClient,
  listChildren,
  downloadFileById,
  createFolder,
  updateFileName,
  updateFileBuffer,
  uploadBufferToFolder,
  normalizeDriveName,
  parseLegacyAppSheetPath,
  extractLegacyFolderCode,
  findChildByName,
  findChildFolderByLegacyCode,
  resolveLegacyAppSheetPath,
};
