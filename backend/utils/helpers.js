// Utilitários e funções auxiliares

// Validar parâmetros obrigatórios
const validateParams = (params, requiredFields) => {
  for (const field of requiredFields) {
    if (!params[field] || params[field] === '') {
      return false;
    }
  }
  return true;
};

// Tratar erros da API de forma consistente
const handleApiError = (error, res, customMessage = 'Erro na operação') => {
  console.error('API Error:', error);

  let statusCode = 500;
  let errorMessage = customMessage;
  let details = null;

  if (error.response) {
    // Erro de resposta HTTP
    statusCode = error.response.status;
    errorMessage = error.response.data?.message || error.message || customMessage;
    details = error.response.data;
  } else if (error.message) {
    // Erro de aplicação
    errorMessage = error.message;

    if (error.message.includes('Token')) {
      statusCode = 401;
    } else if (error.message.includes('não encontrado')) {
      statusCode = 404;
    } else if (error.message.includes('obrigatório')) {
      statusCode = 400;
    }
  }

  res.status(statusCode).json({
    error: errorMessage,
    details: details,
    timestamp: new Date().toISOString(),
    success: false
  });
};

// Formatar resposta de sucesso
const successResponse = (res, data, message = 'Operação realizada com sucesso') => {
  res.json({
    data,
    message,
    timestamp: new Date().toISOString(),
    success: true
  });
};

// Sanitizar dados de entrada
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

// Validar formato de email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar formato de telefone brasileiro
const isValidBrazilianPhone = (phone) => {
  const phoneRegex = /^(\+55|55)?[\s-]?\(?([1-9][0-9])\)?[\s-]?([9]?[0-9]{4})[\s-]?([0-9]{4})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Formatar preço para moeda brasileira
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Paginação helper
const getPaginationData = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 20;
  const totalItems = parseInt(total) || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    page: currentPage,
    limit: itemsPerPage,
    total: totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null
  };
};

// Delay para rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry com backoff exponencial
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries) {
        throw error;
      }

      const delayMs = baseDelay * Math.pow(2, i);
      console.log(`Tentativa ${i + 1} falhou, tentando novamente em ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
};

// Validar range de datas
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: 'Formato de data inválido' };
  }

  if (start > end) {
    return { valid: false, message: 'Data inicial deve ser anterior à data final' };
  }

  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  if (diffDays > 365) {
    return { valid: false, message: 'Período não pode exceder 365 dias' };
  }

  return { valid: true };
};

// Limpar dados sensíveis de logs
const sanitizeForLog = (obj) => {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...obj };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  }

  return sanitized;
};

// Middleware de rate limiting personalizado
const createRateLimit = (windowMs, max, message) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);

    // Remover requisições antigas
    const validRequests = userRequests.filter(time => now - time < windowMs);

    if (validRequests.length >= max) {
      return res.status(429).json({
        error: message || 'Muitas requisições',
        retryAfter: Math.ceil(windowMs / 1000),
        success: false
      });
    }

    validRequests.push(now);
    requests.set(ip, validRequests);

    next();
  };
};

// Cache em memória simples
class SimpleCache {
  constructor(defaultTTL = 300000) { // 5 minutos
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  // Limpar itens expirados
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

module.exports = {
  validateParams,
  handleApiError,
  successResponse,
  sanitizeInput,
  isValidEmail,
  isValidBrazilianPhone,
  formatCurrency,
  getPaginationData,
  delay,
  retryWithBackoff,
  validateDateRange,
  sanitizeForLog,
  createRateLimit,
  SimpleCache
};