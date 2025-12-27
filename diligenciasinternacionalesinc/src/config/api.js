// Configuración de URLs de la API MongoDB
const API_BASE_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Autenticación MongoDB
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  VERIFY: `${API_BASE_URL}/api/auth/verify`,
  CLIENTE_LOGIN: `${API_BASE_URL}/api/auth/cliente-login`,
  
  // Utilidad
  HEALTH: `${API_BASE_URL}/health`,
  
  // PostgreSQL endpoints (COMENTADOS para referencia):
  // POSTGRES_LOGIN: `${API_BASE_URL}/api/login`,
  // POSTGRES_CLIENTE_LOGIN: `${API_BASE_URL}/api/clientes/login`,
  // POSTGRES_PROTECTED: `${API_BASE_URL}/api/protected`,
};

export default API_ENDPOINTS;