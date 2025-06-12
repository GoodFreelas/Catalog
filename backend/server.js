const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Importações dos módulos
const connectDB = require('./src/config/database');
const { syncProducts } = require('./src/services/syncService');
const { saveSyncLog } = require('./src/models/SyncLog');
const { errorHandler, notFoundHandler } = require('./src/middlewares/errorHandler');
const { logger } = require('./src/utils/logger'); // Corrigido: destructuring do logger

// Importação das rotas
const productsRoutes = require('./src/routes/products');
const syncRoutes = require('./src/routes/sync');
const debugRoutes = require('./src/routes/debug');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de origens permitidas para CORS
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:5173',              // Vite dev
    'http://localhost:3000',              // React dev local
  ];

  // Adicionar origens de produção das variáveis de ambiente
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
    // Adicionar também com barra final para garantir compatibilidade
    if (!process.env.FRONTEND_URL.endsWith('/')) {
      origins.push(process.env.FRONTEND_URL + '/');
    }
  }

  // Suporte para múltiplas URLs de frontend (separadas por vírgula)
  if (process.env.ADDITIONAL_FRONTEND_URLS) {
    const additionalUrls = process.env.ADDITIONAL_FRONTEND_URLS.split(',').map(url => url.trim());
    origins.push(...additionalUrls);
  }

  return origins;
};

const allowedOrigins = getAllowedOrigins();

// CORS configurado ANTES de todos os middlewares
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Para suportar browsers legados
}));

// Middleware para logs de CORS (opcional - para debug)
app.use((req, res, next) => {
  logger.debug(`CORS: ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'undefined'}`);
  next();
});

// Middlewares globais
app.use(express.json());

// Conectar ao MongoDB
connectDB();

// Health check específico para CORS
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    origin: req.get('Origin') || 'no-origin'
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'API de Sincronização Tiny ERP',
    version: '1.0.0',
    status: 'online',
    cors_enabled: true,
    allowed_origins: allowedOrigins,
    endpoints: {
      '/products': 'Gestão de produtos',
      '/sync': 'Sincronização',
      '/debug': 'Debug e diagnósticos',
      '/health': 'Health check com info CORS'
    },
    documentation: 'https://github.com/seu-usuario/tiny-erp-sync-api#readme'
  });
});

// Registrar rotas
app.use('/products', productsRoutes);
app.use('/sync', syncRoutes);
app.use('/debug', debugRoutes);

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware de tratamento de erros
app.use(errorHandler);

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

// Inicializar servidor
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
  logger.info(`📅 Sincronização automática diária configurada para todos os dias às 02:00`);

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

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando servidor graciosamente...');
  server.close(() => {
    logger.info('Servidor encerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido. Encerrando servidor graciosamente...');
  server.close(() => {
    logger.info('Servidor encerrado.');
    process.exit(0);
  });
});

module.exports = app;