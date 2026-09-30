const test = require('node:test');
const assert = require('node:assert/strict');

process.env.QUICKBOOKS_CLIENT_ID = 'test-client';
process.env.QUICKBOOKS_CLIENT_SECRET = 'test-secret';
process.env.QUICKBOOKS_REDIRECT_URI = 'http://localhost:5000/api/integraciones/quickbooks/callback';
process.env.QUICKBOOKS_ENVIRONMENT = 'sandbox';
process.env.QUICKBOOKS_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');

const repository = require('../src/repositories/quickbooks.repository');
const auth = require('../src/services/quickbooksAuth.service');
const service = require('../src/services/quickbooks.service');
const cryptoService = require('../src/services/quickbooksCrypto.service');
const quickbooksController = require('../src/controllers/quickbooks.controller');
const { normalizeRole } = require('../src/middlewares/quickbooksAuth');
const { pool } = require('../src/config/db');

const originals = {};
for (const [key, value] of Object.entries(repository)) originals[`repo.${key}`] = value;
for (const [key, value] of Object.entries(auth)) originals[`auth.${key}`] = value;

function restore() {
  for (const [key, value] of Object.entries(originals)) {
    const [target, property] = key.split('.');
    (target === 'repo' ? repository : auth)[property] = value;
  }
}

const client = {
  id_cliente: 3944,
  id_contacto: 10,
  nombre: '  FELICITAS ',
  apellido_paterno: 'REVILLA',
  apellido_materno: 'PÉREZ',
  correo: 'felicitas@example.com',
  telefono: '+52 (614) 123-4567',
  tramites: ['Visa', 'Pasaporte', 'Visa'],
};

test.afterEach(restore);
test.after(async () => pool.end());

test('capitaliza espacios, acentos, guiones y apóstrofes', () => {
  assert.equal(service.titleCase("  ÁNGEL-LUIS  D'ÁVILA "), "Ángel-Luis D'Ávila");
});

test('construye payload sin duplicados y con orden recibido estable', () => {
  const { payload, warnings } = service.buildQuickBooksCustomerPayload(client);
  assert.deepEqual(payload, {
    Title: '3944',
    GivenName: 'Felicitas',
    FamilyName: 'Revilla Pérez',
    DisplayName: 'Felicitas Revilla Pérez (3944)',
    CompanyName: 'Visa | Pasaporte',
    PrimaryEmailAddr: { Address: 'felicitas@example.com' },
    PrimaryPhone: { FreeFormNumber: '+52 (614) 123-4567' },
  });
  assert.deepEqual(warnings, []);
});

test('omite correo vacío y teléfono migrado inválido', () => {
  const { payload } = service.buildQuickBooksCustomerPayload({
    ...client, correo: '', telefono: '#ERROR!', tramites: [],
  });
  assert.equal(payload.PrimaryEmailAddr, undefined);
  assert.equal(payload.PrimaryPhone, undefined);
  assert.equal(payload.Notes, undefined);
  assert.equal(payload.CompanyName, undefined);
});

test('aplica estrategia explícita de longitud y emite advertencia', () => {
  const { payload, warnings } = service.buildQuickBooksCustomerPayload({
    ...client, tramites: ['A'.repeat(90), 'B'.repeat(20)],
  });
  assert.equal(payload.CompanyName, 'A'.repeat(90));
  assert.equal(warnings.length, 1);
});

test('respeta limites documentados de GivenName, FamilyName y DisplayName', () => {
  const { payload, warnings } = service.buildQuickBooksCustomerPayload({
    ...client,
    nombre: 'NOMBRE DE CLIENTE EXTRAORDINARIAMENTE LARGO',
    apellido_paterno: 'APELLIDO EXTRAORDINARIAMENTE LARGO',
  });
  assert.ok(payload.GivenName.length <= 25);
  assert.ok(payload.DisplayName.length <= 100);
  assert.ok(payload.FamilyName.length <= 25);
  assert.ok(warnings.length >= 2);
});

