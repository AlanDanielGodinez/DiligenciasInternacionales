const test = require('node:test');
const assert = require('node:assert/strict');
const template = require('../src/templates/perfilVisaIndividualV3.template');

const dbModule = require.resolve('../src/config/db');
const seen = [];
require.cache[dbModule] = { exports: { pool: { query: async (sql, params) => {
  if (sql.includes('FROM public.perfiles_solicitud ps')) {
    assert.match(sql, /WHERE ps\.id_solicitud = \$1/);
    seen.push(params[0]);
    return { rows: [{ id_perfil: 100 + params[0], id_solicitud: params[0], id_cliente: 7,
      respuestas_json: { expediente: `solicitud-${params[0]}` }, estructura_json: template }] };
  }
  if (sql.includes('FROM public.perfil_respuestas_repetibles')) return { rows: [] };
  throw new Error('Unexpected query');
} } } };
const { getPerfilBySolicitud } = require('../src/services/perfiles.service');

test('two requests for the same applicant retrieve distinct profiles by solicitud', async () => {
  const first = await getPerfilBySolicitud(1);
  const second = await getPerfilBySolicitud(2);
  assert.deepEqual(seen, [1, 2]);
  assert.equal(first.id_cliente, second.id_cliente);
  assert.notEqual(first.id_perfil, second.id_perfil);
  assert.equal(first.respuestas_json.expediente, 'solicitud-1');
  assert.equal(second.respuestas_json.expediente, 'solicitud-2');
});
