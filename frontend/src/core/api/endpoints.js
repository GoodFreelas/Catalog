// Endpoints da API organizados por recursos
export const ENDPOINTS = {
  // Produtos
  PRODUCTS: {
    LIST: '/products',
    BY_ID: (id) => `/products/${id}`,
    SEARCH: '/products/search/text',
    STATS: '/products/stats/general',
    CATEGORIES: '/products/categories',
    BY_CATEGORY: (category) => `/products/category/${category}`,
  },

  // Sincronização
  SYNC: {
    TRIGGER: '/sync',
    STATUS: '/sync/status',
    LOGS: '/sync/logs',
    STATS: '/sync/stats',
    PROGRESS: '/sync/progress',
  },

  // Debug/Health
  DEBUG: {
    HEALTH: '/debug/health',
    TEST_TINY: '/debug/test-tiny',
    RATE_LIMITER: '/debug/rate-limiter',
  },
};

// Parâmetros padrão para requisições
export const DEFAULT_PARAMS = {
  PRODUCTS: {
    page: 1,
    limit: 12,
    sort: 'nome',
    order: 'asc',
  },

  SEARCH: {
    limit: 20,
  },

  SYNC_LOGS: {
    page: 1,
    limit: 10,
    include_details: false,
  },
};