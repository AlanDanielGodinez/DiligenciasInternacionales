require('dotenv').config();
const { pool } = require('../src/config/db');

async function main() {
  const [connection, mappings, columns, oauthStates] = await Promise.all([
    pool.query(`SELECT id_quickbooks_conexion, environment, status,
      left(realm_id, 3) || '***' || right(realm_id, 3) AS realm_masked, updated_at
      , access_token_expires_at, refresh_token_expires_at, created_at
      , (access_token_encrypted IS NOT NULL AND access_token_encrypted <> '') AS access_token_stored
      , (refresh_token_encrypted IS NOT NULL AND refresh_token_encrypted <> '') AS refresh_token_stored
      FROM public.quickbooks_conexiones ORDER BY updated_at DESC LIMIT 1`),
    pool.query(`SELECT count(*)::int AS total,
      count(*) FILTER (WHERE sync_status = 'synced')::int AS synced,
      count(*) FILTER (WHERE sync_status IN ('pending', 'error', 'requires_reconnection'))::int AS actionable
      FROM public.contacto_quickbooks`),
    pool.query(`SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'contacto_quickbooks'
      ORDER BY ordinal_position`),
    pool.query(`SELECT expires_at, used_at, created_at,
      (used_at IS NOT NULL) AS consumed,
      (expires_at <= now()) AS expired
      FROM public.quickbooks_oauth_states
      ORDER BY created_at DESC LIMIT 5`),
  ]);
  console.log(JSON.stringify({
    connection: connection.rows[0] || null,
    mappings: mappings.rows[0],
    oauth_states: oauthStates.rows,
    columns: columns.rows.map((row) => row.column_name),
  }, null, 2));
}

main()
  .catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => pool.end());
