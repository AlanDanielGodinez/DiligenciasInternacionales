const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../src/services/perfilesEngineV2');

const template = {
  schema_version: 2,
  sections: [{
    id: 'general', label: 'General', fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, min_length: 2 },
      { key: 'age', label: 'Edad', type: 'number', min: 18, max: 99 },
      { key: 'travels', label: 'Viajó', type: 'boolean', required: true },
      { key: 'detail', label: 'Detalle', type: 'textarea', show_if: { field: 'travels', operator: 'eq', value: true }, required_if: { field: 'travels', operator: 'eq', value: true } },
      { key: 'email', label: 'Correo', type: 'email' },
      { key: 'family', label: 'Familia', type: 'repeater', min_items: 1, fields: [
        { key: 'name', label: 'Nombre familiar', type: 'text', required: true },
      ] },
    ],
  }],
};

test('evaluateCondition supports declared operators without eval', () => {
  const values = { a: 3, role: 'x', present: 'yes' };
  assert.equal(engine.evaluateCondition({ field: 'a', operator: 'gte', value: 3 }, values), true);
  assert.equal(engine.evaluateCondition({ field: 'role', operator: 'in', value: ['x', 'y'] }, values), true);
  assert.equal(engine.evaluateCondition({ field: 'missing', operator: 'not_exists' }, values), true);
  assert.equal(engine.evaluateCondition({ field: 'present', operator: 'neq', value: 'no' }, values), true);
});

test('hidden required_if does not block completion and keeps answer untouched', () => {
  const answers = { name: 'Ana', travels: false, detail: 'valor conservado' };
  const result = engine.validateProfile(template, answers, { family: [{ data: { name: 'Luis' } }] }, { complete: true });
  assert.equal(result.valid, true);
  assert.equal(answers.detail, 'valor conservado');
  assert.equal(result.completion.percentage, 100);
});

test('complete validates conditional required fields and repeater minimum', () => {
  const result = engine.validateProfile(template, { name: 'Ana', travels: true }, {}, { complete: true });
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors.map((item) => item.path), ['detail', 'family']);
});

test('draft validates provided values but permits missing required fields', () => {
  assert.equal(engine.validateProfile(template, {}, {}, { complete: false }).valid, true);
  const invalid = engine.validateProfile(template, { age: 12, email: 'bad' }, {}, { complete: false });
  assert.deepEqual(invalid.errors.map((item) => item.code), ['min', 'invalid_email']);
});

test('repeater child validation and completion are deterministic', () => {
  const result = engine.validateProfile(template, { name: 'Ana', travels: false }, { family: [{ item_uuid: 'x', data: {} }, { item_uuid: 'y', data: { name: 'Eva' } }] }, { complete: true });
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].path, 'family[0].name');
  assert.equal(result.completion.required_total, 5);
  assert.equal(result.completion.required_complete, 4);
});

test('editable_if rejects only a changed locked value and permits an unlocked change', () => {
  const editableTemplate = {
    schema_version: 2,
    sections: [{ id: 'rules', fields: [
      { key: 'enabled', type: 'boolean' },
      { key: 'locked_value', type: 'text', editable_if: { field: 'enabled', operator: 'eq', value: true } },
    ] }],
  };
  assert.deepEqual(
    engine.validateEditableChanges(editableTemplate, { enabled: false, locked_value: 'A' }, { enabled: false, locked_value: 'A' }),
    []
  );
  assert.equal(
    engine.validateEditableChanges(editableTemplate, { enabled: false, locked_value: 'A' }, { enabled: false, locked_value: 'B' })[0].code,
    'not_editable'
  );
  assert.deepEqual(
    engine.validateEditableChanges(editableTemplate, { enabled: false, locked_value: 'A' }, { enabled: true, locked_value: 'B' }),
    []
  );
});

test('time fields accept civil times and reject invalid hours', () => {
  const timeTemplate = { schema_version: 2, sections: [{ id: 'time', fields: [{ key: 'departure', type: 'time' }] }] };
  assert.equal(engine.validateProfile(timeTemplate, { departure: '23:59' }, {}, { complete: false }).valid, true);
  assert.equal(engine.validateProfile(timeTemplate, { departure: '08:30:15' }, {}, { complete: false }).valid, true);
  assert.equal(engine.validateProfile(timeTemplate, { departure: '25:00' }, {}, { complete: false }).errors[0].code, 'invalid_time');
});
