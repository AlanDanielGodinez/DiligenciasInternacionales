import api from '../lib/api';
import { createContacto, createAplicanteForContacto, getContactoAplicantes } from './contactos.service';
import { createSolicitudForCliente } from './clientes.service';
import { getPagosSolicitud, validarPago, rechazarPago } from './finanzas.service';

jest.mock('../lib/api', () => ({ get: jest.fn(), post: jest.fn(), patch: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

test('creates a contact and an applicant through separate canonical endpoints', async () => {
  api.post.mockResolvedValueOnce({ data: { id_contacto: 1 } }).mockResolvedValueOnce({ data: { id_cliente: 2 } });
  await createContacto({ nombre: 'Familia' });
  await createAplicanteForContacto(1, { nombre: 'Ana' });
  expect(api.post).toHaveBeenNthCalledWith(1, '/contactos', { nombre: 'Familia' });
  expect(api.post).toHaveBeenNthCalledWith(2, '/contactos/1/aplicantes', { nombre: 'Ana' });
});

test('loads the contact hierarchy with applicants and history', async () => {
  api.get.mockResolvedValue({ data: { contacto: { id_contacto: 1 }, aplicantes: [{ id_cliente: 2 }], historial: [{ id_seguimiento: 3 }] } });
  const result = await getContactoAplicantes(1);
  expect(result.aplicantes).toHaveLength(1);
  expect(result.historial).toHaveLength(1);
});

test('creates another request without updating an existing request', async () => {
  api.post.mockResolvedValue({ data: { id_solicitud: 8 } });
  await createSolicitudForCliente(2, { id_tipo_tramite: 4 });
  expect(api.post).toHaveBeenCalledWith('/clientes/2/solicitudes', { id_tipo_tramite: 4 });
});

test('loads every payment belonging to one request', async () => {
  api.get.mockResolvedValue({ data: { pagos: [{ id_pago: 1 }, { id_pago: 2 }] } });
  await expect(getPagosSolicitud(8)).resolves.toHaveLength(2);
  expect(api.get).toHaveBeenCalledWith('/solicitudes/8/pagos');
});

test('validation and rejection use the payment identity', async () => {
  api.patch.mockResolvedValue({ data: { pago: { id_pago: 2 } } });
  await validarPago(2, { validado_por: 9 });
  await rechazarPago(3, { validado_por: 9 });
  expect(api.patch).toHaveBeenNthCalledWith(1, '/pagos/2/validar', { validado_por: 9 });
  expect(api.patch).toHaveBeenNthCalledWith(2, '/pagos/3/rechazar', { validado_por: 9 });
});
