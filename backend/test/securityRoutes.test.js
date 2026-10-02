const test = require('node:test');
const assert = require('node:assert/strict');
const harness = require('./helpers/authTestHarness');
const request = require('supertest');
const express = require('express');
const app = require('../src/app');
const { PUBLIC_ROUTES, bindActor } = require('../src/middlewares/auth');
const { resolveGroups, hasPermission } = require('../src/security/permissions');

test.beforeEach(() => harness.reset());

/** Recorre el router de Express y devuelve [{ method, path }] de cada ruta /api montada. */
function listApiRoutes() {
  const routes = [];
  const mountPath = (layer) => {
    const source = layer.regexp && layer.regexp.source;
    if (!source) return '';
    const match = source.match(/^\^\\\/(.*?)\\\/\?\(\?=\\\/\|\$\)/);
    return match ? `/${match[1].replace(/\\\//g, '/')}` : '';
  };
  for (const layer of app._router.stack) {
    if (layer.name !== 'router' || !layer.handle.stack) continue;
    const base = mountPath(layer);
    if (!base.startsWith('/api/')) continue;
    for (const sub of layer.handle.stack) {
      if (!sub.route) continue;
      for (const method of Object.keys(sub.route.methods)) {
        routes.push({ method: method.toUpperCase(), path: `${base}${sub.route.path === '/' ? '' : sub.route.path}` });
      }
    }
  }
  return routes;
}

const concrete = (path) => path.replace(/:[A-Za-z_]+/g, '1');
const isPublic = ({ method, path }) => PUBLIC_ROUTES.some((r) => r.method === method && `/api${r.path}` === path);

test('el inventario de rutas es amplio (detecta si el recorrido del router deja de funcionar)', () => {
  const routes = listApiRoutes();
  assert.ok(routes.length > 120, `se esperaban >120 rutas, hay ${routes.length}`);
});

test('TODA ruta /api no pública responde 401 sin sesión y no toca la base de datos', async () => {
  const routes = listApiRoutes().filter((route) => !isPublic(route));
  const failures = [];
  for (const route of routes) {
    harness.state.queries.length = 0;
    const res = await request(app)[route.method.toLowerCase()](concrete(route.path)).send({});
    if (res.status !== 401) failures.push(`${route.method} ${route.path} -> ${res.status}`);
    const touchedDb = harness.state.queries.filter((q) => !/auditoria_accesos/.test(q.sql));
    if (touchedDb.length) failures.push(`${route.method} ${route.path} consultó la BD sin sesión`);
  }
  assert.deepEqual(failures, []);
});

test('la lista pública es explícita y mínima', async () => {
  assert.deepEqual(PUBLIC_ROUTES.map((r) => `${r.method} ${r.path}`).sort(), [
    'GET /health',
    'GET /integraciones/quickbooks/callback',
    'GET /noticias-migratorias',
    'POST /auth/cliente-login',
    'POST /auth/login',
  ]);
  const health = await request(app).get('/api/health');
  assert.equal(health.status, 200);
  const cliente = await request(app).post('/api/auth/cliente-login').send({});
  assert.equal(cliente.status, 501);
});

test('token inválido en cualquier ruta protegida responde 401', async () => {
  for (const path of ['/api/clientes', '/api/documentos/1/descargar', '/api/solicitudes/1', '/api/pagos']) {
    const res = await request(app).get(path).set('Authorization', 'Bearer x.y');
    assert.equal(res.status, 401, path);
  }
});

test('grupos por rol/área; rol desconocido = sin grupos (mínimo privilegio)', () => {
  assert.deepEqual(resolveGroups({ rol: 'Administrador' }), ['ADMIN']);
  assert.deepEqual(resolveGroups({ rol: 'Auxiliar de finanzas', area: 'PAGOS' }), ['FINANZAS']);
  assert.deepEqual(resolveGroups({ rol: 'Coordinador', area: 'PROTOCOLO' }), ['PROTOCOLO']);
  assert.deepEqual(resolveGroups({ rol: 'Recepción' }), []);
  assert.equal(hasPermission({ rol: 'Recepción' }, 'pagos.validar'), false);
  assert.equal(hasPermission({ rol: 'Administrador' }, 'ama.protocolo'), true);
  assert.throws(() => hasPermission({ rol: 'Administrador' }, 'permiso.inexistente'), /desconocido/);
});

