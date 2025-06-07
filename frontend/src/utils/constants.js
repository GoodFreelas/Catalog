// Configuração da aplicação
export const CONFIG = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
  },
  whatsapp: {
    number: import.meta.env.VITE_WHATSAPP_NUMBER || '5551999999999',
    message: 'Olá! Gostaria de fazer um pedido:'
  },
  loja: {
    nome: import.meta.env.VITE_STORE_NAME || 'Minha Loja',
    logo: import.meta.env.VITE_STORE_LOGO || '/assets/logo.png'
  },
  pagination: {
    itemsPerPage: 20
  },
  cache: {
    ttl: 300000 // 5 minutos
  }
};

// Status dos produtos
export const PRODUCT_STATUS = {
  ACTIVE: 'A',
  INACTIVE: 'I'
};

// Tipos de notificação
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Ordenação de produtos
export const SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  NEWEST: 'newest'
};