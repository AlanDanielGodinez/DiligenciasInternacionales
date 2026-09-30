const crypto = require('crypto');
const { pool } = require('../config/db');

async function getActiveConnection(query = pool.query.bind(pool)) {
  const { rows } = await query(
    `SELECT * FROM public.quickbooks_conexiones
     WHERE status = 'connected'
     ORDER BY updated_at DESC, id_quickbooks_conexion DESC
     LIMIT 1`
  );
  return rows[0] || null;
}

async function getLatestConnection(query = pool.query.bind(pool)) {
  const { rows } = await query(
    `SELECT * FROM public.quickbooks_conexiones
     ORDER BY updated_at DESC, id_quickbooks_conexion DESC
     LIMIT 1`
  );
  return rows[0] || null;
}

async function saveConnection(connection, query = pool.query.bind(pool)) {
  const { rows } = await query(
    `INSERT INTO public.quickbooks_conexiones (
       realm_id, access_token_encrypted, refresh_token_encrypted,
       access_token_expires_at, refresh_token_expires_at,
       environment, status, last_error, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, 'connected', NULL, now(), now())
     ON CONFLICT (realm_id, environment) DO UPDATE SET
       access_token_encrypted = EXCLUDED.access_token_encrypted,
       refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
       access_token_expires_at = EXCLUDED.access_token_expires_at,
       refresh_token_expires_at = EXCLUDED.refresh_token_expires_at,
       status = 'connected', last_error = NULL, updated_at = now()
     RETURNING *`,
    [
      connection.realm_id,
      connection.access_token_encrypted,
      connection.refresh_token_encrypted,
      connection.access_token_expires_at,
      connection.refresh_token_expires_at,
      connection.environment,
    ]
  );
  return rows[0];
}

async function updateConnectionTokens(id, tokens, query = pool.query.bind(pool)) {
  const { rows } = await query(
    `UPDATE public.quickbooks_conexiones SET
       access_token_encrypted = $1,
       refresh_token_encrypted = $2,
       access_token_expires_at = $3,
       refresh_token_expires_at = $4,
       status = 'connected', last_error = NULL, updated_at = now()
     WHERE id_quickbooks_conexion = $5 RETURNING *`,
    [tokens.access_token_encrypted, tokens.refresh_token_encrypted,
      tokens.access_token_expires_at, tokens.refresh_token_expires_at, id]
  );
  return rows[0] || null;
}

async function setConnectionStatus(id, status, lastError = null, query = pool.query.bind(pool)) {
  const { rows } = await query(
    `UPDATE public.quickbooks_conexiones
     SET status = $1, last_error = $2, updated_at = now()
     WHERE id_quickbooks_conexion = $3 RETURNING *`,
    [status, lastError, id]
  );
  return rows[0] || null;
}

async function disconnectAll(query = pool.query.bind(pool)) {
  await query(
    `UPDATE public.quickbooks_conexiones SET
       status = 'disconnected',
       access_token_encrypted = 'invalidated',
       refresh_token_encrypted = 'invalidated',
       updated_at = now()
     WHERE status <> 'disconnected'`
  );
}

async function storeOAuthState(rawState, ttlSeconds = 600, query = pool.query.bind(pool)) {
  const hash = crypto.createHash('sha256').update(rawState).digest('hex');
  await query(
    `INSERT INTO public.quickbooks_oauth_states (state_hash, expires_at)
     VALUES ($1, now() + ($2 * interval '1 second'))`,
    [hash, ttlSeconds]
  );
}

async function hasOAuthState(rawState, query = pool.query.bind(pool)) {
  const hash = crypto.createHash('sha256').update(String(rawState || '')).digest('hex');
  const { rows } = await query(
    `SELECT EXISTS (SELECT 1 FROM public.quickbooks_oauth_states
      WHERE state_hash = $1 AND used_at IS NULL AND expires_at > now()) AS present`,
    [hash]
  );
  return rows[0]?.present === true;
}

