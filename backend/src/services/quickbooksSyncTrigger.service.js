const repository = require('../repositories/quickbooks.repository');
const quickbooksService = require('./quickbooks.service');

const scheduledClients = new Set();

function logFailure(idCliente, error) {
  const message = quickbooksService.sanitizeError(error);
  console.warn(`[quickbooks] Sincronizacion diferida fallida para cliente ${idCliente}: ${message}`);
}

async function scheduleClientSync(idCliente) {
  const safeId = Number(idCliente);
  if (!Number.isInteger(safeId) || safeId <= 0) return;

  // Persist the work before returning control to the caller. The external request
  // runs after the local transaction and can never roll it back.
  try {
    await repository.markClientPending(safeId);
  } catch (error) {
    logFailure(safeId, error);
    return;
  }

  if (scheduledClients.has(safeId)) return;
  scheduledClients.add(safeId);
  setImmediate(() => {
    quickbooksService.syncClientToQuickBooks(safeId)
      .catch((error) => logFailure(safeId, error))
      .finally(() => scheduledClients.delete(safeId));
  });
}

module.exports = { scheduleClientSync };
