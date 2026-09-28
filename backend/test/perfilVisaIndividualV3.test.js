const test = require('node:test');
const assert = require('node:assert/strict');
const v2 = require('../src/templates/perfilVisaIndividualV2.template');
const v3 = require('../src/templates/perfilVisaIndividualV3.template');
const { validateProfile, calculateCompletion, isFieldVisible } = require('../src/services/perfilesEngineV2');

const fields = template => template.sections.flatMap(section => section.fields);
const field = key => fields(v3).find(item => item.key === key);
const visible = (key, answers) => isFieldVisible(field(key), answers, new Map(fields(v3).map(item => [item.key, item])));

test('V3 preserves V2 keys and related group shapes without modifying V2', () => {
  assert.deepEqual(fields(v3).map(item => item.key), fields(v2).map(item => item.key));
  assert.equal(fields(v3).filter(item => item.show_if).length, 93);
  assert.equal(fields(v3).filter(item => item.required_if).length, 0);
  assert.equal(fields(v3).filter(item => item.required).length, 0);
  assert.equal(fields(v2).filter(item => item.required_if).length, 90);
  assert.deepEqual(fields(v3).filter(item => item.type === 'repeater').map(item => item.key), [
    'ingresos_estados_unidos', 'redes_sociales_detalle', 'familiares_eeuu',
  ]);
  for (const group of fields(v3).filter(item => item.type === 'repeater')) {
    assert.equal(group.min_items, undefined);
    assert.equal(group.fields.some(child => child.required), false);
  }
});

test('V3 answers and custom repeater values survive a storage JSON round trip', () => {
  const stored = JSON.stringify({
    answers: { redes_sociales: true, codigo_postal: '01234' },
    repeaters: { redes_sociales_detalle: [{ item_uuid: 'draft', data: { red_social: 'TikTok', nombre_usuario: '@persona' } }] },
  });
  const reloaded = JSON.parse(stored);
  assert.equal(reloaded.answers.codigo_postal, '01234');
  assert.equal(reloaded.repeaters.redes_sociales_detalle[0].data.red_social, 'TikTok');
  assert.equal(validateProfile(v3, reloaded.answers, reloaded.repeaters, { complete: false }).valid, true);
});

test('documented AppSheet types replace restrictive V2 controls for new profiles', () => {
  assert.equal(field('duracion').type, 'text');
  assert.equal(field('codigo_postal').type, 'text');
  assert.equal(field('correo_electronico_del_contacto').type, 'text');
  assert.equal(field('numero_de_telefono_de_quien_pagaria_por_su_viaje').type, 'text');
  assert.equal(field('correo_electronico_quien_pagaria_por_su_viaje').type, 'email');
});

test('postal codes and durations preserve their textual representation', () => {
  const answers = { codigo_postal: '01234-A', duracion: '2 semanas' };
  const result = validateProfile(v3, answers, {}, { complete: false });
  assert.equal(result.valid, true);
  assert.equal(answers.codigo_postal, '01234-A');
  assert.equal(answers.duracion, '2 semanas');
});

test('identity, payer and prior travel branches follow current answers', () => {
  assert.equal(visible('cual_fue_su_otro_nombre', {ha_usado_otro_nombre_o_lo_ha_modificado:false}), false);
  assert.equal(visible('cual_fue_su_otro_nombre', {ha_usado_otro_nombre_o_lo_ha_modificado:true}), true);
  assert.equal(visible('quien_pagaria_su_viaje', {usted_pagara_por_su_viaje:true}), false);
  assert.equal(visible('quien_pagaria_su_viaje', {usted_pagara_por_su_viaje:false}), true);
  assert.equal(visible('ingresos_estados_unidos', {ha_entrado_a_estados_unidos:false}), false);
  assert.equal(visible('ingresos_estados_unidos', {ha_entrado_a_estados_unidos:true}), true);
});

test('visa, denial and loss chains hide descendants with retained answers', () => {
  const answers={alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua:false,
    alguna_vez_ha_perdido_su_visa_o_ha_sido_robada:true,donde_fue_robada:'Guardado'};
  assert.equal(visible('donde_fue_robada', answers), false);
  assert.equal(visible('donde_fue_robada', {...answers,alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua:true}), true);
  assert.equal(visible('cuando_le_fue_negada_su_visa', {alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua:false}), false);
  assert.equal(visible('cuando_le_fue_negada_su_visa', {alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua:true}), true);
  const withHidden=calculateCompletion(v3,answers,{});
  const withoutHidden=calculateCompletion(v3,{...answers,donde_fue_robada:''},{});
  assert.deepEqual(withHidden,withoutHidden);
  assert.equal(answers.donde_fue_robada,'Guardado');
});

test('family, social and entry repeaters accept multiple records without inferred minimums', () => {
  const answers={ha_entrado_a_estados_unidos:true,redes_sociales:true,tiene_familiares_directos_en_estados_unidos:true};
  assert.equal(validateProfile(v3,answers,{}, {complete:true}).valid,true);
  const repeaters={
    ingresos_estados_unidos:[{data:{fecha_ingreso:'2020',duracion:2,tiempo:'Días'}},{data:{fecha_ingreso:'2021',duracion:1,tiempo:'Meses'}}],
    redes_sociales_detalle:[{data:{red_social:'Facebook',nombre_usuario:'uno'}},{data:{red_social:'X',nombre_usuario:'dos'}}],
    familiares_eeuu:[{data:{apellidos:'Uno',nombre:'A',estatus:'Residente',relacion:'Hermano'}},{data:{apellidos:'Dos',nombre:'B',estatus:'Ciudadano',relacion:'Hijo'}}],
  };
  assert.equal(validateProfile(v3,answers,repeaters,{complete:true}).valid,true);
  assert.ok(calculateCompletion(v3,answers,repeaters).required_complete > calculateCompletion(v3,answers,{}).required_complete);
  const custom={...repeaters,redes_sociales_detalle:[{data:{red_social:'Nueva red',nombre_usuario:'usuario'}}]};
  assert.equal(validateProfile(v3,answers,custom,{complete:true}).valid,true);
  assert.equal(validateProfile(v2,answers,custom,{complete:true}).errors.some(error=>error.code==='invalid_option'),true);
});

test('employment, education and optional Enum values retain documented visibility', () => {
  assert.equal(visible('empleador', {cuenta_con_empleo_actualmente:'No'}), false);
  assert.equal(visible('empleador', {cuenta_con_empleo_actualmente:'Estudiante'}), true);
  assert.equal(visible('ocupacion_anterior', {anteriormente_tuvo_algun_empleo:false}), false);
  assert.equal(visible('ocupacion_anterior', {anteriormente_tuvo_algun_empleo:true}), true);
  assert.equal(visible('nombre_de_la_escuela', {tuvo_estudios:false}), false);
  assert.equal(visible('nombre_de_la_escuela', {tuvo_estudios:true}), true);
  assert.deepEqual(field('cuenta_con_empleo_actualmente').options,['Sí','No','Ama de casa','Estudiante']);
  assert.equal(field('cuales').type,'multiselect');
  assert.equal(field('cuales').allow_custom_value,true);
  assert.equal(field('que_idioma_habla').allow_custom_value,true);
  assert.equal(field('conuslados_a_donde_puede_ir').allow_custom_value,true);
  assert.equal(validateProfile(v3,{que_idioma_habla:['Español','Otra lengua'],conuslados_a_donde_puede_ir:['Otro consulado']},{},{complete:true}).valid,true);
});
