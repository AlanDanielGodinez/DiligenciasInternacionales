const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/services/documentos.service');

const configured = service.__test.DEFAULT_DOCUMENTOS_REQUERIDOS_BY_TEMPLATE.perfil_visa_individual_v3;

test('Visa Individual deja de resolver cero requisitos y CURP es obligatoria', () => {
  assert.equal(configured.length, 3);
  assert.deepEqual(configured.find((item) => item.clave === 'curp'), { clave: 'curp', nombre: 'CURP', obligatorio: true });
});

test('Respaldo y DS conservan identidad independiente dentro del mismo grupo', () => {
  const grouped = configured.filter((item) => item.grupo === 'respaldo_ds');
  assert.deepEqual(grouped.map((item) => item.clave), ['respaldo', 'ds']);
  assert.ok(grouped.every((item) => item.grupo_nombre === 'Respaldo y DS'));
  assert.ok(grouped.every((item) => item.obligatorio === false));
});

test('normalización conserva agrupación y obligatoriedad sin unir archivos', () => {
  const rows = configured.map(service.__test.normalizeDocumentoRequerido);
  assert.equal(new Set(rows.map((item) => item.clave)).size, 3);
  assert.equal(rows.filter((item) => item.obligatorio).length, 1);
  assert.equal(rows.filter((item) => item.grupo === 'respaldo_ds').length, 2);
});
