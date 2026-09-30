require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const net = require('net');
const path = require('path');
const { pool } = require('../src/config/db');

const BACKEND = path.resolve(__dirname, '..');
const FRONTEND = path.resolve(BACKEND, '../diligenciasinternacionalesinc/src');
const EXPECTED_REDIRECT = 'http://localhost:5000/api/integraciones/quickbooks/callback';
const EXPECTED_API = 'https://sandbox-quickbooks.api.intuit.com';
const results = [];
let firstFail = null;
const add = (label, status, evidence) => {
  results.push({ label, status, evidence });
  if (status === 'FAIL' && !firstFail) firstFail = { label, evidence };
};
const isPresent = (key) => Boolean(String(process.env[key] || '').trim());
const listening = (port) => new Promise((resolve) => {
  const socket = net.createConnection({ host: '127.0.0.1', port });
  const done = (value) => { socket.destroy(); resolve(value); };
  socket.setTimeout(1500);
  socket.once('connect', () => done(true));
  socket.once('timeout', () => done(false));
  socket.once('error', () => done(false));
});

async function database() {
  const started = Date.now();
  const { rows } = await pool.query('SELECT current_database() AS database, NOW() AS now');
  add('PostgreSQL', 'PASS', `host=${process.env.DB_HOST || 'localhost'} port=${process.env.DB_PORT || 5432} database=${rows[0].database} ssl=${String(process.env.DB_SSL).toLowerCase() === 'true'} latency_ms~${Date.now() - started}`);
}

async function schema() {
  const required = {
    quickbooks_conexiones: ['id_quickbooks_conexion', 'realm_id', 'access_token_encrypted', 'refresh_token_encrypted', 'access_token_expires_at', 'environment', 'status'],
    quickbooks_oauth_states: ['state_hash', 'expires_at', 'used_at', 'created_at'],
    cliente_quickbooks: ['id_cliente', 'realm_id', 'quickbooks_customer_id', 'quickbooks_sync_token', 'sync_status', 'attempts'],
  };
  const tables = Object.keys(required);
  const { rows } = await pool.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=ANY($1)", [tables]);
  const missing = Object.entries(required).flatMap(([table, columns]) => columns.filter((column) => !rows.some((row) => row.table_name === table && row.column_name === column)).map((column) => `${table}.${column}`));
  const meta = await pool.query(`SELECT
    (SELECT count(*) FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public' AND t.relname=ANY($1))::int constraints,
    (SELECT count(*) FROM pg_indexes WHERE schemaname='public' AND tablename=ANY($1))::int indexes`, [tables]);
  add('Schema', missing.length ? 'FAIL' : 'PASS', missing.length ? `missing=${missing.join(',')}` : `tables=3 constraints=${meta.rows[0].constraints} indexes=${meta.rows[0].indexes}`);
  if (missing.length) return;
  const client = await pool.connect();
  try {
    const hash = crypto.createHash('sha256').update(`qb-demo-${crypto.randomUUID()}`).digest('hex');
    await client.query('BEGIN');
    await client.query("INSERT INTO public.quickbooks_oauth_states(state_hash,expires_at) VALUES($1,now()+interval '5 minutes')", [hash]);
    const selected = await client.query('SELECT 1 FROM public.quickbooks_oauth_states WHERE state_hash=$1', [hash]);
    await client.query('ROLLBACK');
    add('OAuth states table', selected.rowCount === 1 ? 'PASS' : 'FAIL', 'INSERT+SELECT dentro de transaccion; ROLLBACK; sin basura');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    add('OAuth states table', 'FAIL', error.message);
  } finally { client.release(); }
}

