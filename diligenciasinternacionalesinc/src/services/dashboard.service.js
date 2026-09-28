import api from '../lib/api';

export const getDashboardResumen = async (params = {}) => {
  const res = await api.get('/dashboard/resumen', { params });
  return res.data;
};

const dashboardService = {
  getDashboardResumen,
};

export default dashboardService;
