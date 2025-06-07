import React, { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { SORT_OPTIONS } from "../../utils/constants";

const FilterModal = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  categories = [],
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      categoria: "",
      precoMin: "",
      precoMax: "",
      ordenacao: SORT_OPTIONS.NAME_ASC,
      busca: "",
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleClose = () => {
    setLocalFilters(filters); // Restaura os filtros originais
    onClose();
  };

  const updateFilter = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Filtros e Ordenação"
      size="max-w-lg"
    >
      <div className="p-6 space-y-6">
        {/* Search */}
        <Input
          label="Buscar produtos"
          placeholder="Nome ou código do produto..."
          value={localFilters.busca || ""}
          onChange={(e) => updateFilter("busca", e.target.value)}
        />

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Categoria
          </label>
          <select
            value={localFilters.categoria || ""}
            onChange={(e) => updateFilter("categoria", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.descricao}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Faixa de Preço</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preço mínimo"
              type="number"
              step="0.01"
              min="0"
              placeholder="R$ 0,00"
              value={localFilters.precoMin || ""}
              onChange={(e) => updateFilter("precoMin", e.target.value)}
            />
            <Input
              label="Preço máximo"
              type="number"
              step="0.01"
              min="0"
              placeholder="R$ 9999,99"
              value={localFilters.precoMax || ""}
              onChange={(e) => updateFilter("precoMax", e.target.value)}
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ordenar por
          </label>
          <select
            value={localFilters.ordenacao || SORT_OPTIONS.NAME_ASC}
            onChange={(e) => updateFilter("ordenacao", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={SORT_OPTIONS.NAME_ASC}>Nome (A-Z)</option>
            <option value={SORT_OPTIONS.NAME_DESC}>Nome (Z-A)</option>
            <option value={SORT_OPTIONS.PRICE_ASC}>Menor Preço</option>
            <option value={SORT_OPTIONS.PRICE_DESC}>Maior Preço</option>
            <option value={SORT_OPTIONS.NEWEST}>Mais Recentes</option>
          </select>
        </div>

        {/* Stock Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localFilters.apenasDisponiveis || false}
              onChange={(e) =>
                updateFilter("apenasDisponiveis", e.target.checked)
              }
              className="rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Apenas produtos disponíveis
            </span>
          </label>
        </div>

        {/* Active Filters Summary */}
        {(localFilters.categoria ||
          localFilters.precoMin ||
          localFilters.precoMax ||
          localFilters.apenasDisponiveis) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="text-sm font-medium text-blue-900 mb-2">
              Filtros Ativos:
            </h5>
            <div className="space-y-1 text-sm text-blue-700">
              {localFilters.categoria && (
                <div>
                  • Categoria:{" "}
                  {
                    categories.find(
                      (c) => c.id.toString() === localFilters.categoria
                    )?.descricao
                  }
                </div>
              )}
              {(localFilters.precoMin || localFilters.precoMax) && (
                <div>
                  • Preço:{" "}
                  {localFilters.precoMin
                    ? `R$ ${localFilters.precoMin}`
                    : "R$ 0"}{" "}
                  -{" "}
                  {localFilters.precoMax ? `R$ ${localFilters.precoMax}` : "∞"}
                </div>
              )}
              {localFilters.apenasDisponiveis && (
                <div>• Apenas produtos disponíveis</div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleApply} variant="primary" className="flex-1">
            Aplicar Filtros
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Limpar Filtros
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FilterModal;
