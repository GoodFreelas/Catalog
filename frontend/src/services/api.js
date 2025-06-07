import { CONFIG } from '../utils/constants';

class ApiService {
  constructor() {
    this.baseUrl = CONFIG.api.baseUrl;
    this.cache = new Map();
    this.version = 'v3'; // Indicador da versão da API
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Log para debug em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`API ${this.version} Response:`, {
          endpoint,
          status: response.status,
          data: data.data?.length ? `${data.data.length} items` : 'single item'
        });
      }

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
      console.log(`💾 Cache hit: ${key}`);
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

  // ========== PRODUTOS - API V3 ==========

  async getProducts(params = {}) {
    const cacheKey = `products_v3_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    // Converter parâmetros do frontend para API v3
    const apiParams = this.convertProductParamsToV3(params);

    const queryString = new URLSearchParams(apiParams).toString();
    const endpoint = `/produtos${queryString ? `?${queryString}` : ''}`;

    const data = await this.request(endpoint);
    this.setCache(cacheKey, data);

    return data;
  }

  async getProduct(id) {
    const cacheKey = `product_v3_${id}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.request(`/produtos/${id}`);
    this.setCache(cacheKey, data);

    return data;
  }

  async getProductImages(id) {
    const cacheKey = `product_images_v3_${id}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.request(`/produtos/${id}/images`);
    this.setCache(cacheKey, data);

    return data;
  }

  async getProductsByCategory(categoryId, params = {}) {
    const apiParams = {
      ...this.convertProductParamsToV3(params),
      categoria: categoryId // Mantém compatibilidade com backend
    };

    const queryString = new URLSearchParams(apiParams).toString();
    const endpoint = `/produtos/categoria/${categoryId}${queryString ? `?${queryString}` : ''}`;

    return await this.request(endpoint);
  }

  async getFeaturedProducts() {
    const cacheKey = 'featured_products_v3';
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.request('/produtos/featured/list');
    this.setCache(cacheKey, data);

    return data;
  }

  // ========== CATEGORIAS - API V3 ==========

  async getCategories(params = {}) {
    const cacheKey = `categories_v3_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const apiParams = this.convertCategoryParamsToV3(params);
    const queryString = new URLSearchParams(apiParams).toString();
    const endpoint = `/categorias${queryString ? `?${queryString}` : ''}`;

    const data = await this.request(endpoint);
    this.setCache(cacheKey, data);

    return data;
  }

  async getCategory(id) {
    const cacheKey = `category_v3_${id}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.request(`/categorias/${id}`);
    this.setCache(cacheKey, data);

    return data;
  }

  async getCategoryTree() {
    const cacheKey = 'category_tree_v3';
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.request('/categorias/tree');
    this.setCache(cacheKey, data);

    return data;
  }

  async getRootCategories() {
    const cacheKey = 'root_categories_v3';
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.request('/categorias/root/list');
    this.setCache(cacheKey, data);

    return data;
  }

  async getCategoryStats() {
    const cacheKey = 'category_stats_v3';
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.request('/categorias/stats/summary');
    this.setCache(cacheKey, data);

    return data;
  }

  // ========== ESTOQUE ==========

  async getStock(productId) {
    // Estoque não deve ser cacheado por muito tempo
    const data = await this.request(`/estoque/${productId}`);
    return data;
  }

  async updateStock(productId, stockData) {
    const data = await this.request(`/estoque/${productId}`, {
      method: 'POST',
      body: JSON.stringify(stockData)
    });

    // Limpar cache relacionado
    this.cache.delete(`product_v3_${productId}`);

    return data;
  }

  async getStockReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/estoque/relatorio/geral${queryString ? `?${queryString}` : ''}`;

    return await this.request(endpoint);
  }

  async getLowStockReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/estoque/relatorio/baixo${queryString ? `?${queryString}` : ''}`;

    return await this.request(endpoint);
  }

  // ========== SISTEMA ==========

  async getStatus() {
    const data = await this.request('/status');
    return data;
  }

  async getAuthStatus() {
    const data = await this.request('/auth/status');
    return data;
  }

  async testConnection() {
    const data = await this.request('/produtos/debug/v3');
    return data;
  }

  // ========== DEBUG E DESENVOLVIMENTO ==========

  async discoverEndpoints() {
    const data = await this.request('/produtos/discover/v3');
    return data;
  }

  async getMockData() {
    const data = await this.request('/produtos/mock/v3');
    return data;
  }

  // ========== MÉTODOS DE CONVERSÃO ==========

  convertProductParamsToV3(params) {
    const v3Params = {};

    // Mapeamento de parâmetros do frontend para API v3
    if (params.pesquisa) v3Params.search = params.pesquisa;
    if (params.search) v3Params.search = params.search;
    if (params.categoria) v3Params.category_id = params.categoria;
    if (params.category_id) v3Params.category_id = params.category_id;
    if (params.situacao) {
      v3Params.status = params.situacao === 'A' ? 'active' : 'inactive';
    }
    if (params.status) v3Params.status = params.status;
    if (params.pagina) v3Params.page = params.pagina;
    if (params.page) v3Params.page = params.page;
    if (params.limite) v3Params.limit = params.limite;
    if (params.limit) v3Params.limit = params.limit;
    if (params.sort) v3Params.sort = params.sort;
    if (params.order) v3Params.order = params.order;

    return v3Params;
  }

  convertCategoryParamsToV3(params) {
    const v3Params = {};

    if (params.parent_id) v3Params.parent_id = params.parent_id;
    if (params.pai_id) v3Params.parent_id = params.pai_id;
    if (params.status) v3Params.status = params.status;
    if (params.situacao) {
      v3Params.status = params.situacao === 'A' ? 'active' : 'inactive';
    }
    if (params.pagina) v3Params.page = params.pagina;
    if (params.page) v3Params.page = params.page;
    if (params.limite) v3Params.limit = params.limite;
    if (params.limit) v3Params.limit = params.limit;

    return v3Params;
  }

  // ========== CACHE E UTILITÁRIOS ==========

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache da API v3 limpo');
  }

  clearCachePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
    console.log(`🗑️ Cache com padrão '${pattern}' limpo`);
  }

  getCacheInfo() {
    return {
      size: this.cache.size,
      version: this.version,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instância singleton
export const apiService = new ApiService();

// Funções de conveniência para compatibilidade
export const api = {
  products: {
    getAll: (params) => apiService.getProducts(params),
    getById: (id) => apiService.getProduct(id),
    getImages: (id) => apiService.getProductImages(id),
    getByCategory: (categoryId, params) => apiService.getProductsByCategory(categoryId, params),
    getFeatured: () => apiService.getFeaturedProducts(),
    getStock: (id) => apiService.getStock(id),
    updateStock: (id, data) => apiService.updateStock(id, data)
  },

  categories: {
    getAll: (params) => apiService.getCategories(params),
    getById: (id) => apiService.getCategory(id),
    getTree: () => apiService.getCategoryTree(),
    getRoot: () => apiService.getRootCategories(),
    getStats: () => apiService.getCategoryStats()
  },

  stock: {
    getById: (id) => apiService.getStock(id),
    update: (id, data) => apiService.updateStock(id, data),
    getReport: (params) => apiService.getStockReport(params),
    getLowStockReport: (params) => apiService.getLowStockReport(params)
  },

  system: {
    getStatus: () => apiService.getStatus(),
    getAuthStatus: () => apiService.getAuthStatus(),
    testConnection: () => apiService.testConnection(),
    discoverEndpoints: () => apiService.discoverEndpoints(),
    getMockData: () => apiService.getMockData()
  },

  cache: {
    clear: () => apiService.clearCache(),
    clearPattern: (pattern) => apiService.clearCachePattern(pattern),
    getInfo: () => apiService.getCacheInfo()
  }
};

// Exportar também a classe para casos de uso avançados
export { ApiService };

// Adicionar informação da versão para debug
if (typeof window !== 'undefined') {
  window.tinyApiVersion = 'v3';
  window.apiService = apiService;

  // Helper para debug
  window.apiDebug = {
    cache: () => apiService.getCacheInfo(),
    clearCache: () => apiService.clearCache(),
    testConnection: () => apiService.testConnection(),
    version: 'v3'
  };
}