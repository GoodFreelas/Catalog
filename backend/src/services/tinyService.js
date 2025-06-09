const axios = require('axios');
const { TINY_API_CONFIG, validateConfig } = require('../config/tiny');
const { rateLimiter } = require('./rateLimiter');
const { logger } = require('../utils/logger'); // Corrigido: destructuring do logger

// Validar configuração na inicialização
validateConfig();

/**
 * Cliente para interação com a API do Tiny ERP
 */
class TinyApiClient {
  constructor() {
    this.config = TINY_API_CONFIG;
    this.rateLimiter = rateLimiter;
  }

  /**
   * Faz uma requisição para a API do Tiny com rate limiting
   * @param {string} endpoint - Endpoint da API
   * @param {Object} data - Dados para enviar
   * @returns {Promise<Object>} Resposta da API
   */
  async request(endpoint, data = {}) {
    try {
      // Aguardar disponibilidade do rate limiter
      await this.rateLimiter.waitForAvailability();

      logger.debug(`🌐 Fazendo requisição para: ${endpoint}`);
      logger.debug(`📤 Dados enviados:`, { ...data, token: '***' });

      const response = await axios.post(
        `${this.config.baseURL}${endpoint}`,
        new URLSearchParams({
          token: this.config.token,
          formato: 'json',
          ...data
        }).toString(),
        {
          headers: this.config.headers,
          timeout: this.config.timeout
        }
      );

      logger.debug(`📥 Status da resposta: ${response.status}`);

      if (response.data.retorno) {
        logger.debug(`📋 Status do retorno: ${response.data.retorno.status}`);

        if (response.data.retorno.erro) {
          logger.warn(`⚠️ Erro retornado pela API:`, response.data.retorno.erro);
        }
      }

      return response.data;

    } catch (error) {
      logger.error(`❌ Erro na requisição para ${endpoint}:`);
      logger.error(`📋 Mensagem:`, error.message);

      if (error.response) {
        logger.error(`📊 Status HTTP:`, error.response.status);
        logger.error(`📄 Dados da resposta:`, error.response.data);

        // Se for rate limit (429), aguarda e pode ser tentado novamente
        if (error.response.status === 429) {
          logger.warn('⏱️ Rate limit detectado pelo servidor');
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
      } else if (error.request) {
        logger.error(`📡 Erro de rede - sem resposta do servidor`);
      }

      throw error;
    }
  }

  /**
   * Busca lista de produtos com paginação
   * @param {number} page - Número da página
   * @returns {Promise<Object>} Lista de produtos da página
   */
  async getProductsList(page = 1) {
    const response = await this.request(this.config.endpoints.productsList, {
      pagina: page
    });

    if (response.retorno.status !== 'OK') {
      throw new Error(`Erro ao buscar lista de produtos: ${response.retorno.erro || 'Status não OK'}`);
    }

    return {
      products: response.retorno.produtos || [],
      totalPages: response.retorno.numero_paginas || 1,
      currentPage: page,
      hasMore: page < (response.retorno.numero_paginas || 1)
    };
  }

  /**
   * Busca detalhes de um produto específico
   * @param {string} productId - ID do produto
   * @returns {Promise<Object|null>} Detalhes do produto ou null se não encontrado
   */
  async getProductDetails(productId) {
    try {
      const response = await this.request(this.config.endpoints.productDetails, {
        id: productId
      });

      if (response.retorno.status === 'OK' && response.retorno.produto) {
        return response.retorno.produto;
      } else {
        logger.warn(`Produto ${productId} não encontrado:`, response.retorno.erro);
        return null;
      }
    } catch (error) {
      logger.error(`Erro ao buscar detalhes do produto ${productId}:`, error.message);
      return null;
    }
  }

  /**
   * Busca todos os produtos de todas as páginas
   * @returns {Promise<Array>} Array com todos os produtos
   */
  async getAllProducts() {
    let allProducts = [];
    let currentPage = 1;
    let hasMorePages = true;

    logger.info('📦 Iniciando busca paginada de produtos...');

    while (hasMorePages) {
      try {
        logger.info(`📄 Buscando página ${currentPage}...`);

        const result = await this.getProductsList(currentPage);

        if (result.products.length > 0) {
          allProducts = allProducts.concat(result.products);

          logger.info(`✅ Página ${currentPage}/${result.totalPages} processada`);
          logger.info(`📊 Produtos encontrados nesta página: ${result.products.length}`);
          logger.info(`📈 Total acumulado: ${allProducts.length}`);

          hasMorePages = result.hasMore;
          currentPage++;
        } else {
          logger.warn('⚠️ Página sem produtos encontrada');
          hasMorePages = false;
        }

      } catch (error) {
        if (error.message === 'RATE_LIMIT_EXCEEDED') {
          logger.warn('⏱️ Rate limit detectado pelo servidor. Aguardando 2 minutos...');
          await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutos
          continue; // Tenta a mesma página novamente
        }

        logger.error(`❌ Erro ao buscar página ${currentPage}:`, error.message);
        hasMorePages = false;
      }
    }

    logger.info(`🎯 Busca concluída: ${allProducts.length} produtos encontrados`);
    return allProducts;
  }

  /**
   * Testa a conectividade com a API
   * @returns {Promise<Object>} Status da conexão
   */
  async testConnection() {
    try {
      logger.info('🧪 Testando conexão com API do Tiny...');

      const response = await this.request(this.config.endpoints.productsList, { pagina: 1 });

      return {
        success: true,
        status: response.retorno.status,
        message: 'Conexão estabelecida com sucesso',
        totalPages: response.retorno.numero_paginas || 0,
        hasProducts: !!(response.retorno.produtos && response.retorno.produtos.length > 0)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: {
          stack: error.stack,
          response_data: error.response?.data || null,
          response_status: error.response?.status || null
        }
      };
    }
  }

  /**
   * Obtém estatísticas do rate limiter
   * @returns {Object} Estatísticas atuais
   */
  getRateLimiterStats() {
    return this.rateLimiter.getStats();
  }

  /**
   * Obtém timeline das requisições recentes
   * @returns {Array} Timeline das requisições
   */
  getRequestsTimeline() {
    return this.rateLimiter.getRequestsTimeline();
  }

  /**
   * Reset manual do rate limiter
   */
  resetRateLimiter() {
    this.rateLimiter.reset();
  }
}

// Instância singleton do cliente
const tinyApiClient = new TinyApiClient();

module.exports = {
  TinyApiClient,
  tinyApiClient
};