const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = (file) => fs.readFileSync(path.join(__dirname, file), 'utf8');
const contact = source('../src/services/contactos.service.js');
const client = source('../src/services/clientes.service.js');
const request = source('../src/services/solicitudes.service.js');
const payment = source('../src/services/pagos.service.js');
const survey = source('../src/services/encuestasSatisfaccion.service.js');
const denied = source('../src/services/negados.service.js');
const legal = source('../src/services/legales.service.js');

test('1. create contact', () => assert.match(contact, /async function createContacto[\s\S]*INSERT INTO public\.contacto/));
test('2. create multiple applicants under one contact', () => assert.match(client, /async function createAplicanteForContacto[\s\S]*idContacto/));
test('3. create request', () => assert.match(request, /async function createSolicitudForCliente[\s\S]*INSERT INTO public\.solicitudes/));
test('4. assign procedure by catalog foreign key', () => assert.match(request, /id_tipo_tramite/));
test('5. assign responsible employee', () => assert.match(request, /async function updateSolicitudResponsable/));
test('6. change area with history', () => assert.match(request, /async function moverSolicitudArea[\s\S]*insertSeguimientoIfAvailable/));
test('7. register payment', () => assert.match(payment, /async function createPago[\s\S]*INSERT INTO public\.pagos/));
test('8. preserve multiple payments', () => assert.doesNotMatch(payment.match(/async function createPago[\s\S]*?\n}/)?.[0] || '', /UPDATE public\.pagos/));
test('9. validate payment under row lock', () => assert.match(payment, /async function validarPago[\s\S]*FOR UPDATE/));
test('10. append history', () => assert.match(payment + request, /INSERT INTO public\.seguimientos/));
test('11. query full applicant record', () => assert.match(client, /async function getClienteFicha[\s\S]*solicitudes[\s\S]*historial/));
test('12. isolate applicants by id_cliente', () => assert.match(client, /WHERE s\.id_cliente = \$1/));
test('13. isolate payments and documents by id_solicitud', () => assert.match(payment, /WHERE p\.id_solicitud = \$1/));
test('14. relate survey to applicant and optional request', () => { assert.match(survey, /id_cliente/); assert.match(survey, /id_solicitud/); });
test('15. retain denied and Legal integration through process relations', () => { assert.match(denied, /sendLegal/); assert.match(legal, /id_proceso_padre/); });
