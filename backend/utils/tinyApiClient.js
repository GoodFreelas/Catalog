const axios = require('axios');
const tokenManager = require('./tokenManager');

class TinyApiClient {
  constructor() {
    this.baseUrl = process.env.TINY_BASE_URL || 'https://api.tiny.com.br/api/v3';
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

      console.log(`📡 API v3 Request: ${config.method} ${config.url}`);

      const response = await axios(config);

      console.log(`✅ API v3 Response: ${response.status} - ${response.data?.data?.length || 'N/A'} items`);

      return response.data;

    } catch (error) {
      console.error('❌ Erro na API Tiny v3:', {
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

      throw new Error(`Erro na API Tiny v3: ${error.response?.data?.message || error.message}`);
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

  // ========== MÉTODOS DA API V3 ==========

  // GET /api/v3/products
  async getProducts(params = {}) {
    const cacheKey = `products_v3_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const queryString = new URLSearchParams();

    // Parâmetros da API v3
    if (params.search) queryString.append('search', params.search);
    if (params.category_id) queryString.append('category_id', params.category_id);
    if (params.status) queryString.append('status', params.status);
    if (params.page) queryString.append('page', params.page);
    if (params.limit) queryString.append('limit', params.limit);
    if (params.sort) queryString.append('sort', params.sort);
    if (params.order) queryString.append('order', params.order);

    const endpoint = `/products${queryString.toString() ? `?${queryString}` : ''}`;
    const data = await this.makeRequest(endpoint);

    this.setCache(cacheKey, data);
    return data;
  }

  // GET /api/v3/products/{id}
  async getProduct(id) {
    const cacheKey = `product_v3_${id}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.makeRequest(`/products/${id}`);
    this.setCache(cacheKey, data);
    return data;
  }

  // GET /api/v3/products/{id}/images
  async getProductImages(id) {
    const cacheKey = `product_images_v3_${id}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.makeRequest(`/products/${id}/images`);
    this.setCache(cacheKey, data);
    return data;
  }

  // GET /api/v3/product_categories
  async getCategories(params = {}) {
    const cacheKey = `categories_v3_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const queryString = new URLSearchParams();
    if (params.parent_id) queryString.append('parent_id', params.parent_id);
    if (params.status) queryString.append('status', params.status);
    if (params.page) queryString.append('page', params.page);
    if (params.limit) queryString.append('limit', params.limit);

    const endpoint = `/product_categories${queryString.toString() ? `?${queryString}` : ''}`;
    const data = await this.makeRequest(endpoint);

    this.setCache(cacheKey, data);
    return data;
  }

  // GET /api/v3/product_categories/{id}
  async getCategory(id) {
    const cacheKey = `category_v3_${id}`;
    const cached = this.getCached(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.makeRequest(`/product_categories/${id}`);
    this.setCache(cacheKey, data);
    return data;
  }

  // GET /api/v3/products?category_id={id}
  async getProductsByCategory(categoryId, params = {}) {
    const allParams = { ...params, category_id: categoryId };
    return this.getProducts(allParams);
  }

  // Métodos de compatibilidade com o código existente
  async getStock(productId) {
    // Na API v3, o estoque pode vir junto com o produto
    const product = await this.getProduct(productId);

    // Adaptar resposta para manter compatibilidade
    return {
      data: {
        produto_id: productId,
        quantidade: product.data?.stock_quantity || 0,
        quantidade_reservada: product.data?.reserved_quantity || 0,
        quantidade_disponivel: (product.data?.stock_quantity || 0) - (product.data?.reserved_quantity || 0),
        localizacao: product.data?.location || '',
        ultima_atualizacao: product.data?.updated_at || new Date().toISOString()
      }
    };
  }

  async updateStock(productId, stockData) {
    // Este endpoint pode não existir na v3, precisa verificar documentação específica
    const data = await this.makeRequest(`/products/${productId}/stock`, {
      method: 'PUT',
      data: stockData
    });

    // Limpar cache relacionado
    this.cache.delete(`product_v3_${productId}`);

    return data;
  }

  async updateProductPrice(productId, priceData) {
    // Este endpoint pode não existir na v3, precisa verificar documentação específica
    const data = await this.makeRequest(`/products/${productId}/price`, {
      method: 'PUT',
      data: priceData
    });

    // Limpar cache relacionado
    this.cache.delete(`product_v3_${productId}`);

    return data;
  }

  // Método para testar conectividade
  async testConnection() {
    try {
      const data = await this.makeRequest('/products?limit=1');
      return {
        success: true,
        message: 'Conexão com Tiny API v3 funcionando',
        version: 'v3',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        version: 'v3',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Métodos auxiliares para conversão de dados
  convertProductToV2Format(productV3) {
    // Converter formato da API v3 para o formato esperado pelo frontend
    return {
      id: productV3.id,
      nome: productV3.name,
      codigo: productV3.code,
      descricao: productV3.description,
      preco: productV3.price,
      situacao: productV3.status === 'active' ? 'A' : 'I',
      estoque: productV3.stock_quantity || 0,
      categoria: productV3.category ? {
        id: productV3.category.id,
        descricao: productV3.category.name
      } : null,
      urlImagem: productV3.images?.[0]?.url || null,
      created_at: productV3.created_at,
      updated_at: productV3.updated_at
    };
  }

  convertCategoryToV2Format(categoryV3) {
    // Converter formato da API v3 para o formato esperado pelo frontend
    return {
      id: categoryV3.id,
      descricao: categoryV3.name,
      nome: categoryV3.name,
      pai_id: categoryV3.parent_id,
      nivel: categoryV3.level || 0,
      ativo: categoryV3.status === 'active'
    };
  }
}

module.exports = new TinyApiClient();