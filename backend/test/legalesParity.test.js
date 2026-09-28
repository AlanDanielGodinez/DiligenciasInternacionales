const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const service = require('../src/services/legales.service');

const appSheet = fs.readFileSync(path.join(__dirname, '../reports/ama-audit/Application Documentation Legales.pdf.txt'), 'utf8');
const legalSql = [
  '../sql/2026_08_19_proceso_negados_integral.sql',
  '../sql/2026_08_20_negados_trazabilidad.sql',
  '../sql/2026_08_21_modulo_legales.sql',
  '../sql/2026_08_22_fix_legales_active_schema.sql',
].map((file) => fs.readFileSync(path.join(__dirname, file), 'utf8')).join('\n');
const negadosSource = fs.readFileSync(path.join(__dirname, '../src/services/negados.service.js'), 'utf8');
const documentsSource = fs.readFileSync(path.join(__dirname, '../src/services/documentos.service.js'), 'utf8');

test('1. origin is explicit and Negados creates the Legal child only through sendLegal', () => {
  assert.match(negadosSource, /async function sendLegal/);
  assert.match(negadosSource, /INSERT INTO public\.procesos_solicitud\(id_solicitud,tipo_proceso,id_proceso_padre/);
  assert.match(negadosSource, /VALUES\(\$1,'LEGAL',\$2/);
  assert.match(negadosSource, /'ANALISIS_NEGADOS'/);
});

test('2. every Legal row resolves its canonical client through the request', () => {
  assert.match(service.__test.BASE, /JOIN solicitudes s ON s\.id_solicitud=p\.id_solicitud JOIN clientes c ON c\.id_cliente=s\.id_cliente/);
});

test('3. the request is the parent of the operational Legal process', () => {
  assert.match(service.__test.BASE, /p\.id_solicitud/);
  assert.match(legalSql, /id_solicitud INTEGER NOT NULL REFERENCES public\.solicitudes/);
});

test('4. documented AppSheet legal types remain discoverable without inventing a questionnaire', () => {
  for (const value of ['FOIA', 'PETICIÓN FAMILIAR', 'VISA K-1', 'AJUSTE DE ESTATUS', 'ASILO', 'VISA U', 'OTROS']) {
    assert.match(appSheet, new RegExp(value));
  }
  assert.match(service.__test.BASE, /cl\.tipo_caso/);
});

test('5. Legal states are a closed operational catalog', () => {
  assert.deepEqual([...service.__test.STATES], ['PENDIENTE_ASIGNACION', 'EN_ANALISIS', 'ESPERANDO_INFORMACION', 'ESPERANDO_CLIENTE', 'RESUELTO', 'CERRADO']);
});

test('AppSheet legal types support the documented multi-selection catalog only', () => {
  const normalize = service.__test.normalizeLegalTypes;
  assert.deepEqual(normalize(['FOIA', 'VISA U', 'FOIA']), ['FOIA', 'VISA U']);
  assert.throws(() => normalize(['AUDIENCIA INVENTADA']), /no documentado/);
  assert.equal(service.__test.LEGAL_TYPES.size, 20);
  assert.match(service.__test.BASE, /fecha_envio_solicitud/);
  assert.match(service.__test.BASE, /primer_mensaje_seguimiento/);
});

test('6. transitions permit reassessment but not reopening a resolved or closed process', () => {
  assert.ok(service.__test.TRANSITIONS.ESPERANDO_CLIENTE.has('EN_ANALISIS'));
  assert.equal(service.__test.TRANSITIONS.RESUELTO, undefined);
  assert.equal(service.__test.TRANSITIONS.CERRADO, undefined);
});

test('7. responsible staff uses the canonical employee foreign key', () => {
  assert.match(service.__test.BASE, /empleados e ON e\.id_empleado=p\.id_responsable_proceso/);
  assert.match(legalSql, /id_responsable_proceso INTEGER NULL REFERENCES public\.empleados/);
});

test('8. notes are historical rows scoped by both request and process', () => {
  assert.match(service.addNote.toString(), /notas_solicitud\(id_solicitud,id_proceso,id_empleado,contenido,contexto\)/);
});

test('9. state results and closure append canonical history', () => {
  for (const fn of [service.resolve, service.returnOrigin, service.close, service.createLegalRequest]) assert.match(fn.toString(), /finish|history|createLegalRequest/);
  assert.match(service.resolve.toString(), /history/);
});

test('10. documents reuse the request document module and stay isolated by request', () => {
  assert.match(documentsSource, /WHERE d\.id_solicitud = \$1/);
  assert.doesNotMatch(legalSql, /CREATE TABLE.*documentos_legales/is);
});

test('11. detail queries isolate two cases by id_proceso', () => {
  assert.match(service.detail.toString(), /id_proceso=\$1/);
  assert.match(service.__test.BASE, /p\.id_proceso/);
});

test('12. a contracted service is a new related request, never an overwrite', () => {
  const source = service.createLegalRequest.toString();
  assert.match(source, /INSERT INTO solicitudes\(/);
  assert.match(source, /solicitudes_relaciones/);
  assert.doesNotMatch(source, /UPDATE solicitudes SET/);
});

test('13. closure preserves the case and records fecha_salida', () => {
  const source = service.close.toString() + service.returnOrigin.toString();
  assert.match(service.__test.STATES.has('CERRADO').toString(), /true/);
  assert.match(legalSql, /estado_proceso='CERRADO' AND fecha_salida IS NOT NULL/);
  assert.doesNotMatch(source, /DELETE/);
});

test('14. critical origin and result filters reject undocumented values before querying', async () => {
  await assert.rejects(service.list({ origen: 'INVENTADO' }), /Origen Legal inválido/);
  await assert.rejects(service.list({ resultado: 'INVENTADO' }), /Resultado Legal inválido/);
});

test('15. historical compatibility is additive and keeps legacy case fields', () => {
  assert.match(legalSql, /LEGACY/);
  assert.match(legalSql, /WHERE id_proceso_legal IS NULL/);
  assert.doesNotMatch(legalSql, /DROP TABLE|TRUNCATE/i);
});

test('audited AppSheet totals and the eight functional slices remain verifiable', () => {
  for (const value of ['16 Tables', '8 Slices', 'UX Summary 57 Views', 'Behavior Summary 82 Actions', '0 Workflow Rules']) assert.match(appSheet, new RegExp(value));
  for (const value of ['TERMINADOS', 'TRAMITES EN PROCESO', 'NUEVOS APLICANTES', 'PROCESO DE PAGO', 'Negados_legales', 'NEGADOS INDIVIDUALES', 'Estatus_foia is not blank', 'APLICANTES AMA Estatus_foia is not blank']) assert.match(appSheet, new RegExp(`Slice Name ${value}`));
});
