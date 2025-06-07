// API Configuration
export const API_CONFIG = {
  TINY_TOKEN: '6126c965d5c8d23c0da7b7bc33372c40463b9368fce27eeb36c6e0b3a5e13929',
  TINY_BASE_URL: 'https://api.tiny.com.br/api2',
  CACHE_DURATION: {
    PRODUCTS: 10 * 60 * 1000, // 10 minutes
    PRODUCT_DETAILS: 30 * 60 * 1000, // 30 minutes
  }
};

// WhatsApp Configuration
export const WHATSAPP_CONFIG = {
  PHONE_NUMBER: '5551999999999', // Replace with your phone number
  DEFAULT_MESSAGE: 'Olá! Gostaria de fazer um pedido:'
};

// Application Configuration
export const APP_CONFIG = {
  COMPANY_NAME: 'Loja Vonixx',
  COMPANY_EMAIL: 'contato@lojavonixx.com.br',
  COMPANY_PHONE: '(51) 99999-9999',
  COMPANY_ADDRESS: 'Porto Alegre, RS',
  FREE_SHIPPING_THRESHOLD: 150.00,
  DEFAULT_SHIPPING_COST: 15.00
};

// Storage Keys
export const STORAGE_KEYS = {
  CART: 'cart',
  FAVORITES: 'favorites',
  USER_PREFERENCES: 'userPreferences',
  SEARCH_HISTORY: 'searchHistory'
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  { value: '', label: 'Todas as categorias' },
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'polimento', label: 'Polimento' },
  { value: 'ferramentas', label: 'Ferramentas' },
  { value: 'acessorios', label: 'Acessórios' },
  { value: 'ceras', label: 'Ceras e Selantes' },
  { value: 'pneus', label: 'Pneus e Rodas' }
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'name', label: 'Nome A-Z' },
  { value: 'name_desc', label: 'Nome Z-A' },
  { value: 'price', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'newest', label: 'Mais recentes' },
  { value: 'popular', label: 'Mais populares' }
];

// View Modes
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'A',
  INACTIVE: 'I'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  API_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
  PRODUCT_NOT_FOUND: 'Produto não encontrado.',
  INVALID_QUANTITY: 'Quantidade inválida.',
  CART_EMPTY: 'Carrinho está vazio.',
  GENERIC_ERROR: 'Ocorreu um erro inesperado.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PRODUCT_ADDED: 'Produto adicionado ao carrinho!',
  PRODUCT_REMOVED: 'Produto removido do carrinho.',
  CART_CLEARED: 'Carrinho limpo com sucesso.',
  FAVORITE_ADDED: 'Produto adicionado aos favoritos!',
  FAVORITE_REMOVED: 'Produto removido dos favoritos.'
};

// Navigation Items
export const NAVIGATION_ITEMS = [
  { label: 'Produtos', href: '#produtos', active: true },
  { label: 'Categorias', href: '#categorias' },
  { label: 'Promoções', href: '#promocoes' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Contato', href: '#contato' }
];

// Theme Colors
export const THEME_COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d'
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  }
};

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
};

// Pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_VISIBLE_PAGES: 7
};

// Form Validation
export const VALIDATION_RULES = {
  REQUIRED: 'Este campo é obrigatório',
  EMAIL: 'Email inválido',
  PHONE: 'Telefone inválido',
  MIN_LENGTH: (length) => `Mínimo ${length} caracteres`,
  MAX_LENGTH: (length) => `Máximo ${length} caracteres`,
  POSITIVE_NUMBER: 'Deve ser um número positivo'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm'
};