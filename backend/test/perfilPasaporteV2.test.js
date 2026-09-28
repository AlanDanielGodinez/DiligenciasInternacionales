const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPassportTemplate, FIELD_DEFINITIONS, VIRTUAL_COLUMNS } = require('../src/templates/perfilPasaporteV2.template');
const { validateProfile, calculateCompletion, isFieldVisible } = require('../src/services/perfilesEngineV2');

const all = template => template.sections.flatMap(section => section.fields);
const byKey = template => new Map(all(template).map(field => [field.key, field]));

test('audit contract represents all capture and virtual columns', () => {
  assert.equal(FIELD_DEFINITIONS.length, 75);
  assert.equal(FIELD_DEFINITIONS.filter(field => field.operational).length, 1);
  assert.equal(VIRTUAL_COLUMNS.length, 11);
  assert.equal(FIELD_DEFINITIONS.filter(field => field.source_show_if).length + VIRTUAL_COLUMNS.filter(field => field.show_if).length, 64);
  assert.equal(VIRTUAL_COLUMNS.filter(field => field.classification === 'reference_auxiliary').length, 1);
  assert.equal(VIRTUAL_COLUMNS.filter(field => field.classification === 'section_navigation').length, 10);
});

test('country templates contain only documented applicable fields', () => {
  const mexico = byKey(buildPassportTemplate('México'));
  const guatemala = byKey(buildPassportTemplate('Guatemala'));
  const usa = byKey(buildPassportTemplate('Estados Unidos'));
  assert.equal(mexico.has('folio_acta_nacimiento'), true);
  assert.equal(mexico.has('idioma_hablado'), false);
  assert.equal(guatemala.has('idioma_hablado'), true);
  assert.equal(guatemala.has('numero_boleta'), true);
  assert.equal(usa.has('nombre_padre'), true);
  assert.equal(usa.has('contacto_usa_nombre'), true);
  assert.equal(usa.has('contrasena'), false);
});

test('passport type is the only closed AppSheet enum', () => {
  const template = buildPassportTemplate('Guatemala');
  const field = byKey(template).get('tipo_pasaporte');
  assert.equal(field.type, 'select');
  assert.equal(field.options.length, 6);
  assert.equal(validateProfile(template, { tipo_pasaporte: 'Inventado' }, {}, { complete: false }).errors.some(error => error.code === 'invalid_option'), true);
});

test('dates, email, postal code and textual historical passport dates keep documented types', () => {
  const mexico = byKey(buildPassportTemplate('México'));
  const usa = byKey(buildPassportTemplate('Estados Unidos'));
  assert.equal(mexico.get('fecha_nacimiento').type, 'date');
  assert.equal(mexico.get('correo_electronico').type, 'email');
  assert.equal(mexico.get('codigo_postal').type, 'text');
  assert.equal(usa.get('fecha_emision_pasaporte_anterior').type, 'text');
  assert.equal(usa.get('fecha_matrimonio').type, 'date');
});

test('US delivery address follows the documented chained condition', () => {
  const template = buildPassportTemplate('Estados Unidos');
  const fields = byKey(template);
  const address = fields.get('envio_pasaporte_calle_numero');
  assert.equal(isFieldVisible(address, { pasaporte_envio_misma_direccion: 'NO' }, fields), false);
  assert.equal(isFieldVisible(address, { pasaporte_envio_misma_direccion: 'YES' }, fields), true);
});

test('hidden delivery values are retained and excluded from completion', () => {
  const template = buildPassportTemplate('Estados Unidos');
  const retained = { pasaporte_envio_misma_direccion: 'NO', envio_pasaporte_calle_numero: 'Guardado' };
  const empty = { pasaporte_envio_misma_direccion: 'NO', envio_pasaporte_calle_numero: '' };
  assert.deepEqual(calculateCompletion(template, retained, {}), calculateCompletion(template, empty, {}));
  assert.equal(retained.envio_pasaporte_calle_numero, 'Guardado');
});

test('the schema has no invented required fields or repeaters', () => {
  for (const country of ['México','Guatemala','Estados Unidos']) {
    const fields = all(buildPassportTemplate(country));
    assert.equal(fields.some(field => field.required || field.required_if), false);
    assert.equal(fields.some(field => field.type === 'repeater'), false);
  }
});

test('passport answers survive JSON save and reload', () => {
  const template = buildPassportTemplate('Guatemala');
  const saved = JSON.stringify({ correo_electronico: 'persona@example.com', fecha_nacimiento: '2000-01-02', numero_boleta: '00123' });
  const reloaded = JSON.parse(saved);
  assert.equal(validateProfile(template, reloaded, {}, { complete: false }).valid, true);
  assert.equal(reloaded.numero_boleta, '00123');
});
