const test = require('node:test');
const assert = require('node:assert/strict');
const harness = require('./helpers/authTestHarness');
const request = require('supertest');
const app = require('../src/app');
const passwords = require('../src/services/password.service');
const security = require('../src/config/security');
const authService = require('../src/services/auth.service');

test.beforeEach(() => harness.reset());

test('hash scrypt: verifica la contraseña correcta y rechaza la incorrecta', async () => {
  const hash = await passwords.hashPassword('ClaveSegura2026');
  assert.match(hash, /^scrypt\$16384\$8\$1\$/);
  assert.equal(await passwords.verifyPassword('ClaveSegura2026', hash), true);
  assert.equal(await passwords.verifyPassword('ClaveSegura2027', hash), false);
  assert.equal(await passwords.verifyPassword('ClaveSegura2026', null), false);
  assert.equal(await passwords.verifyPassword('ClaveSegura2026', 'texto-plano'), false);
  assert.notEqual(await passwords.hashPassword('ClaveSegura2026'), hash, 'cada hash usa sal aleatoria');
});

test('política de contraseñas', () => {
  assert.match(passwords.validatePasswordPolicy('corta1'), /al menos 10/);
  assert.match(passwords.validatePasswordPolicy('sololetrassinnumeros'), /letras y números/);
  assert.match(passwords.validatePasswordPolicy('angelmeza2026x', { email: 'angelmeza@example.com' }), /correo/);
  assert.equal(passwords.validatePasswordPolicy('ClaveSegura2026', { email: 'ana@example.com' }), null);
  assert.equal(passwords.validatePasswordPolicy(passwords.generateTemporaryPassword()), null);
});

test('JWT_SECRET es obligatorio, largo y sin valores de ejemplo', () => {
  const original = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    delete process.env.AUTH_TOKEN_SECRET;
    assert.throws(() => security.getJwtSecret(), /no está configurado/);
    assert.throws(() => security.assertSecurityConfig(), /no está configurado/);
    process.env.JWT_SECRET = 'corto';
    assert.throws(() => security.getJwtSecret(), /al menos 32/);
    process.env.JWT_SECRET = 'diligencias-local-session-secret';
    assert.throws(() => security.getJwtSecret(), /ejemplo/);
  } finally {
    process.env.JWT_SECRET = original;
  }
});

test('login sin contraseña o sin correo responde 400', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: 'ana@example.test' });
  assert.equal(res.status, 400);
});

test('login con correo válido pero contraseña incorrecta responde 401 (ya no basta el correo)', async () => {
  const emp = await harness.addEmpleado({ correo: 'ana@example.test', password: 'ClaveSegura2026' });
  const res = await request(app).post('/api/auth/login').send({ email: emp.correo, password: 'cualquier-cosa-1' });
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
  assert.equal(res.body.token, undefined);
  assert.ok(harness.state.audit.some((a) => a.evento === 'LOGIN_FALLIDO' && a.exito === false));
});

test('correo inexistente y empleado sin contraseña dan el mismo 401 genérico', async () => {
  await harness.addEmpleado({ correo: 'sinclave@example.test', password: null });
  const a = await request(app).post('/api/auth/login').send({ email: 'noexiste@example.test', password: 'ClaveSegura2026' });
  const b = await request(app).post('/api/auth/login').send({ email: 'sinclave@example.test', password: 'ClaveSegura2026' });
  assert.equal(a.status, 401);
  assert.equal(b.status, 401);
  assert.deepEqual(a.body, b.body);
});

test('login correcto devuelve token, usuario y grupos; el token abre /auth/verify', async () => {
  const emp = await harness.addEmpleado({ correo: 'Pagos@Example.test', area: 'PAGOS', rol: 'Auxiliar de finanzas' });
  const res = await request(app).post('/api/auth/login').send({ email: 'pagos@example.test', password: 'ClaveSegura2026' });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.id_empleado, emp.id_empleado);
  assert.equal(res.body.user.id_area, 2);
  assert.deepEqual(res.body.user.grupos, ['FINANZAS']);
  assert.equal(res.body.auth_warning, undefined);
  assert.equal(JSON.stringify(res.body).includes('password_hash'), false, 'nunca se expone el hash');

  const verify = await request(app).get('/api/auth/verify').set('Authorization', `Bearer ${res.body.token}`);
  assert.equal(verify.status, 200);
  assert.equal(verify.body.user.email, 'Pagos@Example.test');
});

test('empleado inactivo no puede iniciar sesión ni usar un token previo', async () => {
  const emp = await harness.addEmpleado({ activo: false });
  const res = await request(app).post('/api/auth/login').send({ email: emp.correo, password: 'ClaveSegura2026' });
  assert.equal(res.status, 403);
  const verify = await request(app).get('/api/auth/verify').set('Authorization', `Bearer ${harness.tokenFor(emp)}`);
  assert.equal(verify.status, 403);
});

