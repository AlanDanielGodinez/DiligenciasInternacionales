const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const db = require('../src/config/db');
const pagos = require('../src/services/pagos.service');

const read = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');
const appSheet = read('../reports/ama-audit/Application Documentation Negados.pdf.txt');
const contactos = read('../src/services/contactos.service.js');
const clientes = read('../src/services/clientes.service.js');
const solicitudes = read('../src/services/solicitudes.service.js');
const pagosSource = read('../src/services/pagos.service.js');
const documentos = read('../src/services/documentos.service.js');
const encuestas = read('../src/services/encuestasSatisfaccion.service.js');
const quickbooks = read('../src/services/quickbooks.service.js') + read('../src/repositories/quickbooks.repository.js');

test('AppSheet source is the canonical Informes y Pagos export', () => {
  assert.match(appSheet, /INFORMES Y\s*\nPAGOS/);
  assert.match(appSheet, /appId=05b883d5-d795-4611-954e-f883b33bd36b/);
  for (const total of ['39 Tables', '965 Columns', '7 Slices', 'UX Summary 63 Views', 'Behavior Summary 120 Actions', '0 Workflow Rules']) assert.match(appSheet, new RegExp(total));
});

test('CONTACTO is the initial AppSheet entity and supports many applicants', () => {
  assert.match(appSheet, /Schema Name\s+CONTACTO_Schema/);
  assert.match(appSheet, /REF_ROWS\("INFORMES", "NOMBRE DE CONTACTO"\)/);
  assert.match(appSheet, /"IsAPartOf":true/);
});

test('INFORMES is an applicant-interest record rather than a payment ledger', () => {
  for (const field of ['ID DEL APLICANTE', 'NOMBRE DEL APLICANTE', 'NOMBRE DE CONTACTO', 'TRAMITE', 'PAGO REALIZADO', 'NOTAS DE TRAMITE']) assert.match(appSheet, new RegExp(`Column name\\s+${field}`));
  assert.doesNotMatch(appSheet.slice(appSheet.indexOf('Schema Name\tINFORMES_Schema'), appSheet.indexOf('Schema Name\t_Per User Settings_Schema')), /Column name\s+monto/i);
});

test('TRAMITES is a catalog and its concrete instance is normalized as solicitudes', () => {
  assert.match(appSheet, /Schema Name\s+TRAMITES_Schema/);
  assert.match(appSheet, /Column name\s+ID TRAMITE/);
  assert.match(solicitudes, /INSERT INTO public\.solicitudes/);
});

test('contact to applicant remains a canonical one-to-many relation', () => {
  assert.match(clientes, /INSERT INTO public\.clientes[\s\S]*id_contacto/);
  assert.match(contactos, /WHERE c\.id_contacto = \$1/);
});

test('one applicant can own multiple independent requests', () => {
  assert.match(clientes, /WHERE s\.id_cliente = \$1/);
  assert.match(solicitudes, /createSolicitudForCliente/);
  assert.doesNotMatch(solicitudes.match(/async function createSolicitudForCliente[\s\S]*?\n}/)?.[0] || '', /UPDATE public\.solicitudes/);
});

test('responsible person and area use canonical employee and area relations', () => {
  assert.match(solicitudes, /id_empleado_responsable/);
  assert.match(solicitudes, /id_area_actual/);
  assert.match(solicitudes, /async function moverSolicitudArea/);
});

test('AppSheet copy-to-area actions are represented without copying the applicant', () => {
  for (const action of ['AGREGAR HOJA A AMA', 'AGREGAR A HOJA VISA INDIVIDUALES', 'AGRAGAR A HOJA DE PASAPORTE', 'AGREGAR A HOJA DE ETA', 'ENVIAR INFOMRACION A LEGAL']) assert.match(appSheet, new RegExp(action));
  assert.match(solicitudes, /enviarSolicitudPostPago/);
});

test('payments are historical one-to-many rows with amount and evidence', () => {
  assert.match(pagosSource, /INSERT INTO public\.pagos/);
  assert.match(pagosSource, /monto,[\s\S]*moneda,[\s\S]*concepto,[\s\S]*metodo_pago,[\s\S]*referencia/);
  assert.match(pagosSource, /id_documento_comprobante/);
  assert.match(pagosSource, /WHERE p\.id_solicitud = \$1/);
});

