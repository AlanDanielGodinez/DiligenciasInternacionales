const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

const sql = fs.readFileSync(
  path.join(__dirname, '..', 'sql', '2026_08_27_perfiles_formularios_v2.sql'),
  'utf8'
);

(async () => {
  await pool.query(sql);
  const { rows } = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'perfil_respuestas_repetibles'
  `);
  console.log(JSON.stringify({ migration: 'perfiles_v2', applied: rows.length === 1 }));
  await pool.end();
})().catch(async (error) => {
  console.error(error);
  try { await pool.end(); } catch {}
  process.exit(1);
});
