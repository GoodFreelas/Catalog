require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Routes
const { router: authRoutes, requireAuth } = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const stockRoutes = require('./routes/stock');

const app = express();
const PORT = process.env.PORT || 3000;

// Validar configurações críticas
const requiredEnvVars = [
  'TINY_CLIENT_ID',
  'TINY_CLIENT_SECRET',
  'TINY_AUTH_URL',
  'TINY_BASE_URL',
  'REDIRECT_URI'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  process.exit(1);
}

console.log('✅ Configurações da Tiny API v3:');
console.log(`   - Base URL: ${process.env.TINY_BASE_URL}`);
console.log(`   - Auth URL: ${process.env.TINY_AUTH_URL}`);
console.log(`   - Client ID: ${process.env.TINY_CLIENT_ID.substring(0, 20)}...`);
console.log(`   - Redirect URI: ${process.env.REDIRECT_URI}`);

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar para desenvolvimento
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// CORS configurado para suas URLs
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://catalog-471g.onrender.com', // Seu domínio de produção
    // Adicione outras URLs conforme necessário
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`${timestamp} - ${method} ${path} - IP: ${ip}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    apiVersion: 'v3',
    uptime: process.uptime()
  });
});

// Routes
app.use('/auth', authRoutes);

// Aplicar middleware de autenticação nas rotas da API (opcional)
// Descomente as linhas abaixo se quiser exigir autenticação para todas as rotas da API
// app.use('/api/produtos', requireAuth, productRoutes);
// app.use('/api/categorias', requireAuth, categoryRoutes);
// app.use('/api/estoque', requireAuth, stockRoutes);

// Ou use sem autenticação obrigatória (recomendado para desenvolvimento)
app.use('/api/produtos', productRoutes);
app.use('/api/categorias', categoryRoutes);
app.use('/api/estoque', stockRoutes);

// API status endpoint
app.get('/api/status', async (req, res) => {
  try {
    // Importar aqui para evitar erro de dependência circular
    const tinyApiClient = require('./utils/tinyApiClient');

    const connectionTest = await tinyApiClient.testConnection();

    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      apiVersion: 'v3',
      endpoints: {
        auth: '/auth',
        produtos: '/api/produtos',
        categorias: '/api/categorias',
        estoque: '/api/estoque'
      },
      tinyApi: {
        baseUrl: process.env.TINY_BASE_URL,
        connected: connectionTest.success,
        version: 'v3'
      },
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Rota de debug geral
app.get('/api/debug', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    port: PORT,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    config: {
      tinyBaseUrl: process.env.TINY_BASE_URL,
      frontendUrl: process.env.FRONTEND_URL,
      redirectUri: process.env.REDIRECT_URI,
      hasClientId: !!process.env.TINY_CLIENT_ID,
      hasClientSecret: !!process.env.TINY_CLIENT_SECRET
    },
    headers: req.headers,
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Erro na API:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(error.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : error.message,
      status: error.status || 500,
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint não encontrado',
      status: 404,
      path: req.originalUrl,
      availableEndpoints: [
        '/health',
        '/auth/login',
        '/auth/status',
        '/api/status',
        '/api/produtos',
        '/api/categorias',
        '/api/estoque'
      ]
    }
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n📴 Recebido ${signal}, encerrando servidor graciosamente...`);

  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });

  // Forçar encerramento após 10 segundos
  setTimeout(() => {
    console.error('❌ Forçando encerramento do servidor');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Capturar erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log('\n🚀 ===================================');
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API Status: http://localhost:${PORT}/api/status`);

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔐 Autenticação: http://localhost:${PORT}/auth/login`);
    console.log(`🔍 Debug: http://localhost:${PORT}/api/debug`);
  }

  console.log('🚀 ===================================\n');
});

module.exports = app;