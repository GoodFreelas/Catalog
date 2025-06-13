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
   * Busca sugestões baseadas em um termo
   * @param {string} query - Termo de busca
   * @param {Object} params - Parâmetros adicionais
   * @returns {Promise} Sugestões
   */
  static async getSuggestions(query, params = {}) {
    if (!query || query.length < 2) return { suggestions: [] };

    try {
      // Buscar produtos que fazem match com a query
      const queryParams = {
        search: query,
        limit: 10,
        page: 1,
        ...params
      };

      const response = await this.getProducts(queryParams);
      const products = response.data?.products || [];

      return {
        suggestions: this.extractSuggestions(products, query),
        products
      };
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      return { suggestions: [] };
    }
  }

  /**
   * Extrai sugestões de produtos, categorias e keywords
   * @param {Array} products - Lista de produtos
   * @param {string} query - Termo de busca
   * @returns {Array} Lista de sugestões
   */
  static extractSuggestions(products, query) {
    const suggestions = [];
    const seen = new Set();
    const queryLower = query.toLowerCase();

    // Adicionar produtos que fazem match
    products.slice(0, 3).forEach(product => {
      const productName = product.nome.toLowerCase();
      if (productName.includes(queryLower) && !seen.has(productName)) {
        suggestions.push({
          id: `product-${product.id}`,
          text: product.nome,
          type: 'product',
          category: product.categoria,
          product: product
        });
        seen.add(productName);
      }
    });

    // Extrair categorias únicas
    const categories = [...new Set(products.map(p => p.categoria).filter(Boolean))];
    categories.slice(0, 2).forEach(categoria => {
      const categoryLower = categoria.toLowerCase();
      if (categoryLower.includes(queryLower) && !seen.has(categoryLower)) {
        suggestions.push({
          id: `category-${categoria}`,
          text: categoria,
          type: 'category'
        });
        seen.add(categoryLower);
      }
    });

    // Extrair keywords únicas
    const keywords = new Set();
    products.forEach(product => {
      if (product.seo_keywords) {
        product.seo_keywords.split(',').forEach(keyword => {
          const cleanKeyword = keyword.trim().toLowerCase();
          if (cleanKeyword.includes(queryLower) &&
            cleanKeyword.length > 2 &&
            !seen.has(cleanKeyword)) {
            keywords.add(keyword.trim());
          }
        });
      }
    });

    // Adicionar keywords como sugestões
    Array.from(keywords).slice(0, 2).forEach(keyword => {
      suggestions.push({
        id: `keyword-${keyword}`,
        text: keyword,
        type: 'keyword'
      });
      seen.add(keyword.toLowerCase());
    });

    return suggestions;
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

    // Busca por texto (suporte a múltiplos campos)
    if (filters.search) {
      params.search = filters.search;

      // Busca também em keywords e categoria se especificado
      if (filters.searchInKeywords) {
        params.search_keywords = filters.search;
      }
      if (filters.searchInCategory) {
        params.search_category = filters.search;
      }
    }

    // Filtros específicos
    if (filters.category) params.categoria = filters.category;
    if (filters.status) params.situacao = filters.status;
    if (filters.keyword) params.keyword = filters.keyword;

    // Faixa de preço
    if (filters.priceRange) {
      if (filters.priceRange.min !== null) {
        params.preco_min = filters.priceRange.min;
      }
      if (filters.priceRange.max !== null) {
        params.preco_max = filters.priceRange.max;
      }
    }

    // Filtros avançados
    if (filters.hasImages) params.has_images = filters.hasImages;
    if (filters.hasPromotion) params.has_promotion = filters.hasPromotion;
    if (filters.marca) params.marca = filters.marca;

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
   * Verifica se um produto tem promoção válida
   * @param {Object} product - Produto
   * @returns {boolean} True se tem promoção
   */
  static hasValidPromotion(product) {
    return product?.preco_promocional &&
      parseFloat(product.preco_promocional) > 0 &&
      parseFloat(product.preco_promocional) < parseFloat(product.preco || 0);
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
   * Processa descrição HTML para texto limpo
   * @param {string} htmlDescription - Descrição com HTML
   * @returns {string} Texto limpo
   */
  static getCleanDescription(htmlDescription) {
    if (!htmlDescription) return '';

    // Remove tags HTML e converte entidades
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlDescription;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  /**
   * Processa keywords separadas por vírgula
   * @param {string} keywords - Keywords separadas por vírgula
   * @returns {Array} Array de keywords
   */
  static processKeywords(keywords) {
    if (!keywords) return [];
    return keywords.split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
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
      hasPromotion: this.hasValidPromotion(product),
      mainImage: this.getProductMainImage(product),
      hasImages: Boolean(product.anexos && product.anexos.length > 0),
      formattedPrice: parseFloat(product.preco || 0),
      formattedPromoPrice: product.preco_promocional
        ? parseFloat(product.preco_promocional)
        : null,
      cleanDescription: this.getCleanDescription(product.descricao_complementar),
      keywords: this.processKeywords(product.seo_keywords),
      imageCount: product.anexos ? product.anexos.length : 0,
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

  /**
   * Obtém categorias únicas de uma lista de produtos
   * @param {Array} products - Lista de produtos
   * @returns {Array} Categorias únicas
   */
  static extractCategories(products) {
    if (!Array.isArray(products)) return [];

    const categories = products
      .map(p => p.categoria)
      .filter(Boolean)
      .filter((category, index, arr) => arr.indexOf(category) === index);

    return categories.sort();
  }

  /**
   * Obtém keywords únicas de uma lista de produtos
   * @param {Array} products - Lista de produtos
   * @returns {Array} Keywords únicas
   */
  static extractKeywords(products) {
    if (!Array.isArray(products)) return [];

    const keywords = new Set();
    products.forEach(product => {
      if (product.seo_keywords) {
        this.processKeywords(product.seo_keywords).forEach(keyword => {
          keywords.add(keyword);
        });
      }
    });

    return Array.from(keywords).sort();
  }

  /**
   * Obtém marcas únicas de uma lista de produtos
   * @param {Array} products - Lista de produtos
   * @returns {Array} Marcas únicas
   */
  static extractBrands(products) {
    if (!Array.isArray(products)) return [];

    const brands = products
      .map(p => p.marca)
      .filter(Boolean)
      .filter((brand, index, arr) => arr.indexOf(brand) === index);

    return brands.sort();
  }
}