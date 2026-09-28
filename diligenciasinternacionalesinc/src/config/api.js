// Configuración central de endpoints usando variable de entorno CRA
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  VERIFY: `${BASE_URL}/auth/verify`,
  CLIENTE_LOGIN: `${BASE_URL}/auth/cliente-login`,

  // Utilidad / health
  HEALTH: `${BASE_URL}/health`,
  HEALTH_TABLES: `${BASE_URL}/health/tables`,
  MIGRATION_NEWS: `${BASE_URL}/noticias-migratorias`,

  // Ejemplos PostgreSQL (referencia)
  // POSTGRES_LOGIN: `${BASE_URL}/login`,
  // POSTGRES_CLIENTE_LOGIN: `${BASE_URL}/clientes/login`,
  // POSTGRES_PROTECTED: `${BASE_URL}/protected`,
};

export default API_ENDPOINTS;
