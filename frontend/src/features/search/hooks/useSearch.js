import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { ProductService } from '../../catalog/services/productService';
import { useDebounce } from '../../../core/hooks/useDebounce';
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para busca de produtos com debounce
 * @param {string} initialQuery - Query inicial
 * @param {Object} options - Opções do hook
 * @returns {Object} Dados e controles da busca
 */
export const useSearch = (initialQuery = '', options = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchHistory, setSearchHistory] = useState([]);

  // Debounce da query para evitar muitas requisições
  const debouncedQuery = useDebounce(query, 300);

  const {
    enabled = true,
    minLength = 2,
    staleTime = 2 * 60 * 1000, // 2 minutos
    ...queryOptions
  } = options;

  // Query principal de busca
  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => ProductService.searchProducts(debouncedQuery),
    enabled: enabled && debouncedQuery.length >= minLength,
    staleTime,
    select: (data) => ({
      ...data,
      data: {
        ...data.data,
        products: ProductService.formatProductList(data.data.products || []),
      },
    }),
    onSuccess: (data) => {
      // Adicionar ao histórico se retornou resultados
      if (data?.data?.products?.length > 0 && debouncedQuery.length >= minLength) {
        addToHistory(debouncedQuery);
      }
    },
    ...queryOptions,
  });

  // Busca com scroll infinito
  const infiniteSearchQuery = useInfiniteQuery({
    queryKey: ['search', 'infinite', debouncedQuery],
    queryFn: ({ pageParam = 1 }) =>
      ProductService.searchProducts(debouncedQuery, {
        page: pageParam,
        limit: 20
      }),
    enabled: enabled && debouncedQuery.length >= minLength,
    staleTime,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.data;
      return pagination?.has_next ? pagination.current_page + 1 : undefined;
    },
    select: (data) => ({
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        data: {
          ...page.data,
          products: ProductService.formatProductList(page.data.products || []),
        },
      })),
    }),
    onSuccess: (data) => {
      if (data?.pages?.[0]?.data?.products?.length > 0 && debouncedQuery.length >= minLength) {
        addToHistory(debouncedQuery);
      }
    },
  });

  // Gerenciar histórico de buscas
  const addToHistory = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.length < minLength) return;

    setSearchHistory(prev => {
      const filtered = prev.filter(item =>
        item.query.toLowerCase() !== searchTerm.toLowerCase()
      );
      const newHistory = [
        {
          query: searchTerm,
          timestamp: new Date().toISOString(),
          id: Date.now()
        },
        ...filtered
      ].slice(0, 10); // Manter apenas 10 itens

      // Salvar no localStorage
      try {
        localStorage.setItem('search-history', JSON.stringify(newHistory));
      } catch (error) {
        // Erro silencioso
      }
      return newHistory;
    });
  }, [minLength]);

  // Carregar histórico do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('search-history');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (error) {
      // Erro silencioso
    }
  }, []);

  // Limpar histórico
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('search-history');
    } catch (error) {
      // Erro silencioso
    }
  }, []);

  // Remover item específico do histórico
  const removeFromHistory = useCallback((id) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('search-history', JSON.stringify(filtered));
      } catch (error) {
        // Erro silencioso
      }
      return filtered;
    });
  }, []);

  return {
    // Estado da busca
    query,
    setQuery,
    debouncedQuery,

    // Dados da busca simples
    data: searchQuery.data,
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    error: searchQuery.error,
    isFetching: searchQuery.isFetching,

    // Dados da busca infinita
    infiniteData: infiniteSearchQuery.data,
    hasNextPage: infiniteSearchQuery.hasNextPage,
    fetchNextPage: infiniteSearchQuery.fetchNextPage,
    isFetchingNextPage: infiniteSearchQuery.isFetchingNextPage,

    // Controles
    refetch: searchQuery.refetch,

    // Histórico
    searchHistory,
    clearHistory,
    removeFromHistory,
    addToHistory,

    // Estados derivados
    hasResults: searchQuery.data?.data?.products?.length > 0,
    isSearching: searchQuery.isFetching && debouncedQuery.length >= minLength,
    canSearch: debouncedQuery.length >= minLength,
    resultCount: searchQuery.data?.data?.products?.length || 0,
  };
};

/**
 * Hook para sugestões de busca
 * @param {string} query - Query atual
 * @returns {Object} Sugestões e estado
 */
export const useSearchSuggestions = (query, options = {}) => {
  const debouncedQuery = useDebounce(query, 200);

  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: ['search-suggestions', debouncedQuery],
    queryFn: () => ProductService.searchProducts(debouncedQuery, { limit: 5 }),
    enabled: enabled && debouncedQuery.length >= 1 && debouncedQuery.length < 4,
    staleTime: 5 * 60 * 1000, // 5 minutos
    select: (data) => ({
      suggestions: data?.data?.products?.slice(0, 5).map(product => ({
        id: product.id,
        text: product.nome,
        category: product.categoria,
      })) || []
    }),
    ...queryOptions,
  });
};