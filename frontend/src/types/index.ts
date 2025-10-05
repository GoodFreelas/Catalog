/**
 * Arquivo principal de exportação de tipos
 * Centraliza todos os tipos do sistema para facilitar importações
 */

// ================================
// Re-exportações de tipos principais
// ================================

// Tipos de dados
export type { Product, ProductResponse, CartItem, Cart } from './index';

// Tipos de UI e modais
export type { UIState, ModalType } from './index';

// Tipos de API
export type { ApiResponse, ApiError } from './index';

// Tipos de componentes
export type {
  BaseComponentProps,
  ButtonProps,
  InputProps,
  ModalProps,
  ProductCardProps,
  ProductModalProps,
  CartDrawerProps,
  SearchBarProps,
  FilterModalProps,
  HeaderProps,
  FooterProps,
  LoadingProps,
  ImageProps,
  BadgeProps,
  PaginationProps,
  ToastProps,
  IntroVideoProps,
  LoadingSpinnerProps,
  LoadingOverlayProps,
} from './components';

// Tipos de stores
export type {
  UIStoreState,
  CartStoreState,
  Filters,
  Modals,
  ModalState,
  PriceRange,
  CartStoreItem,
  CartPersistState,
} from './stores';

// Tipos de hooks
export type {
  UseProductsReturn,
  UseSearchReturn,
  UseCartReturn,
  CartContextType,
  UIContextType,
} from './index';

// Tipos de utilitários
export type { FormatterOptions, WhatsAppMessage } from './index';

// Tipos específicos do App
export type {
  AppProps,
  AppState,
  QueryClientConfig,
  ToasterConfig,
  HeaderProps as AppHeaderProps,
  IntroVideoProps as AppIntroVideoProps,
} from './app';