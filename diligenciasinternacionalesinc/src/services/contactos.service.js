import api from '../lib/api';

const normalizeArrayResponse = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

export const getContactos = async (params = {}) => {
  const res = await api.get('/contactos', { params });
  return normalizeArrayResponse(res.data, 'contactos');
};

export const getContactoById = async (idContacto) => {
  const res = await api.get(`/contactos/${idContacto}`);
  return res.data;
};

export const getContactoAplicantes = async (idContacto) => {
  const res = await api.get(`/contactos/${idContacto}/aplicantes`);
  return {
    contacto: res.data?.contacto || null,
    aplicantes: normalizeArrayResponse(res.data?.aplicantes || [], 'aplicantes'),
    historial: normalizeArrayResponse(res.data?.historial || [], 'historial'),
  };
};

export const createContacto = async (payload) => {
  const res = await api.post('/contactos', payload);
  return res.data;
};

export const updateContacto = async (idContacto, payload) => {
  const res = await api.patch(`/contactos/${idContacto}`, payload);
  return res.data;
};

export const createAplicanteForContacto = async (idContacto, payload) => {
  const res = await api.post(`/contactos/${idContacto}/aplicantes`, payload);
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
  return normalizeArrayResponse(res.data, 'tipos_tramite');
};

export const getPaises = async () => {
  const res = await api.get('/catalogos/paises');
  return normalizeArrayResponse(res.data, 'paises');
};

const contactosService = {
  getContactos,
  getContactoById,
  getContactoAplicantes,
  createContacto,
  updateContacto,
  createAplicanteForContacto,
  createSolicitudForCliente,
  moverSolicitudArea,
  getSolicitudById,
  getTiposTramite,
  getPaises,
};

export default contactosService;
