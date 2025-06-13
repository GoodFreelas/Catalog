// Configurações da API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Status de produtos
export const PRODUCT_STATUS = {
  ACTIVE: 'A',
  INACTIVE: 'I',
};

// Labels para status
export const PRODUCT_STATUS_LABELS = {
  [PRODUCT_STATUS.ACTIVE]: 'Ativo',
  [PRODUCT_STATUS.INACTIVE]: 'Inativo',
};

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
  MOBILE_LIMIT: 6,
};

// Filtros de preço predefinidos
export const PRICE_RANGES = [
  { label: 'Até R$ 50', min: 0, max: 50 },
  { label: 'R$ 50 - R$ 100', min: 50, max: 100 },
  { label: 'R$ 100 - R$ 200', min: 100, max: 200 },
  { label: 'R$ 200 - R$ 500', min: 200, max: 500 },
  { label: 'Acima de R$ 500', min: 500, max: null },
];

// Opções de ordenação
export const SORT_OPTIONS = [
  { value: 'nome-asc', label: 'Nome A-Z', field: 'nome', order: 'asc' },
  { value: 'nome-desc', label: 'Nome Z-A', field: 'nome', order: 'desc' },
  { value: 'preco-asc', label: 'Menor preço', field: 'preco', order: 'asc' },
  { value: 'preco-desc', label: 'Maior preço', field: 'preco', order: 'desc' },
];

// Configurações do WhatsApp
export const WHATSAPP_CONFIG = {
  PHONE_NUMBER: import.meta.env.VITE_WHATSAPP_NUMBER || '5551999999999',
  MESSAGE_PREFIX: 'Olá! Gostaria de fazer um pedido:',
  BASE_URL: 'https://wa.me',
};