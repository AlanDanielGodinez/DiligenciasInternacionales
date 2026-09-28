import api from '../lib/api';
export const getCitasIndividual=async(params={})=>(await api.get('/citas/individual',{params})).data?.citas||[];
export const createCitaIndividual=async(id,payload)=>(await api.post(`/citas/individual/${id}`,payload)).data?.cita;
export const updateCitaIndividual=async(id,idCita,payload)=>(await api.patch(`/citas/individual/${id}/${idCita}`,payload)).data?.cita;
export const getDsIndividual=async(id)=>(await api.get(`/solicitudes/${id}/ds-actividades`)).data?.actividades||[];
export const createDsIndividual=async(id,payload)=>(await api.post(`/solicitudes/${id}/ds-actividades`,payload)).data?.actividad;
export const setResultadoIndividual=async(id,payload)=>(await api.patch(`/solicitudes/${id}/resultado-individual`,payload)).data;
