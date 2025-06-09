const { RATE_LIMITER_CONFIG } = require('../config/tiny');
const { logger } = require('../utils/logger'); // Corrigido: destructuring do logger

/**
 * Rate Limiter para API do Tiny ERP
 * Controla o número de requisições por minuto
 */
class TinyRateLimiter {
  constructor(maxRequests = RATE_LIMITER_CONFIG.maxRequests, windowMs = RATE_LIMITER_CONFIG.windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
    this.totalRequests = 0;
    this.rateLimitHits = 0;

    logger.info(`🚦 Rate Limiter inicializado: ${maxRequests} req/${windowMs}ms`);
  }

  /**
   * Aguarda disponibilidade para fazer uma requisição
   * @returns {Promise<void>}
   */
  async waitForAvailability() {
    const now = Date.now();

    // Remove requisições antigas (fora da janela de tempo)
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    // Se atingiu o limite, aguarda
    if (this.requests.length >= this.maxRequests) {
      this.rateLimitHits++;
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest) + RATE_LIMITER_CONFIG.safetyBuffer;

      logger.warn(`⏱️ Rate limit atingido. Aguardando ${Math.ceil(waitTime / 1000)}s...`);
      logger.info(`📊 Requisições na janela atual: ${this.requests.length}/${this.maxRequests}`);

      await this.sleep(waitTime);
      return this.waitForAvailability(); // Verifica novamente após esperar
    }

    // Registra a nova requisição
    this.requests.push(now);
    this.totalRequests++;

    logger.debug(`🌐 Requisição ${this.totalRequests} - (${this.requests.length}/${this.maxRequests} na janela atual)`);
  }

  /**
   * Função helper para aguardar
   * @param {number} ms - Milissegundos para aguardar
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retorna estatísticas do rate limiter
   * @returns {Object}
   */
  getStats() {
    const now = Date.now();
    const activeRequests = this.requests.filter(time => now - time < this.windowMs);

    return {
      total_requests: this.totalRequests,
      requests_in_current_window: activeRequests.length,
      max_requests_per_window: this.maxRequests,
      window_duration_ms: this.windowMs,
      available_slots: this.maxRequests - activeRequests.length,
      rate_limit_hits: this.rateLimitHits,
      is_rate_limited: activeRequests.length >= this.maxRequests,
      next_reset_in_ms: activeRequests.length > 0 ?
        this.windowMs - (now - Math.min(...activeRequests)) : 0
    };
  }

  /**
   * Retorna timeline detalhada das requisições recentes
   * @returns {Array}
   */
  getRequestsTimeline() {
    const now = Date.now();
    const recentRequests = this.requests.filter(time => now - time < this.windowMs);

    return recentRequests.map(time => ({
      timestamp: time,
      seconds_ago: Math.floor((now - time) / 1000),
      datetime: new Date(time).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
      })
    })).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Reset manual do rate limiter
   */
  reset() {
    this.requests = [];
    this.totalRequests = 0;
    this.rateLimitHits = 0;
    logger.info('🔄 Rate limiter resetado manualmente');
  }

  /**
   * Verifica se pode fazer uma requisição sem aguardar
   * @returns {boolean}
   */
  canMakeRequest() {
    const now = Date.now();
    const activeRequests = this.requests.filter(time => now - time < this.windowMs);
    return activeRequests.length < this.maxRequests;
  }

  /**
   * Estima tempo de espera para próxima requisição disponível
   * @returns {number} Milissegundos até próxima slot disponível
   */
  getWaitTime() {
    if (this.canMakeRequest()) return 0;

    const now = Date.now();
    const activeRequests = this.requests.filter(time => now - time < this.windowMs);

    if (activeRequests.length === 0) return 0;

    const oldestRequest = Math.min(...activeRequests);
    return Math.max(0, this.windowMs - (now - oldestRequest) + RATE_LIMITER_CONFIG.safetyBuffer);
  }
}

// Instância singleton do rate limiter
const rateLimiter = new TinyRateLimiter();

module.exports = {
  TinyRateLimiter,
  rateLimiter
};