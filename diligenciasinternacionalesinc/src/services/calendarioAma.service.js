import api from '../lib/api';

const normalizeCalendarioAmaResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.calendario)) return data.calendario;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

export const getCalendarioAma = async (params = {}) => {
  const res = await api.get('/calendario-ama', { params });
  return normalizeCalendarioAmaResponse(res.data);
};

export const getLlamadasAma = async (params = {}) => (await api.get('/calendario-ama/llamadas', { params })).data;
export const createLlamadaAma = async (payload) => (await api.post('/calendario-ama/llamadas', payload)).data;
export const updateLlamadaAma = async (id, payload) => (await api.patch(`/calendario-ama/llamadas/${id}`, payload)).data;

export default {
  getCalendarioAma,
  getLlamadasAma,
  createLlamadaAma,
  updateLlamadaAma,
};
