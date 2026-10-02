/**
 * Integración con PostgreSQL real (cluster local de pruebas, igual que amaActividad.test.js).
 * Valida la migración sql/2026_10_02_auth_credenciales.sql, el login y las consultas SQL de
 * acceso a expedientes/documentos. Se omite si el cluster de pruebas no está disponible.
 *   initdb -U ama_test --auth=trust && pg_ctl -o "-p 55439" start
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Pool, Client } = require('pg');

process.env.JWT_SECRET = 'test-secret-only-for-node-test-0123456789abcdef';
const config = { host: '127.0.0.1', port: 55439, user: 'ama_test', database: `auth_test_${Date.now()}` };
const pool = new Pool(config);
require.cache[require.resolve('../src/config/db')] = { exports: { pool } };

let available = true;
let request; let app; let authService; let access;

before(async () => {
  try {
    const admin = new Client({ ...config, database: 'postgres', connectionTimeoutMillis: 1500 });
    await admin.connect();
    await admin.query(`CREATE DATABASE ${config.database}`);
    await admin.end();
  } catch (_) {
    available = false;
    return;
  }
  await pool.query(`
    CREATE TABLE empleados(id_empleado int PRIMARY KEY, nombre text, apellidos text, correo text, area text, rol text, activo boolean DEFAULT true);
    CREATE TABLE solicitudes(id_solicitud int PRIMARY KEY, id_cliente int, id_empleado_responsable int);
    CREATE TABLE documentos(id_documento int PRIMARY KEY, id_solicitud int, id_cliente int, nombre_documento text, drive_file_id text,
      mime_type text, url_archivo text, web_view_link text, web_content_link text, clave_documento_requerido text, origen_documento text);
    CREATE TABLE pagos(id_pago int PRIMARY KEY, id_solicitud int, id_documento_comprobante int);
  `);
  await pool.query(fs.readFileSync(path.join(__dirname, '../sql/2026_06_18_catalogo_areas_solicitudes_area.sql'), 'utf8'));
  // Se aplica dos veces para comprobar que es idempotente.
  const migration = fs.readFileSync(path.join(__dirname, '../sql/2026_10_02_auth_credenciales.sql'), 'utf8');
  await pool.query(migration);
  await pool.query(migration);
  await pool.query(`
    INSERT INTO empleados VALUES
      (1,'Ana','Informes','ana@example.test','Informes','Coordinador de Informes',true),
      (2,'Pepe','Pagos','pepe@example.test','Finanzas / Pagos','Auxiliar de finanzas',true),
      (3,'Lalo','Logistica','lalo@example.test','Logística','Vuelos',true),
      (4,'Root','Admin','root@example.test','Administración','Administrador',true),
      (5,'Ines','Individuales','ines@example.test','Individuales','Asesor',true);
    INSERT INTO solicitudes(id_solicitud,id_cliente,id_area_actual,id_empleado_responsable) VALUES
      (10,100,1,NULL),   -- en Informes
      (20,200,3,3),      -- en Individuales, responsable Lalo (otra área)
      (30,300,4,NULL);   -- en AMA
    INSERT INTO documentos(id_documento,id_solicitud,id_cliente,nombre_documento) VALUES
      (1000,10,100,'pasaporte'),(2000,20,200,'ine'),(3000,30,300,'comprobante'),(4000,NULL,100,'acta sin expediente');
    INSERT INTO pagos VALUES (1,30,3000);
  `);
  request = require('supertest');
  app = require('../src/app');
  authService = require('../src/services/auth.service');
  access = require('../src/security/expedienteAccess');
});

after(async () => {
  await pool.end().catch(() => null);
  if (!available) return;
  const admin = new Client({ ...config, database: 'postgres' });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS ${config.database}`);
  await admin.end();
});

const skip = (t) => { if (!available) { t.skip('cluster PostgreSQL de pruebas no disponible'); return true; } return false; };

test('migración: columnas, índice único de correo y tabla de auditoría', async (t) => {
  if (skip(t)) return;
  const cols = (await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='empleados'`)).rows.map((r) => r.column_name);
  for (const c of ['password_hash', 'password_actualizado_en', 'debe_cambiar_password', 'ultimo_login_en']) assert.ok(cols.includes(c), c);
  await assert.rejects(pool.query(`INSERT INTO empleados(id_empleado,correo) VALUES (99,'ANA@example.test')`), /duplicate key/);
  const audit = await pool.query(`SELECT to_regclass('public.auditoria_accesos') AS t`);
  assert.equal(audit.rows[0].t, 'auditoria_accesos');
});

test('sin contraseña asignada nadie entra; con contraseña asignada sí, y queda en bitácora', async (t) => {
  if (skip(t)) return;
  const before = await request(app).post('/api/auth/login').send({ email: 'ana@example.test', password: 'ClaveSegura2026' });
  assert.equal(before.status, 401);
  await authService.setPassword(1, 'ClaveSegura2026', { mustChange: false });
  const ok = await request(app).post('/api/auth/login').send({ email: 'ANA@example.test', password: 'ClaveSegura2026' });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.user.id_area, 1);
  const bad = await request(app).post('/api/auth/login').send({ email: 'ana@example.test', password: 'Equivocada2026' });
  assert.equal(bad.status, 401);
  await new Promise((r) => setTimeout(r, 50));
  const events = (await pool.query(`SELECT evento, exito FROM auditoria_accesos ORDER BY id_auditoria`)).rows;
  assert.ok(events.some((e) => e.evento === 'LOGIN_OK' && e.exito));
  assert.ok(events.some((e) => e.evento === 'LOGIN_FALLIDO' && !e.exito));
  const pwd = (await pool.query(`SELECT password_hash FROM empleados WHERE id_empleado=1`)).rows[0].password_hash;
  assert.match(pwd, /^scrypt\$/);
  assert.equal(pwd.includes('ClaveSegura2026'), false);
});

test('contraseña temporal: obliga a cambiarla y el cambio revoca el token anterior', async (t) => {
  if (skip(t)) return;
  await authService.setPassword(5, 'Temporal12345', { mustChange: true });
  const login = await request(app).post('/api/auth/login').send({ email: 'ines@example.test', password: 'Temporal12345' });
  assert.equal(login.status, 200);
  assert.equal(login.body.debe_cambiar_password, true);
  const blocked = await request(app).get('/api/clientes').set('Authorization', `Bearer ${login.body.token}`);
  assert.equal(blocked.status, 403);
  const changed = await request(app).post('/api/auth/cambiar-password').set('Authorization', `Bearer ${login.body.token}`)
    .send({ password_actual: 'Temporal12345', password_nueva: 'DefinitivaSegura99' });
  assert.equal(changed.status, 200, JSON.stringify(changed.body));
  assert.equal(changed.body.user.debe_cambiar_password, false);
  const old = await request(app).get('/api/auth/verify').set('Authorization', `Bearer ${login.body.token}`);
  assert.equal(old.status, 401);
});

const user = async (id) => (await authService.verify(`Bearer ${authService.__test.sign({
  typ: 'empleado', id_empleado: id,
  pwv: authService.__test.passwordVersion((await pool.query('SELECT password_actualizado_en FROM empleados WHERE id_empleado=$1', [id])).rows[0]),
  exp: Math.floor(Date.now() / 1000) + 600,
})}`)).user;

test('SQL de acceso a expedientes: área actual, responsable y administrador', async (t) => {
  if (skip(t)) return;
  for (const id of [2, 3, 4]) await authService.setPassword(id, 'ClaveSegura2026');
  await pool.query('UPDATE empleados SET debe_cambiar_password=false');
  const [ana, pepe, lalo, root] = [await user(1), await user(2), await user(3), await user(4)];
  assert.equal(await access.canAccessSolicitud(ana, 10), true, 'Informes ve expediente en Informes');
  assert.equal(await access.canAccessSolicitud(ana, 20), false, 'Informes no ve expediente en Individuales');
  assert.equal(await access.canAccessSolicitud(lalo, 20), true, 'responsable lo ve aunque sea de otra área');
  assert.equal(await access.canAccessSolicitud(pepe, 10), false);
  assert.equal(await access.canAccessSolicitud(root, 30), true, 'admin ve todo');
});

test('SQL de acceso a documentos: incluye comprobantes para Finanzas y documentos sin expediente del mismo cliente', async (t) => {
  if (skip(t)) return;
  const [ana, pepe, lalo, root] = [await user(1), await user(2), await user(3), await user(4)];
  assert.equal(await access.canAccessDocumento(ana, 1000), true);
  assert.equal(await access.canAccessDocumento(ana, 2000), false);
  assert.equal(await access.canAccessDocumento(ana, 4000), true, 'documento del cliente 100 cuyo expediente está en Informes');
  assert.equal(await access.canAccessDocumento(lalo, 4000), false);
  assert.equal(await access.canAccessDocumento(pepe, 3000), true, 'Finanzas lee el comprobante de pago');
  assert.equal(await access.canAccessDocumento(pepe, 1000), false, 'pero no otros documentos');
  assert.equal(await access.canAccessDocumento(root, 2000), true);
  assert.equal(await access.canAccessDocumento(ana, 999999), false, 'documento inexistente');
});

test('descarga HTTP real: 401 sin sesión, 403 de otra área, y pasa el control para el área correcta', async (t) => {
  if (skip(t)) return;
  const anon = await request(app).get('/api/documentos/1000/descargar');
  assert.equal(anon.status, 401);
  const login = async (email) => (await request(app).post('/api/auth/login').send({ email, password: 'ClaveSegura2026' })).body.token;
  const lalo = await login('lalo@example.test');
  const denied = await request(app).get('/api/documentos/1000/descargar').set('Authorization', `Bearer ${lalo}`);
  assert.equal(denied.status, 403);
  const ana = await login('ana@example.test');
  const allowed = await request(app).get('/api/documentos/1000/descargar').set('Authorization', `Bearer ${ana}`);
  assert.equal(allowed.status, 400, 'pasa el acceso; el documento de prueba no tiene archivo en Drive');
  await new Promise((r) => setTimeout(r, 50));
  const events = (await pool.query(`SELECT evento FROM auditoria_accesos WHERE recurso='documento:1000'`)).rows.map((r) => r.evento);
  assert.ok(events.includes('DOCUMENTO_DESCARGA_DENEGADA'));
});
