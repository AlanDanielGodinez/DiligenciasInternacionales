const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { listChildren } = require('../src/services/drive.service');

dotenv.config();

const getBackendRoot = () => path.resolve(__dirname, '..');

const resolveKeyFilePath = () => {
  const keyFile = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_FILE;
  if (!keyFile) return null;
  return path.isAbsolute(keyFile) ? keyFile : path.resolve(getBackendRoot(), keyFile);
};

const printDriveError = (err) => {
  const status = err?.response?.status || err?.code;
  const message = err?.response?.data?.error?.message || err?.message || String(err);

  console.error('Google Drive test failed.');
  console.error(`Reason: ${message}`);

  if (status === 403) {
    console.error('Possible causes: the Drive API is not enabled, or the service account does not have permission to read this folder.');
  } else if (status === 404) {
    console.error('Possible causes: the folder ID is incorrect, or the service account cannot see the folder.');
  }
};

const main = async () => {
  const folderId = process.env.GOOGLE_DRIVE_APPSHEET_ROOT_FOLDER_ID;
  const keyFile = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_FILE;
  const keyFilePath = resolveKeyFilePath();

  if (!keyFile) {
    console.error('Missing GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_FILE in .env.');
    process.exitCode = 1;
    return;
  }

  if (!keyFilePath || !fs.existsSync(keyFilePath)) {
    console.error(`Service account JSON file does not exist: ${keyFilePath}`);
    process.exitCode = 1;
    return;
  }

  if (!folderId) {
    console.error('Missing GOOGLE_DRIVE_APPSHEET_ROOT_FOLDER_ID in .env.');
    process.exitCode = 1;
    return;
  }

  try {
    const files = await listChildren(folderId);
    const firstItems = files.slice(0, 20);

    console.log(`Found ${files.length} items in FOTOS DE TRAMITES root folder.`);
    console.log(JSON.stringify(firstItems, null, 2));
  } catch (err) {
    printDriveError(err);
    process.exitCode = 1;
  }
};

main();
