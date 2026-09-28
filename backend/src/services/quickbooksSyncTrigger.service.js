const repository = require('../repositories/quickbooks.repository');
const quickbooksService = require('./quickbooks.service');

const scheduledContacts = new Set();

function logFailure(idContacto, error) {
  const message = quickbooksService.sanitizeError(error);
  console.warn(`[quickbooks] Sincronizacion diferida fallida para contacto ${idContacto}: ${message}`);
}

async function scheduleContactSync(idContacto) {
  const safeId = Number(idContacto);
  if (!Number.isInteger(safeId) || safeId <= 0) return;

  // Persist the work before returning control to the caller. The external request
  // runs after the local transaction and can never roll it back.
  try {
    await repository.markContactPending(safeId);
  } catch (error) {
    logFailure(safeId, error);
    return;
  }

  if (scheduledContacts.has(safeId)) return;
  scheduledContacts.add(safeId);
  setImmediate(() => {
    quickbooksService.syncContactToQuickBooks(safeId)
      .catch((error) => logFailure(safeId, error))
      .finally(() => scheduledContacts.delete(safeId));
  });
}

module.exports = { scheduleContactSync };
