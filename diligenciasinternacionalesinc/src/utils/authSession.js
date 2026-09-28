export const AUTH_TOKEN_KEY = 'authToken';
export const AUTH_USER_KEY = 'user';

const decodePayload = (token) => {
  const encoded = String(token || '').split('.')[0];
  if (!encoded) return null;
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(Array.from(atob(base64), (char) =>
      `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')));
  } catch (_) { return null; }
};

export const inspectStoredSession = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const payload = decodePayload(token);
  return {
    token,
    tokenPresent: Boolean(token),
    structurallyValid: Boolean(token && token.split('.').length === 2 && payload),
    expired: Boolean(payload?.exp && Number(payload.exp) <= Math.floor(Date.now() / 1000)),
    payload,
  };
};

export const authHeaders = () => {
  const { token } = inspectStoredSession();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const clearAuthSession = () => {
  [AUTH_TOKEN_KEY, AUTH_USER_KEY, 'token', 'accessToken', 'userToken']
    .forEach((key) => localStorage.removeItem(key));
};