async function consumeOAuthState(rawState) {
  const hash = crypto.createHash('sha256').update(String(rawState || '')).digest('hex');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE public.quickbooks_oauth_states SET used_at = now()
       WHERE state_hash = $1 AND used_at IS NULL AND expires_at > now()
       RETURNING state_hash`,
      [hash]
    );
    await client.query('COMMIT');
    return rows.length === 1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getClientData(idCliente, query = pool.query.bind(pool)) {
  const { rows } = await query(
    `WITH tramites AS (
       SELECT DISTINCT s.id_cliente, btrim(tt.nombre_tramite) AS nombre_tramite
       FROM public.solicitudes s
       JOIN public.tipos_tramite tt ON tt.id_tipo_tramite = s.id_tipo_tramite
       WHERE s.id_cliente = $1 AND nullif(btrim(tt.nombre_tramite), '') IS NOT NULL
     )
     SELECT c.id_cliente, c.id_contacto, c.nombre, c.apellido_paterno,
       c.apellido_materno, c.telefono, c.correo,
       COALESCE((SELECT json_agg(t.nombre_tramite ORDER BY t.nombre_tramite)
         FROM tramites t WHERE t.id_cliente = c.id_cliente), '[]'::json) AS tramites
     FROM public.clientes c WHERE c.id_cliente = $1`,
    [idCliente]
  );
  return rows[0] || null;
}

async function getClientLink(idCliente, realmId = null, query = pool.query.bind(pool)) {
  const { rows } = await query(
    `SELECT * FROM public.cliente_quickbooks
     WHERE id_cliente = $1 AND ($2::text IS NULL OR realm_id IS NULL OR realm_id = $2)
     ORDER BY (realm_id = $2) DESC NULLS LAST LIMIT 1`, [idCliente, realmId]
  );
  return rows[0] || null;
}

async function markClientPending(idCliente, query = pool.query.bind(pool)) {
  const { rows } = await query(
    `INSERT INTO public.cliente_quickbooks (id_cliente, sync_status)
     VALUES ($1, 'pending')
     ON CONFLICT (id_cliente) DO UPDATE SET
       sync_status = CASE WHEN cliente_quickbooks.sync_status = 'synced' THEN 'pending'
         ELSE cliente_quickbooks.sync_status END,
       updated_at = now()
     RETURNING *`, [idCliente]
  );
  return rows[0];
}

async function markSyncing(idCliente, query = pool.query.bind(pool)) {
  const { rows } = await query(
    `INSERT INTO public.cliente_quickbooks (id_cliente, sync_status, attempts, last_attempt_at)
     VALUES ($1, 'syncing', 1, now())
     ON CONFLICT (id_cliente) DO UPDATE SET
       sync_status = 'syncing', attempts = cliente_quickbooks.attempts + 1,
       last_error = NULL, last_attempt_at = now(), updated_at = now()
     RETURNING *`, [idCliente]
  );
  return rows[0];
}

async function markSyncSuccess(idCliente, customer, realmId, query = pool.query.bind(pool)) {
  const { rows } = await query(
    `UPDATE public.cliente_quickbooks SET
       quickbooks_customer_id = $1, quickbooks_sync_token = $2, realm_id = $3,
       sync_status = 'synced', last_error = NULL, synced_at = now(), updated_at = now()
     WHERE id_cliente = $4 RETURNING *`,
    [customer.Id, customer.SyncToken, realmId, idCliente]
  );
  return rows[0];
}

async function markSyncFailure(idCliente, status, error, query = pool.query.bind(pool)) {
  const { rows } = await query(
    `INSERT INTO public.cliente_quickbooks (id_cliente, sync_status, last_error, attempts)
     VALUES ($1, $2, $3, 1)
     ON CONFLICT (id_cliente) DO UPDATE SET
       sync_status = EXCLUDED.sync_status, last_error = EXCLUDED.last_error,
       updated_at = now()
     RETURNING *`, [idCliente, status, error]
  );
  return rows[0];
}

async function listClients({ status, limit, offset }, query = pool.query.bind(pool)) {
  const values = [];
  const where = status ? `WHERE COALESCE(cq.sync_status, 'pending') = $${values.push(status)}` : '';
  values.push(limit, offset);
  const { rows } = await query(
    `SELECT c.id_cliente, c.id_contacto,
       concat_ws(' ', nullif(btrim(c.nombre), ''), nullif(btrim(c.apellido_paterno), ''),
         nullif(btrim(c.apellido_materno), '')) AS nombre,
       cq.quickbooks_customer_id, COALESCE(cq.sync_status, 'pending') AS sync_status,
       cq.last_error, COALESCE(cq.attempts, 0) AS attempts,
       cq.last_attempt_at, cq.synced_at, cq.updated_at
     FROM public.clientes c
     LEFT JOIN public.cliente_quickbooks cq ON cq.id_cliente = c.id_cliente
     ${where}
     ORDER BY cq.updated_at ASC NULLS FIRST, c.id_cliente ASC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );
  return rows;
}

async function withClientSyncLock(idCliente, callback) {
  const client = await pool.connect();
  const lockKey = Number(idCliente);
  try {
    await client.query('SELECT pg_advisory_lock($1, $2)', [7142, lockKey]);
    return await callback();
  } finally {
    try { await client.query('SELECT pg_advisory_unlock($1, $2)', [7142, lockKey]); }
    finally { client.release(); }
  }
}

module.exports = {
  getActiveConnection, getLatestConnection, saveConnection, updateConnectionTokens,
  setConnectionStatus, disconnectAll, storeOAuthState, hasOAuthState, consumeOAuthState,
  getClientData, getClientLink, markClientPending, markSyncing,
  markSyncSuccess, markSyncFailure, listClients, withClientSyncLock,
};