test('tokens alterados, expirados, sin firma o firmados con otro secreto se rechazan', async () => {
  const emp = await harness.addEmpleado();
  const good = harness.tokenFor(emp);
  const [payload, signature] = good.split('.');
  const forgedPayload = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload, 'base64').toString()), id_empleado: 1 }))
    .toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const crypto = require('node:crypto');
  const otherSecretSig = crypto.createHmac('sha256', 'diligencias-local-session-secret').update(payload).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const cases = {
    alterado: `${forgedPayload}.${signature}`,
    expirado: harness.tokenFor(emp, { exp: Math.floor(Date.now() / 1000) - 10 }),
    sinFirma: payload,
    otroSecreto: `${payload}.${otherSecretSig}`,
    basura: 'abc.def',
    tipoCliente: harness.tokenFor(emp, { typ: 'cliente' }),
    sinExp: harness.tokenFor(emp, { exp: undefined }),
  };
  for (const [name, token] of Object.entries(cases)) {
    const res = await request(app).get('/api/auth/verify').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 401, `${name} debe ser 401`);
  }
  const missing = await request(app).get('/api/auth/verify');
  assert.equal(missing.status, 401);
  assert.equal(missing.body.error.code, 'TOKEN_MISSING');
});

test('cambiar la contraseña revoca los tokens emitidos antes', async () => {
  const emp = await harness.addEmpleado({ correo: 'cambio@example.test' });
  const oldToken = harness.tokenFor(emp);
  const res = await request(app)
    .post('/api/auth/cambiar-password')
    .set('Authorization', `Bearer ${oldToken}`)
    .send({ password_actual: 'ClaveSegura2026', password_nueva: 'OtraClaveFuerte77' });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.ok(res.body.token);

  const withOld = await request(app).get('/api/auth/verify').set('Authorization', `Bearer ${oldToken}`);
  assert.equal(withOld.status, 401);
  assert.equal(withOld.body.error.code, 'TOKEN_REVOKED');
  const withNew = await request(app).get('/api/auth/verify').set('Authorization', `Bearer ${res.body.token}`);
  assert.equal(withNew.status, 200);

  const login = await request(app).post('/api/auth/login').send({ email: 'cambio@example.test', password: 'OtraClaveFuerte77' });
  assert.equal(login.status, 200);
});

test('cambio de contraseña valida la actual y la política', async () => {
  const emp = await harness.addEmpleado();
  const token = harness.tokenFor(emp);
  const wrong = await request(app).post('/api/auth/cambiar-password').set('Authorization', `Bearer ${token}`)
    .send({ password_actual: 'Incorrecta123', password_nueva: 'OtraClaveFuerte77' });
  assert.equal(wrong.status, 400);
  const weak = await request(app).post('/api/auth/cambiar-password').set('Authorization', `Bearer ${token}`)
    .send({ password_actual: 'ClaveSegura2026', password_nueva: 'corta' });
  assert.equal(weak.status, 400);
  assert.equal(weak.body.error.code, 'WEAK_PASSWORD');
});

test('con contraseña temporal sólo se permite consultar sesión y cambiarla', async () => {
  const emp = await harness.addEmpleado({ debe_cambiar_password: true, area: 'ADMIN' });
  const token = harness.tokenFor(emp);
  const blocked = await request(app).get('/api/clientes').set('Authorization', `Bearer ${token}`);
  assert.equal(blocked.status, 403);
  assert.equal(blocked.body.error.code, 'PASSWORD_CHANGE_REQUIRED');
  const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
  assert.equal(me.status, 200);
  assert.equal(me.body.user.debe_cambiar_password, true);
});

test('fuerza bruta: después de 8 intentos fallidos a la misma cuenta responde 429', async () => {
  const emp = await harness.addEmpleado({ correo: 'objetivo@example.test' });
  let last;
  for (let i = 0; i < 9; i += 1) {
    last = await request(app).post('/api/auth/login').send({ email: emp.correo, password: `Incorrecta${i}x` });
  }
  assert.equal(last.status, 429);
  assert.equal(last.body.error.code, 'TOO_MANY_ATTEMPTS');
});

test('registro público deshabilitado: requiere sesión', async () => {
  const res = await request(app).post('/api/auth/register').send({ email: 'x@example.test', password: 'ClaveSegura2026' });
  assert.equal(res.status, 401);
});

test('authService.verify acepta encabezado con o sin prefijo Bearer', async () => {
  const emp = await harness.addEmpleado();
  const token = harness.tokenFor(emp);
  assert.equal((await authService.verify(`Bearer ${token}`)).user.id_empleado, emp.id_empleado);
  assert.equal((await authService.verify(token)).user.id_empleado, emp.id_empleado);
});
