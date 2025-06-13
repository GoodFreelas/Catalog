import { useQuery, useInfiniteQuery } from 'react-query';
import { ProductService } from '../services/productService';
import { useUIStore } from '../../../core/stores/uiStore';
import { PAGINATION } from '../../../core/constants/api';

/**
 * Hook para buscar produtos com paginação e filtros
 * @param {Object} options - Opções do hook
 * @returns {Object} Dados e estado da consulta
 */
export const useProducts = (options = {}) => {
  const { filters, searchTerm } = useUIStore();

  const {
    enabled = true,
    keepPreviousData = true,
    staleTime = 5 * 60 * 1000, // 5 minutos
    ...queryOptions
  } = options;

  // Combinar filtros do store com opções passadas
  const queryParams = {
    ...ProductService.buildFilterParams(filters),
    search: searchTerm,
    ...options.params,
  };

  const queryKey = ['products', queryParams];

  return useQuery({
    queryKey,
    queryFn: () => ProductService.getProducts(queryParams),
    enabled,
    keepPreviousData,
    staleTime,
    select: (data) => ({
      ...data,
      data: {
        ...data.data,
        products: ProductService.formatProductList(data.data.products),
      },
    }),
    ...queryOptions,
  });
};

/**
 * Hook para buscar produtos com scroll infinito
 * @param {Object} options - Opções do hook
 * @returns {Object} Dados e estado da consulta infinita
 */
export const useInfiniteProducts = (options = {}) => {
  const { filters, searchTerm } = useUIStore();

  const {
    enabled = true,
    staleTime = 5 * 60 * 1000,
    ...queryOptions
  } = options;

  const baseParams = {
    ...ProductService.buildFilterParams(filters),
    search: searchTerm,
    limit: PAGINATION.DEFAULT_LIMIT,
    ...options.params,
  };

  const queryKey = ['products', 'infinite', baseParams];

  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      ProductService.getProducts({ ...baseParams, page: pageParam }),
    enabled,
    staleTime,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.data;
      return pagination.has_next ? pagination.current_page + 1 : undefined;
    },
    select: (data) => ({
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        data: {
          ...page.data,
          products: ProductService.formatProductList(page.data.products),
        },
      })),
    }),
    ...queryOptions,
  });
};

/**
 * Hook para buscar um produto específico por ID
 * @param {string} productId - ID do produto
 * @param {Object} options - Opções do hook
 * @returns {Object} Dados e estado da consulta
 */
export const useProduct = (productId, options = {}) => {
  const {
    enabled = Boolean(productId),
    staleTime = 10 * 60 * 1000, // 10 minutos
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => ProductService.getProductById(productId),
    enabled,
    staleTime,
    select: (data) => ({
      ...data,
      data: {
        ...data.data,
        product: ProductService.formatProduct(data.data.product),
      },
    }),
    ...queryOptions,
  });
};

/**
 * Hook para buscar categorias de produtos
 * @param {Object} options - Opções do hook
 * @returns {Object} Dados e estado da consulta
 */
export const useCategories = (options = {}) => {
  const {
    enabled = true,
    staleTime = 30 * 60 * 1000, // 30 minutos
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: ['categories'],
    queryFn: ProductService.getCategories,
    enabled,
    staleTime,
    ...queryOptions,
  });
};

/**
 * Hook para buscar produtos por categoria
 * @param {string} category - Nome da categoria
 * @param {Object} options - Opções do hook
 * @returns {Object} Dados e estado da consulta
 */
export const useProductsByCategory = (category, options = {}) => {
  const {
    enabled = Boolean(category),
    keepPreviousData = true,
    staleTime = 5 * 60 * 1000,
    ...queryOptions
  } = options;

  const queryParams = {
    page: 1,
    limit: PAGINATION.DEFAULT_LIMIT,
    ...options.params,
  };

  return useQuery({
    queryKey: ['products', 'category', category, queryParams],
    queryFn: () => ProductService.getProductsByCategory(category, queryParams),
    enabled,
    keepPreviousData,
    staleTime,
    select: (data) => ({
      ...data,
      data: {
        ...data.data,
        products: ProductService.formatProductList(data.data.products),
      },
    }),
    ...queryOptions,
  });
};

/**
 * Hook para buscar estatísticas de produtos
 * @param {Object} options - Opções do hook
 * @returns {Object} Dados e estado da consulta
 */
export const useProductStats = (options = {}) => {
  const {
    enabled = true,
    staleTime = 15 * 60 * 1000, // 15 minutos
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: ['products', 'stats'],
    queryFn: ProductService.getProductStats,
    enabled,
    staleTime,
    ...queryOptions,
  });
};