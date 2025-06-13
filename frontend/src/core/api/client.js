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
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptador de response
apiClient.interceptors.response.use(
  (response) => {


    return response;
  },
  (error) => {
    // Log do erro
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    // Tratamento de erros específicos
    if (error.response?.status === 429) {
      console.warn('⚠️ Rate limit atingido, tente novamente em alguns segundos');
    }

    if (error.response?.status >= 500) {
      console.error('🔥 Erro interno do servidor');
    }

    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Timeout da requisição');
    }

    return Promise.reject(error);
  }
);

export default apiClient;