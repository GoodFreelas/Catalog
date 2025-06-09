/**
 * Sistema de logs customizado
 * Suporta diferentes níveis de log e formatação colorida
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const LOG_COLORS = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
  RESET: '\x1b[0m'   // Reset
};

class Logger {
  constructor() {
    this.level = this.getLogLevel();
    this.enableColors = process.env.LOG_COLORS !== 'false';
  }

  /**
   * Determina o nível de log baseado no ambiente
   * @returns {number} Nível de log
   */
  getLogLevel() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    return LOG_LEVELS[envLevel] !== undefined ? LOG_LEVELS[envLevel] : LOG_LEVELS.INFO;
  }

  /**
   * Formata uma mensagem de log
   * @param {string} level - Nível do log
   * @param {Array} args - Argumentos da mensagem
   * @returns {string} Mensagem formatada
   */
  formatMessage(level, args) {
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const color = this.enableColors ? LOG_COLORS[level] : '';
    const reset = this.enableColors ? LOG_COLORS.RESET : '';

    // Converter argumentos para strings
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2);
      }
      return String(arg);
    }).join(' ');

    return `${color}[${timestamp}] ${level.padEnd(5)} |${reset} ${message}`;
  }

  /**
   * Log de debug
   * @param {...any} args - Argumentos para logar
   */
  debug(...args) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      console.log(this.formatMessage('DEBUG', args));
    }
  }

  /**
   * Log de informação
   * @param {...any} args - Argumentos para logar
   */
  info(...args) {
    if (this.level <= LOG_LEVELS.INFO) {
      console.log(this.formatMessage('INFO', args));
    }
  }

  /**
   * Log de aviso
   * @param {...any} args - Argumentos para logar
   */
  warn(...args) {
    if (this.level <= LOG_LEVELS.WARN) {
      console.warn(this.formatMessage('WARN', args));
    }
  }

  /**
   * Log de erro
   * @param {...any} args - Argumentos para logar
   */
  error(...args) {
    if (this.level <= LOG_LEVELS.ERROR) {
      console.error(this.formatMessage('ERROR', args));
    }
  }

  /**
   * Log de uma requisição HTTP
   * @param {Object} req - Objeto request
   * @param {Object} res - Objeto response
   * @param {number} duration - Duração da requisição em ms
   */
  logRequest(req, res, duration) {
    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;
    const userAgent = req.get('User-Agent') || '-';

    const statusColor = status >= 400 ? 'ERROR' : 'INFO';

    this[statusColor.toLowerCase()](
      `${method} ${url} ${status} - ${duration}ms - ${userAgent}`
    );
  }

  /**
   * Log de início de sincronização
   * @param {string} type - Tipo de sincronização
   */
  logSyncStart(type) {
    this.info('🔄 ==========================================');
    this.info(`🔄 INICIANDO SINCRONIZAÇÃO: ${type.toUpperCase()}`);
    this.info('🔄 ==========================================');
  }

  /**
   * Log de fim de sincronização
   * @param {Object} stats - Estatísticas da sincronização
   */
  logSyncEnd(stats) {
    this.info('🎉 ==========================================');
    this.info('🎉 SINCRONIZAÇÃO CONCLUÍDA');
    this.info(`📊 Processados: ${stats.processed}`);
    this.info(`✅ Criados: ${stats.created}`);
    this.info(`🔄 Atualizados: ${stats.updated}`);
    this.info(`❌ Erros: ${stats.errors}`);
    this.info(`⏱️ Duração: ${stats.duration}s`);
    this.info('🎉 ==========================================');
  }

  /**
   * Log de progresso da sincronização
   * @param {number} current - Progresso atual
   * @param {number} total - Total de itens
   * @param {Object} stats - Estatísticas atuais
   */
  logSyncProgress(current, total, stats) {
    const percentage = ((current / total) * 100).toFixed(1);
    this.info(`📈 Progresso: ${current}/${total} (${percentage}%) | ✅ ${stats.created} | 🔄 ${stats.updated} | ❌ ${stats.errors}`);
  }

  /**
   * Log de erro de rate limit
   * @param {number} waitTime - Tempo de espera em segundos
   */
  logRateLimit(waitTime) {
    this.warn(`⏱️ Rate limit atingido. Aguardando ${waitTime}s...`);
  }

  /**
   * Altera o nível de log dinamicamente
   * @param {string} level - Novo nível de log
   */
  setLevel(level) {
    const upperLevel = level.toUpperCase();
    if (LOG_LEVELS[upperLevel] !== undefined) {
      this.level = LOG_LEVELS[upperLevel];
      this.info(`📝 Nível de log alterado para: ${upperLevel}`);
    } else {
      this.warn(`❌ Nível de log inválido: ${level}`);
    }
  }

  /**
   * Obtém o nível de log atual
   * @returns {string} Nível atual
   */
  getCurrentLevel() {
    return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === this.level);
  }
}

// Instância singleton do logger
const logger = new Logger();

// Middleware para logs de requisições Express
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });

  next();
};

module.exports = {
  Logger,
  logger,
  requestLogger,
  LOG_LEVELS
};