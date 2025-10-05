// External Services
const { tinyApiClient } = require('./tinyService');

// Models
const Product = require('../models/Product');
const { saveSyncLog } = require('../models/SyncLog');

// Utilities
const { logger } = require('../utils/logger');

// ================================
// SyncService Class
// ================================

/**
 * Serviço de sincronização de produtos do Tiny ERP
 * Gerencia a sincronização completa de produtos com controle de conflitos
 */
class SyncService {
  constructor() {
    this.isRunning = false;
    this.currentStats = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: 0,
      total: 0
    };
  }

  // ================================
  // Public Methods
  // ================================

  /**
   * Executa a sincronização completa de produtos
   * @param {string} syncType - Tipo de sincronização ('manual', 'automatic', 'startup')
   * @returns {Promise<Object>} Resultado da sincronização
   */
  async syncProducts(syncType = 'manual') {
    if (this.isRunning) {
      throw new Error('Sincronização já está em execução');
    }

    this.isRunning = true;
    const startTime = new Date();

    try {
      logger.info('🔄 Iniciando sincronização de produtos...');
      logger.info(`📅 Data/Hora: ${startTime.toLocaleString('pt-BR')}`);
      logger.info(`🏷️ Tipo: ${syncType}`);

      // Reset das estatísticas
      this.resetStats();

      // Testar conexão com a API primeiro
      logger.info('🔍 Testando conexão com API do Tiny...');
      const connectionTest = await tinyApiClient.testConnection();

      if (!connectionTest.success) {
        throw new Error(`Falha na conexão com API: ${connectionTest.error}`);
      }

      logger.info('✅ Conexão com API do Tiny estabelecida');

      // Buscar lista de produtos
      logger.info('📦 Buscando lista de produtos...');
      const productsList = await tinyApiClient.getAllProducts();

      this.currentStats.total = productsList.length;
      logger.info(`📊 Total de produtos encontrados: ${productsList.length}`);

      if (productsList.length === 0) {
        logger.warn('⚠️ Nenhum produto encontrado para sincronizar');
        await this.saveSyncResult(startTime, syncType, 'Nenhum produto encontrado');
        return this.getSyncResult(startTime);
      }

      // Processar produtos em lotes para otimizar performance
      const batchSize = 10;
      logger.info(`🔍 Iniciando processamento em lotes de ${batchSize} produtos...`);

      for (let i = 0; i < productsList.length; i += batchSize) {
        const batch = productsList.slice(i, i + batchSize);
        await this.processBatch(batch, i + 1);

        // Log de progresso
        const progress = Math.min(i + batchSize, productsList.length);
        logger.info(`📈 Progresso: ${progress}/${productsList.length} produtos processados`);

        // Estatísticas do rate limiter a cada lote
        const rateLimiterStats = tinyApiClient.getRateLimiterStats();
        logger.debug(`📊 Rate Limiter: ${rateLimiterStats.requests_in_current_window}/${rateLimiterStats.max_requests_per_window}`);
      }

      const result = await this.saveSyncResult(startTime, syncType);
      logger.info('🎉 Sincronização concluída com sucesso!');

      return result;

    } catch (error) {
      logger.error('❌ Erro crítico durante a sincronização:', error.message);
      logger.error('📋 Stack trace:', error.stack);

      await this.saveSyncResult(startTime, syncType, error.message);
      throw error;

    } finally {
      this.isRunning = false;
    }
  }

  // ================================
  // Private Methods
  // ================================

  /**
   * Processa um lote de produtos
   * @param {Array} batch - Lote de produtos para processar
   * @param {number} startIndex - Índice inicial do lote
   */
  async processBatch(batch, startIndex) {
    const promises = batch.map(async (productSummary, index) => {
      const productName = productSummary.produto?.nome || 'Nome não disponível';
      const productId = productSummary.produto?.id;
      const currentIndex = startIndex + index;

      logger.debug(`⏳ ${currentIndex}: ${productName} (ID: ${productId})`);

      try {
        // Buscar detalhes completos do produto
        const productDetails = await tinyApiClient.getProductDetails(productId);

        if (productDetails) {
          const result = await this.saveOrUpdateProduct(productDetails);
          this.currentStats.processed++;

          if (result.created) {
            this.currentStats.created++;
            logger.debug(`✅ Produto ${productId} criado`);
          } else {
            this.currentStats.updated++;
            logger.debug(`🔄 Produto ${productId} atualizado`);
          }
        } else {
          logger.warn(`⚠️ Detalhes do produto ${productId} não encontrados`);
          this.currentStats.errors++;
        }

      } catch (error) {
        logger.error(`❌ Erro ao processar produto ${productId}:`, error.message);
        this.currentStats.errors++;

        // Se for erro de rate limit crítico, aguarda mais
        if (error.message === 'RATE_LIMIT_EXCEEDED') {
          logger.warn('⏱️ Rate limit crítico detectado. Aguardando 3 minutos...');
          await new Promise(resolve => setTimeout(resolve, 180000));
        }
      }
    });

    // Aguardar conclusão de todos os produtos do lote
    await Promise.all(promises);
  }

  /**
   * Salva ou atualiza um produto no banco de dados
   * @param {Object} productData - Dados do produto
   * @returns {Promise<Object>} Resultado da operação
   */
  async saveOrUpdateProduct(productData) {
    try {
      const existingProduct = await Product.findOne({ id: productData.id });

      if (existingProduct) {
        // Atualizar produto existente
        await Product.findOneAndUpdate(
          { id: productData.id },
          {
            ...productData,
            last_updated: new Date(),
            sync_date: new Date()
          },
          { new: true }
        );

        logger.debug(`🔄 Produto ${productData.id} atualizado: ${productData.nome}`);
        return { created: false, updated: true };

      } else {
        // Criar novo produto
        const newProduct = new Product({
          ...productData,
          sync_date: new Date(),
          created_at: new Date()
        });

        await newProduct.save();
        logger.debug(`✨ Produto ${productData.id} criado: ${productData.nome}`);
        return { created: true, updated: false };
      }

    } catch (error) {
      logger.error(`Erro ao salvar produto ${productData.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Salva o resultado da sincronização
   * @param {Date} startTime - Horário de início
   * @param {string} syncType - Tipo de sincronização
   * @param {string} errorMessage - Mensagem de erro (se houver)
   * @returns {Promise<Object>} Log salvo
   */
  async saveSyncResult(startTime, syncType, errorMessage = null) {
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    const rateLimiterStats = tinyApiClient.getRateLimiterStats();

    const logData = {
      products_processed: this.currentStats.processed,
      products_created: this.currentStats.created,
      products_updated: this.currentStats.updated,
      products_errors: this.currentStats.errors,
      duration_seconds: duration,
      start_time: startTime,
      end_time: endTime,
      sync_type: syncType,
      api_requests_made: rateLimiterStats.total_requests,
      rate_limit_hits: rateLimiterStats.rate_limit_hits,
      error_message: errorMessage,
      status: errorMessage ? 'error' :
        (this.currentStats.errors > 0 ? 'partial' : 'success')
    };

    logger.info(`⏱️ Duração: ${duration.toFixed(2)} segundos`);
    logger.info(`✅ Produtos criados: ${this.currentStats.created}`);
    logger.info(`🔄 Produtos atualizados: ${this.currentStats.updated}`);
    logger.info(`❌ Produtos com erro: ${this.currentStats.errors}`);
    logger.info(`📊 Total no banco: ${await Product.countDocuments()}`);

    return await saveSyncLog(
      this.currentStats.processed,
      duration,
      errorMessage,
      logData
    );
  }

  /**
   * Obtém resultado atual da sincronização
   * @param {Date} startTime - Horário de início
   * @returns {Object} Resultado atual
   */
  getSyncResult(startTime) {
    const duration = (new Date() - startTime) / 1000;

    return {
      success: !this.currentStats.errors,
      duration_seconds: duration,
      stats: { ...this.currentStats },
      is_running: this.isRunning
    };
  }

  /**
   * Reset das estatísticas
   */
  resetStats() {
    this.currentStats = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: 0,
      total: 0
    };
  }

  /**
   * Obtém estatísticas atuais da sincronização
   * @returns {Object} Estatísticas atuais
   */
  getCurrentStats() {
    return {
      ...this.currentStats,
      is_running: this.isRunning,
      progress_percentage: this.currentStats.total > 0 ?
        ((this.currentStats.processed + this.currentStats.errors) / this.currentStats.total) * 100 : 0
    };
  }

  /**
   * Verifica se uma sincronização está em execução
   * @returns {boolean}
   */
  isRunning() {
    return this.isRunning;
  }
}

// ================================
// Export
// ================================

// Instância singleton do serviço
const syncService = new SyncService();

/**
 * Função para compatibilidade com código existente
 * @param {string} syncType - Tipo de sincronização
 * @returns {Promise<Object>} Resultado da sincronização
 */
async function syncProducts(syncType = 'manual') {
  return await syncService.syncProducts(syncType);
}

module.exports = {
  SyncService,
  syncService,
  syncProducts
};