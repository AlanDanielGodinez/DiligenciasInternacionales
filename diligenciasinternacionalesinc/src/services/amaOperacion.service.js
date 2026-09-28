import api from '../lib/api';
export const getOperacionAma=async id=>(await api.get(`/solicitudes/${id}/operacion-ama`)).data;
export const addDsAma=async(id,p)=>(await api.post(`/solicitudes/${id}/operacion-ama/ds`,p)).data;
export const addProtocoloAma=async(id,p)=>(await api.post(`/solicitudes/${id}/operacion-ama/protocolo`,p)).data;
export const setResultadoAma=async(id,p)=>(await api.patch(`/solicitudes/${id}/operacion-ama/resultado`,p)).data;
export const setVisaRecibidaAma=async(id,p)=>(await api.patch(`/solicitudes/${id}/operacion-ama/visa-recibida`,p)).data;
