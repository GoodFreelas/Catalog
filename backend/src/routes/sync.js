const express = require('express');
const { syncService } = require('../services/syncService');
const { SyncLog } = require('../models/SyncLog');
const Product = require('../models/Product');
const { logger } = require('../utils/logger'); // Corrigido: destructuring do logger
const mongoose = require('mongoose');

const router = express.Router();

/**
 * @route POST /sync
 * @desc Executar sincronização manual
 * @access Public
 */
router.post('/', async (req, res) => {
  try {
    if (syncService.isRunning) {
      return res.status(409).json({
        success: false,
        error: 'Sincronização já em execução',
        message: 'Aguarde a conclusão da sincronização atual',
        current_stats: syncService.getCurrentStats()
      });
    }

    // Responder imediatamente que a sincronização foi iniciada
    res.json({
      success: true,
      message: 'Sincronização iniciada',
      status: 'processing',
      timestamp: new Date().toISOString()
    });

    // Executar sincronização em background
    syncService.syncProducts('manual').catch(error => {
      logger.error('Erro na sincronização manual:', error.message);
    });

  } catch (error) {
    logger.error('Erro ao iniciar sincronização:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

/**
 * @route GET /sync/status
 * @desc Status da sincronização e sistema
 * @access Public
 */
router.get('/status', async (req, res) => {
  try {
    const lastSync = await SyncLog.getLastSync();
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ situacao: 'A' });
    const syncStats = await SyncLog.getStats();

    res.json({
      success: true,
      data: {
        system_status: {
          mongodb_connected: mongoose.connection.readyState === 1,
          total_products_in_db: totalProducts,
          active_products: activeProducts,
          connection_state: mongoose.connection.readyState,
          uptime_seconds: process.uptime()
        },
        sync_status: {
          is_running: syncService.isRunning,
          current_stats: syncService.getCurrentStats(),
          last_sync: lastSync
        },
        sync_statistics: syncStats,
        environment: {
          sync_on_start: process.env.SYNC_ON_START,
          node_env: process.env.NODE_ENV,
          port: process.env.PORT,
          log_level: logger.getCurrentLevel()
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

/**
 * @route GET /sync/logs
 * @desc Histórico de logs de sincronização
 * @access Public
 */
router.get('/logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    // Filtros opcionais
    const filters = {};

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.sync_type) {
      filters.sync_type = req.query.sync_type;
    }

    if (req.query.date_from || req.query.date_to) {
      filters.date = {};
      if (req.query.date_from) {
        filters.date.$gte = new Date(req.query.date_from);
      }
      if (req.query.date_to) {
        filters.date.$lte = new Date(req.query.date_to);
      }
    }

    const logs = await SyncLog.find(filters)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .select('-error_stack -config_snapshot'); // Campos sensíveis removidos por padrão

    const total = await SyncLog.countDocuments(filters);

    // Incluir stack trace se solicitado e for erro
    if (req.query.include_details === 'true') {
      // Rebusar com todos os campos
      const detailedLogs = await SyncLog.find(filters)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        success: true,
        data: {
          logs: detailedLogs,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(total / limit),
            total_logs: total,
            per_page: limit
          },
          filters_applied: filters
        }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_logs: total,
          per_page: limit
        },
        filters_applied: filters
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar logs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

/**
 * @route GET /sync/logs/errors
 * @desc Logs de sincronização com erro
 * @access Public
 */
router.get('/logs/errors', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const errorLogs = await SyncLog.getErrorLogs(limit);

    res.json({
      success: true,
      data: {
        error_logs: errorLogs,
        total_errors: errorLogs.length
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar logs de erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

/**
 * @route GET /sync/stats
 * @desc Estatísticas detalhadas de sincronização
 * @access Public
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await SyncLog.getStats();

    // Estatísticas por tipo de sincronização
    const statsByType = await SyncLog.aggregate([
      {
        $group: {
          _id: '$sync_type',
          count: { $sum: 1 },
          success_count: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          avg_duration: { $avg: '$duration_seconds' },
          total_products_processed: { $sum: '$products_processed' }
        }
      }
    ]);

    // Estatísticas dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStats = await SyncLog.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          syncs_count: { $sum: 1 },
          products_processed: { $sum: '$products_processed' },
          success_rate: {
            $avg: { $cond: [{ $eq: ['$status', 'success'] }, 100, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        general_stats: stats,
        stats_by_type: statsByType,
        last_30_days: recentStats,
        performance_metrics: {
          avg_sync_duration: stats.avg_duration,
          success_rate: stats.total_syncs > 0 ?
            (stats.successful_syncs / stats.total_syncs) * 100 : 0,
          total_products_synced: stats.total_products_processed
        }
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

/**
 * @route POST /sync/cancel
 * @desc Tentar cancelar sincronização em execução
 * @access Public
 */
router.post('/cancel', async (req, res) => {
  try {
    if (!syncService.isRunning) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma sincronização em execução',
        message: 'Não há sincronização para cancelar'
      });
    }

    // Nota: Implementação real de cancelamento seria mais complexa
    // Aqui apenas retornamos informação sobre a impossibilidade
    res.json({
      success: false,
      message: 'Cancelamento não implementado',
      info: 'A sincronização continuará até conclusão natural',
      current_stats: syncService.getCurrentStats()
    });

  } catch (error) {
    logger.error('Erro ao tentar cancelar sincronização:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

/**
 * @route GET /sync/progress
 * @desc Progresso da sincronização atual
 * @access Public
 */
router.get('/progress', async (req, res) => {
  try {
    const stats = syncService.getCurrentStats();

    if (!syncService.isRunning) {
      return res.json({
        success: true,
        data: {
          is_running: false,
          message: 'Nenhuma sincronização em execução'
        }
      });
    }

    res.json({
      success: true,
      data: {
        is_running: true,
        progress: stats,
        estimated_time_remaining: stats.total > 0 && stats.processed > 0 ?
          Math.round(((stats.total - stats.processed) / stats.processed) * 60) : null // estimativa em segundos
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar progresso:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

module.exports = router;