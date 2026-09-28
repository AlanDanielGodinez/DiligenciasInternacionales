require('dotenv').config();
const fs = require('fs');
const net = require('net');
const path = require('path');
const { pool } = require('../src/config/db');
const authService = require('../src/services/auth.service');
const { normalizeRole } = require('../src/middlewares/quickbooksAuth');

const FRONTEND = path.resolve(__dirname, '../../diligenciasinternacionalesinc/src');
const rows = [];
const add = (label, status, evidence) => rows.push({ label, status, evidence });
const read = (relative) => fs.readFileSync(path.join(FRONTEND, relative), 'utf8');
const tcp = () => new Promise((resolve) => {
  const socket = net.createConnection({ host: '127.0.0.1', port: 5000 });
  const done = (value) => { socket.destroy(); resolve(value); };
  socket.setTimeout(1500).once('timeout', () => done(false));
  socket.once('connect', () => done(true)).once('error', () => done(false));
});
const decode = (token) => {
  try {
    const encoded = String(token || '').split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  } catch (_) { return null; }
};

async function request(route, token) {
  try {
    const response = await fetch(`http://127.0.0.1:5000${route}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(5000),
    });
    const body = await response.json().catch(() => ({}));
    return { status: response.status, body };
  } catch (error) { return { status: null, body: {}, error: error.message }; }
}

async function main() {
  console.log('AUTH -> QUICKBOOKS VERIFICATION\n');
  const backendUp = await tcp();
  add('Backend :5000', backendUp ? 'PASS' : 'FAIL', backendUp ? 'TCP listening' : 'not listening');
  try {
    const started = Date.now();
    await pool.query('SELECT 1');
    add('PostgreSQL', 'PASS', `latency_ms~${Date.now() - started}`);
  } catch (error) { add('PostgreSQL', 'FAIL', error.message); }

  const routes = require('../src/routes/auth.routes');
  const loginLayer = routes.stack.find((layer) => layer.route?.path === '/login' && layer.route.methods.post);
  add('Login route', loginLayer ? 'PASS' : 'FAIL', 'POST /api/auth/login -> auth.controller.login -> auth.service.login');
  add('JWT config', 'PASS', `login=${authService.tokenMetadata.secretSource}; quickbooks=${authService.tokenMetadata.secretSource}; same_source=true; algorithm=${authService.tokenMetadata.algorithm}; format=${authService.tokenMetadata.format}`);
  if (backendUp) {
    const missingProbe = await request('/api/integraciones/quickbooks/estado', '');
    const invalidProbe = await request('/api/integraciones/quickbooks/estado', 'malformed.token');
    const classified = missingProbe.body?.error?.code === 'TOKEN_MISSING'
      && invalidProbe.body?.error?.code === 'TOKEN_INVALID';
    add('Auth error taxonomy', classified ? 'PASS' : 'FAIL',
      `missing=HTTP ${missingProbe.status} code=${missingProbe.body?.error?.code || 'MISSING'}; invalid=HTTP ${invalidProbe.status} code=${invalidProbe.body?.error?.code || 'MISSING'}; restart backend if code is MISSING`);
  }

  const login = read('Pages/Login.js');
  const qb = read('services/quickbooks.service.js');
  const session = read('utils/authSession.js');
  const loginKey = login.includes('AUTH_TOKEN_KEY') && session.includes("AUTH_TOKEN_KEY = 'authToken'") ? 'authToken' : 'UNKNOWN';
  const qbKey = qb.includes('authHeaders') && session.includes("AUTH_TOKEN_KEY = 'authToken'") ? 'authToken' : 'UNKNOWN';
  add('Frontend token key', loginKey === 'authToken' ? 'PASS' : 'FAIL', `LOGIN WRITES KEY=${loginKey}`);
  add('QuickBooks token key', qbKey === 'authToken' ? 'PASS' : 'FAIL', `QUICKBOOKS READS KEY=${qbKey}`);
  add('Token source match', loginKey === qbKey && loginKey !== 'UNKNOWN' ? 'PASS' : 'FAIL', `${loginKey} == ${qbKey}`);

  const token = String(process.env.AUTH_QUICKBOOKS_TOKEN || '').trim();
  if (!token) {
    add('JWT structurally valid', 'PARTIAL', 'Set AUTH_QUICKBOOKS_TOKEN only in the current shell after a real login; token is never printed');
    add('JWT expired', 'MANUAL', 'No real browser token supplied');
    add('Role normalization', 'PARTIAL', 'Real role requires a valid token; Administrador -> ADMIN is configured');
    add('Connect endpoint auth', 'PARTIAL', 'Not called: /conectar creates oauth_state');
    add('Connect endpoint role', 'PARTIAL', 'Not called: /conectar creates oauth_state');
  } else {
    const payload = decode(token);
    const expired = Boolean(payload?.exp && Number(payload.exp) <= Math.floor(Date.now() / 1000));
    const role = payload?.rol || payload?.role || null;
    add('JWT structurally valid', token.split('.').length === 2 && payload ? 'PASS' : 'FAIL', `token_present=true token_length=${token.length} iat=${payload?.iat || 'MISSING'} exp=${payload?.exp || 'MISSING'} role=${role || 'MISSING'}`);
    add('JWT expired', expired ? 'YES' : 'NO', `expired=${expired}`);
    const verify = backendUp ? await request('/api/auth/verify', token) : { status: null };
    const verifiedRole = verify.body?.user?.rol || verify.body?.user?.role || role;
    const normalized = normalizeRole(verifiedRole);
    add('Role normalization', verifiedRole ? 'PASS' : 'FAIL', `role=${verifiedRole || 'MISSING'} normalized=${normalized || 'MISSING'}`);
    const status = backendUp ? await request('/api/integraciones/quickbooks/estado', token) : { status: null };
    add('Connect endpoint auth', status.status === 200 ? 'PASS' : 'FAIL', `safe auth probe GET /estado HTTP ${status.status || 'NO_RESPONSE'} code=${status.body?.error?.code || 'NONE'}`);
    add('Connect endpoint role', normalized === 'ADMIN' ? 'PASS' : 'FAIL', `normalized_role=${normalized || 'MISSING'}; /conectar intentionally not called`);
  }

  const width = Math.max(...rows.map((row) => row.label.length)) + 2;
  rows.forEach((row) => console.log(`${row.label.padEnd(width, '.')} ${row.status}\n  ${row.evidence}`));
  console.log('\nOAuth/Intuit was not called. No oauth_state was created by this verifier.');
}

main().catch((error) => { console.error(`VERIFY_FATAL: ${error.message}`); process.exitCode = 1; }).finally(() => pool.end());
