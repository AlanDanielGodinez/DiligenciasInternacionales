import api from '../lib/api';

const normalizeArray = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

export const getEmpleados = async () => {
  const res = await api.get('/empleados');
  return normalizeArray(res.data, 'empleados');
};

export const getAreas = async () => {
  const res = await api.get('/catalogos/areas');
  return normalizeArray(res.data, 'areas');
};

export const getTiposTramite = async () => {
  const res = await api.get('/tipos-tramite');
  return normalizeArray(res.data, 'tipos_tramite');
};

export const getPaises = async () => {
  const res = await api.get('/catalogos/paises');
  return normalizeArray(res.data, 'paises');
};
