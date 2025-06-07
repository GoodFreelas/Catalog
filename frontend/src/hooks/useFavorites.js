import { useState, useEffect, useCallback } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      return [];
    }
  });

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  }, [favorites]);

  // Add product to favorites
  const addToFavorites = useCallback((productId) => {
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev; // Already in favorites
      }
      return [...prev, productId];
    });
  }, []);

  // Remove product from favorites
  const removeFromFavorites = useCallback((productId) => {
    setFavorites(prev => prev.filter(id => id !== productId));
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((productId) => {
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  // Check if product is favorite
  const isFavorite = useCallback((productId) => {
    return favorites.includes(productId);
  }, [favorites]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  // Get favorites count
  const getFavoritesCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    getFavoritesCount
  };
};