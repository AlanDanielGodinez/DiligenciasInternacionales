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

export const getContactQuickBooksStatus = async (idContacto) => {
  const response = await api.get(
    `/integraciones/quickbooks/contactos/${idContacto}/estado`,
    authConfig()
  );
  return response.data;
};

export const syncContactToQuickBooks = async (idContacto) => {
  const response = await api.post(
    `/integraciones/quickbooks/contactos/${idContacto}/sincronizar`,
    {},
    authConfig()
  );
  return response.data?.quickbooks || response.data;
};

export const getPendingQuickBooksContacts = async (params = {}) => {
  const response = await api.get('/integraciones/quickbooks/pendientes', {
    ...authConfig(),
    params,
  });
  return {
    contactos: Array.isArray(response.data?.contactos) ? response.data.contactos : [],
    limit: response.data?.limit || params.limit || 20,
    offset: response.data?.offset || params.offset || 0,
  };
};

const quickbooksService = {
  getQuickBooksStatus,
  connectQuickBooks,
  disconnectQuickBooks,
  getContactQuickBooksStatus,
  syncContactToQuickBooks,
  getPendingQuickBooksContacts,
};

export default quickbooksService;
