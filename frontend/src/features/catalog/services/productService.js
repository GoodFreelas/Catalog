import apiClient from '../../../core/api/client';
import { ENDPOINTS, DEFAULT_PARAMS } from '../../../core/api/endpoints';

/**
 * Serviço para operações relacionadas a produtos
 */
export class ProductService {
  /**
   * Lista produtos com filtros e paginação
   * @param {Object} params - Parâmetros de consulta
   * @returns {Promise} Resposta da API
   */
  static async getProducts(params = {}) {
    const queryParams = {
      ...DEFAULT_PARAMS.PRODUCTS,
      ...params,
    };

    const response = await apiClient.get(ENDPOINTS.PRODUCTS.LIST, {
      params: queryParams,
    });

    return response.data;
  }

  /**
   * Busca produto por ID
   * @param {string} productId - ID do produto
   * @returns {Promise} Dados do produto
   */
  static async getProductById(productId) {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.BY_ID(productId));
    return response.data;
  }

  /**
   * Busca produtos por texto
   * @param {string} query - Termo de busca
   * @param {Object} params - Parâmetros adicionais
   * @returns {Promise} Resultados da busca
   */
  static async searchProducts(query, params = {}) {
    const queryParams = {
      q: query,
      ...DEFAULT_PARAMS.SEARCH,
      ...params,
    };

    const response = await apiClient.get(ENDPOINTS.PRODUCTS.SEARCH, {
      params: queryParams,
    });

    return response.data;
  }

  /**
   * Lista todas as categorias disponíveis
   * @returns {Promise} Lista de categorias
   */
  static async getCategories() {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.CATEGORIES);
    return response.data;
  }

  /**
   * Lista produtos de uma categoria específica
   * @param {string} category - Nome da categoria
   * @param {Object} params - Parâmetros adicionais
   * @returns {Promise} Produtos da categoria
   */
  static async getProductsByCategory(category, params = {}) {
    const queryParams = {
      ...DEFAULT_PARAMS.PRODUCTS,
      ...params,
    };

    const response = await apiClient.get(
      ENDPOINTS.PRODUCTS.BY_CATEGORY(category),
      { params: queryParams }
    );

    return response.data;
  }

  /**
   * Obtém estatísticas gerais dos produtos
   * @returns {Promise} Estatísticas
   */
  static async getProductStats() {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.STATS);
    return response.data;
  }

  /**
   * Busca produtos com filtros avançados
   * @param {Object} filters - Filtros a serem aplicados
   * @returns {Promise} Produtos filtrados
   */
  static async getFilteredProducts(filters = {}) {
    const params = this.buildFilterParams(filters);
    return this.getProducts(params);
  }

  /**
   * Constrói parâmetros de filtro para a API
   * @param {Object} filters - Filtros do frontend
   * @returns {Object} Parâmetros formatados para API
   */
  static buildFilterParams(filters) {
    const params = {};

    // Paginação
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    // Busca por texto
    if (filters.search) params.search = filters.search;

    // Filtros específicos
    if (filters.category) params.categoria = filters.category;
    if (filters.status) params.situacao = filters.status;

    // Faixa de preço
    if (filters.priceRange) {
      if (filters.priceRange.min !== null) {
        params.preco_min = filters.priceRange.min;
      }
      if (filters.priceRange.max !== null) {
        params.preco_max = filters.priceRange.max;
      }
    }

    // Ordenação
    if (filters.sort) params.sort = filters.sort;
    if (filters.order) params.order = filters.order;

    return params;
  }

  /**
   * Valida se um produto está ativo
   * @param {Object} product - Produto a ser validado
   * @returns {boolean} True se ativo
   */
  static isProductActive(product) {
    return product && product.situacao === 'A';
  }

  /**
   * Obtém a imagem principal do produto
   * @param {Object} product - Produto
   * @returns {string|null} URL da imagem ou null
   */
  static getProductMainImage(product) {
    if (!product || !product.anexos || product.anexos.length === 0) {
      return null;
    }

    return product.anexos[0].anexo;
  }

  /**
   * Formata dados do produto para exibição
   * @param {Object} product - Produto bruto da API
   * @returns {Object} Produto formatado
   */
  static formatProduct(product) {
    return {
      ...product,
      isActive: this.isProductActive(product),
      mainImage: this.getProductMainImage(product),
      hasImages: Boolean(product.anexos && product.anexos.length > 0),
      formattedPrice: parseFloat(product.preco || 0),
      formattedPromoPrice: product.preco_promocional
        ? parseFloat(product.preco_promocional)
        : null,
    };
  }

  /**
   * Formata lista de produtos
   * @param {Array} products - Lista de produtos
   * @returns {Array} Lista formatada
   */
  static formatProductList(products) {
    if (!Array.isArray(products)) return [];
    return products.map(product => this.formatProduct(product));
  }
}