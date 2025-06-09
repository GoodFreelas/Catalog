// Configurações da API Tiny ERP
const TINY_API_CONFIG = {
  baseURL: 'https://api.tiny.com.br',
  token: process.env.TINY_TOKEN || '6126c965d5c8d23c0da7b7bc33372c40463b9368fce27eeb36c6e0b3a5e13929',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  timeout: 30000, // 30 segundos
  endpoints: {
    productsList: '/api2/produtos.pesquisa.php',
    productDetails: '/api2/produto.obter.php'
  }
};

// Configurações do Rate Limiter
const RATE_LIMITER_CONFIG = {
  maxRequests: parseInt(process.env.TINY_RATE_LIMIT_REQUESTS) || 25,
  windowMs: parseInt(process.env.TINY_RATE_LIMIT_WINDOW) || 60000, // 1 minuto
  safetyBuffer: 1000 // 1 segundo extra de segurança
};

// Validar configurações essenciais
const validateConfig = () => {
  if (!TINY_API_CONFIG.token) {
    throw new Error('TINY_TOKEN não está definido nas variáveis de ambiente');
  }

  if (RATE_LIMITER_CONFIG.maxRequests > 30) {
    console.warn('⚠️ AVISO: Rate limit configurado acima de 30 req/min pode causar erros na API do Tiny');
  }

  return true;
};

module.exports = {
  TINY_API_CONFIG,
  RATE_LIMITER_CONFIG,
  validateConfig
};