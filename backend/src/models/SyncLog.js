const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  // Informações básicas da sincronização
  date: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Estatísticas
  products_processed: {
    type: Number,
    required: true,
    min: 0
  },
  products_created: {
    type: Number,
    default: 0,
    min: 0
  },
  products_updated: {
    type: Number,
    default: 0,
    min: 0
  },
  products_errors: {
    type: Number,
    default: 0,
    min: 0
  },

  // Timing
  duration_seconds: {
    type: Number,
    required: true,
    min: 0
  },
  start_time: Date,
  end_time: Date,

  // Status
  status: {
    type: String,
    enum: ['success', 'error', 'partial'],
    default: 'success',
    index: true
  },

  // Detalhes do erro (se houver)
  error_message: String,
  error_stack: String,

  // Tipo de sincronização
  sync_type: {
    type: String,
    enum: ['manual', 'automatic', 'startup'],
    default: 'manual'
  },

  // Estatísticas da API
  api_requests_made: {
    type: Number,
    default: 0
  },
  rate_limit_hits: {
    type: Number,
    default: 0
  },

  // Metadados
  app_version: String,
  node_version: String,

  // Configurações usadas
  config_snapshot: {
    rate_limit_requests: Number,
    rate_limit_window: Number,
    mongodb_uri_host: String
  }
}, {
  timestamps: true,
  collection: 'sync_logs'
});

// Índices
syncLogSchema.index({ date: -1, status: 1 });
syncLogSchema.index({ sync_type: 1, date: -1 });

// Métodos estáticos
syncLogSchema.statics.getLastSync = function () {
  return this.findOne().sort({ date: -1 });
};

syncLogSchema.statics.getRecentLogs = function (limit = 10) {
  return this.find().sort({ date: -1 }).limit(limit);
};

syncLogSchema.statics.getErrorLogs = function (limit = 10) {
  return this.find({ status: 'error' }).sort({ date: -1 }).limit(limit);
};

syncLogSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total_syncs: { $sum: 1 },
        successful_syncs: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failed_syncs: {
          $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
        },
        total_products_processed: { $sum: '$products_processed' },
        avg_duration: { $avg: '$duration_seconds' },
        last_sync: { $max: '$date' }
      }
    }
  ]);

  return stats[0] || {
    total_syncs: 0,
    successful_syncs: 0,
    failed_syncs: 0,
    total_products_processed: 0,
    avg_duration: 0,
    last_sync: null
  };
};

// Métodos de instância
syncLogSchema.methods.isSuccessful = function () {
  return this.status === 'success';
};

syncLogSchema.methods.hasErrors = function () {
  return this.products_errors > 0 || this.status === 'error';
};

syncLogSchema.methods.getSuccessRate = function () {
  if (this.products_processed === 0) return 0;
  return ((this.products_processed - this.products_errors) / this.products_processed) * 100;
};

// Função helper para criar log
syncLogSchema.statics.createLog = async function (data) {
  const logData = {
    ...data,
    app_version: process.env.npm_package_version || '1.0.0',
    node_version: process.version,
    config_snapshot: {
      rate_limit_requests: process.env.TINY_RATE_LIMIT_REQUESTS || 25,
      rate_limit_window: process.env.TINY_RATE_LIMIT_WINDOW || 60000,
      mongodb_uri_host: process.env.MONGODB_URI ?
        new URL(process.env.MONGODB_URI).hostname : 'localhost'
    }
  };

  return await this.create(logData);
};

const SyncLog = mongoose.model('SyncLog', syncLogSchema);

// Função helper para salvar log (compatibilidade com código existente)
async function saveSyncLog(productsProcessed, duration, errorMessage = null, additionalData = {}) {
  try {
    const logData = {
      products_processed: productsProcessed,
      duration_seconds: duration,
      status: errorMessage ? 'error' : 'success',
      error_message: errorMessage,
      end_time: new Date(),
      ...additionalData
    };

    if (additionalData.start_time) {
      logData.start_time = additionalData.start_time;
    }

    const log = await SyncLog.createLog(logData);
    return log;
  } catch (error) {
    console.error('Erro ao salvar log de sincronização:', error.message);
    return null;
  }
}

module.exports = {
  SyncLog,
  saveSyncLog
};