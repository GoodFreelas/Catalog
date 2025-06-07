import React, { useState } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

export const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  onSearch,
  onFilterChange,
  filters = {},
  showAdvancedFilters = false,
  onToggleAdvancedFilters,
  className = ''
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    category: '',
    priceMin: '',
    priceMax: '',
    inStock: true,
    onSale: false,
    ...filters
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      priceMin: '',
      priceMax: '',
      inStock: true,
      onSale: false
    };
    setLocalFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const activeFiltersCount = Object.values(localFilters).filter(value =>
    value !== '' && value !== false && value !== 'all'
  ).length;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Main Search Bar */}
      <div className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button type="submit" className="px-6">
            Buscar
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge
                variant="primary"
                size="sm"
                className="absolute -top-2 -right-2 min-w-[1.25rem] h-5"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </form>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="border-t bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={localFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as categorias</option>
                <option value="limpeza">Limpeza</option>
                <option value="polimento">Polimento</option>
                <option value="ferramentas">Ferramentas</option>
                <option value="acessorios">Acessórios</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Mínimo
              </label>
              <Input
                type="number"
                placeholder="R$ 0,00"
                value={localFilters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preço Máximo
              </label>
              <Input
                type="number"
                placeholder="R$ 999,99"
                value={localFilters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Additional Filters */}
            <div className="space-y-3">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Apenas em estoque</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.onSale}
                    onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Em promoção</span>
                </label>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {activeFiltersCount > 0 && (
                <>
                  <span className="text-sm text-gray-600">Filtros ativos:</span>
                  {localFilters.category && (
                    <Badge variant="primary" className="flex items-center gap-1">
                      {localFilters.category}
                      <button
                        onClick={() => handleFilterChange('category', '')}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {(localFilters.priceMin || localFilters.priceMax) && (
                    <Badge variant="primary" className="flex items-center gap-1">
                      R$ {localFilters.priceMin || '0'} - {localFilters.priceMax || '∞'}
                      <button
                        onClick={() => {
                          handleFilterChange('priceMin', '');
                          handleFilterChange('priceMax', '');
                        }}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {localFilters.onSale && (
                    <Badge variant="danger" className="flex items-center gap-1">
                      Em promoção
                      <button
                        onClick={() => handleFilterChange('onSale', false)}
                        className="hover:bg-red-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};