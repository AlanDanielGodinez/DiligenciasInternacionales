const { pool } = require('../src/config/db');
const perfilesService = require('../src/services/perfiles.service');

(async () => {
  console.log('Diagnosing perfil tables before migration...');
  const before = await perfilesService.diagnosePerfilTables();
  console.log(JSON.stringify(before, null, 2));

  console.log('Applying perfil schema migration...');
  await perfilesService.runMigration();

  console.log('Diagnosing perfil tables after migration...');
  const after = await perfilesService.diagnosePerfilTables();
  console.log(JSON.stringify(after, null, 2));

  await pool.end();
})().catch(async (err) => {
  console.error(err);
  try {
    await pool.end();
  } catch (endErr) {
    // Ignore shutdown errors after migration failure.
  }
  process.exit(1);
});
