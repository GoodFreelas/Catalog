/**
 * Tipos para componentes React
 */

import { ReactNode } from 'react';

// ================================
// Componentes Base
// ================================

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// ================================
// Componentes de Produto
// ================================

export interface ProductCardProps {
  product: import('./index').Product;
  onAddToCart?: (product: import('./index').Product) => void;
  onViewDetails?: (product: import('./index').Product) => void;
  className?: string;
}

export interface ProductModalProps {
  product?: import('./index').Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: import('./index').Product) => void;
}

export interface ProductDetailProps {
  product: import('./index').Product;
  onAddToCart?: (product: import('./index').Product) => void;
  onGoBack?: () => void;
}

// ================================
// Componentes de Carrinho
// ================================

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: import('./index').CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  total: number;
  itemCount: number;
}

export interface CartIconProps {
  itemCount: number;
  onClick: () => void;
  className?: string;
}

// ================================
// Componentes de Busca e Filtros
// ================================

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: import('./index').SearchFilters;
  onFiltersChange: (filters: import('./index').SearchFilters) => void;
  onClearFilters: () => void;
  categories: string[];
  brands: string[];
}

export interface SearchResultsProps {
  query: string;
  results: import('./index').Product[];
  loading: boolean;
  error: string | null;
  onProductClick: (product: import('./index').Product) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export interface SearchSuggestionsProps {
  suggestions: string[];
  categories: string[];
  brands: string[];
  onSuggestionClick: (suggestion: string) => void;
  onCategoryClick: (category: string) => void;
  onBrandClick: (brand: string) => void;
  visible: boolean;
}

// ================================
// Componentes de Layout
// ================================

export interface HeaderProps {
  onSearch: (term: string) => void;
  onFilterToggle: () => void;
  className?: string;
}

export interface FooterProps {
  className?: string;
}

export interface LayoutProps {
  children: ReactNode;
  className?: string;
}

// ================================
// Componentes de Navegação
// ================================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
  className?: string;
}

// ================================
// Componentes de Formulário
// ================================

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
}

export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

// ================================
// Componentes de Imagem
// ================================

export interface ImageProps extends BaseComponentProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loading?: 'eager' | 'lazy';
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
}

// ================================
// Componentes de Página
// ================================

export interface PageProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

// ================================
// Componentes de Notificação
// ================================

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

// ================================
// Componentes de Intro/Video
// ================================

export interface IntroVideoProps {
  onEnd: () => void;
  onSkip: () => void;
  isFinished: boolean;
  duration?: number;
  skipText?: string;
}

// ================================
// Componentes de Loading
// ================================

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  children?: ReactNode;
}
