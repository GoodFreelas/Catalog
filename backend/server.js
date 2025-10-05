// External Libraries
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Database & Configuration
const connectDB = require('./src/config/database');

// Services & Models
const { syncProducts } = require('./src/services/syncService');
const { saveSyncLog } = require('./src/models/SyncLog');

// Middlewares
const { errorHandler, notFoundHandler, correlationIdHandler } = require('./src/middlewares/errorHandler');

// Utilities
const { logger } = require('./src/utils/logger');

// Routes
const productsRoutes = require('./src/routes/products');
const syncRoutes = require('./src/routes/sync');
const debugRoutes = require('./src/routes/debug');

// ================================
// Constants & Configuration
// ================================

const app = express();
const PORT = process.env.PORT || 3000;

// ================================
// CORS Configuration
// ================================

/**
 * Obtém lista de origens permitidas para CORS baseada nas variáveis de ambiente
 * @returns {Array<string>} Array de origens permitidas
 */
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:5173',              // Vite dev
    'http://localhost:3000',              // React dev local
    'https://localhost:5173',             // Vite dev HTTPS
    'https://localhost:3000',             // React dev HTTPS
  ];

  // Adicionar origens de produção das variáveis de ambiente
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
    // Adicionar também com e sem barra final
    const url = process.env.FRONTEND_URL;
    if (url.endsWith('/')) {
      origins.push(url.slice(0, -1));
    } else {
      origins.push(url + '/');
    }
  }

  // Suporte para múltiplas URLs de frontend (separadas por vírgula)
  if (process.env.ADDITIONAL_FRONTEND_URLS) {
    const additionalUrls = process.env.ADDITIONAL_FRONTEND_URLS.split(',').map(url => url.trim());
    origins.push(...additionalUrls);
  }

  // Adicionar domínios Netlify comuns se não especificado
  if (!process.env.FRONTEND_URL) {
    origins.push(
      'https://*.netlify.app',
      'https://*.netlify.com',
      'https://app.netlify.com'
    );
  }

  return origins;
};

const allowedOrigins = getAllowedOrigins();

/**
 * Configuração do CORS com opções mais permissivas para produção
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sem origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);

    // Verificar se a origin está na lista permitida
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Verificar wildcard patterns para Netlify
    if (origin.includes('.netlify.app') || origin.includes('.netlify.com')) {
      return callback(null, true);
    }

    // Log para debug
    logger.warn(`CORS bloqueado para origin: ${origin}`);
    logger.info(`Origins permitidas: ${allowedOrigins.join(', ')}`);

    // Em desenvolvimento, ser mais permissivo
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    callback(new Error('Não permitido pelo CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200, // Para suportar browsers legados
  preflightContinue: false
};

// ================================
// Middlewares Configuration
// ================================

// CORS aplicado ANTES de todos os middlewares
app.use(cors(corsOptions));

/**
 * Middleware adicional para garantir headers CORS em todas as respostas
 */
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Se a origin for permitida ou se estivermos em desenvolvimento
  if (allowedOrigins.includes(origin) ||
    (origin && (origin.includes('.netlify.app') || origin.includes('.netlify.com'))) ||
    process.env.NODE_ENV !== 'production') {

    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma');
    res.header('Access-Control-Expose-Headers', 'X-Total-Count,X-Page-Count');
  }

  // Responder preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  logger.debug(`${req.method} ${req.path} - Origin: ${origin || 'no-origin'}`);
  next();
});

// Middlewares globais
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging de requisições (importado do logger)
const { requestLogger } = require('./src/utils/logger');
app.use(requestLogger);

// Middleware de ID de correlação
app.use(correlationIdHandler);

// ================================
// Database Connection
// ================================

// Conectar ao MongoDB
connectDB();

// ================================
// Routes Configuration
// ================================

/**
 * Health check específico para CORS
 * @route GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    origin: req.get('Origin') || 'no-origin',
    allowed_origins: allowedOrigins,
    headers: {
      'access-control-allow-origin': res.get('Access-Control-Allow-Origin'),
      'access-control-allow-credentials': res.get('Access-Control-Allow-Credentials')
    }
  });
});

/**
 * Rota principal da API
 * @route GET /
 */
app.get('/', (req, res) => {
  res.json({
    message: 'API de Sincronização Tiny ERP',
    version: '1.0.0',
    status: 'online',
    cors_enabled: true,
    allowed_origins: allowedOrigins,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      '/products': 'Gestão de produtos',
      '/sync': 'Sincronização',
      '/debug': 'Debug e diagnósticos',
      '/health': 'Health check com info CORS'
    },
    documentation: 'https://github.com/seu-usuario/tiny-erp-sync-api#readme'
  });
});

