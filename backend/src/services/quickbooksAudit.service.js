const fs = require('fs');
const path = require('path');

const auditPath = path.resolve(__dirname, '../../logs/quickbooks-oauth-audit.log');

function writeQuickBooksAudit(event) {
  const safeEvent = { ...event, timestamp: event.timestamp || new Date().toISOString() };
  fs.mkdirSync(path.dirname(auditPath), { recursive: true });
  fs.appendFileSync(auditPath, `${JSON.stringify(safeEvent)}\n`, { encoding: 'utf8', mode: 0o600 });
}

module.exports = { auditPath, writeQuickBooksAudit };