function config() {
  const aliases = {
    QUICKBOOKS_CLIENT_ID: ['QUICKBOOKS_CLIENT_ID'],
    QUICKBOOKS_CLIENT_SECRET: ['QUICKBOOKS_CLIENT_SECRET'],
    QUICKBOOKS_REDIRECT_URI: ['QUICKBOOKS_REDIRECT_URI'],
    QUICKBOOKS_TOKEN_ENCRYPTION_KEY: ['QUICKBOOKS_TOKEN_ENCRYPTION_KEY'],
  };
  const facts = Object.entries(aliases).map(([label, keys]) => `${label}: ${keys.some(isPresent) ? 'PRESENT' : 'MISSING'}`);
  const required = ['QUICKBOOKS_CLIENT_ID', 'QUICKBOOKS_CLIENT_SECRET', 'QUICKBOOKS_REDIRECT_URI', 'QUICKBOOKS_TOKEN_ENCRYPTION_KEY'];
  const redirect = process.env.QUICKBOOKS_REDIRECT_URI || '';
  const fail = required.some((key) => !isPresent(key))
    || redirect !== EXPECTED_REDIRECT;
  add('OAuth config', fail ? 'FAIL' : 'PASS', `${facts.join('; ')}; QUICKBOOKS_REDIRECT_URI=${redirect || 'MISSING'}`);
  const environment = String(process.env.QUICKBOOKS_ENVIRONMENT || '').toLowerCase();
  const apiBase = require('../src/services/quickbooks.service').apiBase(environment);
  add('Environment', environment === 'sandbox' && apiBase === EXPECTED_API ? 'PASS' : 'FAIL', `environment=${environment || 'MISSING'} api_base=${apiBase}`);
}

function routes() {
  const router = require('../src/routes/quickbooks.routes');
  const found = router.stack.filter((layer) => layer.route).map((layer) => ({
    method: Object.keys(layer.route.methods)[0].toUpperCase(),
    path: `/api/integraciones/quickbooks${layer.route.path}`,
    middleware: layer.route.stack.map((item) => item.handle.name || '<anonymous>'),
  }));
  const required = [
    ['GET', '/api/integraciones/quickbooks/estado'],
    ['GET', '/api/integraciones/quickbooks/conectar'],
    ['GET', '/api/integraciones/quickbooks/callback'],
    ['POST', '/api/integraciones/quickbooks/clientes/:idCliente/sincronizar'],
    ['GET', '/api/integraciones/quickbooks/clientes/:idCliente/estado'],
    ['GET', '/api/integraciones/quickbooks/clientes'],
  ];
  const missing = required.filter(([method, routePath]) => !found.some((route) => route.method === method && route.path === routePath));
  add('Express routes', missing.length ? 'FAIL' : 'PASS', found.filter((route) => required.some((item) => item[1] === route.path)).map((route) => `${route.method} ${route.path} [${route.middleware.join(' -> ')}]`).join('; '));
}

function frontend() {
  const page = fs.readFileSync(path.join(FRONTEND, 'Pages/Empleado/QuickBooksIntegracionPage.js'), 'utf8');
  const service = fs.readFileSync(path.join(FRONTEND, 'services/quickbooks.service.js'), 'utf8');
  const routeOk = service.includes("api.get('/integraciones/quickbooks/conectar'")
    && service.includes('/integraciones/quickbooks/clientes/')
    && service.includes('authHeaders')
    && service.includes("params: { format: 'json' }");
  const clickOk = page.includes('onClick={handleConnect}') && page.includes('await connectQuickBooks()') && page.includes('window.location.assign(url)') && page.includes('[QB-FRONTEND] authorization-url-received');
  add('Frontend route', routeOk ? 'PASS' : 'FAIL', 'Axios GET /integraciones/quickbooks/conectar?format=json; Authorization Bearer <redacted>');
  add('Frontend connect action', clickOk ? 'PASS' : 'FAIL', 'onClick -> handleConnect -> connectQuickBooks -> Axios -> authorization_url -> window.location.assign');
}

