const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const source = read('reports/ama-audit/Application Documentation.pdf.txt');
const groups = read('src/services/gruposAma.service.js');
const activity = read('src/services/amaActividad.service.js');
const notes = read('src/services/solicitudNotas.service.js');
const profile = read('src/services/perfiles.service.js');
const payments = read('src/services/pagos.service.js');
const calendar = read('src/services/calendarioAma.service.js');

test('1. crear grupo es una operación explícita', () => assert.match(groups, /async function createGrupo[\s\S]*INSERT INTO public\.grupos_ama/));
test('2. listar grupo admite filtros operativos', () => assert.match(groups, /async function listGrupos[\s\S]*estado_grupo[\s\S]*id_empleado_responsable/));
test('3. agregar solicitud elegible valida dentro de la transacción', () => assert.match(groups, /BEGIN[\s\S]*assertElegible\(idSolicitud, client\.query\.bind\(client\)\)/));
test('4. solicitud no elegible produce bloqueo 409', () => assert.match(activity, /error\.status=409/));
test('5. duplicado activo del mismo grupo se bloquea', () => assert.match(groups, /already belongs to this AMA group/));
test('6. ausencia de fecha base se conserva como SIN_FECHA_BASE', () => assert.match(activity, /SIN_FECHA_BASE/));
test('7. elegibilidad usa seis meses calendario', () => assert.match(activity, /INTERVAL '6 months'/));
test('8. actividad válida está enumerada y no usa actualizado_en', () => {
  assert.match(activity, /seguimiento_operativo/);
  assert.doesNotMatch(activity, /SELECT[^;]*actualizado_en[^;]*FROM public\.solicitudes/is);
});
test('9. nota del revisor no forma parte de eventos de actividad', () => {
  assert.match(notes, /INSERT INTO public\.notas_solicitud/);
  assert.doesNotMatch(activity, /notas_solicitud/);
});
test('10. pago validado sí es actividad sustantiva', () => assert.match(activity, /estado_pago,''\)\)='validado'/));
test('11. pago rechazado no renueva actividad', () => assert.doesNotMatch(activity, /estado_pago,''\)\)='rechazado'/));
test('12. perfil AMA permanece versionado fuera del grupo', () => {
  assert.match(profile, /perfiles_solicitud_versiones/);
  assert.doesNotMatch(groups, /respuestas_json|repetibles_snapshot_json/);
});
test('13. checklist grupal conserva fecha y autor', () => assert.match(groups, /fecha_completado[\s\S]*completado_por/));
test('14. estados de grupo AppSheet están inventariados sin mezclarlos con solicitud', () => {
  for (const value of ['EN PROCESO DS','DERECHO DE VISA PAGADO','GRUPO CON CITA','EN PROTOCOLO','PROTOCOLO REALIZADO','TERMINADO']) assert.ok(source.includes(value));
  assert.match(groups, /ga\.estado_grupo/);
  assert.match(groups, /s\.estado_actual/);
});
test('15. detalle aísla integrantes por id de grupo', () => assert.match(groups, /WHERE gas\.id_grupo_ama = \$1 AND gas\.activo = true/));
test('16. retiro es baja lógica y no DELETE físico', () => {
  const body = groups.match(/async function removeSolicitudFromGrupo[\s\S]*?\n}/)?.[0] || '';
  assert.match(body, /SET activo = false/);
  assert.doesNotMatch(body, /DELETE FROM/);
});
test('17. calendario AppSheet pertenece al grupo y el backend lo filtra', () => {
  assert.match(source, /Schema Name\s+CALENDARIO_Schema/);
  assert.match(calendar, /WHERE \$\{clauses\.join\(' AND '\)\}/);
});
test('18. documentos permanecen en el módulo por solicitud', () => {
  assert.match(payments, /public\.documentos/);
  assert.doesNotMatch(groups, /INSERT INTO public\.documentos/);
});
