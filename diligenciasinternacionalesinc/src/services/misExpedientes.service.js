import api from '../lib/api';

export const getMisExpedientes = async (params = {}) => {
  const res = await api.get('/solicitudes/mis-expedientes', { params });
  return res.data;
};

export const getAreasActivas = async () => {
  const res = await api.get('/catalogos/areas');
  return Array.isArray(res.data) ? res.data : res.data?.value || [];
};

const misExpedientesService = {
  getAreasActivas,
  getMisExpedientes,
};

export default misExpedientesService;
