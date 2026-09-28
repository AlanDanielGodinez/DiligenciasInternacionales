import api from '../lib/api';

const normalizePerfilResponse = (data) => {
  if (data?.perfil && typeof data.perfil === 'object') return data.perfil;
  if (data?.data && typeof data.data === 'object') return data.data;
  if (data && typeof data === 'object') return data;
  return null;
};

const normalizePlantillasResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.plantillas)) return data.plantillas;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const normalizeVersionesResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.versiones)) return data.versiones;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

export const getPerfilBySolicitud = async (idSolicitud) => {
  try {
    const res = await api.get(`/solicitudes/${idSolicitud}/perfil`);
    return normalizePerfilResponse(res.data);
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

export const getPerfilPlantillas = async () => {
  const res = await api.get('/perfiles/plantillas');
  return normalizePlantillasResponse(res.data);
};

export const resolverPerfilPlantilla = async ({ id_tipo_tramite, id_pais }) => {
  const res = await api.get('/perfiles/plantillas/resolver', {
    params: { id_tipo_tramite, id_pais },
  });
  return normalizePerfilResponse(res.data);
};

export const createPerfilSolicitud = async (idSolicitud, payload) => {
  const res = await api.post(`/solicitudes/${idSolicitud}/perfil`, payload);
  return normalizePerfilResponse(res.data);
};

export const updatePerfil = async (idPerfil, payload) => {
  const res = await api.patch(`/perfiles/${idPerfil}`, payload);
  return normalizePerfilResponse(res.data);
};

export const getPerfilVersiones = async (idPerfil) => {
  const res = await api.get(`/perfiles/${idPerfil}/versiones`);
  return normalizeVersionesResponse(res.data);
};

export const generarPdfPerfilVersion = async (idVersion, options = {}) => {
  const query = options.force === true ? '?force=true' : '';
  const res = await api.post(`/perfiles/versiones/${idVersion}/generar-pdf${query}`);
  return normalizePerfilResponse(res.data);
};

export const descargarDocumentoPerfilPdf = async (idDocumento) => {
  const res = await api.get(`/documentos/${idDocumento}/descargar`, {
    responseType: 'blob',
  });
  return res.data;
};
