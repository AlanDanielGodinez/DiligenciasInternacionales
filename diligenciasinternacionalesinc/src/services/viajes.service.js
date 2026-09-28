import api from '../lib/api';

export const getCotizacionesViaje = async (params = {}) => {
  const res = await api.get('/viajes/cotizaciones', { params });
  return res.data?.cotizaciones || [];
};

export const getCotizacionesSolicitud = async (idSolicitud) => {
  const res = await api.get(`/solicitudes/${idSolicitud}/cotizaciones-viaje`);
  return res.data?.cotizaciones || [];
};

export const createCotizacionSolicitud = async (idSolicitud, payload) => {
  const res = await api.post(`/solicitudes/${idSolicitud}/cotizaciones-viaje`, payload);
  return res.data?.cotizacion;
};

export const updateCotizacionViaje = async (idCotizacion, payload) => {
  const res = await api.patch(`/viajes/cotizaciones/${idCotizacion}`, payload);
  return res.data?.cotizacion;
};

export const getItinerariosViaje = async (params = {}) => {
  const res = await api.get('/viajes/itinerarios', { params });
  return res.data?.itinerarios || [];
};

export const getItinerarioSolicitud = async (idSolicitud) => {
  const res = await api.get(`/solicitudes/${idSolicitud}/itinerario-viaje`);
  return res.data?.itinerario || null;
};

export const createItinerarioSolicitud = async (idSolicitud, payload) => {
  const res = await api.post(`/solicitudes/${idSolicitud}/itinerario-viaje`, payload);
  return res.data?.itinerario;
};

export const updateItinerarioViaje = async (idItinerario, payload) => {
  const res = await api.patch(`/viajes/itinerarios/${idItinerario}`, payload);
  return res.data?.itinerario;
};
export const getToursViaje=async()=>(await api.get('/viajes/tours')).data?.tours||[];
export const createTourViaje=async(payload)=>(await api.post('/viajes/tours',payload)).data?.tour;
export const updateTourViaje=async(id,payload)=>(await api.patch(`/viajes/tours/${id}`,payload)).data?.tour;
export const getGruposViaje=async()=>(await api.get('/viajes/grupos')).data?.grupos||[];
export const getGrupoViaje=async(id)=>(await api.get(`/viajes/grupos/${id}`)).data?.grupo;
export const createGrupoViaje=async(payload)=>(await api.post('/viajes/grupos',payload)).data?.grupo;
export const updateGrupoViaje=async(id,payload)=>(await api.patch(`/viajes/grupos/${id}`,payload)).data?.grupo;
export const addIntegranteGrupoViaje=async(id,id_solicitud)=>(await api.post(`/viajes/grupos/${id}/integrantes`,{id_solicitud})).data?.grupo;

const viajesService = {
  createCotizacionSolicitud,
  createItinerarioSolicitud,
  getCotizacionesSolicitud,
  getCotizacionesViaje,
  getItinerarioSolicitud,
  getItinerariosViaje,
  updateCotizacionViaje,
  updateItinerarioViaje,
};

export default viajesService;
