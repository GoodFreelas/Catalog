const { logger } = require('../utils/logger'); // Corrigido: destructuring do logger

/**
 * Middleware de tratamento de erros global
 * @param {Error} err - Objeto de erro
 * @param {Object} req - Request object
 * @param {Object} res - Response object  
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Se a resposta já foi enviada, delegar para o handler padrão do Express
  if (res.headersSent) {
    return next(err);
  }

  let error = { ...err };
  error.message = err.message;

  // Log do erro
  logger.error(`Erro na rota ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    stack: err.stack,
    user_agent: req.get('User-Agent'),
    ip: req.ip,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Erro de cast do MongoDB (ID inválido)
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado';
    error = { message, statusCode: 404 };
  }

  // Erro de duplicação do MongoDB
  if (err.code === 11000) {
    const message = 'Recurso duplicado';
    error = { message, statusCode: 400 };
  }

  // Erro de validação do MongoDB
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Erro de JSON inválido
  if (err.type === 'entity.parse.failed') {
    const message = 'JSON inválido no corpo da requisição';
    error = { message, statusCode: 400 };
  }

  // Erro de timeout
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
    const message = 'Timeout na requisição';
    error = { message, statusCode: 504 };
  }

  // Rate limiting error
  if (err.message === 'RATE_LIMIT_EXCEEDED') {
    const message = 'Rate limit excedido. Tente novamente em alguns minutos.';
    error = { message, statusCode: 429 };
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';

  const errorResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Incluir stack trace apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = error;
  }

  // Incluir ID de correlação se disponível
  if (req.correlationId) {
    errorResponse.correlation_id = req.correlationId;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware para capturar rotas não encontradas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const notFoundHandler = (req, res, next) => {
  const message = `Rota ${req.originalUrl} não encontrada`;

  logger.warn(`404 - Rota não encontrada: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    available_routes: {
      products: '/products',
      sync: '/sync',
      debug: '/debug'
    }
  });
};

/**
 * Middleware para adicionar ID de correlação
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const correlationIdHandler = (req, res, next) => {
  // Gerar ID único para rastreamento
  req.correlationId = req.get('X-Correlation-ID') ||
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Adicionar ao header de resposta
  res.set('X-Correlation-ID', req.correlationId);

  next();
};

/**
 * Middleware para validação de content-type em rotas POST/PUT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');

    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type deve ser application/json',
        received: contentType || 'não informado',
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
};

/**
 * Middleware para rate limiting básico por IP
 */
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const requestData = requests.get(ip);

    if (now > requestData.resetTime) {
      requestData.count = 1;
      requestData.resetTime = now + windowMs;
      return next();
    }

    if (requestData.count >= max) {
      return res.status(429).json({
        success: false,
        error: 'Muitas requisições',
        message: `Limite de ${max} requisições por ${windowMs / 1000 / 60} minutos excedido`,
        retry_after: Math.ceil((requestData.resetTime - now) / 1000),
        timestamp: new Date().toISOString()
      });
    }

    requestData.count++;
    next();
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  correlationIdHandler,
  validateContentType,
  createRateLimiter
};