// Registrar rotas da API
app.use('/products', productsRoutes);
app.use('/sync', syncRoutes);
app.use('/debug', debugRoutes);

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware de tratamento de erros
app.use(errorHandler);

// ================================
// Sync Service Functions
// ================================

/**
 * Executa sincronização com verificação de conflito
 * @param {string} syncType - Tipo de sincronização
 * @param {number} retryDelay - Delay em minutos para retry (padrão: 5)
 */
async function executeSyncWithRetry(syncType, retryDelay = 5) {
  try {
    // Importar syncService aqui para evitar problemas de importação circular
    const { syncService } = require('./src/services/syncService');

    // Verificar se já existe uma sincronização em andamento
    if (syncService.isRunning) {
      logger.warn(`⏳ Sincronização ${syncType} cancelada: já existe uma sincronização em andamento`);
      logger.info(`🔄 Nova tentativa agendada para ${retryDelay} minutos`);

      // Agendar retry em X minutos
      setTimeout(() => {
        logger.info(`🔄 Retry da sincronização ${syncType} após ${retryDelay} minutos de espera`);
        executeSyncWithRetry(syncType, retryDelay);
      }, retryDelay * 60 * 1000);

      return;
    }

    // Executar sincronização
    logger.info(`🚀 Iniciando sincronização ${syncType}...`);
    await syncProducts(syncType);
    logger.info(`✅ Sincronização ${syncType} concluída com sucesso`);

  } catch (error) {
    logger.error(`❌ Erro na sincronização ${syncType}:`, error.message);
    saveSyncLog(0, 0, error.message);
  }
}

// ================================
// Cron Jobs Configuration
// ================================

// Configurar cron jobs para sincronização automática
// Sincronização diária às 02:00 (mais completa)
cron.schedule('0 2 * * *', () => {
  logger.info('Agendando sincronização automática diária...');
  executeSyncWithRetry('automatic_daily', 5);
});

// Sincronização a cada 15 minutos (configurável via variável de ambiente)
const enableFrequentSync = process.env.ENABLE_FREQUENT_SYNC === 'true';
const syncInterval = process.env.SYNC_INTERVAL_MINUTES || '15';
const retryDelay = parseInt(process.env.SYNC_RETRY_DELAY_MINUTES) || 5;

if (enableFrequentSync) {
  const cronExpression = `*/${syncInterval} * * * *`;

  cron.schedule(cronExpression, () => {
    logger.info(`Agendando sincronização automática a cada ${syncInterval} minutos...`);
    executeSyncWithRetry('automatic_frequent', retryDelay);
  });

  logger.info(`🔄 Sincronização frequente habilitada: a cada ${syncInterval} minutos`);
  logger.info(`⏱️ Retry configurado para ${retryDelay} minutos em caso de conflito`);
} else {
  logger.info('🔄 Sincronização frequente desabilitada (use ENABLE_FREQUENT_SYNC=true para habilitar)');
}

// ================================
// Server Initialization
// ================================

/**
 * Inicializa o servidor Express
 */
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
  logger.info(`📅 Sincronização automática diária configurada para todos os dias às 02:00`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  if (enableFrequentSync) {
    logger.info(`⏱️ Sincronização frequente ativa: a cada ${syncInterval} minutos`);
  }

  logger.info(`🔧 SYNC_ON_START: ${process.env.SYNC_ON_START}`);

  // Executar sincronização inicial se configurado
  if (process.env.SYNC_ON_START === 'true') {
    setTimeout(async () => {
      logger.info('🔄 Agendando sincronização inicial na inicialização...');
      executeSyncWithRetry('startup', 2); // Retry menor para startup
    }, 5000);
  }
});

// ================================
// Graceful Shutdown
// ================================

/**
 * Handler para encerramento gracioso do servidor
 * @param {string} signal - Sinal recebido
 */
const gracefulShutdown = (signal) => {
  logger.info(`${signal} recebido. Encerrando servidor graciosamente...`);
  
  server.close(() => {
    logger.info('Servidor encerrado.');
    process.exit(0);
  });

  // Force close após 30 segundos
  setTimeout(() => {
    logger.error('Forçando encerramento do servidor...');
    process.exit(1);
  }, 30000);
};

// Listeners para sinais de encerramento
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ================================
// Export
// ================================

module.exports = app;