async function service() {
  const auth = require('../src/services/quickbooksAuth.service');
  const before = await pool.query('SELECT count(*)::int count FROM public.quickbooks_oauth_states');
  let hash;
  try {
    const authorizationUrl = await auth.createAuthorizationUrl();
    const url = new URL(authorizationUrl);
    const state = url.searchParams.get('state');
    hash = crypto.createHash('sha256').update(state || '').digest('hex');
    const stored = await pool.query('SELECT created_at,expires_at FROM public.quickbooks_oauth_states WHERE state_hash=$1', [hash]);
    const after = await pool.query('SELECT count(*)::int count FROM public.quickbooks_oauth_states');
    const valid = url.hostname === 'appcenter.intuit.com' && Boolean(url.searchParams.get('client_id')) && url.searchParams.get('response_type') === 'code' && url.searchParams.get('scope') === 'com.intuit.quickbooks.accounting' && url.searchParams.get('redirect_uri') === EXPECTED_REDIRECT && Boolean(state);
    add('Auth URL generation', valid ? 'PASS' : 'FAIL', `hostname=${url.hostname} client_id=PRESENT response_type=${url.searchParams.get('response_type')} scope=${url.searchParams.get('scope')} redirect_uri=${url.searchParams.get('redirect_uri')} state_length=${state?.length || 0}`);
    add('State persistence', stored.rowCount === 1 && after.rows[0].count === before.rows[0].count + 1 ? 'PASS' : 'FAIL', `state_exists_in_db=${stored.rowCount === 1} count_delta=${after.rows[0].count - before.rows[0].count}`);
  } catch (error) { add('Auth URL generation', 'FAIL', error.message); }
  finally { if (hash) await pool.query('DELETE FROM public.quickbooks_oauth_states WHERE state_hash=$1', [hash]); }
}

async function currentState() {
  const connection = await pool.query("SELECT environment,status,realm_id IS NOT NULL has_realm,(access_token_encrypted IS NOT NULL AND access_token_encrypted<>'') has_access,(refresh_token_encrypted IS NOT NULL AND refresh_token_encrypted<>'') has_refresh FROM public.quickbooks_conexiones ORDER BY updated_at DESC LIMIT 1");
  const states = await pool.query('SELECT created_at,expires_at,used_at IS NOT NULL consumed,expires_at<=now() expired FROM public.quickbooks_oauth_states ORDER BY created_at DESC LIMIT 5');
  add('OAuth real connection', connection.rowCount && connection.rows[0].status === 'connected' ? 'CONNECTED_UNVERIFIED' : 'NOT_CONNECTED', connection.rowCount ? JSON.stringify(connection.rows[0]) : 'connection=null');
  add('QuickBooks real read', 'NOT_TESTED', 'No external request made; Customer create NOT_TESTED');
  return states.rows;
}

async function main() {
  console.log('QUICKBOOKS INTEGRATION VERIFICATION\n');
  try { await database(); } catch (error) { add('PostgreSQL', 'FAIL', error.message); }
  if (!firstFail) await schema();
  if (!firstFail) config();
  if (!firstFail && String(process.env.QUICKBOOKS_ENVIRONMENT).toLowerCase() !== 'production') add('Backend :5000', await listening(5000) ? 'PASS' : 'FAIL', 'TCP 127.0.0.1:5000; server not auto-started');
  try { routes(); } catch (error) { add('Express routes', 'FAIL', error.message); }
  frontend();
  if (!firstFail) await service();
  add('HTTP authenticated flow', 'PARTIAL', 'No official test-token/session generator exists; no auth bypass added');
  const oauthStates = await currentState();
  const width = Math.max(...results.map((row) => row.label.length)) + 2;
  for (const row of results) console.log(`${row.label.padEnd(width, '.')} ${row.status}\n  ${row.evidence}`);
  console.log(`\noauth_states: ${JSON.stringify(oauthStates, null, 2)}`);
  console.log(`\nFIRST FAIL: ${firstFail ? `${firstFail.label} - ${firstFail.evidence}` : 'NONE'}`);
  const localFail = results.some((row) => row.status === 'FAIL');
  console.log(`\nFINAL:\nLOCAL IMPLEMENTATION = ${localFail ? 'FAIL' : 'PASS'}\nREAL OAUTH = NOT VALIDATED\nCUSTOMER CREATE = NOT TESTED`);
  if (firstFail) process.exitCode = 1;
}

main().catch((error) => { console.error(`VERIFY_FATAL: ${error.message}`); process.exitCode = 1; }).finally(() => pool.end());