test('normaliza comillas y diagonales Unicode sin alterar correo', () => {
  const { payload } = service.buildQuickBooksCustomerPayload({
    ...client,
    nombre: "MARIA\u2019LUISA \\ PEREZ",
    correo: 'Case.Sensitive@example.com',
  });
  assert.equal(payload.GivenName, "Maria'Luisa / Perez");
  assert.equal(payload.PrimaryEmailAddr.Address, 'Case.Sensitive@example.com');
});

test('cifra y descifra tokens con AES-256-GCM', () => {
  const encrypted = cryptoService.encryptToken('secret-token');
  assert.notEqual(encrypted, 'secret-token');
  assert.equal(cryptoService.decryptToken(encrypted), 'secret-token');
});

function installSyncMocks({ link = null } = {}) {
  repository.withClientSyncLock = async (_, callback) => callback();
  repository.getClientData = async () => client;
  repository.markClientPending = async () => ({ sync_status: 'pending' });
  repository.getLatestConnection = async () => ({ status: 'connected' });
  repository.markSyncing = async () => ({ sync_status: 'syncing' });
  repository.getClientLink = async () => link;
  repository.markSyncSuccess = async (_, customer) => ({
    sync_status: 'synced', quickbooks_customer_id: customer.Id,
  });
  repository.markSyncFailure = async (_, status, error) => ({ sync_status: status, last_error: error });
  auth.isConfigured = () => true;
  auth.getValidAccessToken = async () => ({
    accessToken: 'mock-token', connection: { realm_id: 'realm', environment: 'sandbox' },
  });
}

const response = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });

test('crea Customer nuevo cuando no hay relación ni DisplayName', async () => {
  installSyncMocks();
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    if (url.includes('/query?')) return response(200, { QueryResponse: {} });
    return response(200, { Customer: { Id: '101', SyncToken: '0' } });
  };
  const result = await service.syncClientToQuickBooks(3944, { fetchImpl });
  assert.equal(result.status, 'synced');
  assert.equal(result.customer_id, '101');
  assert.equal(requests.length, 2);
});

test('vincula Customer encontrado y actualiza con SyncToken mediante sparse update', async () => {
  installSyncMocks();
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    if (url.includes('/query?')) return response(200, {
      QueryResponse: { Customer: [{ Id: '202', SyncToken: '4', DisplayName: 'Felicitas Revilla (3944)' }] },
    });
    return response(200, { Customer: { Id: '202', SyncToken: '5' } });
  };
  const result = await service.syncClientToQuickBooks(3945, { fetchImpl });
  const updateBody = JSON.parse(requests[1].options.body);
  assert.equal(result.customer_id, '202');
  assert.equal(updateBody.SyncToken, '4');
  assert.equal(updateBody.sparse, true);
});

test('actualiza por quickbooks_customer_id local', async () => {
  installSyncMocks({ link: { quickbooks_customer_id: '303' } });
  const requests = [];
  let persisted;
  repository.markSyncSuccess = async (idCliente, customer) => {
    persisted = { idCliente, customer };
    return { sync_status: 'synced', quickbooks_customer_id: customer.Id };
  };
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    if ((options.method || 'GET') === 'GET') return response(200, { Customer: { Id: '303', SyncToken: '7' } });
    return response(200, { Customer: { Id: '303', SyncToken: '8' } });
  };
  const result = await service.syncClientToQuickBooks(3946, { fetchImpl });
  assert.equal(result.customer_id, '303');
  assert.equal(JSON.parse(requests[1].options.body).SyncToken, '7');
  assert.equal(persisted.idCliente, 3946);
  assert.deepEqual(persisted.customer, { Id: '303', SyncToken: '8' });
});

