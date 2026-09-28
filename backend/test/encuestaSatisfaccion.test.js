const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const definition = require('../src/surveys/satisfactionSurvey.definition');
const service = require('../src/services/encuestasSatisfaccion.service');

test('definition contains the nine visible AppSheet capture fields', () => {
  assert.equal(definition.SATISFACTION_SURVEY_FIELDS.length, 9);
});
test('five satisfaction scores preserve the exact 1 to 5 scale', () => {
  const fields = definition.SATISFACTION_SURVEY_FIELDS.filter((field) => field.type === 'scale' && field.key !== 'probabilidad_recomendacion');
  assert.equal(fields.length, 5); fields.forEach((field) => assert.deepEqual([field.min, field.max], [1, 5]));
});
test('recommendation preserves the AppSheet 0 to 10 scale', () => {
  const field = definition.SATISFACTION_SURVEY_FIELDS.find((item) => item.key === 'probabilidad_recomendacion');
  assert.deepEqual([field.min, field.max], [0, 10]);
});
test('result enum is closed to the two AppSheet values', () => {
  assert.deepEqual(definition.SATISFACTION_SURVEY_FIELDS.find((field) => field.key === 'aprobado_negado').options, ['Negado', 'Aprobado']);
});
test('all AppSheet answers remain optional', () => {
  assert.ok(definition.SATISFACTION_SURVEY_FIELDS.every((field) => !field.required));
  assert.equal(service.normalizePayload({}).satisfaccion_general, null);
});
test('backend rejects scores outside the documented range', () => {
  assert.throws(() => service.normalizePayload({ satisfaccion_general: 0 }), /between 1 and 5/);
  assert.throws(() => service.normalizePayload({ probabilidad_recomendacion: 11 }), /between 0 and 10/);
});
test('backend rejects undocumented result values', () => {
  assert.throws(() => service.normalizePayload({ aprobado_negado: 'Pendiente' }), /Negado or Aprobado/);
});
test('parent check accepts a request owned by the applicant', async () => {
  const calls = [];
  await service.assertParent(7, 11, async (sql, params) => { calls.push(params); return { rows: sql.includes('clientes') ? [{ id_cliente: 7 }] : [{ id_solicitud: 11 }] }; });
  assert.deepEqual(calls, [[7], [11, 7]]);
});
test('parent check blocks a request owned by another applicant', async () => {
  await assert.rejects(service.assertParent(7, 12, async (sql) => ({ rows: sql.includes('clientes') ? [{ id_cliente: 7 }] : [] })), /no pertenece/);
});
test('lookup isolation includes both applicant and survey identifiers', async () => {
  let captured;
  await service.getByIdForCliente(7, 22, async (sql, params) => { captured = { sql, params }; return { rows: [] }; });
  assert.match(captured.sql, /es\.id_cliente=\$1 AND es\.id_encuesta=\$2/);
  assert.deepEqual(captured.params, [7, 22]);
});
test('SQL is additive, historical and does not impose one survey per parent', () => {
  const sql = fs.readFileSync(path.join(__dirname, '../sql/2026_09_22_encuestas_satisfaccion.sql'), 'utf8');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS/);
  assert.match(sql, /id_cliente/);
  assert.doesNotMatch(sql, /DROP\s/i);
  assert.doesNotMatch(sql, /UNIQUE\s*\(\s*id_(?:cliente|solicitud)/i);
});
