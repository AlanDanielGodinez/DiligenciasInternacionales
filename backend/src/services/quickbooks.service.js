const repository = require('../repositories/quickbooks.repository');
const authService = require('./quickbooksAuth.service');

const FIELD_LIMITS = Object.freeze({
  Title: 16,
  GivenName: 25,
  DisplayName: 100,
  CompanyName: 100,
  Notes: 1024,
  Email: 100,
  Phone: 30,
});
const contactSyncs = new Map();

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

function buildQuickBooksCustomerPayload(contactData) {
  if (!contactData?.id_contacto) throw new Error('id_contacto is required');
  const warnings = [];
  let name = titleCase(contactData.nombre);
  if (!name) throw new Error('Contact name is required');
  if (name.length > FIELD_LIMITS.GivenName) {
    warnings.push(`GivenName: el nombre fue recortado al límite de ${FIELD_LIMITS.GivenName} caracteres`);
    name = name.slice(0, FIELD_LIMITS.GivenName).trimEnd();
  }

  const suffix = ` (${contactData.id_contacto})`;
  let displayName = `${name}${suffix}`;
  if (displayName.length > FIELD_LIMITS.DisplayName) {
    warnings.push(`DisplayName: el nombre fue recortado conservando el identificador (${FIELD_LIMITS.DisplayName} caracteres)`);
    displayName = `${name.slice(0, FIELD_LIMITS.DisplayName - suffix.length).trimEnd()}${suffix}`;
  }

  const applicants = uniqueNormalized(contactData.aplicantes, titleCase);
  const procedures = uniqueNormalized(contactData.tramites);
  const companyName = fitJoinedValues(procedures, ' | ', FIELD_LIMITS.CompanyName, 'CompanyName', warnings);
  const notes = fitJoinedValues(applicants, ', ', FIELD_LIMITS.Notes, 'Notes', warnings);
  const title = String(contactData.id_contacto);
  if (title.length > FIELD_LIMITS.Title) throw new Error('id_contacto exceeds the QuickBooks Title limit');

  const payload = { Title: title, GivenName: name, DisplayName: displayName };
  if (companyName) payload.CompanyName = companyName;
  if (notes) payload.Notes = notes;
  if (isValidEmail(contactData.correo)) payload.PrimaryEmailAddr = { Address: normalizeSpaces(contactData.correo) };
  if (isValidPhone(contactData.telefono)) payload.PrimaryPhone = { FreeFormNumber: normalizeSpaces(contactData.telefono) };
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

async function executeSync(idContacto, options = {}) {
  const data = await repository.getContactData(idContacto);
  if (!data) { const error = new Error('Contacto not found'); error.status = 404; throw error; }
  await repository.markContactPending(idContacto);
  if (!authService.isConfigured()) {
    return { status: 'not_configured', customer_id: null, message: 'QuickBooks no está configurado' };
  }
  const connection = await repository.getLatestConnection();
  if (!connection || connection.status !== 'connected') {
    const status = connection?.status === 'requires_reconnection' ? 'requires_reconnection' : 'pending';
    const link = await repository.markSyncFailure(idContacto, status, 'QuickBooks no está conectado');
    return publicSyncResult(link, status === 'requires_reconnection'
      ? 'QuickBooks requiere reconexión' : 'QuickBooks no está conectado');
  }

  await repository.markSyncing(idContacto);
  try {
    const { payload, warnings } = buildQuickBooksCustomerPayload(data);
    warnings.forEach((warning) => console.warn(`[quickbooks] Contacto ${idContacto}: ${warning}`));
    const link = await repository.getContactLink(idContacto, connection.realm_id);
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
    const saved = await repository.markSyncSuccess(idContacto, customer, connection.realm_id);
    return publicSyncResult(saved, warnings.length
      ? `Sincronizado con ${warnings.length} advertencia(s) de longitud` : 'Contacto sincronizado con QuickBooks');
  } catch (error) {
    const reconnect = error.requiresReconnection || error.code === 'QUICKBOOKS_NOT_CONNECTED';
    const saved = await repository.markSyncFailure(
      idContacto, reconnect ? 'requires_reconnection' : 'error', sanitizeError(error)
    );
    return publicSyncResult(saved, reconnect ? 'QuickBooks requiere reconexión' : sanitizeError(error));
  }
}

async function syncContactToQuickBooks(idContacto, options = {}) {
  const key = String(idContacto);
  if (contactSyncs.has(key)) return contactSyncs.get(key);
  const promise = repository
    .withContactSyncLock(idContacto, () => executeSync(idContacto, options))
    .finally(() => contactSyncs.delete(key));
  contactSyncs.set(key, promise);
  return promise;
}

module.exports = {
  FIELD_LIMITS, titleCase, uniqueNormalized, isValidEmail, isValidPhone,
  buildQuickBooksCustomerPayload, sanitizeError, syncContactToQuickBooks,
  quickBooksRequest, findCustomerByDisplayName,
};
