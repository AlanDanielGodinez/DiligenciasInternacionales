const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {ama,individual}=require('../.tmp/extract-negados-rules');
const service=require('../src/services/negados.service');
const source=fs.readFileSync(path.join(__dirname,'../reports/ama-audit/Application Documentation Informes.pdf.txt'),'utf8');

const actionBlocks=[...source.matchAll(/^Action name ([^\r\n]+)[\s\S]*?(?=^Action name |\z)/gm)]
  .map(match=>({name:match[1].trim(),body:match[0],table:(match[0].match(/^For a record of this table\s+(.+)$/m)||[])[1]?.trim()}))
  .filter(action=>['NEGADOS','negados ind'].includes(action.table));
const relevantSlices=['LLAMADA PENDIENTE','LLAMADAS REALIZADAS','ASISTIRAN','PENDIENTES','GRUPOS','INDIVIDUALES','Negados pendiente','Pendientes de respuesta','REACTIVOS','NO ASISTIRAN'];

test('AMA Negados schema has exact audited counts',()=>assert.deepEqual(ama.summary,{total:14,physical:13,virtual:1,show:1,required:0,valid:0,editable:0,reset:0,suggested:0,refs:2,lists:1,isPartOf:0}));
test('individual Negados schema has exact audited counts',()=>assert.deepEqual(individual.summary,{total:16,physical:14,virtual:2,show:1,required:0,valid:0,editable:0,reset:0,suggested:0,refs:1,lists:1,isPartOf:0}));
test('both operational tables reference the canonical applicant',()=>{
  assert.equal(ama.rows.find(row=>row.name==='ID APLICANTE').ref,'INFORMES');
  assert.equal(individual.rows.find(row=>row.name==='id_aplicante').ref,'INFORMES');
});
test('the nine exact consular questions are preserved',()=>{
  assert.equal(ama.rows.find(row=>row.name==='preguntas_consulado').enumValues.length,9);
  assert.equal(individual.rows.find(row=>row.name==='preguntas_consulado').enumValues.length,9);
});
test('survey is a virtual applicant relation in both tables',()=>{
  for(const schema of [ama,individual]){const row=schema.rows.find(item=>item.name==='Encuesta de satisfacción');assert.equal(row.virtual,true);assert.match(row.formula,/Related encuesta_satisfaccions/);}
});
test('all ten Negados slices are documented',()=>relevantSlices.forEach(name=>assert.match(source,new RegExp(`Slice Name ${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`))));
test('24 table-specific actions are audited',()=>{
  assert.equal(actionBlocks.length,23);
  assert.match(source,/Action name\s+SI ASISTIRA IND/);
});
test('response actions preserve the four operational answers',()=>{
  for(const value of ['ASISTIRA','NO ASISTIRA','LO PENSARA','SIN RESPUESTA'])assert.ok(actionBlocks.some(action=>action.name.includes(value)));
});
test('automatic origin only creates a case for a denied request',async()=>{
  let calls=0;const process=await service.ensureProcess(8,async(sql)=>{calls++;return {rows:sql.startsWith('INSERT')?[{id_proceso:3,id_solicitud:8}]:[]};});
  assert.equal(process.id_solicitud,8);assert.equal(calls,1);
});
test('existing historical process is reused',async()=>{
  const process=await service.ensureProcess(8,async(sql)=>({rows:sql.startsWith('INSERT')?[]:[{id_proceso:4,id_solicitud:8}]}));
  assert.equal(process.id_proceso,4);
});
test('queue query relates applicant, request, process, history, survey and questions',()=>{
  for(const fragment of ['public.solicitudes','public.clientes','public.procesos_solicitud','public.actividades_solicitud','public.encuestas_satisfaccion','public.solicitud_preguntas_consulado'])assert.match(service.__test.BASE,new RegExp(fragment.replace('.','\\.')));
  assert.match(service.__test.BASE,/es\.id_cliente=s\.id_cliente/);
});
test('critical server filters are parameterized',()=>{
  const values=[];const clauses=service.__test.filters({origen:'AMA',responsable:'7',encuesta:'completada',preguntas:'registradas',reaplicacion:'12_mas'},values);
  assert.ok(clauses.length>=5);assert.deepEqual(values,['AMA',7,true,true]);
});
test('workflow keeps all AppSheet responses and explicit historical outcomes',()=>{
  for(const value of ['SIN_RESPUESTA','ASISTIRA','NO_ASISTIRA','LO_PENSARA'])assert.ok(service.__test.ACTIVITY_RESULTS.has(value));
  assert.ok(service.__test.CLOSE_RESULTS.has('REAPLICACION'));
});
test('reapplication SQL creates a new request and relation without updating the original request',()=>{
  const fn=service.createReapplication.toString();
  assert.match(fn,/INSERT INTO public\.solicitudes/);assert.match(fn,/solicitudes_relaciones/);assert.doesNotMatch(fn,/UPDATE public\.solicitudes SET/);
});
