import React, { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import Input from "../atoms/input";
import Button from "../atoms/Button";
import { productService } from "../../services/api";

const SearchFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    search: "",
    categoria: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "nome",
    sortOrder: "asc",
    ...initialFilters,
  });

  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };
    loadCategories();
  }, []);

  // Aplicar filtros com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(filters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      categoria: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "nome",
      sortOrder: "asc",
    };
    setFilters(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== "nome" && value !== "asc"
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      {/* Barra de pesquisa principal */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Pesquisar produtos..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            icon={Search}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Filtros expandidos */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={filters.categoria}
              onChange={(e) => handleFilterChange("categoria", e.target.value)}
              className="input-field"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Preço mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço mínimo
            </label>
            <Input
              type="number"
              placeholder="R$ 0,00"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Preço máximo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço máximo
            </label>
            <Input
              type="number"
              placeholder="R$ 999,99"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Ordenação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="input-field flex-1"
              >
                <option value="nome">Nome</option>
                <option value="preco">Preço</option>
                <option value="categoria">Categoria</option>
                <option value="marca">Marca</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange("sortOrder", e.target.value)
                }
                className="input-field w-20"
              >
                <option value="asc">↑</option>
                <option value="desc">↓</option>
              </select>
            </div>
          </div>

          {/* Botão limpar filtros */}
          {hasActiveFilters && (
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
