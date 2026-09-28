// Rules transcribed from PERFILES AMA in Application Documentation Formularios.pdf
// (17 August 2026). Keep V2 untouched for profiles already bound to it.
const v2 = require('./perfilAmaV2.template');
const template = JSON.parse(JSON.stringify(v2));
template.source = { document: 'Application Documentation Formularios.pdf', audited_pages: '17-104', audited_date: '2026-08-17' };
template.activation = { applies_to: 'new_profiles_only', preserves_existing_profiles: true };

const yes = (field) => ({ field, operator: 'eq', value: 'Sí' });
const no = (field) => ({ field, operator: 'eq', value: 'No' });
const rules = {
  otros_nombres_cual: yes('ha_usado_otros_nombres'),
  otra_nacionalidad_cual: yes('otra_nacionalidad'),
  tramito_pasaporte: yes('otra_nacionalidad'),
  discapacidad_cual: yes('discapacidad_o_enfermedad'),
  ingreso_ilegal_documentos_falsos: yes('ha_estado_en_eeuu'),
  fechas_ingreso_eeuu: yes('ha_estado_en_eeuu'),
  deportado_voluntaria_involuntariamente: yes('ha_estado_en_eeuu'),
  pago_costos_deportacion: yes('deportado_voluntaria_involuntariamente'),
  delito_cual: yes('acto_ilicito_felonia'),
  hubo_sentencia: yes('acto_ilicito_felonia'),
  sentencia_tiempo: yes('hubo_sentencia'),
  sentencia_donde: yes('acto_ilicito_felonia'),
  sentencia_cuando: yes('acto_ilicito_felonia'),
  explicacion_viajes_anteriores: yes('acto_ilicito_felonia'),
  tuvo_hijo_eeuu: yes('ha_estado_en_eeuu'),
  tipo_visa: yes('visa_otorgada'),
  fecha_emision_visa: yes('visa_otorgada'),
  fecha_vencimiento_visa: yes('visa_otorgada'),
  numero_visa: yes('visa_otorgada'),
  solicita_mismo_tipo_visa: yes('visa_otorgada'),
  aplica_mismo_pais_residencia: yes('visa_otorgada'),
  le_sacaron_huellas: yes('visa_otorgada'),
  visa_perdida_robada: yes('visa_otorgada'),
  visa_perdida_donde: yes('visa_perdida_robada'),
  visa_perdida_anio: yes('visa_perdida_robada'),
  hizo_reporte_visa_perdida: yes('visa_perdida_robada'),
  visa_cancelada_revocada: yes('visa_otorgada'),
  visa_negada_donde_cuando: yes('visa_negada'),
  visa_negada_fecha: yes('visa_negada'),
  hoja_denegacion: yes('visa_negada'),
  tamano_hoja_denegacion: yes('hoja_denegacion'),
  visa_observaciones: yes('visa_negada'),
  mintio_aplicacion_anterior: yes('visa_negada'),
  mintio_explicacion: yes('mintio_aplicacion_anterior'),
  detalle_peticion_inmigracion: yes('peticion_inmigracion'),
  peticion_rechazada_motivo: yes('peticion_inmigracion'),
  fecha_anio_extravio_pasaporte: yes('pasaporte_perdido_robado'),
  hizo_reporte_pasaporte: yes('pasaporte_perdido_robado'),
  padre_en_eeuu: yes('padre_esta_vivo'),
  padre_estatus_migratorio: yes('padre_en_eeuu'),
  padre_observaciones: yes('padre_en_eeuu'),
  madre_en_eeuu: yes('madre_esta_viva'),
  madre_estatus_migratorio: yes('madre_en_eeuu'),
  madre_observaciones: yes('madre_en_eeuu'),
  hijos_pais_residencia: yes('familiares_inmediatos_eeuu'),
  hijos_pais_residencia_observaciones: yes('familiares_inmediatos_eeuu'),
  explicacion_hospital_hijo_eeuu: yes('tuvo_hijo_eeuu'),
  familiares_eeuu: yes('familiares_inmediatos_eeuu'),
  conyuge_nombre: { field: 'estado_civil', operator: 'neq', value: 'Soltero/a' },
  conyuge_fecha_lugar_nacimiento: { field: 'estado_civil', operator: 'neq', value: 'Soltero/a' },
  conyuge_lugar_nacimiento: { field: 'estado_civil', operator: 'neq', value: 'Soltero/a' },
  se_ha_divorciado: { field: 'estado_civil', operator: 'neq', value: 'Soltero/a' },
  numero_divorcios: yes('se_ha_divorciado'),
  ultimo_matrimonio_de: yes('se_ha_divorciado'),
  ultimo_matrimonio_hasta: yes('se_ha_divorciado'),
  viven_mismo_domicilio: { field: 'estado_civil', operator: 'neq', value: 'Soltero/a' },
  conyuge_domicilio: no('viven_mismo_domicilio'),
  ocupacion_principal: yes('cuenta_empleo_actualmente'),
  empleador_actual: yes('cuenta_empleo_actualmente'),
  empleo_direccion: yes('cuenta_empleo_actualmente'),
  empleo_telefono: yes('cuenta_empleo_actualmente'),
  sueldo_mensual_moneda_local: yes('cuenta_empleo_actualmente'),
  descripcion_deberes: yes('cuenta_empleo_actualmente'),
  traduccion_descripcion: yes('cuenta_empleo_actualmente'),
  desde_cuando_empleo: yes('cuenta_empleo_actualmente'),
  ocupacion_anterior: yes('tuvo_empleo_anterior'),
  empleador_anterior: yes('tuvo_empleo_anterior'),
  empleo_anterior_localidad: yes('tuvo_empleo_anterior'),
  empleo_anterior_direccion: yes('tuvo_empleo_anterior'),
  empleo_anterior_municipio: yes('tuvo_empleo_anterior'),
  empleo_anterior_estado: yes('tuvo_empleo_anterior'),
  empleo_anterior_pais: yes('tuvo_empleo_anterior'),
  empleo_anterior_telefono: yes('tuvo_empleo_anterior'),
  empleo_anterior_descripcion_deberes: yes('tuvo_empleo_anterior'),
  empleo_anterior_traduccion_descripcion: yes('tuvo_empleo_anterior'),
  empleo_anterior_periodo: yes('tuvo_empleo_anterior'),
  empleo_anterior_fin: yes('tuvo_empleo_anterior'),
  paises_visitados_ultimos_5_anios: yes('viajo_otro_pais_ultimos_5_anios'),
};

