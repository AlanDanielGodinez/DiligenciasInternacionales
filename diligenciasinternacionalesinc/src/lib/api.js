import axios from 'axios';
import { attachAxiosAuth } from '../utils/apiAuth';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

// Todas las llamadas con esta instancia llevan el token de sesión.
attachAxiosAuth(api);

export default api;
