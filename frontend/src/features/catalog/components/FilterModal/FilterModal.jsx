import { useState, useEffect } from "react";
import { X, Filter, RotateCcw, Check } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

import Button from "../../../../shared/components/atoms/Button/Button";
import Badge from "../../../../shared/components/atoms/Badge/Badge";
import { useUIStore } from "../../../../core/stores/uiStore";
import { useCategories } from "../../hooks/useProducts";
import {
  PRICE_RANGES,
  SORT_OPTIONS,
  PRODUCT_STATUS_LABELS,
} from "../../../../core/constants/api";

const FilterModal = () => {
  const {
    modals,
    closeModal,
    filters,
    setFilter,
    setPriceRange,
    setSort,
    clearFilters,
    hasActiveFilters,
  } = useUIStore();

  const [localFilters, setLocalFilters] = useState(filters);
  const isOpen = modals.filters?.isOpen || false;

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data?.categories || [];

  // Sincronizar filtros locais com o store
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  const handleClose = () => {
    closeModal("filters");
  };

  const handleApplyFilters = () => {
    // Aplicar todos os filtros ao store
    Object.keys(localFilters).forEach((key) => {
      if (key === "priceRange") {
        setPriceRange(localFilters.priceRange.min, localFilters.priceRange.max);
      } else if (key === "sort" || key === "order") {
        // Aplicado junto no setSort
      } else {
        setFilter(key, localFilters[key]);
      }
    });

    setSort(localFilters.sort, localFilters.order);
    handleClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category: "",
      priceRange: { min: null, max: null },
      status: "",
      sort: "nome",
      order: "asc",
    };
    setLocalFilters(clearedFilters);
    clearFilters();
  };

  const handleLocalFilterChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePriceRangeChange = (min, max) => {
    setLocalFilters((prev) => ({
      ...prev,
      priceRange: { min, max },
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.category) count++;
    if (localFilters.status) count++;
    if (
      localFilters.priceRange.min !== null ||
      localFilters.priceRange.max !== null
    )
      count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: "100%", scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: "100%", scale: 0.95 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl shadow-strong"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-secondary-200 px-6 py-4 rounded-t-2xl md:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-secondary-900">
                Filtros
              </h2>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="primary" size="sm">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  leftIcon={<RotateCcw />}
                  className="text-secondary-600"
                >
                  Limpar
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-8">
          {/* Categorias */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-secondary-900 mb-4">
                Categorias
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => handleLocalFilterChange("category", "")}
                  className={clsx(
                    "w-full text-left px-4 py-3 rounded-lg border transition-all",
                    localFilters.category === ""
                      ? "border-primary-200 bg-primary-50 text-white"
                      : "border-secondary-200 hover:border-secondary-300 text-secondary-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>Todas as categorias</span>
                    {localFilters.category === "" && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                </button>

                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      handleLocalFilterChange("category", category)
                    }
                    className={clsx(
                      "w-full text-left px-4 py-3 rounded-lg border transition-all",
                      localFilters.category === category
                        ? "border-primary-200 bg-primary-50 text-white"
                        : "border-secondary-200 hover:border-secondary-300 text-secondary-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category}</span>
                      {localFilters.category === category && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Faixa de preço */}
          <div>
            <h3 className="text-base font-semibold text-secondary-900 mb-4">
              Faixa de preço
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => handlePriceRangeChange(null, null)}
                className={clsx(
                  "w-full text-left px-4 py-3 rounded-lg border transition-all",
                  localFilters.priceRange.min === null &&
                    localFilters.priceRange.max === null
                    ? "border-primary-200 bg-primary-50 text-white"
                    : "border-secondary-200 hover:border-secondary-300 text-secondary-700"
                )}
              >
                <div className="flex items-center justify-between">
                  <span>Qualquer preço</span>
                  {localFilters.priceRange.min === null &&
                    localFilters.priceRange.max === null && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                </div>
              </button>

              {PRICE_RANGES.map((range, index) => {
                const isSelected =
                  localFilters.priceRange.min === range.min &&
                  localFilters.priceRange.max === range.max;

                return (
                  <button
                    key={index}
                    onClick={() => handlePriceRangeChange(range.min, range.max)}
                    className={clsx(
                      "w-full text-left px-4 py-3 rounded-lg border transition-all",
                      isSelected
                        ? "border-primary-200 bg-primary-50 text-white"
                        : "border-secondary-200 hover:border-secondary-300 text-secondary-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{range.label}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status do produto */}
          <div>
            <h3 className="text-base font-semibold text-secondary-900 mb-4">
              Status
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => handleLocalFilterChange("status", "")}
                className={clsx(
                  "w-full text-left px-4 py-3 rounded-lg border transition-all",
                  localFilters.status === ""
                    ? "border-primary-200 bg-primary-50 text-white"
                    : "border-secondary-200 hover:border-secondary-300 text-secondary-700"
                )}
              >
                <div className="flex items-center justify-between">
                  <span>Todos os produtos</span>
                  {localFilters.status === "" && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </div>
              </button>

              {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleLocalFilterChange("status", value)}
                  className={clsx(
                    "w-full text-left px-4 py-3 rounded-lg border transition-all",
                    localFilters.status === value
                      ? "border-primary-200 bg-primary-50 text-white"
                      : "border-secondary-200 hover:border-secondary-300 text-secondary-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{label}</span>
                    {localFilters.status === value && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ordenação */}
          <div>
            <h3 className="text-base font-semibold text-secondary-900 mb-4">
              Ordenar por
            </h3>

            <div className="space-y-2">
              {SORT_OPTIONS.map((option) => {
                const isSelected =
                  localFilters.sort === option.field &&
                  localFilters.order === option.order;

                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleLocalFilterChange("sort", option.field);
                      handleLocalFilterChange("order", option.order);
                    }}
                    className={clsx(
                      "w-full text-left px-4 py-3 rounded-lg border transition-all",
                      isSelected
                        ? "border-primary-200 bg-primary-50 text-white"
                        : "border-secondary-200 hover:border-secondary-300 text-secondary-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-secondary-200 px-6 py-4">
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={handleClose}>
              Cancelar
            </Button>

            <Button
              variant="primary"
              fullWidth
              onClick={handleApplyFilters}
              leftIcon={<Filter />}
            >
              Aplicar filtros
              {getActiveFiltersCount() > 0 && (
                <span className="ml-1">({getActiveFiltersCount()})</span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FilterModal;