const education = { field: 'nivel_educativo', operator: 'in', value: [
  'SECUANDARIA', 'PREPARATORIA/BACHILLERATO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO',
] };
for (const key of ['lugar_estudio_nombre', 'lugar_estudio_direccion', 'lugar_estudio_telefono', 'estudio_de', 'estudio_a']) rules[key] = education;

for (const section of template.sections) for (const field of section.fields) {
  if (rules[field.key]) field.show_if = rules[field.key];
  if (field.key === 'familiares_inmediatos_eeuu') field.label = '¿Tienes familiares directos en Estados Unidos?';
  if (field.key === 'hijos_pais_residencia') field.type = 'textarea';
  if (field.key === 'familiares_inmediatos_detalle') field.label = 'Detalle libre de familiares (dato legado)';
  if (field.key === 'nivel_educativo') {
    field.type = 'select';
    field.options = ['PRIMARIA', 'SECUANDARIA', 'PREPARATORIA/BACHILLERATO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO', 'SIN ESTUDIOS'];
  }
}

const insertAfter = (key, newField) => {
  const section = template.sections.find(item => item.fields.some(field => field.key === key));
  const index = section.fields.findIndex(field => field.key === key);
  section.fields.splice(index + 1, 0, newField);
};
insertAfter('visa_negada_donde_cuando', { key: 'visa_negada_fecha', label: '¿Cuándo le fue negada su visa?', type: 'textarea', required: false, show_if: rules.visa_negada_fecha });
insertAfter('tuvo_hijo_eeuu', { key: 'explicacion_hospital_hijo_eeuu', label: 'Explicación (tipo de hospital y fecha)', type: 'textarea', required: false, show_if: rules.explicacion_hospital_hijo_eeuu });
insertAfter('conyuge_fecha_lugar_nacimiento', { key: 'conyuge_lugar_nacimiento', label: 'Lugar de nacimiento del cónyuge', type: 'textarea', required: false, show_if: rules.conyuge_lugar_nacimiento });
insertAfter('empleo_anterior_periodo', { key: 'empleo_anterior_fin', label: 'Fecha de finalización del empleo anterior', type: 'textarea', required: false, show_if: rules.empleo_anterior_fin });
insertAfter('familiares_inmediatos_detalle', {
  key: 'familiares_eeuu', label: 'Familiares en Estados Unidos', type: 'repeater', required: false,
  show_if: rules.familiares_eeuu,
  fields: [
    { key: 'apellidos', label: 'Apellidos', type: 'text', required: false },
    { key: 'nombre', label: 'Nombre', type: 'text', required: false },
    { key: 'estatus', label: 'Estatus en EUA', type: 'text', required: false },
    { key: 'relacion', label: 'Relación', type: 'text', required: false },
    { key: 'edad_ingreso_eeuu', label: 'Edad a la que ingresó a EUA', type: 'text', required: false },
  ],
});

module.exports = template;
