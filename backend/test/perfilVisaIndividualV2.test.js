const test = require('node:test');
const assert = require('node:assert/strict');
const template = require('../src/templates/perfilVisaIndividualV2.template');
const { validateProfile, calculateCompletion, isFieldVisible } = require('../src/services/perfilesEngineV2');

const baseAnswers = {
  ha_usado_otro_nombre_o_lo_ha_modificado: false,
  estado_civil: 'Soltero',
  tiene_alguna_otra_nacionalidad: false,
  tiene_alguna_discapacidad: false,
  usted_pagara_por_su_viaje: true,
  ha_entrado_a_estados_unidos: false,
  alguna_vez_alguien_metio_una_peticion_de_migracion: false,
  en_el_pasado_cometio_un_acto_ilicito_o_felonia_en_eeuu_o_en_su_pais_de_origen: false,
  alguna_vez_le_han_otorgado_visa_para_viajar_a_los_eua: false,
  alguna_vez_le_han_negado_una_visa_para_viajar_a_los_eua: false,
  redes_sociales: false,
  ha_perdido_su_pasaporte_o_se_lo_han_robado: false,
  el_padre_se_encuentra_en_los_eua: false,
  la_madre_se_encuentra_en_eeuu: false,
  tiene_familiares_directos_en_estados_unidos: false,
  tiene_mas_familiares_en_eua: false,
  tuvo_usted_algun_hijo_en_los_eua: false,
  cuenta_con_empleo_actualmente: 'No',
  anteriormente_tuvo_algun_empleo: false,
  tuvo_estudios: false,
  tuvo_educacion_antes: false,
  ha_viajado_a_algun_pais_en_los_ultimos_5_anos: false,
};

const getField = (key) => template.sections.flatMap((section) => section.fields).find((field) => field.key === key);

test('Visa Individual V2 has the audited contract and only confirmed repeaters', () => {
  const fields = template.sections.flatMap((section) => section.fields);
  assert.equal(template.schema_version, 2);
  assert.equal(template.sections.length, 20);
  assert.deepEqual(fields.filter((field) => field.type === 'repeater').map((field) => field.key), [
    'ingresos_estados_unidos', 'redes_sociales_detalle', 'familiares_eeuu',
  ]);
  assert.equal(new Set(fields.map((field) => field.key)).size, fields.length);
});

test('minimal negative branches can be completed with useful deterministic completion', () => {
  const result = validateProfile(template, baseAnswers, {}, { complete: true });
  assert.equal(result.valid, true);
  assert.equal(result.completion.required_total, 22);
  assert.equal(result.completion.required_complete, 22);
  assert.equal(result.completion.percentage, 100);
});

test('historical show_if branches become required and preserve repeater minimums', () => {
  const answers = {
    ...baseAnswers,
    ha_usado_otro_nombre_o_lo_ha_modificado: true,
    ha_entrado_a_estados_unidos: true,
    redes_sociales: true,
    tiene_familiares_directos_en_estados_unidos: true,
  };
  const result = validateProfile(template, answers, {}, { complete: true });
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors.map((error) => error.path), [
    'cual_fue_su_otro_nombre', 'ingresos_estados_unidos', 'entro_de_manera_ilegal_o_con_documentos_falsos',
    'alguna_vez_le_han_deportado_de_manera_voluntaria_o_involuntaria', 'redes_sociales_detalle', 'familiares_eeuu',
  ]);
  assert.equal(isFieldVisible(getField('cual_fue_su_otro_nombre'), answers), true);
  assert.ok(calculateCompletion(template, answers, {}).percentage < 100);
});

test('all three related AppSheet tables accept multiple valid rows', () => {
  const answers = {
    ...baseAnswers,
    ha_entrado_a_estados_unidos: true,
    entro_de_manera_ilegal_o_con_documentos_falsos: 'No',
    alguna_vez_le_han_deportado_de_manera_voluntaria_o_involuntaria: false,
    redes_sociales: true,
    tiene_familiares_directos_en_estados_unidos: true,
  };
  const repeaters = {
    ingresos_estados_unidos: [1, 2].map((index) => ({ data: { fecha_ingreso: `202${index}-01-01`, duracion: index, tiempo: 'Días' } })),
    redes_sociales_detalle: [
      { data: { red_social: 'Facebook', nombre_usuario: 'perfil.uno' } },
      { data: { red_social: 'X', nombre_usuario: 'perfil.dos' } },
    ],
    familiares_eeuu: [
      { data: { apellidos: 'Uno', nombre: 'Familiar', estatus: 'Residente', relacion: 'Hermano' } },
      { data: { apellidos: 'Dos', nombre: 'Familiar', estatus: 'Ciudadano', relacion: 'Hijo' } },
    ],
  };
  const result = validateProfile(template, answers, repeaters, { complete: true });
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.completion.percentage, 100);
});
