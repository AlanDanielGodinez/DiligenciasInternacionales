const {test}=require('node:test');
const assert=require('node:assert/strict');
const template=require('../src/templates/perfilAmaV2.template');
const legacy=require('../src/templates/perfilAmaLegacy.template');
const {validateProfile,evaluateCondition,calculateCompletion}=require('../src/services/perfilesEngineV2');
test('AMA V2 conserva todas las claves y documentos históricos',()=>{
  assert.deepEqual(template.sections.flatMap(s=>s.fields.map(f=>f.key)).sort(),legacy.secciones.flatMap(s=>s.campos.map(f=>f.name)).sort());
  assert.deepEqual(template.documentos_requeridos,legacy.documentos_requeridos);
});
test('completitud de captura no depende de campos required',()=>{
  const simple={schema_version:2,sections:[{id:'a',fields:[{key:'uno',type:'text'},{key:'dos',type:'text',show_if:{field:'uno',operator:'eq',value:'si'}}]}]};
  assert.equal(calculateCompletion(simple,{},{}).percentage,0);
  assert.equal(calculateCompletion(simple,{uno:'si'},{}).percentage,50);
  assert.equal(calculateCompletion(simple,{uno:'si',dos:'ok'},{}).percentage,100);
});
test('otro nombre condicional, orden documentado y no obligatorio',()=>{
  const fields=template.sections[0].fields;
  assert.equal(fields[1].key,'otros_nombres_cual');
  assert.equal(fields[1].type,'textarea');
  assert.equal(evaluateCondition(fields[1].show_if,{ha_usado_otros_nombres:'No'}),false);
  assert.equal(evaluateCondition(fields[1].show_if,{ha_usado_otros_nombres:'Sí'}),true);
  assert.equal(validateProfile(template,{ha_usado_otros_nombres:'Sí'},{},{complete:true}).valid,true);
});
test('opciones antiguas siguen siendo válidas con etiquetas AppSheet',()=>{
  for(const value of legacy.secciones[0].campos.find(f=>f.name==='estado_civil').options)
    assert.equal(validateProfile(template,{estado_civil:value},{},{complete:true}).valid,true);
});
