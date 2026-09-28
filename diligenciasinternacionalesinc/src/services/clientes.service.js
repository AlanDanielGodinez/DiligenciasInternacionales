import api from '../lib/api';

const normalizeClientesResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.clientes)) return data.clientes;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const normalizeClienteResponse = (data) => {
  if (data?.cliente && typeof data.cliente === 'object') return data.cliente;
  if (data?.data && typeof data.data === 'object') return data.data;
  if (data && typeof data === 'object') return data;
  return null;
};

export const getClientes = async (params = {}) => {
  const res = await api.get('/clientes', { params });
  return normalizeClientesResponse(res.data);
};

export const getClienteById = async (idCliente) => {
  const res = await api.get(`/clientes/${idCliente}`);
  return normalizeClienteResponse(res.data);
};

export const getClienteFicha = async (idCliente) => {
  const res = await api.get(`/clientes/${idCliente}/ficha`);
  return res.data;
};

export const updateCliente = async (idCliente, payload) => {
  const res = await api.patch(`/clientes/${idCliente}`, payload);
  return res.data;
};

export const createSolicitudForCliente = async (idCliente, payload) => {
  const res = await api.post(`/clientes/${idCliente}/solicitudes`, payload);
  return res.data;
};

export const moverSolicitudArea = async (idSolicitud, payload) => {
  const res = await api.patch(`/solicitudes/${idSolicitud}/mover-area`, payload);
  return res.data;
};

export const getSolicitudById = async (idSolicitud) => {
  const res = await api.get(`/solicitudes/${idSolicitud}`);
  return res.data;
};

export const getTiposTramite = async () => {
  const res = await api.get('/tipos-tramite');
  return normalizeClientesResponse(res.data);
};

const clientesService = {
  getClientes,
  getClienteById,
  getClienteFicha,
  updateCliente,
  createSolicitudForCliente,
  moverSolicitudArea,
  getSolicitudById,
  getTiposTramite,
};

export default clientesService;
