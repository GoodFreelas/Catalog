import { CONFIG } from '../utils/constants';

class ApiService {
  constructor() {
    this.baseUrl = CONFIG.api.baseUrl;
    this.cache = new Map();
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Cache simples
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CONFIG.cache.ttl) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Produtos
  async getProducts(params = {}) {
    const cacheKey = `products_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/produtos${queryString ? `?${queryString}` : ''}`;

    const data = await this.request(endpoint);
    this.setCache(cacheKey, data);

    return data;
  }

  async getProduct(id) {
    const cacheKey = `product_${id}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.request(`/produtos/${id}`);
    this.setCache(cacheKey, data);

    return data;
  }

  // Categorias
  async getCategories() {
    const cacheKey = 'categories';
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.request('/categorias');
    this.setCache(cacheKey, data);

    return data;
  }

  // Estoque
  async getStock(productId) {
    const data = await this.request(`/estoque/${productId}`);
    return data;
  }

  // Status da API
  async getStatus() {
    const data = await this.request('/status');
    return data;
  }

  // Limpar cache
  clearCache() {
    this.cache.clear();
  }
}

// Instância singleton
export const apiService = new ApiService();

// Funções de conveniência
export const api = {
  products: {
    getAll: (params) => apiService.getProducts(params),
    getById: (id) => apiService.getProduct(id),
    getStock: (id) => apiService.getStock(id)
  },
  categories: {
    getAll: () => apiService.getCategories()
  },
  system: {
    getStatus: () => apiService.getStatus()
  }
};