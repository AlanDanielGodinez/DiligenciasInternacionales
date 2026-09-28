const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function main() {
  const sqlPath = path.resolve(__dirname, '../sql/2026_08_03_quickbooks_integration.sql');
  await pool.query(fs.readFileSync(sqlPath, 'utf8'));
  console.log('QuickBooks integration migration completed.');
}

main()
  .catch((error) => {
    console.error('QuickBooks migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
