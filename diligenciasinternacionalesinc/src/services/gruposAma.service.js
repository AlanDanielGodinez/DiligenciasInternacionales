import api from '../lib/api';

export const getGruposAma = async (params = {}) => {
  const res = await api.get('/grupos-ama', { params });
  return Array.isArray(res.data) ? res.data : [];
};

export const getGrupoAma = async (idGrupo) => {
  const res = await api.get(`/grupos-ama/${idGrupo}`);
  return res.data;
};

export const createGrupoAma = async (payload) => {
  const res = await api.post('/grupos-ama', payload);
  return res.data;
};

export const updateGrupoAma = async (idGrupo, payload) => {
  const res = await api.patch(`/grupos-ama/${idGrupo}`, payload);
  return res.data;
};
export const terminarGrupoAma = async (idGrupo,payload) => (await api.post(`/grupos-ama/${idGrupo}/terminar`,payload)).data;

export const getGrupoAmaSolicitudes = async (idGrupo) => {
  const res = await api.get(`/grupos-ama/${idGrupo}/solicitudes`);
  return Array.isArray(res.data) ? res.data : [];
};

export const getGrupoAmaChecklist = async (idGrupo) => {
  const res = await api.get(`/grupos-ama/${idGrupo}/checklist`);
  return Array.isArray(res.data) ? res.data : [];
};

export const generarGrupoAmaChecklist = async (idGrupo) => {
  const res = await api.post(`/grupos-ama/${idGrupo}/checklist/generar`);
  return Array.isArray(res.data) ? res.data : [];
};

export const updateGrupoAmaChecklistItem = async (idGrupo, idChecklist, payload) => {
  const res = await api.patch(`/grupos-ama/${idGrupo}/checklist/${idChecklist}`, payload);
  return res.data;
};

export const getCandidatosGrupoAma = async (params = {}) => {
  const res = await api.get('/grupos-ama/candidatos', { params });
  return Array.isArray(res.data) ? res.data : [];
};
export const getAplicantesAma = async (params = {}) => (await api.get('/grupos-ama/aplicantes', { params })).data || [];

export const addSolicitudesGrupoAma = async (idGrupo, idSolicitudes) => {
  const res = await api.post(`/grupos-ama/${idGrupo}/solicitudes`, {
    id_solicitudes: idSolicitudes,
  });
  return res.data;
};

export const removeSolicitudGrupoAma = async (idGrupo, idSolicitud) => {
  const res = await api.delete(`/grupos-ama/${idGrupo}/solicitudes/${idSolicitud}`);
  return res.data;
};

export const getTiposTramite = async () => {
  const res = await api.get('/tipos-tramite');
  return Array.isArray(res.data) ? res.data : [];
};

export const getPaises = async () => {
  const res = await api.get('/catalogos/paises');
  return Array.isArray(res.data) ? res.data : [];
};

export const getEmpleados = async () => {
  const res = await api.get('/empleados');
  return Array.isArray(res.data) ? res.data : [];
};

const gruposAmaService = {
  addSolicitudesGrupoAma,
  createGrupoAma,
  getCandidatosGrupoAma,
  getEmpleados,
  getGrupoAma,
  generarGrupoAmaChecklist,
  getGrupoAmaChecklist,
  getGrupoAmaSolicitudes,
  getGruposAma,
  getPaises,
  getTiposTramite,
  removeSolicitudGrupoAma,
  updateGrupoAmaChecklistItem,
  updateGrupoAma,
};

export default gruposAmaService;
