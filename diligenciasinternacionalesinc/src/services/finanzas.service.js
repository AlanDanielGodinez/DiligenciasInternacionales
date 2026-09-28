import api from '../lib/api';

export const getSolicitudesPendientesPago = async () => {
  const res = await api.get('/finanzas/solicitudes-pendientes-pago');
  return res.data?.solicitudes || [];
};

export const getHistorialPagos = async (params = {}) => {
  const res = await api.get('/finanzas/pagos', { params });
  return res.data?.pagos || [];
};
export const getBandejaFinanzas = async (params = {}) => (await api.get('/finanzas/pagos',{params})).data;

export const getPagosSolicitud = async (idSolicitud) => {
  const res = await api.get(`/solicitudes/${idSolicitud}/pagos`);
  return res.data?.pagos || [];
};

export const registrarPagoSolicitud = async (idSolicitud, payload) => {
  const formData = new FormData();

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (key === 'comprobante') return;
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  if (payload?.comprobante) {
    formData.append('comprobante', payload.comprobante);
  }

  const res = await api.post(`/solicitudes/${idSolicitud}/pagos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.pago;
};

export const validarPago = async (idPago, payload = {}) => {
  const res = await api.patch(`/pagos/${idPago}/validar`, payload);
  return res.data;
};

export const getDestinoPostPago = async (idSolicitud) => {
  const res = await api.get(`/solicitudes/${idSolicitud}/destino-post-pago`);
  return res.data;
};

export const enviarSolicitudPostPago = async (idSolicitud, payload = {}) => {
  const res = await api.patch(`/solicitudes/${idSolicitud}/enviar-post-pago`, payload);
  return res.data;
};

export const getEmpleadosActivos = async () => {
  const res = await api.get('/empleados');
  return Array.isArray(res.data) ? res.data : [];
};

export const rechazarPago = async (idPago, payload = {}) => {
  const res = await api.patch(`/pagos/${idPago}/rechazar`, payload);
  return res.data;
};

export const descargarDocumento = async (idDocumento) => {
  const res = await api.get(`/documentos/${idDocumento}/descargar`, {
    responseType: 'blob',
  });
  return res;
};

const finanzasService = {
  descargarDocumento,
  enviarSolicitudPostPago,
  getDestinoPostPago,
  getEmpleadosActivos,
  getHistorialPagos,
  getPagosSolicitud,
  getSolicitudesPendientesPago,
  rechazarPago,
  registrarPagoSolicitud,
  validarPago,
};

export default finanzasService;
