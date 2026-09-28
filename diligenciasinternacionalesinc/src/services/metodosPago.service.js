import api from '../lib/api';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.metodos)) return data.metodos;
  return [];
};

export const getMetodosPago = async (params = {}) => {
  const res = await api.get('/metodos-pago', { params });
  return normalizeList(res.data);
};

export const createMetodoPago = async (payload) => {
  const res = await api.post('/metodos-pago', payload);
  return res.data?.metodo;
};

export const updateMetodoPago = async (idMetodoPago, payload) => {
  const res = await api.patch(`/metodos-pago/${idMetodoPago}`, payload);
  return res.data?.metodo;
};

export const deactivateMetodoPago = async (idMetodoPago) => {
  const res = await api.delete(`/metodos-pago/${idMetodoPago}`);
  return res.data?.metodo;
};

const metodosPagoService = {
  createMetodoPago,
  deactivateMetodoPago,
  getMetodosPago,
  updateMetodoPago,
};

export default metodosPagoService;
