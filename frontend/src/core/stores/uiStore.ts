// External Libraries
import { create } from 'zustand';

// Types
import { UIStoreState, Filters, Modals } from '../../types/stores';

export const useUIStore = create((set, get) => ({
  // Estado da UI
  isLoading: false,
  searchTerm: '',
  filters: {
    category: '',
    priceRange: { min: null, max: null },
    status: '',
    sort: 'nome',
    order: 'asc',
  },

  // Modais e drawers
  modals: {
    productDetail: { isOpen: false, productId: null },
    filters: { isOpen: false },
  },

  // Viewport
  isMobile: false,

  // Ações de loading
  setLoading: (loading) => set({ isLoading: loading }),

  // Ações de busca
  setSearchTerm: (term) => {
    // Evitar loop ao verificar se o valor é diferente
    const currentTerm = get().searchTerm;
    if (currentTerm !== term) {
      set({ searchTerm: term });
    }
  },
  clearSearch: () => set({ searchTerm: '' }),

  // Ações de filtros
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    })),

  setPriceRange: (min, max) =>
    set((state) => ({
      filters: { ...state.filters, priceRange: { min, max } }
    })),

  setSort: (sort, order = 'asc') =>
    set((state) => ({
      filters: { ...state.filters, sort, order }
    })),

  clearFilters: () =>
    set({
      filters: {
        category: '',
        priceRange: { min: null, max: null },
        status: '',
        sort: 'nome',
        order: 'asc',
      }
    }),

  // Ações de modais
  openModal: (modalName, data = {}) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { isOpen: true, ...data }
      }
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { isOpen: false }
      }
    })),

  // Ações de viewport
  setIsMobile: (isMobile) => set({ isMobile }),

  // Getters
  hasActiveFilters: () => {
    const { filters, searchTerm } = get();
    return !!(
      searchTerm ||
      filters.category ||
      filters.status ||
      filters.priceRange.min !== null ||
      filters.priceRange.max !== null
    );
  },

  getActiveFiltersCount: () => {
    const { filters, searchTerm } = get();
    let count = 0;

    if (searchTerm) count++;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++;

    return count;
  },
}));