/**
 * Tipos para os stores Zustand
 */

import { Product, CartItem } from './index';

// ================================
// UI Store Types
// ================================

export interface PriceRange {
  min: number | null;
  max: number | null;
}

export interface Filters {
  category: string;
  priceRange: PriceRange;
  status: string;
  sort: 'nome' | 'preco' | 'categoria' | 'createdAt';
  order: 'asc' | 'desc';
}

export interface ModalState {
  isOpen: boolean;
  productId?: string | null;
}

export interface Modals {
  productDetail: ModalState;
  filters: ModalState;
}

export interface UIStoreState {
  // Estado da UI
  isLoading: boolean;
  searchTerm: string;
  filters: Filters;
  modals: Modals;
  isMobile: boolean;

  // Ações de loading
  setLoading: (loading: boolean) => void;

  // Ações de busca
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;

  // Ações de filtros
  setFilter: (key: keyof Filters, value: any) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setSort: (sort: Filters['sort'], order?: Filters['order']) => void;
  clearFilters: () => void;

  // Ações de modais
  openModal: (modalName: keyof Modals, data?: Partial<ModalState>) => void;
  closeModal: (modalName: keyof Modals) => void;

  // Ações de viewport
  setIsMobile: (isMobile: boolean) => void;

  // Getters
  hasActiveFilters: () => boolean;
  getActiveFiltersCount: () => number;
}

// ================================
// Cart Store Types
// ================================

export interface CartStoreItem extends Product {
  quantity: number;
}

export interface CartStoreState {
  // Estado inicial
  items: CartStoreItem[];
  isOpen: boolean;

  // Ações básicas
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;

  // Ações de UI do carrinho
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Getters computados
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;

  // Utilitários
  getWhatsAppMessage: () => string;
}

// ================================
// Store Persist Types
// ================================

export interface CartPersistState {
  items: CartStoreItem[];
}

export interface UIStoreActions {
  setLoading: (loading: boolean) => void;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  setFilter: (key: keyof Filters, value: any) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setSort: (sort: Filters['sort'], order?: Filters['order']) => void;
  clearFilters: () => void;
  openModal: (modalName: keyof Modals, data?: Partial<ModalState>) => void;
  closeModal: (modalName: keyof Modals) => void;
  setIsMobile: (isMobile: boolean) => void;
  hasActiveFilters: () => boolean;
  getActiveFiltersCount: () => number;
}

export interface CartStoreActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
  getWhatsAppMessage: () => string;
}
