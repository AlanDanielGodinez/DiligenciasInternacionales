jest.mock('axios', () => ({
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
}));

const API = 'http://localhost:5000/api';

const makeInstance = () => ({
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
});

const validToken = () => {
  const payload = btoa(JSON.stringify({ id_empleado: 1, exp: Math.floor(Date.now() / 1000) + 3600 }));
  return `${payload}.firma`;
};

describe('apiAuth', () => {
  let apiAuth;
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    apiAuth = require('./apiAuth');
  });

  test('reconoce URLs del backend y nunca las de terceros', () => {
    expect(apiAuth.isApiUrl(`${API}/clientes`)).toBe(true);
    expect(apiAuth.isApiUrl('/clientes', API)).toBe(true);
    expect(apiAuth.isApiUrl('https://maps.googleapis.com/maps/api/js')).toBe(false);
    expect(apiAuth.isApiUrl('https://otro-dominio.com/api/clientes')).toBe(false);
    expect(apiAuth.isApiUrl(`${window.location.origin}/api/clientes`)).toBe(true);
  });

  test('axios: agrega Authorization a llamadas del backend, no a login ni a terceros', () => {
    localStorage.setItem('authToken', validToken());
    const instance = makeInstance();
    apiAuth.attachAxiosAuth(instance);
    const [onRequest] = instance.interceptors.request.use.mock.calls[0];

    expect(onRequest({ url: '/clientes', baseURL: API, headers: {} }).headers.Authorization).toMatch(/^Bearer /);
    expect(onRequest({ url: `${API}/auth/login`, headers: {} }).headers.Authorization).toBeUndefined();
    expect(onRequest({ url: 'https://maps.googleapis.com/x', headers: {} }).headers.Authorization).toBeUndefined();
    expect(onRequest({ url: '/clientes', baseURL: API, headers: { Authorization: 'Bearer propio' } }).headers.Authorization)
      .toBe('Bearer propio');
  });

  test('axios: sin token no inventa encabezado', () => {
    const instance = makeInstance();
    apiAuth.attachAxiosAuth(instance);
    const [onRequest] = instance.interceptors.request.use.mock.calls[0];
    expect(onRequest({ url: '/clientes', baseURL: API, headers: {} }).headers.Authorization).toBeUndefined();
  });

  test('fetch: agrega el token sólo hacia el backend', async () => {
    localStorage.setItem('authToken', validToken());
    const originalFetch = jest.fn(() => Promise.resolve({ status: 200 }));
    window.fetch = originalFetch;
    apiAuth.installAuthInterceptors();

    await window.fetch(`${API}/solicitudes`);
    await window.fetch('https://maps.googleapis.com/maps/api/js');
    expect(originalFetch.mock.calls[0][1].headers.get('Authorization')).toMatch(/^Bearer /);
    expect(originalFetch.mock.calls[1][1]).toEqual({});
  });

  test('hasUsableSession detecta token ausente o vencido', () => {
    expect(apiAuth.hasUsableSession()).toBe(false);
    localStorage.setItem('authToken', validToken());
    expect(apiAuth.hasUsableSession()).toBe(true);
    const expired = `${btoa(JSON.stringify({ exp: 10 }))}.firma`;
    localStorage.setItem('authToken', expired);
    expect(apiAuth.hasUsableSession()).toBe(false);
  });
});