test('payment state domains stay separate from request state', () => {
  assert.deepEqual([...new Set([pagos.__test.ESTADO_PAGO_REGISTRADO, pagos.__test.ESTADO_PAGO_VALIDADO, pagos.__test.ESTADO_PAGO_RECHAZADO])], ['registrado', 'validado', 'rechazado']);
  assert.match(pagosSource, /UPDATE public\.solicitudes[\s\S]*estado_actual/);
});

test('repeated rejected-payment validation is idempotent', async () => {
  const originalConnect = db.pool.connect;
  const sql = [];
  const client = {
    query: async (statement) => {
      sql.push(statement);
      if (/SELECT p\.\*, s\.estado_actual/.test(statement)) return { rowCount: 1, rows: [{ id_pago: 7, id_solicitud: 18, estado_pago: 'rechazado', estado_actual: 2 }] };
      if (/LEFT JOIN public\.documentos/.test(statement)) return { rowCount: 1, rows: [{ id_pago: 7, estado_pago: 'rechazado' }] };
      return { rowCount: 0, rows: [] };
    },
    release: () => {},
  };
  db.pool.connect = async () => client;
  try {
    const result = await pagos.rechazarPago(7, { validado_por: 3 });
    assert.equal(result.seguimiento, null);
    assert.equal(result.pago.estado_pago, 'rechazado');
    assert.equal(sql.filter((statement) => /INSERT INTO public\.seguimientos|UPDATE public\.pagos/.test(statement)).length, 0);
  } finally {
    db.pool.connect = originalConnect;
  }
});

test('documents and payment receipts reuse the general document entity', () => {
  assert.match(pagosSource, /INSERT INTO public\.documentos/);
  assert.match(documentos, /WHERE d\.id_solicitud = \$1/);
  assert.doesNotMatch(pagosSource, /CREATE TABLE.*comprobantes/is);
});

test('survey remains the independent client-related implementation', () => {
  assert.match(encuestas, /id_cliente/);
  assert.match(encuestas, /id_solicitud/);
  assert.doesNotMatch(solicitudes, /CREATE TABLE.*encuesta/is);
});

test('QuickBooks uses a persistent client link and duplicate-safe customer lookup', () => {
  assert.match(quickbooks, /cliente_quickbooks/);
  assert.match(quickbooks, /quickbooks_customer_id/);
  assert.match(quickbooks, /findCustomerByDisplayName/);
  assert.match(quickbooks, /withClientSyncLock/);
});

test('AppSheet QuickBooks behavior is documented only as an opaque process output', () => {
  assert.match(appSheet, /Process for QBKS_INF - 1 Process Table/);
  assert.match(appSheet, /QBKS Output/);
  assert.doesNotMatch(appSheet, /quickbooks_customer_id|SyncToken|realm_id/);
});

test('AppSheet history records registration and payment while the new history is richer', () => {
  assert.match(appSheet, /"REGISTRO DE APLICANTE","PAGO DE[\s\S]*TRAMITE"/);
  assert.match(solicitudes + pagosSource, /seguimientos/);
});

test('all seven AppSheet payment slices remain auditable as filters', () => {
  for (const name of ['Falta de pago inicial', 'Falta de pago completo visa individual', 'Cobro pendiente Ama', 'PENDEINTES DE PAGO LEGAL', 'Cobro pendiente Visa Canadá', 'Falta de pago inicial informes', 'Cobro pendiente de pasaporte Americano']) assert.match(appSheet, new RegExp(`Slice Name ${name}`));
});

test('physical deletion remains deliberately unavailable in the canonical services', () => {
  assert.match(appSheet, /Action name\s+Delete/);
  assert.doesNotMatch(contactos + clientes + solicitudes + pagosSource, /DELETE FROM public\.(contacto|clientes|solicitudes|pagos)/);
});

test('the export has no documented workflow rules or sufficient fiscal module', () => {
  assert.match(appSheet, /0 Workflow Rules/);
  assert.doesNotMatch(appSheet, /Column name\s+(RFC|razon social|estado de factura)/i);
});
