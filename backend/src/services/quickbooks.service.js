const repository = require('../repositories/quickbooks.repository');
const authService = require('./quickbooksAuth.service');

const FIELD_LIMITS = Object.freeze({
  Title: 16,
  GivenName: 25,
  FamilyName: 25,
  DisplayName: 100,
  CompanyName: 100,
  Notes: 1024,
  Email: 100,
  Phone: 30,
});
const clientSyncs = new Map();

const normalizeSpaces = (value) => String(value || '')
  .normalize('NFKC')
  .replace(/[\u2018\u2019\u2032]/g, "'")
  .replace(/[\u201C\u201D\u2033]/g, '"')
  .replace(/[\\\u2044\u2215]/g, '/')
  .trim()
  .replace(/\s+/g, ' ');

function titleCase(value) {
  return normalizeSpaces(value)
    .toLocaleLowerCase('es-MX')
    .replace(/(^|[\s\-'])\p{L}/gu, (match) => match.toLocaleUpperCase('es-MX'));
}

function uniqueNormalized(values, transform = normalizeSpaces) {
  const seen = new Set();
  return (Array.isArray(values) ? values : []).reduce((result, value) => {
    const clean = transform(value);
    const key = clean.toLocaleLowerCase('es-MX');
    if (clean && !seen.has(key)) { seen.add(key); result.push(clean); }
    return result;
  }, []);
}

function fitJoinedValues(values, separator, limit, field, warnings) {
  const accepted = [];
  for (const value of values) {
    const candidate = [...accepted, value].join(separator);
    if (candidate.length <= limit) accepted.push(value);
    else warnings.push(`${field}: se omitió "${value}" porque excede el límite de ${limit} caracteres`);
  }
  return accepted.join(separator);
}

function isValidEmail(value) {
  const email = normalizeSpaces(value);
  return email.length <= FIELD_LIMITS.Email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(value) {
  const phone = normalizeSpaces(value);
  if (!phone || phone.length > FIELD_LIMITS.Phone || /#ERROR!|N\/A|NULL|UNDEFINED/i.test(phone)) return false;
  return /\d/.test(phone) && /^[+\d\s().-]+$/.test(phone);
}

function buildQuickBooksCustomerPayload(clientData) {
  if (!clientData?.id_cliente) throw new Error('id_cliente is required');
  const warnings = [];
  let givenName = titleCase(clientData.nombre);
  if (!givenName) throw new Error('Client name is required');
  if (givenName.length > FIELD_LIMITS.GivenName) {
    warnings.push(`GivenName: el nombre fue recortado al límite de ${FIELD_LIMITS.GivenName} caracteres`);
    givenName = givenName.slice(0, FIELD_LIMITS.GivenName).trimEnd();
  }

  let familyName = titleCase([clientData.apellido_paterno, clientData.apellido_materno]
    .filter(Boolean).join(' '));
  if (familyName.length > FIELD_LIMITS.FamilyName) {
    warnings.push(`FamilyName: los apellidos fueron recortados al límite de ${FIELD_LIMITS.FamilyName} caracteres`);
    familyName = familyName.slice(0, FIELD_LIMITS.FamilyName).trimEnd();
  }
  const fullName = titleCase([clientData.nombre, clientData.apellido_paterno, clientData.apellido_materno]
    .filter(Boolean).join(' '));
  const suffix = ` (${clientData.id_cliente})`;
  let displayName = `${fullName}${suffix}`;
  if (displayName.length > FIELD_LIMITS.DisplayName) {
    warnings.push(`DisplayName: el nombre fue recortado conservando el identificador (${FIELD_LIMITS.DisplayName} caracteres)`);
    displayName = `${fullName.slice(0, FIELD_LIMITS.DisplayName - suffix.length).trimEnd()}${suffix}`;
  }

  const procedures = uniqueNormalized(clientData.tramites);
  const companyName = fitJoinedValues(procedures, ' | ', FIELD_LIMITS.CompanyName, 'CompanyName', warnings);
  const title = String(clientData.id_cliente);
  if (title.length > FIELD_LIMITS.Title) throw new Error('id_cliente exceeds the QuickBooks Title limit');

  const payload = { Title: title, GivenName: givenName, DisplayName: displayName };
  if (familyName) payload.FamilyName = familyName;
  if (companyName) payload.CompanyName = companyName;
  if (isValidEmail(clientData.correo)) payload.PrimaryEmailAddr = { Address: normalizeSpaces(clientData.correo) };
  if (isValidPhone(clientData.telefono)) payload.PrimaryPhone = { FreeFormNumber: normalizeSpaces(clientData.telefono) };
  return { payload, warnings };
}

function sanitizeError(error) {
  const message = String(error?.message || 'Error desconocido de QuickBooks')
    .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+/gi, 'Bearer [REDACTED]')
    .replace(/(?:access|refresh)_token["'=:\s]+[^\s,"']+/gi, 'token=[REDACTED]');
  return message.slice(0, 1000);
}

function apiBase(environment) {
  return environment === 'production'
    ? 'https://quickbooks.api.intuit.com'
    : 'https://sandbox-quickbooks.api.intuit.com';
}

async function quickBooksRequest(path, options = {}, retried = false) {
  const { accessToken, connection } = await authService.getValidAccessToken({
    forceRefresh: retried, fetchImpl: options.fetchImpl,
  });
  const response = await (options.fetchImpl || fetch)(
    `${apiBase(connection.environment)}/v3/company/${encodeURIComponent(connection.realm_id)}${path}`,
    {
      method: options.method || 'GET',
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(15000),
    }
  );
  if (response.status === 401 && !retried) return quickBooksRequest(path, options, true);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fault = body?.Fault?.Error?.[0];
    const error = new Error(`QuickBooks API error (${response.status}): ${fault?.Message || 'request failed'}`);
    error.status = response.status;
    error.qboCode = fault?.code;
    throw error;
  }
  return body;
}

async function getCustomer(id, options) {
  const body = await quickBooksRequest(`/customer/${encodeURIComponent(id)}?minorversion=75`, options);
  return body.Customer;
}

async function findCustomerByDisplayName(displayName, options) {
  const escaped = displayName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const query = encodeURIComponent(`SELECT * FROM Customer WHERE DisplayName = '${escaped}' MAXRESULTS 2`);
  const body = await quickBooksRequest(`/query?query=${query}&minorversion=75`, options);
  return body?.QueryResponse?.Customer || [];
}

async function createCustomer(payload, options) {
  const body = await quickBooksRequest('/customer?minorversion=75', { ...options, method: 'POST', body: payload });
  return body.Customer;
}

async function updateCustomer(current, payload, options) {
  const body = await quickBooksRequest('/customer?minorversion=75', {
    ...options, method: 'POST', body: { ...payload, Id: current.Id, SyncToken: current.SyncToken, sparse: true },
  });
  return body.Customer;
}

function publicSyncResult(link, message) {
  const mapped = {
    pending: 'pending', syncing: 'pending', synced: 'synced', error: 'error',
    requires_reconnection: 'reconnect_required',
  };
  return {
    status: mapped[link?.sync_status] || 'pending',
    customer_id: link?.quickbooks_customer_id || null,
    message,
  };
}

async function executeSync(idCliente, options = {}) {
  const data = await repository.getClientData(idCliente);
  if (!data) { const error = new Error('Cliente not found'); error.status = 404; throw error; }
  await repository.markClientPending(idCliente);
  if (!authService.isConfigured()) {
    return { status: 'not_configured', customer_id: null, message: 'QuickBooks no está configurado' };
  }
  const connection = await repository.getLatestConnection();
  if (!connection || connection.status !== 'connected') {
    const status = connection?.status === 'requires_reconnection' ? 'requires_reconnection' : 'pending';
    const link = await repository.markSyncFailure(idCliente, status, 'QuickBooks no está conectado');
    return publicSyncResult(link, status === 'requires_reconnection'
      ? 'QuickBooks requiere reconexión' : 'QuickBooks no está conectado');
  }

  await repository.markSyncing(idCliente);
  try {
    const { payload, warnings } = buildQuickBooksCustomerPayload(data);
    warnings.forEach((warning) => console.warn(`[quickbooks] Cliente ${idCliente}: ${warning}`));
    const link = await repository.getClientLink(idCliente, connection.realm_id);
    let customer;
    if (link?.quickbooks_customer_id) {
      const current = await getCustomer(link.quickbooks_customer_id, options);
      customer = await updateCustomer(current, payload, options);
    } else {
      const matches = await findCustomerByDisplayName(payload.DisplayName, options);
      if (matches.length > 1) throw new Error('Más de un Customer coincide con DisplayName');
      customer = matches.length === 1
        ? await updateCustomer(matches[0], payload, options)
        : await createCustomer(payload, options);
    }
    const saved = await repository.markSyncSuccess(idCliente, customer, connection.realm_id);
    return publicSyncResult(saved, warnings.length
      ? `Sincronizado con ${warnings.length} advertencia(s) de longitud` : 'Cliente sincronizado con QuickBooks');
  } catch (error) {
    const reconnect = error.requiresReconnection || error.code === 'QUICKBOOKS_NOT_CONNECTED';
    const saved = await repository.markSyncFailure(
      idCliente, reconnect ? 'requires_reconnection' : 'error', sanitizeError(error)
    );
    return publicSyncResult(saved, reconnect ? 'QuickBooks requiere reconexión' : sanitizeError(error));
  }
}

async function syncClientToQuickBooks(idCliente, options = {}) {
  const key = String(idCliente);
  if (clientSyncs.has(key)) return clientSyncs.get(key);
  const promise = repository
    .withClientSyncLock(idCliente, () => executeSync(idCliente, options))
    .finally(() => clientSyncs.delete(key));
  clientSyncs.set(key, promise);
  return promise;
}

module.exports = {
  FIELD_LIMITS, titleCase, uniqueNormalized, isValidEmail, isValidPhone,
  buildQuickBooksCustomerPayload, sanitizeError, syncClientToQuickBooks,
  quickBooksRequest, findCustomerByDisplayName, apiBase,
};