test('dos clientes del mismo contacto generan Customers independientes', async () => {
  installSyncMocks();
  repository.getClientData = async (idCliente) => ({
    ...client,
    id_cliente: idCliente,
    id_contacto: 10,
    nombre: idCliente === 100 ? 'Juan' : 'Ana',
  });
  const created = [];
  const fetchImpl = async (url, options) => {
    if (url.includes('/query?')) return response(200, { QueryResponse: {} });
    const body = JSON.parse(options.body);
    created.push(body);
    return response(200, {
      Customer: { Id: body.Title === '100' ? '500' : '501', SyncToken: '0' },
    });
  };
  const [first, second] = await Promise.all([
    service.syncClientToQuickBooks(100, { fetchImpl }),
    service.syncClientToQuickBooks(101, { fetchImpl }),
  ]);
  assert.equal(first.customer_id, '500');
  assert.equal(second.customer_id, '501');
  assert.deepEqual(created.map((payload) => payload.Title).sort(), ['100', '101']);
  assert.ok(created.every((payload) => payload.Notes === undefined));
});

test('reintenta una sola vez después de 401 solicitando refresh', async () => {
  let tokenCalls = 0;
  let fetchCalls = 0;
  auth.getValidAccessToken = async ({ forceRefresh }) => {
    tokenCalls += 1;
    assert.equal(forceRefresh, tokenCalls === 2);
    return { accessToken: 'mock', connection: { realm_id: 'realm', environment: 'sandbox' } };
  };
  const fetchImpl = async () => {
    fetchCalls += 1;
    return fetchCalls === 1 ? response(401, {}) : response(200, { QueryResponse: {} });
  };
  await service.quickBooksRequest('/query?query=test', { fetchImpl });
  assert.equal(fetchCalls, 2);
  assert.equal(tokenCalls, 2);
});

test('refresh fallido produce error sin ciclo infinito', async () => {
  let calls = 0;
  auth.getValidAccessToken = async () => { calls += 1; throw new Error('refresh failed'); };
  await assert.rejects(() => service.quickBooksRequest('/customer/1', { fetchImpl: async () => response(200, {}) }), /refresh failed/);
  assert.equal(calls, 1);
});

test('QuickBooks desconectado conserva sincronización pendiente', async () => {
  repository.withClientSyncLock = async (_, callback) => callback();
  repository.getClientData = async () => client;
  repository.markClientPending = async () => ({ sync_status: 'pending' });
  repository.getLatestConnection = async () => null;
  repository.markSyncFailure = async (_, status) => ({ sync_status: status });
  auth.isConfigured = () => true;
  const result = await service.syncClientToQuickBooks(3950);
  assert.equal(result.status, 'pending');
});

test('dos solicitudes simultáneas comparten una sola sincronización', async () => {
  installSyncMocks();
  let queryCalls = 0;
  const fetchImpl = async (url) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (url.includes('/query?')) { queryCalls += 1; return response(200, { QueryResponse: {} }); }
    return response(200, { Customer: { Id: '404', SyncToken: '0' } });
  };
  const [first, second] = await Promise.all([
    service.syncClientToQuickBooks(3999, { fetchImpl }),
    service.syncClientToQuickBooks(3999, { fetchImpl }),
  ]);
  assert.deepEqual(first, second);
  assert.equal(queryCalls, 1);
});

