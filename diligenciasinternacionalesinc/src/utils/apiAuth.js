/**
 * Adjunta el token de sesión a TODAS las llamadas al backend (axios y fetch) y reacciona a
 * sesiones vencidas. El backend es la autoridad: esto sólo mejora la experiencia de usuario.
 */
import axios from 'axios';
import { authHeaders, clearAuthSession, inspectStoredSession } from './authSession';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Deben coincidir con PUBLIC_ROUTES de backend/src/middlewares/auth.js.
const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/cliente-login', '/noticias-migratorias'];

const toAbsolute = (url) => {
  try {
    return new URL(String(url || ''), window.location.origin).href;
  } catch (_) {
    return String(url || '');
  }
};

const apiPrefix = () => toAbsolute(API_BASE_URL).replace(/\/+$/, '');

export const isApiUrl = (url, baseURL) => {
  if (!url) return Boolean(baseURL);
  const raw = String(url);
  if (!/^https?:\/\//i.test(raw) && baseURL) return isApiUrl(`${String(baseURL).replace(/\/+$/, '')}/${raw.replace(/^\/+/, '')}`);
  const absolute = toAbsolute(raw);
  if (absolute.startsWith(`${apiPrefix()}/`) || absolute === apiPrefix()) return true;
  // Rutas relativas /api/... del mismo origen (cuando el backend sirve el build). Nunca se envía
  // el token a otros dominios.
  try {
    const parsed = new URL(absolute);
    return parsed.origin === window.location.origin && parsed.pathname.startsWith('/api/');
  } catch (_) {
    return false;
  }
};

const isPublicEndpoint = (url) => PUBLIC_ENDPOINTS.some((endpoint) => String(url || '').includes(endpoint));

let redirecting = false;
export const handleAuthFailure = (status, code) => {
  if (redirecting || typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (status === 401 && path !== '/login') {
    redirecting = true;
    clearAuthSession();
    window.location.assign(`/login?sesion=expirada&volver=${encodeURIComponent(path + window.location.search)}`);
  } else if (status === 403 && code === 'PASSWORD_CHANGE_REQUIRED' && path !== '/cambiar-password') {
    redirecting = true;
    window.location.assign('/cambiar-password');
  }
};

const withAuthHeader = (config) => {
  const url = config.url || '';
  if (!isApiUrl(url, config.baseURL) || isPublicEndpoint(url)) return config;
  const headers = config.headers || {};
  const hasAuth = typeof headers.get === 'function' ? headers.get('Authorization') : headers.Authorization;
  if (!hasAuth) {
    const { Authorization } = authHeaders();
    if (Authorization) {
      if (typeof headers.set === 'function') headers.set('Authorization', Authorization);
      else headers.Authorization = Authorization;
      config.headers = headers;
    }
  }
  return config;
};

export const attachAxiosAuth = (instance) => {
  if (!instance || instance.__diligenciasAuth) return instance;
  instance.__diligenciasAuth = true;
  instance.interceptors.request.use(withAuthHeader);
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const { config, response } = error || {};
      if (response && config && isApiUrl(config.url, config.baseURL) && !isPublicEndpoint(config.url)) {
        handleAuthFailure(response.status, response.data?.error?.code);
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

const patchFetch = () => {
  if (typeof window === 'undefined' || !window.fetch || window.fetch.__diligenciasAuth) return;
  const originalFetch = window.fetch.bind(window);
  const authFetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    let nextInit = init;
    if (isApiUrl(url) && !isPublicEndpoint(url)) {
      const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined) || {});
      const { Authorization } = authHeaders();
      if (Authorization && !headers.has('Authorization')) headers.set('Authorization', Authorization);
      nextInit = { ...init, headers };
    }
    const response = await originalFetch(input, nextInit);
    if ((response.status === 401 || response.status === 403) && isApiUrl(url) && !isPublicEndpoint(url)) {
      let code;
      if (response.status === 403) {
        try { code = (await response.clone().json())?.error?.code; } catch (_) { code = undefined; }
      }
      handleAuthFailure(response.status, code);
    }
    return response;
  };
  authFetch.__diligenciasAuth = true;
  window.fetch = authFetch;
};

/** Se llama una vez al iniciar la app (src/index.js). */
export const installAuthInterceptors = (...instances) => {
  attachAxiosAuth(axios);
  instances.forEach(attachAxiosAuth);
  patchFetch();
};

export const hasUsableSession = () => {
  const session = inspectStoredSession();
  return session.tokenPresent && session.structurallyValid && !session.expired;
};
