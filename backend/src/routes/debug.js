const express = require('express');
const mongoose = require('mongoose');
const { tinyApiClient } = require('../services/tinyService');
const { logger } = require('../utils/logger');
const { rateLimiter } = require('../services/rateLimiter');

const router = express.Router();

/**
 * @route GET /debug/health
 * @desc Health check completo do sistema
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      mongodb: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        state: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      environment: {
        node_version: process.version,
        platform: process.platform,
        pid: process.pid,
        NODE_ENV: process.env.NODE_ENV
      }
    };

    // Teste básico da API Tiny
    try {
      const tinyTest = await tinyApiClient.testConnection();
      health.tiny_api = {
        status: tinyTest.success ? 'ok' : 'error',
        details: tinyTest
      };
    } catch (error) {
      health.tiny_api = {
        status: 'error',
        error: error.message
      };
    }

    // Status geral baseado nos componentes
    const hasErrors = health.mongodb.status !== 'connected' || health.tiny_api.status !== 'ok';
    health.status = hasErrors ? 'degraded' : 'ok';

    const statusCode = hasErrors ? 503 : 200;
    res.status(statusCode).json({
      success: !hasErrors,
      data: health
    });

  } catch (error) {
    logger.error('Erro no health check:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /debug/env
 * @desc Verificar variáveis de ambiente (sem expor valores sensíveis)
 * @access Public
 */
router.get('/env', (req, res) => {
  try {
    const envInfo = {
      port: process.env.PORT,
      node_env: process.env.NODE_ENV,
      sync_on_start: process.env.SYNC_ON_START,
      log_level: process.env.LOG_LEVEL,
      log_colors: process.env.LOG_COLORS,

      // Verificações de existência (sem expor valores)
      has_mongodb_uri: !!process.env.MONGODB_URI,
      has_tiny_token: !!process.env.TINY_TOKEN,

      // Configurações do rate limiter
      rate_limit_config: {
        requests: process.env.TINY_RATE_LIMIT_REQUESTS || '25 (default)',
        window: process.env.TINY_RATE_LIMIT_WINDOW || '60000 (default)'
      },

      // Estado do MongoDB
      mongodb_connection_state: mongoose.connection.readyState,
      mongodb_states: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      },

      // Informações do sistema
      system: {
        platform: process.platform,
        arch: process.arch,
        node_version: process.version,
        pid: process.pid
      }
    };

    res.json({
      success: true,
      data: envInfo
    });

  } catch (error) {
    logger.error('Erro ao verificar ambiente:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /debug/test-tiny
 * @desc Testar conexão com API do Tiny
 * @access Public
 */
router.get('/test-tiny', async (req, res) => {
  try {
    logger.info('🧪 Testando conexão com API do Tiny...');

    const testResult = await tinyApiClient.testConnection();

    res.json({
      success: testResult.success,
      data: testResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Erro no teste da API Tiny:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: {
        stack: error.stack,
        response_data: error.response?.data || null,
        response_status: error.response?.status || null
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /debug/rate-limiter
 * @desc Status detalhado do rate limiter
 * @access Public
 */
router.get('/rate-limiter', (req, res) => {
  try {
    const stats = rateLimiter.getStats();
    const timeline = rateLimiter.getRequestsTimeline();

    const now = Date.now();
    const nextResetTime = stats.next_reset_in_ms > 0 ?
      new Date(now + stats.next_reset_in_ms) : null;

    res.json({
      success: true,
      data: {
        current_stats: stats,
        timeline: timeline.slice(0, 10), // Últimas 10 requisições
        next_window_reset: {
          in_ms: stats.next_reset_in_ms,
          in_seconds: Math.ceil(stats.next_reset_in_ms / 1000),
          timestamp: nextResetTime?.toISOString() || null,
          local_time: nextResetTime?.toLocaleString('pt-BR') || null
        },
        configuration: {
          max_requests_per_window: stats.max_requests_per_window,
          window_duration_ms: stats.window_duration_ms,
          window_duration_seconds: stats.window_duration_ms / 1000
        },
        status: {
          can_make_request: !stats.is_rate_limited,
          wait_time_ms: rateLimiter.getWaitTime(),
          recommendations: stats.is_rate_limited ?
            ['Aguarde o reset da janela antes de fazer novas requisições'] :
            ['Rate limiter funcionando normalmente']
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Erro ao verificar rate limiter:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /debug/rate-limiter/reset
 * @desc Reset manual do rate limiter
 * @access Public
 */
router.post('/rate-limiter/reset', (req, res) => {
  try {
    const beforeStats = rateLimiter.getStats();
    rateLimiter.reset();
    const afterStats = rateLimiter.getStats();

    logger.info('Rate limiter resetado manualmente via API');

    res.json({
      success: true,
      message: 'Rate limiter resetado com sucesso',
      data: {
        before: beforeStats,
        after: afterStats
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Erro ao resetar rate limiter:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /debug/logs/level
 * @desc Verificar nível de log atual
 * @access Public
 */
router.get('/logs/level', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        current_level: logger.getCurrentLevel(),
        available_levels: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
        description: {
          DEBUG: 'Todas as mensagens (muito verboso)',
          INFO: 'Informações gerais e debug',
          WARN: 'Avisos e erros',
          ERROR: 'Apenas erros críticos'
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /debug/logs/level
 * @desc Alterar nível de log dinamicamente
 * @access Public
 */
router.post('/logs/level', (req, res) => {
  try {
    const { level } = req.body;

    if (!level) {
      return res.status(400).json({
        success: false,
        error: 'Nível de log obrigatório',
        message: 'Forneça o campo "level" no body'
      });
    }

    const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    if (!validLevels.includes(level.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Nível de log inválido',
        valid_levels: validLevels
      });
    }

    const oldLevel = logger.getCurrentLevel();
    logger.setLevel(level);
    const newLevel = logger.getCurrentLevel();

    res.json({
      success: true,
      message: `Nível de log alterado de ${oldLevel} para ${newLevel}`,
      data: {
        old_level: oldLevel,
        new_level: newLevel
      }
    });

  } catch (error) {
    logger.error('Erro ao alterar nível de log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /debug/memory
 * @desc Informações detalhadas de memória
 * @access Public
 */
router.get('/memory', (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const formatBytes = (bytes) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    res.json({
      success: true,
      data: {
        raw_bytes: memUsage,
        formatted: {
          rss: formatBytes(memUsage.rss),
          heapTotal: formatBytes(memUsage.heapTotal),
          heapUsed: formatBytes(memUsage.heapUsed),
          external: formatBytes(memUsage.external),
          arrayBuffers: formatBytes(memUsage.arrayBuffers)
        },
        heap_usage_percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
        uptime_seconds: process.uptime(),
        pid: process.pid
      }
    });

  } catch (error) {
    logger.error('Erro ao verificar memória:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;