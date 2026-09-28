const test=require('node:test');
const assert=require('node:assert/strict');
const template=require('../src/templates/perfilEtaV1.template');
const {validateProfile,calculateCompletion,isFieldVisible}=require('../src/services/perfilesEngineV2');
const fields=template.sections.flatMap(section=>section.fields);
const fieldMap=new Map(fields.map(field=>[field.key,field]));

test('ETA V1 represents the audited capture and virtual contract',()=>{
  assert.equal(fields.length,36);
  assert.equal(template.virtual_columns.length,6);
  assert.equal(fields.filter(field=>field.show_if).length,2);
  assert.equal(fields.some(field=>field.required||field.required_if),false);
  assert.equal(fields.some(field=>field.type==='repeater'),false);
});

test('passport, visa and personal fields preserve documented types',()=>{
  assert.equal(fieldMap.get('numero_pasaporte').type,'text');
  assert.equal(fieldMap.get('fecha_emision_pasaporte').type,'date');
  assert.equal(fieldMap.get('fecha_expiracion_visa').type,'date');
  assert.equal(fieldMap.get('nacionalidad').type,'text');
  assert.equal(fieldMap.get('nacionalidad_otra').show_if,undefined);
});

test('sex and marital status are closed documented enums',()=>{
  assert.deepEqual(fieldMap.get('sexo').options,['Masculino','Femenino']);
  assert.deepEqual(fieldMap.get('estado_civil').options,['Casado','Soltero','Viudo','Divorciado','Legalmente Separado','Unión Libre']);
  assert.equal(validateProfile(template,{sexo:'Otro'},{},{complete:false}).errors[0].code,'invalid_option');
});

test('prior Canada application data remains visible because PDF has no Show_If',()=>{
  assert.equal(fieldMap.get('numero_visa_eta_permiso_anterior_canada').show_if,undefined);
  assert.equal(isFieldVisible(fieldMap.get('numero_visa_eta_permiso_anterior_canada'),{ha_aplicado_anteriormente_canada:false},fieldMap),true);
});

test('employment, address and travel fields are simple and non-repeating',()=>{
  assert.equal(fieldMap.get('empleador').type,'text');
  assert.equal(fieldMap.get('codigo_postal_aplicante').type,'text');
  assert.equal(fieldMap.get('sabe_cuando_viajara_canada').type,'boolean');
  assert.equal(fieldMap.get('fecha_viaje').type,'text');
});

test('flight departure uses generic civil time validation',()=>{
  assert.equal(fieldMap.get('hora_salida_vuelo').type,'time');
  assert.equal(validateProfile(template,{hora_salida_vuelo:'19:45'},{},{complete:false}).valid,true);
  assert.equal(validateProfile(template,{hora_salida_vuelo:'24:01'},{},{complete:false}).errors[0].code,'invalid_time');
});

test('denial explanation follows only the documented parent answer',()=>{
  const explanation=fieldMap.get('explicacion_negacion_visa_entrada_salida');
  assert.equal(isFieldVisible(explanation,{negacion_visa_entrada_salida_canada_otros:false},fieldMap),false);
  assert.equal(isFieldVisible(explanation,{negacion_visa_entrada_salida_canada_otros:true},fieldMap),true);
});

test('criminal explanation is hidden recursively, retained and excluded from completion',()=>{
  const explanation=fieldMap.get('explicacion_delito_penal');
  assert.equal(isFieldVisible(explanation,{delito_penal_antecedentes:false},fieldMap),false);
  const retained={delito_penal_antecedentes:false,explicacion_delito_penal:'Guardado'};
  const empty={delito_penal_antecedentes:false,explicacion_delito_penal:''};
  assert.deepEqual(calculateCompletion(template,retained,{}),calculateCompletion(template,empty,{}));
  assert.equal(retained.explicacion_delito_penal,'Guardado');
});

test('the AppSheet parent Ref is metadata and not a profile repeater',()=>{
  assert.deepEqual(template.relation_metadata,[{source_column:'Id_aplicante',referenced_table:'ETA',is_part_of:true,classification:'parent_reference'}]);
});

test('ETA values survive JSON save and reload',()=>{
  const saved=JSON.stringify({numero_pasaporte:'A001',codigo_postal_aplicante:'0A1 B2',hora_salida_vuelo:'08:05'});
  const reloaded=JSON.parse(saved);
  assert.equal(validateProfile(template,reloaded,{},{complete:false}).valid,true);
  assert.equal(reloaded.codigo_postal_aplicante,'0A1 B2');
});
