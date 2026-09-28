import api from '../lib/api';

const normalizeSolicitudesResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.solicitudes)) return data.solicitudes;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const normalizeSolicitudResponse = (data) => {
  if (data?.solicitud && typeof data.solicitud === 'object') return data.solicitud;
  if (data?.data && typeof data.data === 'object') return data.data;
  if (data && typeof data === 'object') return data;
  return null;
};

const normalizeDocumentosResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.documentos)) return data.documentos;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const normalizeSeguimientosResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.seguimientos)) return data.seguimientos;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

export const getSolicitudes = async ({ limit = 500, offset = 0 } = {}) => {
  const res = await api.get('/solicitudes', { params: { limit, offset } });
  return normalizeSolicitudesResponse(res.data);
};

export const getSolicitudById = async (idSolicitud) => {
  const res = await api.get(`/solicitudes/${idSolicitud}`);
  return normalizeSolicitudResponse(res.data);
};

export const getDocumentosBySolicitud = async (idSolicitud) => {
  const res = await api.get(`/documentos/solicitud/${idSolicitud}`);
  return normalizeDocumentosResponse(res.data);
};

export const getDocumentosRequeridosBySolicitud = async (idSolicitud) => {
  const res = await api.get(`/solicitudes/${idSolicitud}/documentos-requeridos`);
  if (Array.isArray(res.data?.documentos_requeridos)) return res.data.documentos_requeridos;
  return normalizeDocumentosResponse(res.data);
};

export const getResumenAvanceSolicitud = async (idSolicitud) => {
  const res = await api.get(`/solicitudes/${idSolicitud}/resumen-avance`);
  return res.data;
};

export const uploadDocumentoRequerido = async (idSolicitud, claveDocumento, file) => {
  const formData = new FormData();
  formData.append('archivo', file);
  const res = await api.post(
    `/solicitudes/${idSolicitud}/documentos-requeridos/${claveDocumento}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data?.documento || res.data;
};

export const getSeguimientosBySolicitud = async (idSolicitud) => {
  const res = await api.get(`/solicitudes/${idSolicitud}/seguimientos`);
  return normalizeSeguimientosResponse(res.data);
};

export const getEstadosDisponiblesSolicitud = async (idSolicitud) => {
  const res = await api.get(`/solicitudes/${idSolicitud}/estados-disponibles`);
  return res.data;
};

export const createSeguimientoOperativo = async (idSolicitud, payload) => {
  const res = await api.post(`/solicitudes/${idSolicitud}/seguimientos-operativos`, payload);
  return res.data;
};

export const updateSolicitudResponsable = async (idSolicitud, payload) => {
  const res = await api.patch(`/solicitudes/${idSolicitud}/responsable`, payload);
  return normalizeSolicitudResponse(res.data);
};

export const updateContacto = async (idContacto, payload) => {
  const res = await api.patch(`/contactos/${idContacto}`, payload);
  return res.data;
};

export const updateCliente = async (idCliente, payload) => {
  const res = await api.patch(`/clientes/${idCliente}`, payload);
  return res.data;
};

export const updateSolicitud = async (idSolicitud, payload) => {
  const res = await api.patch(`/solicitudes/${idSolicitud}`, payload);
  return normalizeSolicitudResponse(res.data);
};

export default {
  getSolicitudes,
  getSolicitudById,
  getDocumentosBySolicitud,
  getDocumentosRequeridosBySolicitud,
  getResumenAvanceSolicitud,
  uploadDocumentoRequerido,
  getSeguimientosBySolicitud,
  getEstadosDisponiblesSolicitud,
  createSeguimientoOperativo,
  updateSolicitudResponsable,
  updateContacto,
  updateCliente,
  updateSolicitud,
};
