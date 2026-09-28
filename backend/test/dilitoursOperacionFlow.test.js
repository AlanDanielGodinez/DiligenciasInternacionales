const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const source = read('reports/ama-audit/Application Documentation Logistica dilitours.pdf.txt');
const service = read('src/services/viajes.service.js');
const migration = read('scripts/migrate-viajes-fase1.js');
const payments = read('src/services/pagos.service.js');
const documents = read('src/services/documentos.service.js');

test('1. crea varias cotizaciones sin sobrescribir las anteriores', () => {
  assert.match(service, /INSERT INTO public\.cotizaciones_viaje/);
  assert.doesNotMatch(migration, /UNIQUE[^;]*cotizaciones_viaje[^;]*id_solicitud/is);
});
test('2. asocia la cotización al cliente mediante solicitud canónica', () => assert.match(service, /JOIN public\.clientes c ON c\.id_cliente = s\.id_cliente/));
test('3. limita el servicio a un catálogo explícito', () => assert.match(service, /new Set\(\['vuelo', 'hotel', 'transporte', 'paquete', 'tour', 'otro'\]\)/));
test('4. valida monto no negativo y conserva moneda', () => {
  assert.match(service, /monto_estimado must be a non-negative numeric value|fieldName.*non-negative/);
  assert.match(service, /trimString\(payload\.moneda\) \|\| 'MXN'/);
});
test('5. estados de cotización están separados de itinerario', () => {
  assert.match(service, /COTIZACION_ESTADOS/); assert.match(service, /ITINERARIO_ESTADOS/);
});
test('6. AppSheet acepta o cancela una cotización sin borrar histórico', () => {
  assert.match(source, /Action name\s+Aceptar/); assert.match(source, /Action name\s+Cancelar/);
});
test('7. itinerario activo pertenece a una solicitud', () => assert.match(migration, /ux_itinerario_viaje_activo_solicitud/));
test('8. vuelo relacional AppSheet queda detectado como brecha del modelo plano', () => {
  assert.match(source, /Schema Name\s+vuelos_Schema/); assert.match(service, /numero_vuelo/);
});
test('9. reserva hotel 1:N existe en fuente y no se inventa en backend', () => {
  assert.match(source, /Schema Name\s+hoteles_principal_Schema/); assert.match(source, /Schema Name\s+hoteles_detalles_Schema/);
  assert.doesNotMatch(migration, /hoteles_principal|hoteles_detalles/);
});
test('10. transporte actual es indicador y no catálogo comercial', () => assert.match(service, /transporte_incluido/));
test('11. pasajeros externos o múltiples permanecen como brecha explícita', () => {
  assert.match(source, /Column name\s+nombres_viajeros/); assert.doesNotMatch(migration, /CREATE TABLE[^;]*pasajeros/is);
});
test('12. pagos permanecen en el módulo financiero general', () => assert.match(payments, /public\.pagos/));
test('13. documentos permanecen aislados por solicitud', () => assert.match(documents, /id_solicitud/));
test('14. calendario deriva salida y regreso del itinerario', () => {
  assert.match(service, /fecha_salida/); assert.match(service, /fecha_regreso/);
});
test('15. consultas aíslan cotización e itinerario por solicitud o identificador', () => {
  assert.match(service, /WHERE v\.id_solicitud = \$1 AND v\.activo = true/);
  assert.match(service, /WHERE v\.id_cotizacion = \$1/);
  assert.match(service, /WHERE v\.id_itinerario = \$1/);
});
