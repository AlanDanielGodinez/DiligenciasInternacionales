const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeDiscount } = require('../src/services/solicitudes.service');

test('descuento desactivado se guarda sin motivos', () => {
  assert.deepEqual(normalizeDiscount(false, []), { aplica_descuento: false, motivos_descuento: [] });
});

test('acepta discapacidad, adulto mayor y ambos sin calcular importes', () => {
  assert.deepEqual(normalizeDiscount(true, ['DISCAPACIDAD']), { aplica_descuento: true, motivos_descuento: ['DISCAPACIDAD'] });
  assert.deepEqual(normalizeDiscount(true, ['ADULTO_MAYOR']), { aplica_descuento: true, motivos_descuento: ['ADULTO_MAYOR'] });
  assert.deepEqual(normalizeDiscount(true, ['DISCAPACIDAD', 'ADULTO_MAYOR']), { aplica_descuento: true, motivos_descuento: ['DISCAPACIDAD', 'ADULTO_MAYOR'] });
});

test('rechaza motivo sin descuento, descuento sin motivo y valores ajenos', () => {
  assert.throws(() => normalizeDiscount(false, ['DISCAPACIDAD']), /requires aplica_descuento/);
  assert.throws(() => normalizeDiscount(true, []), /At least one/);
  assert.throws(() => normalizeDiscount(true, ['PORCENTAJE']), /unsupported/);
});
