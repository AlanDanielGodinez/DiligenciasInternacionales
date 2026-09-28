import api from '../lib/api';
import {
  createCotizacionSolicitud,
  createItinerarioSolicitud,
  getCotizacionesSolicitud,
  getCotizacionesViaje,
  getItinerarioSolicitud,
  updateItinerarioViaje,
} from './viajes.service';

jest.mock('../lib/api', () => ({ get: jest.fn(), post: jest.fn(), patch: jest.fn() }));

test('lista cotizaciones con filtros', async () => {
  api.get.mockResolvedValue({ data: { cotizaciones: [] } });
  await getCotizacionesViaje({ estado_cotizacion: 'pendiente' });
  expect(api.get).toHaveBeenCalledWith('/viajes/cotizaciones', { params: { estado_cotizacion: 'pendiente' } });
});
test('consulta cotizaciones aisladas por solicitud', async () => {
  api.get.mockResolvedValue({ data: { cotizaciones: [{ id_cotizacion: 2 }] } });
  await expect(getCotizacionesSolicitud(7)).resolves.toHaveLength(1);
  expect(api.get).toHaveBeenCalledWith('/solicitudes/7/cotizaciones-viaje');
});
test('crea cotización para la solicitud canónica', async () => {
  api.post.mockResolvedValue({ data: { cotizacion: { id_cotizacion: 2 } } });
  await createCotizacionSolicitud(7, { tipo_servicio: 'vuelo' });
  expect(api.post).toHaveBeenCalledWith('/solicitudes/7/cotizaciones-viaje', { tipo_servicio: 'vuelo' });
});
test('consulta itinerario por solicitud', async () => {
  api.get.mockResolvedValue({ data: { itinerario: null } });
  await expect(getItinerarioSolicitud(7)).resolves.toBeNull();
  expect(api.get).toHaveBeenCalledWith('/solicitudes/7/itinerario-viaje');
});
test('crea itinerario sin duplicar cliente', async () => {
  api.post.mockResolvedValue({ data: { itinerario: { id_itinerario: 3 } } });
  await createItinerarioSolicitud(7, { destino: 'MEX' });
  expect(api.post).toHaveBeenCalledWith('/solicitudes/7/itinerario-viaje', { destino: 'MEX' });
});
test('actualiza el itinerario por su identificador', async () => {
  api.patch.mockResolvedValue({ data: { itinerario: { id_itinerario: 3 } } });
  await updateItinerarioViaje(3, { estado_itinerario: 'confirmado' });
  expect(api.patch).toHaveBeenCalledWith('/viajes/itinerarios/3', { estado_itinerario: 'confirmado' });
});
