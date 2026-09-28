const test=require('node:test');const assert=require('node:assert/strict');const service=require('../src/services/amaOperacion.service');
test('AMA acepta únicamente resultados documentados',()=>assert.deepEqual([...service.__test.RESULTS],['APROBADO','NEGADO','PROCESO ADMINISTRATIVO','DETENIDO']));