const as = async (fields) => {
  const emp = await harness.addEmpleado(fields);
  return { emp, auth: `Bearer ${harness.tokenFor(emp)}` };
};

test('validar/rechazar pagos: sólo Finanzas/Pagos y Admin', async () => {
  const informes = await as({ area: 'INFORMES', rol: 'Coordinador de Informes' });
  const finanzas = await as({ area: 'PAGOS', rol: 'Auxiliar de finanzas' });
  const admin = await as({ area: 'ADMIN', rol: 'Administrador' });

  for (const path of ['/api/pagos/1/validar', '/api/pagos/1/rechazar']) {
    const denied = await request(app).patch(path).set('Authorization', informes.auth).send({});
    assert.equal(denied.status, 403, `${path} informes`);
    assert.equal(denied.body.error.code, 'INSUFFICIENT_PERMISSION');
    for (const allowed of [finanzas, admin]) {
      const res = await request(app).patch(path).set('Authorization', allowed.auth).send({});
      assert.ok(![401, 403].includes(res.status), `${path} debe pasar el control de acceso (status ${res.status})`);
    }
  }
  const bandeja = await request(app).get('/api/finanzas/pagos').set('Authorization', informes.auth);
  assert.equal(bandeja.status, 403);
  assert.ok(harness.state.audit.some((a) => a.evento === 'PERMISO_DENEGADO'));
});

test('protocolo AMA: sólo Protocolo y Admin', async () => {
  const ama = await as({ area: 'AMA', rol: 'Asesor AMA' });
  const protocolo = await as({ area: 'PROTOCOLO', rol: 'Protocolo' });
  const denied = await request(app).post('/api/solicitudes/1/operacion-ama/protocolo').set('Authorization', ama.auth).send({});
  assert.equal(denied.status, 403);
  const allowed = await request(app).post('/api/solicitudes/1/operacion-ama/protocolo').set('Authorization', protocolo.auth).send({});
  assert.ok(![401, 403].includes(allowed.status), `status ${allowed.status}`);
});

test('escrituras por área: legales, logística, grupos AMA, métodos de pago; lectura abierta a empleados', async () => {
  const informes = await as({ area: 'INFORMES', rol: 'Auxiliar de informes' });
  const writes = [
    ['patch', '/api/legales/1'],
    ['post', '/api/viajes/tours'],
    ['post', '/api/grupos-ama'],
    ['post', '/api/metodos-pago'],
    ['post', '/api/solicitudes/1/cotizaciones-viaje'],
    ['patch', '/api/solicitudes/1/resultado-individual'],
    ['post', '/api/calendario-ama/llamadas'],
  ];
  for (const [method, path] of writes) {
    const res = await request(app)[method](path).set('Authorization', informes.auth).send({});
    assert.equal(res.status, 403, `${method.toUpperCase()} ${path}`);
  }
  for (const path of ['/api/legales', '/api/viajes/tours', '/api/grupos-ama', '/api/metodos-pago']) {
    const res = await request(app).get(path).set('Authorization', informes.auth);
    assert.ok(![401, 403].includes(res.status), `GET ${path} status ${res.status}`);
  }
});

test('diagnóstico interno (/health/db, /health/tables) sólo Admin', async () => {
  const informes = await as({ area: 'INFORMES' });
  assert.equal((await request(app).get('/api/health/tables').set('Authorization', informes.auth)).status, 403);
  assert.equal((await request(app).get('/api/health/db').set('Authorization', informes.auth)).status, 403);
});

