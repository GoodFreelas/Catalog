import React, { useState } from 'react';
import { Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { ProductCard } from '../molecules/ProductCard';
import { Button } from '../atoms/Button';
import { LoadingSpinner, SkeletonLoader } from '../atoms/LoadingSpinner';

export const ProductGrid = ({
  products = [],
  onAddToCart,
  onViewDetails,
  onToggleFavorite,
  favorites = [],
  loading = false,
  error = null,
  viewMode = 'grid', // 'grid' or 'list'
  onViewModeChange,
  sortBy = 'name',
  onSortChange,
  className = ''
}) => {
  const [isChangingView, setIsChangingView] = useState(false);

  const sortOptions = [
    { value: 'name', label: 'Nome A-Z', icon: SortAsc },
    { value: 'name_desc', label: 'Nome Z-A', icon: SortDesc },
    { value: 'price', label: 'Menor preço', icon: SortAsc },
    { value: 'price_desc', label: 'Maior preço', icon: SortDesc },
    { value: 'newest', label: 'Mais recentes', icon: SortDesc },
    { value: 'popular', label: 'Mais populares', icon: SortDesc }
  ];

  const handleViewModeChange = async (newMode) => {
    if (newMode === viewMode) return;

    setIsChangingView(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      onViewModeChange?.(newMode);
      setIsChangingView(false);
    }, 300);
  };

  const getSortedProducts = () => {
    if (!products || products.length === 0) return [];

    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.nome.localeCompare(b.nome);
        case 'name_desc':
          return b.nome.localeCompare(a.nome);
        case 'price':
          const priceA = a.preco_promocional > 0 ? a.preco_promocional : a.preco;
          const priceB = b.preco_promocional > 0 ? b.preco_promocional : b.preco;
          return priceA - priceB;
        case 'price_desc':
          const priceDescA = a.preco_promocional > 0 ? a.preco_promocional : a.preco;
          const priceDescB = b.preco_promocional > 0 ? b.preco_promocional : b.preco;
          return priceDescB - priceDescA;
        case 'newest':
          return new Date(b.data_criacao) - new Date(a.data_criacao);
        default:
          return 0;
      }
    });

    return sorted;
  };

  const sortedProducts = getSortedProducts();

  // Loading skeleton
  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <SkeletonLoader lines={2} />
                <SkeletonLoader lines={1} className="w-1/2" />
                <div className="flex gap-2">
                  <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar produtos</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!sortedProducts || sortedProducts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V9a2 2 0 012 2v2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500">Tente ajustar seus filtros de busca ou explore outras categorias.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with view controls and sorting */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {sortedProducts.length} produto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
                className="rounded-r-none border-r-0"
                disabled={isChangingView}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className="rounded-l-none"
                disabled={isChangingView}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid/List */}
      {isChangingView ? (
        <LoadingSpinner size="lg" text="Alterando visualização..." />
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorites.includes(product.id)}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}
    </div>
  );
};