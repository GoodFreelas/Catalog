import { useState, useEffect, useCallback } from 'react';
import { TinyAPI } from '../services/TinyAPI';

export const useProducts = (initialPage = 1) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceMin: '',
    priceMax: '',
    inStock: true,
    onSale: false
  });

  // Load products from API
  const loadProducts = useCallback(async (page = currentPage, retryCount = 0) => {
    setLoading(true);
    setError(null);

    try {
      const response = await TinyAPI.fetchProducts(page);

      if (response && response.retorno) {
        if (response.retorno.status === 'OK' && response.retorno.produtos) {
          const productList = response.retorno.produtos.map(p => p.produto);
          setProducts(productList);
          setTotalPages(parseInt(response.retorno.numero_paginas) || 1);
        } else {
          throw new Error('Resposta inválida da API');
        }
      } else {
        throw new Error('Falha na comunicação com a API');
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);

      // Retry logic for network errors
      if (retryCount < 2 && (error.name === 'TypeError' || error.message.includes('fetch'))) {
        setTimeout(() => {
          loadProducts(page, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }

      setError(error.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Filter products based on search term and filters
  const getFilteredProducts = useCallback(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.nome.toLowerCase().includes(term) ||
        (product.codigo && product.codigo.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== '') {
      filtered = filtered.filter(product => {
        const productName = product.nome.toLowerCase();
        const category = filters.category.toLowerCase();

        // Simple category matching based on product name
        switch (category) {
          case 'limpeza':
            return productName.includes('limpador') ||
              productName.includes('citron') ||
              productName.includes('v floc') ||
              productName.includes('removex');
          case 'polimento':
            return productName.includes('boina') ||
              productName.includes('composto') ||
              productName.includes('polidor');
          case 'ferramentas':
            return productName.includes('politriz') ||
              productName.includes('soprador') ||
              productName.includes('escova');
          case 'acessorios':
            return productName.includes('aplicador') ||
              productName.includes('toalha') ||
              productName.includes('pincel');
          default:
            return true;
        }
      });
    }

    // Apply price filters
    if (filters.priceMin !== '') {
      const minPrice = parseFloat(filters.priceMin);
      filtered = filtered.filter(product => {
        const price = product.preco_promocional > 0 ? product.preco_promocional : product.preco;
        return price >= minPrice;
      });
    }

    if (filters.priceMax !== '') {
      const maxPrice = parseFloat(filters.priceMax);
      filtered = filtered.filter(product => {
        const price = product.preco_promocional > 0 ? product.preco_promocional : product.preco;
        return price <= maxPrice;
      });
    }

    // Apply stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.situacao === 'A');
    }

    // Apply sale filter
    if (filters.onSale) {
      filtered = filtered.filter(product => product.preco_promocional > 0);
    }

    return filtered;
  }, [products, searchTerm, filters]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [currentPage, totalPages]);

  // Handle search
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Reload products
  const reloadProducts = useCallback(() => {
    loadProducts(currentPage);
  }, [loadProducts, currentPage]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      priceMin: '',
      priceMax: '',
      inStock: true,
      onSale: false
    });
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // Load products when page changes
  useEffect(() => {
    loadProducts(currentPage);
  }, [currentPage, loadProducts]);

  // Get product details
  const getProductDetails = useCallback(async (productId) => {
    try {
      const response = await TinyAPI.fetchProductDetails(productId);
      if (response && response.retorno && response.retorno.produto) {
        return response.retorno.produto;
      }
      throw new Error('Produto não encontrado');
    } catch (error) {
      console.error('Erro ao buscar detalhes do produto:', error);
      throw error;
    }
  }, []);

  const filteredProducts = getFilteredProducts();

  return {
    // Data
    products: filteredProducts,
    allProducts: products,
    loading,
    error,

    // Pagination
    currentPage,
    totalPages,

    // Search and filters
    searchTerm,
    filters,

    // Actions
    handlePageChange,
    handleSearch,
    handleFilterChange,
    reloadProducts,
    clearFilters,
    getProductDetails,

    // Utils
    hasFilters: searchTerm.trim() !== '' || Object.values(filters).some(v => v !== '' && v !== true && v !== false),
    totalProducts: products.length,
    filteredCount: filteredProducts.length
  };
};