const { test } = require('node:test');
const assert = require('node:assert/strict');
const v2 = require('../src/templates/perfilAmaV2.template');
const v3 = require('../src/templates/perfilAmaV3.template');
const { evaluateCondition, calculateCompletion, validateProfile } = require('../src/services/perfilesEngineV2');

const field = (key) => v3.sections.flatMap(section => section.fields).find(item => item.key === key);

test('V3 keeps all V2 answer keys and leaves V2 unchanged', () => {
  const keys = new Set(v3.sections.flatMap(s => s.fields.map(f => f.key)));
  for (const key of v2.sections.flatMap(s => s.fields.map(f => f.key))) assert.ok(keys.has(key), key);
  assert.equal(v2.sections.flatMap(s => s.fields).filter(f => f.show_if).length, 1);
  assert.equal(v3.sections.flatMap(s => s.fields).filter(f => f.show_if).length, 83);
});

test('generic condition operators and compound rules', () => {
  assert.equal(evaluateCondition({field:'a',operator:'eq',value:'Sí'}, {a:'Sí'}), true);
  assert.equal(evaluateCondition({field:'a',operator:'eq',value:'Sí'}, {a:'No'}), false);
  assert.equal(evaluateCondition({field:'a',operator:'neq',value:'Sí'}, {a:'No'}), true);
  assert.equal(evaluateCondition({all:[{field:'a',value:'Sí'},{field:'b',value:'No'}]}, {a:'Sí',b:'No'}), true);
  assert.equal(evaluateCondition({any:[{field:'a',value:'Sí'},{field:'b',value:'No'}]}, {a:'No',b:'No'}), true);
  assert.equal(evaluateCondition({field:'a',operator:'not_exists'}, {}), true);
});

test('visa questions respond to the documented parent answer', () => {
  assert.equal(evaluateCondition(field('tipo_visa').show_if,{visa_otorgada:'No'}), false);
  assert.equal(evaluateCondition(field('tipo_visa').show_if,{visa_otorgada:'Sí'}), true);
});

test('passport, family and employment branches follow their documented parent', () => {
  for (const [key, parent] of [
    ['fecha_anio_extravio_pasaporte','pasaporte_perdido_robado'],
    ['padre_estatus_migratorio','padre_en_eeuu'],
    ['empleador_actual','cuenta_empleo_actualmente'],
    ['ocupacion_anterior','tuvo_empleo_anterior'],
  ]) {
    assert.equal(evaluateCondition(field(key).show_if,{[parent]:'No'}), false);
    assert.equal(evaluateCondition(field(key).show_if,{[parent]:'Sí'}), true);
  }
});

test('hidden chained descendants do not count even when their answers are retained', () => {
  const answers={visa_otorgada:'No',visa_perdida_robada:'Sí',visa_perdida_donde:'Guardado'};
  const before=calculateCompletion(v3,answers);
  const after=calculateCompletion(v3,{...answers,visa_perdida_donde:''});
  assert.equal(before.required_total,after.required_total);
  assert.equal(before.required_complete,after.required_complete);
  assert.equal(validateProfile(v3,answers,{}, {complete:true}).valid,true);
  assert.equal(answers.visa_perdida_donde,'Guardado');
});

test('education options reflect the documented enum', () => {
  assert.equal(field('nivel_educativo').type,'select');
  assert.ok(field('nivel_educativo').options.includes('LICENCIATURA'));
  assert.equal(evaluateCondition(field('lugar_estudio_nombre').show_if,{nivel_educativo:'LICENCIATURA'}),true);
  assert.equal(evaluateCondition(field('lugar_estudio_nombre').show_if,{nivel_educativo:'PRIMARIA'}),false);
});

test('visa denial date is LongText and follows denial without splitting legacy text', () => {
  assert.equal(field('visa_negada_fecha').type,'textarea');
  assert.equal(evaluateCondition(field('visa_negada_fecha').show_if,{visa_negada:'No'}),false);
  assert.equal(evaluateCondition(field('visa_negada_fecha').show_if,{visa_negada:'Sí'}),true);
  assert.ok(field('visa_negada_donde_cuando'));
});

test('hijos_guatemala_mexico maps to existing free-text count key', () => {
  assert.equal(field('hijos_pais_residencia').type,'textarea');
  assert.equal(evaluateCondition(field('hijos_pais_residencia').show_if,{familiares_inmediatos_eeuu:'No'}),false);
  assert.equal(evaluateCondition(field('hijos_pais_residencia').show_if,{familiares_inmediatos_eeuu:'Sí'}),true);
});

test('hospital explanation is optional and follows the documented child question', () => {
  const explanation=field('explicacion_hospital_hijo_eeuu');
  assert.equal(explanation.required,false);
  assert.equal(evaluateCondition(explanation.show_if,{tuvo_hijo_eeuu:'No'}),false);
  assert.equal(evaluateCondition(explanation.show_if,{tuvo_hijo_eeuu:'Sí'}),true);
});

test('spouse birthplace and prior employment finish retain combined legacy keys', () => {
  assert.equal(field('conyuge_lugar_nacimiento').type,'textarea');
  assert.equal(evaluateCondition(field('conyuge_lugar_nacimiento').show_if,{estado_civil:'Soltero/a'}),false);
  assert.equal(evaluateCondition(field('conyuge_lugar_nacimiento').show_if,{estado_civil:'Casado/a'}),true);
  assert.equal(field('empleo_anterior_fin').type,'textarea');
  assert.equal(evaluateCondition(field('empleo_anterior_fin').show_if,{tuvo_empleo_anterior:'No'}),false);
  assert.equal(evaluateCondition(field('empleo_anterior_fin').show_if,{tuvo_empleo_anterior:'Sí'}),true);
  assert.ok(field('conyuge_fecha_lugar_nacimiento'));
  assert.ok(field('empleo_anterior_periodo'));
});

test('family repeater follows direct-family answer and retains legacy narrative', () => {
  const group=field('familiares_eeuu');
  assert.equal(group.type,'repeater');
  assert.deepEqual(group.fields.map(item=>item.key),['apellidos','nombre','estatus','relacion','edad_ingreso_eeuu']);
  assert.equal(evaluateCondition(group.show_if,{familiares_inmediatos_eeuu:'No'}),false);
  assert.equal(evaluateCondition(group.show_if,{familiares_inmediatos_eeuu:'Sí'}),true);
  assert.ok(field('familiares_inmediatos_detalle'));
  const answers={familiares_inmediatos_eeuu:'No',familiares_inmediatos_detalle:'Texto previo'};
  const repeaters={familiares_eeuu:[{item_uuid:'historic',data:{nombre:'Conservado'}}]};
  const hidden=calculateCompletion(v3,answers,repeaters);
  const without=calculateCompletion(v3,answers,{});
  assert.equal(hidden.required_total,without.required_total);
  assert.equal(hidden.required_complete,without.required_complete);
  assert.equal(answers.familiares_inmediatos_detalle,'Texto previo');
  assert.equal(repeaters.familiares_eeuu[0].data.nombre,'Conservado');
  assert.equal(validateProfile(v3,answers,repeaters,{complete:true}).valid,true);
  const visible=calculateCompletion(v3,{...answers,familiares_inmediatos_eeuu:'Sí'},repeaters);
  assert.ok(visible.required_total>hidden.required_total);
});
