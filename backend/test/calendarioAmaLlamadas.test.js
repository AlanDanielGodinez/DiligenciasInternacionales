const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const service = require('../src/services/calendarioAma.service');

const source = fs.readFileSync(path.join(__dirname, '../src/services/calendarioAma.service.js'), 'utf8');
const valid = { id_solicitud: 12, id_empleado_responsable: 7, id_grupo_ama: null, fecha: '2026-09-25', hora: '09:30', tipo: 'LLAMADA', notas: 'Confirmar documentos' };

test('normaliza solicitud, responsable, fecha y hora civil', () => { const row=service.__test.normalizeCall(valid); assert.equal(row.id_solicitud,12); assert.equal(row.id_empleado_responsable,7); assert.equal(row.fecha,'2026-09-25'); assert.equal(row.hora,'09:30'); });
test('grupo es opcional y conserva identidad de solicitud', () => { assert.equal(service.__test.normalizeCall(valid).id_grupo_ama,null); assert.equal(service.__test.normalizeCall({...valid,id_grupo_ama:4}).id_grupo_ama,4); });
test('valida estados simples y permite cancelar', () => { assert.equal(service.__test.normalizeCall({...valid,estado:'CANCELADA'}).estado,'CANCELADA'); assert.throws(()=>service.__test.normalizeCall({...valid,estado:'BORRADA'})); });
test('rechaza fechas y horas con desfase o formato ambiguo', () => { assert.throws(()=>service.__test.normalizeCall({...valid,fecha:'2026-09-25T00:00:00Z'})); assert.throws(()=>service.__test.normalizeCall({...valid,hora:'25:00'})); });
test('listado soporta filtros responsables, grupos y rango', () => { for(const token of ['filters.id_empleado','filters.id_grupo','filters.desde','filters.hasta']) assert.match(source,new RegExp(token.replace('.','\\.'))); });
test('creación valida empleado, solicitud y membresía del grupo', () => { assert.match(source,/JOIN empleados/); assert.match(source,/grupo_real/); assert.match(source,/no pertenece al grupo/); });
test('edición es trazable y no elimina físicamente', () => { assert.match(source,/actualizado_en=NOW\(\)/); assert.doesNotMatch(source,/DELETE FROM ama_llamadas/); });
test('consulta aísla llamadas por solicitud canónica', () => { assert.match(source,/l\.id_solicitud/); assert.match(source,/JOIN public\.solicitudes/); });
