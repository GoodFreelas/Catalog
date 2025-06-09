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

// CORS configurado ANTES de todos os middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',              // Vite dev
    'http://localhost:3000',              // React dev local
    'https://catalog-eight-indol.vercel.app', // Seu frontend em produção
    'https://catalog-eight-indol.vercel.app/', // Com barra final (caso necessário)
  ],
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
    allowed_origins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://catalog-eight-indol.vercel.app'
    ],
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

// Configurar cron job para sincronização automática
cron.schedule('0 2 * * *', () => {
  logger.info('Executando sincronização automática diária...');
  syncProducts().catch(error => {
    logger.error('Erro na sincronização automática:', error.message);
    saveSyncLog(0, 0, error.message);
  });
});

// Inicializar servidor
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`🌐 CORS habilitado para: localhost:5173, localhost:3000, catalog-eight-indol.vercel.app`);
  logger.info(`📅 Sincronização automática configurada para todos os dias às 02:00`);
  logger.info(`🔧 SYNC_ON_START: ${process.env.SYNC_ON_START}`);

  // Executar sincronização inicial se configurado
  if (process.env.SYNC_ON_START === 'true') {
    setTimeout(async () => {
      try {
        logger.info('🔄 Iniciando sincronização automática na inicialização...');
        await syncProducts();
        logger.info('✅ Sincronização inicial concluída com sucesso');
      } catch (error) {
        logger.error('❌ Erro na sincronização inicial:', error);
      }
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
