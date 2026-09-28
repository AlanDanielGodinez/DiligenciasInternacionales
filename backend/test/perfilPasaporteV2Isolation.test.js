const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPassportTemplate } = require('../src/templates/perfilPasaporteV2.template');
const template = buildPassportTemplate('México');
const dbModule = require.resolve('../src/config/db');
const seen = [];
require.cache[dbModule] = { exports: { pool: { query: async (sql, params) => {
  if (sql.includes('FROM public.perfiles_solicitud ps')) {
    seen.push(params[0]);
    return { rows: [{ id_perfil: 500 + params[0], id_solicitud: params[0], id_cliente: 9,
      respuestas_json: { numero_identificacion_principal: `solicitud-${params[0]}` }, estructura_json: template }] };
  }
  if (sql.includes('FROM public.perfil_respuestas_repetibles')) return { rows: [] };
  throw new Error('Unexpected query');
} } } };
const { getPerfilBySolicitud } = require('../src/services/perfiles.service');

test('two passport requests for one applicant load different profiles', async () => {
  const first = await getPerfilBySolicitud(1);
  const second = await getPerfilBySolicitud(2);
  assert.deepEqual(seen, [1, 2]);
  assert.equal(first.id_cliente, second.id_cliente);
  assert.notEqual(first.id_perfil, second.id_perfil);
  assert.notEqual(first.respuestas_json.numero_identificacion_principal, second.respuestas_json.numero_identificacion_principal);
});
