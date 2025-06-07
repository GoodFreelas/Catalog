import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Salvar no localStorage sempre que os favoritos mudarem
  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }, [favorites]);

  // Adicionar ou remover favorito
  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      if (prev.includes(productId)) {
        // Remove dos favoritos
        return prev.filter(id => id !== productId);
      } else {
        // Adiciona aos favoritos
        return [...prev, productId];
      }
    });
  };

  // Verificar se produto é favorito
  const isFavorite = (productId) => {
    return favorites.includes(productId);
  };

  // Adicionar aos favoritos
  const addToFavorites = (productId) => {
    if (!favorites.includes(productId)) {
      setFavorites(prev => [...prev, productId]);
    }
  };

  // Remover dos favoritos
  const removeFromFavorites = (productId) => {
    setFavorites(prev => prev.filter(id => id !== productId));
  };

  // Limpar todos os favoritos
  const clearFavorites = () => {
    setFavorites([]);
  };

  // Obter quantidade de favoritos
  const getFavoritesCount = () => {
    return favorites.length;
  };

  // Filtrar produtos favoritos de uma lista
  const getFavoriteProducts = (products) => {
    return products.filter(product => favorites.includes(product.id));
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    getFavoritesCount,
    getFavoriteProducts
  };
};