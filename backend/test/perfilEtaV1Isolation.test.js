const test=require('node:test');
const assert=require('node:assert/strict');
const template=require('../src/templates/perfilEtaV1.template');
const dbModule=require.resolve('../src/config/db');
const seen=[];
require.cache[dbModule]={exports:{pool:{query:async(sql,params)=>{
  if(sql.includes('FROM public.perfiles_solicitud ps')){
    seen.push(params[0]);
    return {rows:[{id_perfil:800+params[0],id_solicitud:params[0],id_cliente:12,respuestas_json:{numero_pasaporte:`ETA-${params[0]}`},estructura_json:template}]};
  }
  if(sql.includes('FROM public.perfil_respuestas_repetibles'))return {rows:[]};
  throw new Error('Unexpected query');
}}}};
const {getPerfilBySolicitud}=require('../src/services/perfiles.service');

test('two ETA requests for one applicant load independent profiles',async()=>{
  const first=await getPerfilBySolicitud(100);
  const second=await getPerfilBySolicitud(200);
  assert.deepEqual(seen,[100,200]);
  assert.equal(first.id_cliente,second.id_cliente);
  assert.notEqual(first.id_perfil,second.id_perfil);
  assert.equal(first.respuestas_json.numero_pasaporte,'ETA-100');
  assert.equal(second.respuestas_json.numero_pasaporte,'ETA-200');
});
