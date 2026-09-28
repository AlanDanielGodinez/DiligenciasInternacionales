const test=require('node:test');
const assert=require('node:assert/strict');
const {primary,negados,identical}=require('../.tmp/extract-visa-canadiense-rules');

const technical=new Set([1,2,3]);
const canonical=new Set([4,5,11,17,19]);
const credentials=new Set([12,13,14]);
const operational=new Set([6,7,8,9,10,15,16,18,20,21,22,23,24,25]);

test('main Visa Canadiense schema has the exact audited counts',()=>{
  assert.deepEqual(primary.summary,{total:26,physical:25,virtual:1,show:0,required:0,valid:0,editable:0,reset:0,suggested:0,refs:3,lists:0,isPartOf:0});
});

test('Negados is a distinct type-degraded operational copy',()=>{
  assert.equal(identical,false);
  assert.deepEqual(negados.summary,{total:25,physical:25,virtual:0,show:0,required:0,valid:0,editable:0,reset:0,suggested:0,refs:0,lists:0,isPartOf:0});
  assert.equal(primary.rows.find(row=>row.name==='fecha_limite_biometricos').type,'Date');
  assert.equal(negados.rows.find(row=>row.name==='fecha_limite_biometricos').type,'Text');
});

test('all 26 columns are exhaustively classified',()=>{
  const classified=new Set([...technical,...canonical,...credentials,...operational,26]);
  assert.equal(classified.size,26);
  assert.deepEqual([...classified].sort((a,b)=>a-b),Array.from({length:26},(_,index)=>index+1));
});

test('credential columns are identified and excluded from a profile contract',()=>{
  assert.deepEqual([...credentials].map(number=>primary.rows[number-1].name),['contrana_correo','contrasena_portal_ircc','contrasena_ttservices']);
});

test('typed references are operational relationships rather than repeaters',()=>{
  assert.deepEqual(primary.rows.filter(row=>row.type==='Ref').map(row=>[row.name,row.ref]),[['tramite','TRAMITES'],['contacto','CONTACTO'],['encargado','ASESORES']]);
  assert.equal(primary.rows.some(row=>row.type==='List'||row.isPartOf),false);
});

test('the only virtual column is a calculated display value',()=>{
  const virtual=primary.rows.filter(row=>row.virtual);
  assert.equal(virtual.length,1);
  assert.equal(virtual[0].name,'Nombre completo del aplicante');
  assert.match(virtual[0].formula,/CONCATENATE/);
});

test('biometrics and status fields are operational, not applicant questionnaire rules',()=>{
  const names=[...operational].map(number=>primary.rows[number-1].name);
  assert.ok(names.includes('fecha_cita_biometrios'));
  assert.ok(names.includes('estatus'));
  assert.ok(names.includes('estatus_pago_completo'));
  assert.equal(primary.rows.some(row=>primary.meaningful(row.show)),false);
});
