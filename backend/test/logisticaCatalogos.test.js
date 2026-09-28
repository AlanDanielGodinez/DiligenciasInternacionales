const test=require('node:test');
const assert=require('node:assert/strict');
const {__test}=require('../src/services/logisticaCatalogos.service');

test('clasifica un tour futuro como pendiente',()=>assert.equal(__test.tourState({fecha_hora_salida:'2030-01-02T10:00:00Z'},new Date('2030-01-01T00:00:00Z')),'Viaje pendiente'));
test('clasifica un tour concluido como realizado',()=>assert.equal(__test.tourState({fecha_hora_salida:'2029-01-01',fecha_hora_regreso:'2029-01-02'},new Date('2030-01-01')),'Viaje realizado'));
test('clasifica un tour iniciado sin regreso pasado como en curso',()=>assert.equal(__test.tourState({fecha_hora_salida:'2029-01-01',fecha_hora_regreso:'2031-01-02'},new Date('2030-01-01')),'Viaje en curso'));
test('normaliza importes y capacidad',()=>{const row=__test.normalizeTour({nombre_tour:' Tour ',fecha_hora_salida:'2030-01-01',capacidad:'12',costo_uno:'10.50'});assert.equal(row.nombre_tour,'Tour');assert.equal(row.capacidad,12);assert.equal(row.costo_uno,10.5)});
test('rechaza importes negativos',()=>assert.throws(()=>__test.normalizeTour({costo_uno:-1}),/inválido/));
test('rechaza fechas de tour inválidas',()=>assert.throws(()=>__test.normalizeTour({fecha_hora_salida:'no-fecha'}),/inválida/));
test('normaliza las fechas de grupo documentadas',()=>assert.deepEqual(__test.normalizeGroup({nombre:' Grupo ',fecha_ida:'2030-05-01',fecha_regreso:'2030-05-10',grupo_de_regreso:true}),{nombre:'Grupo',fecha_ida:'2030-05-01',fecha_regreso:'2030-05-10',notas:null,grupo_de_regreso:true}));
test('rechaza fechas de grupo fuera de ISO',()=>assert.throws(()=>__test.normalizeGroup({fecha_ida:'01/05/2030'}),/inválida/));