test('rechaza payload sin id_cliente', () => {
  assert.throws(() => service.buildQuickBooksCustomerPayload({ nombre: 'Demo' }), /id_cliente/);
});
test('rechaza payload sin nombre de cliente', () => {
  assert.throws(() => service.buildQuickBooksCustomerPayload({ id_cliente: 1 }), /Client name/);
});
test('rechaza id_cliente mayor al limite de Title', () => {
  assert.throws(() => service.buildQuickBooksCustomerPayload({ id_cliente: '12345678901234567', nombre: 'Demo' }), /Title limit/);
});
test('acepta correo valido', () => assert.equal(service.isValidEmail('demo@example.com'), true));
test('rechaza correo sin dominio', () => assert.equal(service.isValidEmail('demo@'), false));
test('rechaza correo mayor al limite', () => assert.equal(service.isValidEmail(`${'a'.repeat(95)}@x.com`), false));
test('acepta telefono internacional', () => assert.equal(service.isValidPhone('+52 (614) 123-4567'), true));
test('rechaza telefono sin digitos', () => assert.equal(service.isValidPhone('telefono'), false));
test('rechaza marcador de error migrado', () => assert.equal(service.isValidPhone('#ERROR!'), false));
test('deduplica valores ignorando mayusculas y espacios', () => {
  assert.deepEqual(service.uniqueNormalized([' Visa ', 'VISA', 'Pasaporte']), ['Visa', 'Pasaporte']);
});
test('conserva el identificador al recortar DisplayName', () => {
  const { payload } = service.buildQuickBooksCustomerPayload({ id_cliente: 9876, nombre: 'X'.repeat(150) });
  assert.ok(payload.DisplayName.endsWith(' (9876)'));
});
test('cliente sin tramites omite Notes y CompanyName', () => {
  const { payload } = service.buildQuickBooksCustomerPayload({ id_cliente: 1, nombre: 'Cliente Demo', tramites: [] });
  assert.equal(payload.Notes, undefined);
  assert.equal(payload.CompanyName, undefined);
});
test('sanea bearer token en errores', () => {
  assert.equal(service.sanitizeError(new Error('Bearer abc.def')), 'Bearer [REDACTED]');
});
test('sanea refresh_token en errores', () => {
  assert.equal(service.sanitizeError(new Error('refresh_token=secreto')), 'token=[REDACTED]');
});
test('protege y rota ambos tokens recibidos por OAuth', () => {
  const tokens = auth.protectTokenResponse({ access_token: 'access-new', refresh_token: 'refresh-new', expires_in: 3600, x_refresh_token_expires_in: 86400 });
  assert.equal(cryptoService.decryptToken(tokens.access_token_encrypted), 'access-new');
  assert.equal(cryptoService.decryptToken(tokens.refresh_token_encrypted), 'refresh-new');
});
test('configuracion interna no usa propiedades de token plano', () => {
  const config = auth.getConfig();
  assert.equal(Object.prototype.hasOwnProperty.call(config, 'accessToken'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(config, 'refreshToken'), false);
});

test('callback OAuth regresa a la ruta real de configuracion QuickBooks', () => {
  const resultUrl = new URL(auth.getFrontendResultUrl('connected'));
  assert.equal(resultUrl.pathname, '/empleado/configuracion/quickbooks');
  assert.equal(resultUrl.searchParams.get('quickbooks'), 'connected');
});

function callbackResponse() {
  return {
    statusCode: 200,
    location: null,
    redirect(url) { this.location = url; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('callback success redirige a la pagina QuickBooks real', async () => {
  auth.handleCallback = async () => ({});
  const res = callbackResponse();
  await quickbooksController.callback({ query: { code: 'masked', realmId: 'realm', state: 'masked' } }, res);
  const url = new URL(res.location);
  assert.equal(url.pathname, '/empleado/configuracion/quickbooks');
  assert.equal(url.searchParams.get('quickbooks'), 'connected');
});

for (const [name, query, category] of [
  ['OAuth cancelado', { error: 'access_denied' }, 'oauth_cancelled'],
  ['state invalido', { code: 'masked', realmId: 'realm', state: 'masked' }, 'invalid_state'],
  ['token exchange fallido', { code: 'masked', realmId: 'realm', state: 'masked' }, 'token_exchange_failed'],
]) {
  test(`${name} redirige sin 404 y con razon segura`, async () => {
    if (!query.error) auth.handleCallback = async () => {
      const error = new Error('technical detail');
      error.oauthCategory = category;
      throw error;
    };
    const res = callbackResponse();
    await quickbooksController.callback({ query }, res);
    const url = new URL(res.location);
    assert.equal(url.pathname, '/empleado/configuracion/quickbooks');
    assert.equal(url.searchParams.get('quickbooks'), 'error');
    assert.equal(url.searchParams.get('reason'), category);
  });
}

for (const [name, callback, missing] of [
  ['callback sin code', { realmId: 'realm', state: 'masked' }, 'code'],
  ['callback sin realmId', { code: 'masked', state: 'masked' }, 'realmId'],
  ['callback sin state', { code: 'masked', realmId: 'realm' }, 'state'],
]) {
  test(`${name} se clasifica invalid_callback`, async () => {
    await assert.rejects(
      () => auth.handleCallback(callback),
      (error) => error.oauthCategory === 'invalid_callback'
        && error.missingParameters.includes(missing)
    );
  });
}

test('callback con error de Intuit se clasifica oauth_cancelled sin exponer detalle', async () => {
  const res = callbackResponse();
  await quickbooksController.callback({ query: { error: 'access_denied', error_description: 'private detail' } }, res);
  const url = new URL(res.location);
  assert.equal(url.searchParams.get('reason'), 'oauth_cancelled');
  assert.equal(url.searchParams.has('error_description'), false);
});

test('callback valido consume state, intercambia token y persiste conexion', async () => {
  repository.consumeOAuthState = async () => true;
  let saved = null;
  repository.saveConnection = async (connection) => { saved = connection; return connection; };
  const fetchImpl = async () => response(200, {
    access_token: 'mock-access', refresh_token: 'mock-refresh', expires_in: 3600,
  });
  await auth.handleCallback({ code: 'masked', realmId: 'realm-demo', state: 'masked' }, fetchImpl);
  assert.equal(saved.realm_id, 'realm-demo');
  assert.equal(saved.environment, 'sandbox');
  assert.ok(saved.access_token_encrypted);
  assert.ok(saved.refresh_token_encrypted);
});

test('state inexistente se clasifica invalid_state', async () => {
  repository.consumeOAuthState = async () => false;
  await assert.rejects(
    () => auth.handleCallback({ code: 'masked', realmId: 'realm', state: 'missing' }),
    (error) => error.oauthCategory === 'invalid_state'
  );
});

test('state expirado se clasifica invalid_state', async () => {
  repository.consumeOAuthState = async () => false;
  await assert.rejects(
    () => auth.handleCallback({ code: 'masked', realmId: 'realm', state: 'expired' }),
    (error) => error.oauthCategory === 'invalid_state'
  );
});

test('Authorization URL contiene estructura OAuth requerida', async () => {
  let stateStored = false;
  repository.storeOAuthState = async () => { stateStored = true; };
  const url = new URL(await auth.createAuthorizationUrl());
  assert.equal(url.origin, 'https://appcenter.intuit.com');
  assert.ok(url.searchParams.get('client_id'));
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(url.searchParams.get('scope'), 'com.intuit.quickbooks.accounting');
  assert.equal(url.searchParams.get('redirect_uri'), 'http://localhost:5000/api/integraciones/quickbooks/callback');
  assert.ok(url.searchParams.get('state'));
  assert.equal(stateStored, true);
});

test('RBAC QuickBooks reconoce Administrador como ADMIN', () => {
  assert.equal(normalizeRole('Administrador'), 'ADMIN');
  assert.equal(normalizeRole('ADMIN'), 'ADMIN');
});

test('endpoint estado devuelve disconnected sin exponer tokens', async () => {
  auth.isConfigured = () => true;
  repository.getLatestConnection = async () => null;
  let body;
  await quickbooksController.getStatus({}, { json(value) { body = value; } }, (error) => { throw error; });
  assert.equal(body.connected, false);
  assert.equal(body.status, 'disconnected');
  assert.equal(body.environment, 'sandbox');
  assert.equal(Object.prototype.hasOwnProperty.call(body, 'access_token'), false);
});
