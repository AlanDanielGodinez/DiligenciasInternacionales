// Derived from the documented V2 key map. V2 stays bound to existing profiles.
const v2 = require('./perfilVisaIndividualV2.template');
const template = JSON.parse(JSON.stringify(v2));
template.source = {
  ...template.source,
  audited_date: '2026-08-17',
  rules_audit: 'docs/perfiles/visa-individual-appsheet-matriz-2026-09-18.md',
};
template.activation = { ...template.activation, applies_to: 'new_profiles_only', preserves_existing_profiles: true };

// The AppSheet schema has no non-null Required_If or Valid_If in this table.
// V2 inferred required fields and repeater minimums; V3 does not carry those
// inferred constraints into new profiles.
for (const section of template.sections) for (const field of section.fields) {
  const fields = [field, ...(field.fields || [])];
  for (const item of fields) {
    item.required = false;
    delete item.required_if;
    delete item.min;
    delete item.max;
  }
  if (field.type === 'repeater') {
    delete field.min_items;
    delete field.max_items;
  }
}

// Exact AppSheet column types where the V2 UI used a different control.
const textKeys = [
  'duracion', 'numero_de_telefono_de_quien_pagaria_por_su_viaje',
  'correo_electronico_del_contacto', 'numero_de_telefono_del_empleo_anterior',
  'numero_de_telefono_de_la_escuela_anterior',
  'cual_es_su_discapacidad', 'cual_es_el_motivo_de_su_viaje',
  'domicilio_donde_va_a_llegar_a_estados_unidos', 'domicilio_quien_pagaria_por_su_viaje',
  'entro_de_manera_ilegal_o_con_documentos_falsos',
  'pago_por_los_costos_de_su_deportacion_explique',
  'quien_y_para_que_tipo_de_peticion', 'por_que_fue_rechazada',
  'alguna_vez_su_visa_ha_sido_cancelada_o_revocada_explique',
  'alguna_vez_le_fue_negada_la_admision_a_los_eua_o_se_le_ha_retirado_su_aplicacion_para_admision_en_el_punto_de_entrada_explique',
  'observaciones', 'explique_cual_fue_esa_informacion',
  'fecha_y_ano_del_extravio_o_robo', 'domicilio_del_contacto',
  'notas_sobre_el_estatus_del_padre', 'notas_sobre_el_estatus_de_la_madre',
  'explicacion_tipo_de_hospital_y_fecha', 'domicilio_del_esposo_a',
  'direccion_de_empleador', 'direccion_del_empleo_anterior',
  'descripcion_breve_del_empleo_anterior', 'traduccion_de_la_descripcion_del_empleo_anterior',
  'direccion_de_la_escuela', 'direccion_de_la_escuela_anterior',
  'ha_participado_o_contribuido_en_alguna_organizacion_social_de_caridad_u_ong',
];
const fieldsByKey = new Map(template.sections.flatMap(section => section.fields).map(field => [field.key, field]));
for (const key of textKeys) fieldsByKey.get(key).type = 'text';
// Preserve leading zeroes and international postal-code formats.
fieldsByKey.get('codigo_postal').type = 'text';
const openField = field => {
  field.suggestions = field.options || [];
  field.allow_custom_value = true;
  delete field.options;
  delete field.allow_other_values;
};
openField(fieldsByKey.get('redes_sociales_detalle').fields.find(field => field.key === 'red_social'));
openField(fieldsByKey.get('que_idioma_habla'));
fieldsByKey.get('cuales').type = 'multiselect';
fieldsByKey.get('cuales').options = ['México', 'Colombia'];
openField(fieldsByKey.get('cuales'));
fieldsByKey.get('conuslados_a_donde_puede_ir').type = 'multiselect';
fieldsByKey.get('conuslados_a_donde_puede_ir').options = [];
openField(fieldsByKey.get('conuslados_a_donde_puede_ir'));

module.exports = template;
