const axios = require('axios');
const tokenManager = require('./tokenManager');

class TinyApiClient {
  constructor() {
    this.baseUrl = process.env.TINY_BASE_URL;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const tokenInfo = await tokenManager.getValidToken();
      const authHeader = tokenManager.getAuthHeader();

      const config = {
        url: `${this.baseUrl}${endpoint}`,
        method: options.method || 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        timeout: 30000, // 30 segundos
        ...options
      };

      console.log(`📡 API Request: ${config.method} ${config.url}`);

      const response = await axios(config);

      console.log(`✅ API Response: ${response.status} - ${response.data?.data?.length || 'N/A'} items`);

      return response.data;

    } catch (error) {
      console.error('❌ Erro na API Tiny:', {
        endpoint,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        details: error.response?.data
      });

      if (error.response?.status === 401) {
        // Token inválido, tentar renovar
        try {
          await tokenManager.refreshToken();
          console.log('🔄 Token renovado, tentando novamente...');
          return this.makeRequest(endpoint, options);
        } catch (refreshError) {
          throw new Error('Token expirado. Faça login novamente.');
        }
      }

      throw new Error(`Erro na API Tiny: ${error.response?.data?.message || error.message}`);
    }
  }

  // Cache simples para reduzir chamadas à API
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
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
    console.log(`💾 Cache set: ${key}`);
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache limpo');
  }

  // Métodos específicos da API
  async getProducts(params = {}) {
    const cacheKey = `products_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const queryString = new URLSearchParams();

    // Adicionar parâmetros de consulta
    if (params.pesquisa) queryString.append('pesquisa', params.pesquisa);
    if (params.categoria) queryString.append('categoria', params.categoria);
    if (params.situacao) queryString.append('situacao', params.situacao);
    if (params.pagina) queryString.append('pagina', params.pagina);
    if (params.limite) queryString.append('limite', params.limite);

    const endpoint = `/produtos${queryString.toString() ? `?${queryString}` : ''}`;
    const data = await this.makeRequest(endpoint);

    this.setCache(cacheKey, data);
    return data;
  }

  async getProduct(id) {
    const cacheKey = `product_${id}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.makeRequest(`/produtos/${id}`);
    this.setCache(cacheKey, data);
    return data;
  }

  async getCategories() {
    const cacheKey = 'categories';
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.makeRequest('/categorias/todas');
    this.setCache(cacheKey, data);
    return data;
  }

  async getStock(productId) {
    // Estoque não deve ser cacheado por muito tempo
    const data = await this.makeRequest(`/estoque/${productId}`);
    return data;
  }

  async updateStock(productId, stockData) {
    const data = await this.makeRequest(`/estoque/${productId}`, {
      method: 'POST',
      data: stockData
    });

    // Limpar cache relacionado
    this.cache.delete(`product_${productId}`);
    this.cache.delete(`stock_${productId}`);

    return data;
  }

  async updateProductPrice(productId, priceData) {
    const data = await this.makeRequest(`/produtos/${productId}/preco`, {
      method: 'PUT',
      data: priceData
    });

    // Limpar cache relacionado
    this.cache.delete(`product_${productId}`);

    return data;
  }

  // Método para testar conectividade
  async testConnection() {
    try {
      const data = await this.makeRequest('/produtos?limite=1');
      return {
        success: true,
        message: 'Conexão com Tiny API funcionando',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new TinyApiClient();