import api from '../lib/api';

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getHealthTables = async () => {
  const res = await api.get('/health/tables');
  return res.data;
};

export default {
  getHealth,
  getHealthTables,
};
