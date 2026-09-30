import api from '../lib/api';
import { authHeaders, inspectStoredSession } from '../utils/authSession';

const authConfig = () => {
  const headers = authHeaders();
  return Object.keys(headers).length ? { headers } : {};
};

export const getQuickBooksStatus = async () => {
  const response = await api.get('/integraciones/quickbooks/estado', authConfig());
  return response.data;
};

export const connectQuickBooks = async () => {
  const session = inspectStoredSession();
  if (process.env.NODE_ENV === 'development') console.info('[QB-AUTH]', {
    token_present: session.tokenPresent,
    token_expired: session.expired,
    authorization_header_present: Boolean(authHeaders().Authorization),
  });
  const response = await api.get('/integraciones/quickbooks/conectar', {
    ...authConfig(),
    params: { format: 'json' },
  });
  return response.data?.authorization_url;
};

export const disconnectQuickBooks = async () => {
  const response = await api.post('/integraciones/quickbooks/desconectar', {}, authConfig());
  return response.data;
};

export const getClientQuickBooksStatus = async (idCliente) => {
  const response = await api.get(
    `/integraciones/quickbooks/clientes/${idCliente}/estado`,
    authConfig()
  );
  return response.data;
};

export const syncClientToQuickBooks = async (idCliente) => {
  const response = await api.post(
    `/integraciones/quickbooks/clientes/${idCliente}/sincronizar`,
    {},
    authConfig()
  );
  return response.data?.quickbooks || response.data;
};

export const getQuickBooksClients = async (params = {}) => {
  const response = await api.get('/integraciones/quickbooks/clientes', {
    ...authConfig(),
    params,
  });
  return {
    clientes: Array.isArray(response.data?.clientes) ? response.data.clientes : [],
    limit: response.data?.limit || params.limit || 20,
    offset: response.data?.offset || params.offset || 0,
  };
};

const quickbooksService = {
  getQuickBooksStatus,
  connectQuickBooks,
  disconnectQuickBooks,
  getClientQuickBooksStatus,
  syncClientToQuickBooks,
  getQuickBooksClients,
};

export default quickbooksService;
