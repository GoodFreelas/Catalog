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

// Middlewares globais
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
connectDB();

// Rotas
app.get('/', (req, res) => {
  res.json({
    message: 'API de Sincronização Tiny ERP',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      '/products': 'Gestão de produtos',
      '/sync': 'Sincronização',
      '/debug': 'Debug e diagnósticos'
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