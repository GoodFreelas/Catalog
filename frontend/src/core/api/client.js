import axios from 'axios';
import { API_CONFIG } from '../constants/api';

// Instância principal do axios
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador de request
apiClient.interceptors.request.use(
  (config) => {


    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador de response
apiClient.interceptors.response.use(
  (response) => {


    return response;
  },
  (error) => {
    // Tratamento de erros específicos (sem logs)
    return Promise.reject(error);
  }
);

export default apiClient;