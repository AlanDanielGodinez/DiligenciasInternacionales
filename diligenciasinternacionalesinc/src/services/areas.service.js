import api from '../lib/api';

export const getSolicitudesByArea = async (idArea, params = {}) => {
  const res = await api.get(`/areas/${idArea}/solicitudes`, { params });
  return res.data;
};

export const getSolicitudesIndividuales = async (params = {}) =>
  getSolicitudesByArea(3, params);

export const getSolicitudesAma = async (params = {}) =>
  getSolicitudesByArea(4, params);

export const getSolicitudesLegales = async (params = {}) =>
  getSolicitudesByArea(5, params);

const areasService = {
  getSolicitudesAma,
  getSolicitudesByArea,
  getSolicitudesIndividuales,
  getSolicitudesLegales,
};

export default areasService;