test('documentos: sin sesión 401; otra área 403 (y queda en bitácora); responsable/área pasa', async () => {
  const anon = await request(app).get('/api/documentos/55/descargar');
  assert.equal(anon.status, 401);

  const otraArea = await as({ area: 'LOGISTICA', rol: 'Vuelos' });
  harness.state.documentAccess = () => false;
  const denied = await request(app).get('/api/documentos/55/descargar').set('Authorization', otraArea.auth);
  assert.equal(denied.status, 403);
  assert.ok(harness.state.audit.some((a) => a.evento === 'DOCUMENTO_DESCARGA_DENEGADA' && a.recurso === 'documento:55'));

  const responsable = await as({ area: 'INDIVIDUALES' });
  harness.state.documentAccess = ([idDocumento, idEmpleado]) => idDocumento === 55 && idEmpleado === responsable.emp.id_empleado;
  const ok = await request(app).get('/api/documentos/55/descargar').set('Authorization', responsable.auth);
  assert.equal(ok.status, 404, 'pasa el control de acceso y llega a la búsqueda del documento (no existe en el fake)');
});

test('documentos: Finanzas puede leer comprobantes de pago (parámetro enviado a la consulta)', async () => {
  const finanzas = await as({ area: 'PAGOS', rol: 'Auxiliar de finanzas' });
  let canReadReceipts = null;
  harness.state.documentAccess = (params) => { canReadReceipts = params[4]; return true; };
  await request(app).get('/api/documentos/7/descargar').set('Authorization', finanzas.auth);
  assert.equal(canReadReceipts, true);
  const informes = await as({ area: 'INFORMES' });
  await request(app).get('/api/documentos/7/descargar').set('Authorization', informes.auth);
  assert.equal(canReadReceipts, false);
});

test('documentos por expediente y listado global', async () => {
  const informes = await as({ area: 'INFORMES' });
  harness.state.solicitudAccess = () => false;
  assert.equal((await request(app).get('/api/documentos/solicitud/9').set('Authorization', informes.auth)).status, 403);
  assert.equal((await request(app).get('/api/solicitudes/9/documentos-requeridos').set('Authorization', informes.auth)).status, 403);
  assert.equal((await request(app).post('/api/solicitudes/9/documentos-requeridos/PASAPORTE').set('Authorization', informes.auth)).status, 403);
  assert.equal((await request(app).get('/api/documentos').set('Authorization', informes.auth)).status, 403);

  harness.state.solicitudAccess = ([idSolicitud]) => idSolicitud === 9;
  const allowed = await request(app).get('/api/documentos/solicitud/9').set('Authorization', informes.auth);
  assert.equal(allowed.status, 200);
  assert.deepEqual(allowed.body, { documentos: [] });
});

test('el administrador accede a documentos de cualquier expediente sin consultar la regla de área', async () => {
  const admin = await as({ area: 'ADMIN', rol: 'Administrador' });
  harness.state.solicitudAccess = () => { throw new Error('no debería consultarse'); };
  const res = await request(app).get('/api/documentos/solicitud/9').set('Authorization', admin.auth);
  assert.equal(res.status, 200);
});

test('bindActor: la autoría sale de la sesión aunque el cliente envíe otro id', async () => {
  const mini = express();
  mini.use(express.json());
  mini.use((req, res, next) => { req.user = { id_empleado: 42 }; next(); });
  mini.use(bindActor);
  mini.post('/x', (req, res) => res.json(req.body));
  const res = await request(mini).post('/x').send({ id_empleado: 1, validado_por: 1, registrado_por: 1, subido_por: 1, monto: 10 });
  assert.deepEqual(res.body, { id_empleado: 42, validado_por: 42, registrado_por: 42, subido_por: 42, monto: 10 });
});

test('respuestas incluyen cabeceras de seguridad (helmet) y no X-Powered-By', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.headers['x-powered-by'], undefined);
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
});
