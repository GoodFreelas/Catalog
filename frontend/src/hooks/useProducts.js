import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Produtos de fallback caso a API falhe
  const fallbackProducts = [
    {
      id: 1,
      nome: 'Smartphone Galaxy A54',
      codigo: 'GAL-A54',
      sku: 'SM-A546B',
      preco: 1299.99,
      descricao: 'Smartphone Samsung Galaxy A54 5G 128GB Câmera Tripla 50MP',
      urlImagem: '/api/placeholder/300/300',
      categoria: { id: 1, descricao: 'Smartphones' },
      situacao: 'A',
      estoque: 15
    },
    {
      id: 2,
      nome: 'Notebook Dell Inspiron 15',
      codigo: 'DELL-I15',
      sku: 'I15-3511',
      preco: 2499.99,
      descricao: 'Notebook Dell Inspiron 15 Intel Core i5 8GB 256GB SSD',
      urlImagem: '/api/placeholder/300/300',
      categoria: { id: 2, descricao: 'Notebooks' },
      situacao: 'A',
      estoque: 8
    },
    {
      id: 3,
      nome: 'Fone Bluetooth JBL',
      codigo: 'JBL-T110BT',
      sku: 'JBLT110BT',
      preco: 149.99,
      descricao: 'Fone de Ouvido Bluetooth JBL T110BT com Microfone',
      urlImagem: '/api/placeholder/300/300',
      categoria: { id: 3, descricao: 'Áudio' },
      situacao: 'A',
      estoque: 25
    },
    {
      id: 4,
      nome: 'Smart TV LG 50"',
      codigo: 'LG-50UP7750',
      sku: '50UP7750PSB',
      preco: 1899.99,
      descricao: 'Smart TV LED 50" LG 50UP7750 4K UHD',
      urlImagem: '/api/placeholder/300/300',
      categoria: { id: 4, descricao: 'TVs' },
      situacao: 'A',
      estoque: 5
    },
    {
      id: 5,
      nome: 'Mouse Gamer Logitech',
      codigo: 'LOG-G502',
      sku: 'G502HERO',
      preco: 299.99,
      descricao: 'Mouse Gamer Logitech G502 HERO 25K DPI',
      urlImagem: '/api/placeholder/300/300',
      categoria: { id: 5, descricao: 'Periféricos' },
      situacao: 'A',
      estoque: 12
    },
    {
      id: 6,
      nome: 'Teclado Mecânico Redragon',
      codigo: 'RED-K552',
      sku: 'K552KUMARA',
      preco: 199.99,
      descricao: 'Teclado Mecânico Gamer Redragon Kumara K552',
      urlImagem: '/api/placeholder/300/300',
      categoria: { id: 5, descricao: 'Periféricos' },
      situacao: 'A',
      estoque: 18
    }
  ];

  const fallbackCategories = [
    { id: 1, descricao: 'Smartphones' },
    { id: 2, descricao: 'Notebooks' },
    { id: 3, descricao: 'Áudio' },
    { id: 4, descricao: 'TVs' },
    { id: 5, descricao: 'Periféricos' }
  ];

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar produtos e categorias em paralelo
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.products.getAll(filters),
        api.categories.getAll()
      ]);

      setProducts(productsResponse.data || fallbackProducts);
      setCategories(categoriesResponse.data || fallbackCategories);

      // Atualizar paginação se disponível
      if (productsResponse.pagination) {
        setPagination(productsResponse.pagination);
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message);

      // Usar dados de fallback em caso de erro
      setProducts(fallbackProducts);
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  // Recarregar quando os filtros mudarem
  useEffect(() => {
    loadData();
  }, [JSON.stringify(filters)]);

  // Buscar produto por ID
  const getProductById = async (id) => {
    try {
      const response = await api.products.getById(id);
      return response.data;
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      // Buscar no fallback
      return fallbackProducts.find(p => p.id === parseInt(id));
    }
  };

  // Atualizar estoque de um produto
  const updateProductStock = async (productId) => {
    try {
      const stockResponse = await api.products.getStock(productId);
      const updatedStock = stockResponse.data;

      // Atualizar o produto na lista
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? { ...product, estoque: updatedStock.quantidade }
            : product
        )
      );

      return updatedStock;
    } catch (err) {
      console.error('Erro ao atualizar estoque:', err);
      return null;
    }
  };

  // Filtrar produtos localmente
  const filterProducts = (searchTerm, categoryFilter, priceRange) => {
    return products.filter(product => {
      const matchesSearch = !searchTerm ||
        product.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !categoryFilter ||
        product.categoria?.id.toString() === categoryFilter;

      const matchesPriceMin = !priceRange.min ||
        product.preco >= parseFloat(priceRange.min);

      const matchesPriceMax = !priceRange.max ||
        product.preco <= parseFloat(priceRange.max);

      return matchesSearch && matchesCategory && matchesPriceMin && matchesPriceMax;
    });
  };

  // Ordenar produtos
  const sortProducts = (productsToSort, sortBy) => {
    const sorted = [...productsToSort];

    switch (sortBy) {
      case 'name_asc':
        return sorted.sort((a, b) => a.nome.localeCompare(b.nome));
      case 'name_desc':
        return sorted.sort((a, b) => b.nome.localeCompare(a.nome));
      case 'price_asc':
        return sorted.sort((a, b) => a.preco - b.preco);
      case 'price_desc':
        return sorted.sort((a, b) => b.preco - a.preco);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      default:
        return sorted;
    }
  };

  return {
    products,
    categories,
    loading,
    error,
    pagination,
    loadData,
    getProductById,
    updateProductStock,
    filterProducts,
    sortProducts
  };
};