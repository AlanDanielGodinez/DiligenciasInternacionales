const crypto = require('crypto');
const repository = require('../repositories/quickbooks.repository');
const { encryptToken, decryptToken } = require('./quickbooksCrypto.service');
const { writeQuickBooksAudit } = require('./quickbooksAudit.service');

const AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const REFRESH_SKEW_MS = 5 * 60 * 1000;
let refreshPromise = null;

function getConfig() {
  const config = {
    clientId: String(process.env.QUICKBOOKS_CLIENT_ID || '').trim(),
    clientSecret: String(process.env.QUICKBOOKS_CLIENT_SECRET || '').trim(),
    redirectUri: String(process.env.QUICKBOOKS_REDIRECT_URI || '').trim(),
    environment: String(process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox').trim().toLowerCase(),
    frontendUrl: String(process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''),
  };
  const missing = [];
  if (!config.clientId) missing.push('QUICKBOOKS_CLIENT_ID');
  if (!config.clientSecret) missing.push('QUICKBOOKS_CLIENT_SECRET');
  if (!config.redirectUri) missing.push('QUICKBOOKS_REDIRECT_URI');
  if (!process.env.QUICKBOOKS_TOKEN_ENCRYPTION_KEY) missing.push('QUICKBOOKS_TOKEN_ENCRYPTION_KEY');
  if (!['sandbox', 'production'].includes(config.environment)) {
    throw new Error('QUICKBOOKS_ENVIRONMENT must be sandbox or production');
  }
  if (missing.length) throw new Error(`QuickBooks is not configured: ${missing.join(', ')}`);
  return config;
}

function isConfigured() {
  try { getConfig(); return true; } catch (_) { return false; }
}

function basicAuthorization(config) {
  return `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`;
}

async function requestTokens(parameters, fetchImpl = fetch) {
  const config = getConfig();
  let response;
  try {
    response = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: basicAuthorization(config),
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(parameters),
    signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    writeQuickBooksAudit({ event: 'token_exchange', token_exchange_attempted: true,
      token_exchange_status: null, access_token_received: false, refresh_token_received: false });
    throw error;
  }
  const body = await response.json().catch(() => ({}));
  writeQuickBooksAudit({ event: 'token_exchange', token_exchange_attempted: true,
    token_exchange_status: `HTTP ${response.status}`,
    access_token_received: Boolean(body.access_token), refresh_token_received: Boolean(body.refresh_token) });
  if (!response.ok || !body.access_token || !body.refresh_token) {
    const error = new Error(`Intuit token request failed (${response.status})`);
    error.status = response.status;
    error.oauthCode = body.error;
    throw error;
  }
  return body;
}

function protectTokenResponse(body) {
  const now = Date.now();
  return {
    access_token_encrypted: encryptToken(body.access_token),
    refresh_token_encrypted: encryptToken(body.refresh_token),
    access_token_expires_at: new Date(now + Number(body.expires_in || 3600) * 1000),
    refresh_token_expires_at: body.x_refresh_token_expires_in
      ? new Date(now + Number(body.x_refresh_token_expires_in) * 1000)
      : null,
  };
}

async function createAuthorizationUrl() {
  const config = getConfig();
  const state = crypto.randomBytes(32).toString('base64url');
  await repository.storeOAuthState(state, 600);
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: config.redirectUri,
    state,
  }).toString();
  return url.toString();
}

async function handleCallback({ code, realmId, state }, fetchImpl = fetch) {
  if (!code || !realmId || !state) {
    const error = new Error('OAuth callback is missing required parameters');
    error.oauthCategory = 'invalid_callback';
    error.missingParameters = [
      ...(!code ? ['code'] : []),
      ...(!realmId ? ['realmId'] : []),
      ...(!state ? ['state'] : []),
    ];
    throw error;
  }
  if (!await repository.consumeOAuthState(state)) {
    const error = new Error('OAuth state is invalid or expired');
    error.oauthCategory = 'invalid_state';
    throw error;
  }
  const config = getConfig();
  let body;
  try {
    body = await requestTokens({
      grant_type: 'authorization_code', code, redirect_uri: config.redirectUri,
    }, fetchImpl);
  } catch (error) {
    error.oauthCategory = error.oauthCode === 'invalid_grant'
      ? 'redirect_uri_mismatch_or_invalid_code'
      : 'token_exchange_failed';
    throw error;
  }
  try {
    return await repository.saveConnection({
      realm_id: String(realmId), environment: config.environment, ...protectTokenResponse(body),
    });
  } catch (error) {
    error.oauthCategory = 'connection_persist_failed';
    throw error;
  }
}

async function refreshConnection(connection, fetchImpl = fetch) {
  try {
    const body = await requestTokens({
      grant_type: 'refresh_token', refresh_token: decryptToken(connection.refresh_token_encrypted),
    }, fetchImpl);
    return await repository.updateConnectionTokens(
      connection.id_quickbooks_conexion, protectTokenResponse(body)
    );
  } catch (error) {
    if (['invalid_grant', 'invalid_client'].includes(error.oauthCode) || [400, 401].includes(error.status)) {
      await repository.setConnectionStatus(
        connection.id_quickbooks_conexion, 'requires_reconnection', 'La autorización de QuickBooks debe renovarse'
      );
      error.requiresReconnection = true;
    }
    throw error;
  }
}

async function getValidAccessToken({ forceRefresh = false, fetchImpl = fetch } = {}) {
  let connection = await repository.getActiveConnection();
  if (!connection) {
    const error = new Error('QuickBooks is not connected');
    error.code = 'QUICKBOOKS_NOT_CONNECTED';
    throw error;
  }
  const expiresSoon = new Date(connection.access_token_expires_at).getTime() <= Date.now() + REFRESH_SKEW_MS;
  if (forceRefresh || expiresSoon) {
    if (!refreshPromise) {
      refreshPromise = refreshConnection(connection, fetchImpl).finally(() => { refreshPromise = null; });
    }
    connection = await refreshPromise;
  }
  return { accessToken: decryptToken(connection.access_token_encrypted), connection };
}

function getFrontendResultUrl(result, reason = null) {
  const config = getConfig();
  const url = new URL('/empleado/configuracion/quickbooks', `${config.frontendUrl}/`);
  url.searchParams.set('quickbooks', result);
  if (reason) url.searchParams.set('reason', reason);
  return url.toString();
}

module.exports = {
  getConfig, isConfigured, createAuthorizationUrl, handleCallback,
  getValidAccessToken, getFrontendResultUrl, protectTokenResponse,
};
