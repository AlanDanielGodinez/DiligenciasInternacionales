import api from '../lib/api';
export const getEncuestaSatisfaccion = async (idSolicitud) => (await api.get(`/solicitudes/${idSolicitud}/encuesta-satisfaccion`)).data?.encuesta || null;
export const createEncuestaSatisfaccion = async (idSolicitud, payload) => (await api.post(`/solicitudes/${idSolicitud}/encuesta-satisfaccion`, payload)).data?.encuesta || null;
export const listEncuestasSatisfaccion = async (idCliente) => (await api.get(`/clientes/${idCliente}/encuestas-satisfaccion`)).data?.encuestas || [];
export const createEncuestaSatisfaccionCliente = async (idCliente, payload) => (await api.post(`/clientes/${idCliente}/encuestas-satisfaccion`, payload)).data?.encuesta || null;
export const updateEncuestaSatisfaccionCliente = async (idCliente, idEncuesta, payload) => (await api.patch(`/clientes/${idCliente}/encuestas-satisfaccion/${idEncuesta}`, payload)).data?.encuesta || null;
