import { useState } from "react";
import { Search, X, Clock, TrendingUp, Filter, Grid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import Button from "../../../../shared/components/atoms/Button/Button";
import ProductCard from "../../../../shared/components/molecules/ProductCard/ProductCard";
import { useUIStore } from "../../../../core/stores/uiStore";
import { formatRelativeTime } from "../../../../core/utils/formatters";

const SearchResults = ({
  query,
  results = [],
  isLoading,
  isError,
  error,
  resultCount = 0,
  searchHistory = [],
  onClearHistory,
  onRemoveFromHistory,
  onQueryChange,
  onProductView,
  className,
  ...props
}) => {
  const [viewMode, setViewMode] = useState("grid");
  const [showHistory, setShowHistory] = useState(false);
  const { openModal } = useUIStore();

  const handleProductView = (product) => {
    onProductView?.(product);
    openModal("productDetail", { productId: product.id });
  };

  const handleHistoryClick = (historyItem) => {
    onQueryChange(historyItem.query);
    setShowHistory(false);
  };

  const handleFilterToggle = () => {
    openModal("filters");
  };

  // Estados de loading e erro
  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Search className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
            Erro na busca
          </h3>
          <p className="text-secondary-600 mb-4">
            {error?.message || "Não foi possível realizar a busca"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("space-y-6", className)} {...props}>
      {/* Header dos resultados */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Info dos resultados */}
        <div className="space-y-1">
          {query && (
            <h2 className="text-xl lg:text-2xl font-bold text-secondary-900">
              Resultados para "{query}"
            </h2>
          )}

          {!isLoading && (
            <p className="text-secondary-600">
              {resultCount > 0
                ? `${resultCount} produto${
                    resultCount !== 1 ? "s" : ""
                  } encontrado${resultCount !== 1 ? "s" : ""}`
                : "Nenhum produto encontrado"}
            </p>
          )}
        </div>

        {/* Controles */}
        {results.length > 0 && (
          <div className="flex items-center gap-3">
            {/* Histórico de buscas */}
            {searchHistory.length > 0 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  leftIcon={<Clock />}
                  className="hidden md:flex"
                >
                  Histórico
                </Button>

                {/* Dropdown do histórico */}
                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-white border border-secondary-200 rounded-lg shadow-strong z-10"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-secondary-900">
                            Buscas recentes
                          </h3>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={onClearHistory}
                            className="text-secondary-500 hover:text-error-600"
                          >
                            Limpar
                          </Button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {searchHistory.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 hover:bg-secondary-50 rounded-lg cursor-pointer group"
                              onClick={() => handleHistoryClick(item)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Clock className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-secondary-900 truncate">
                                    {item.query}
                                  </p>
                                  <p className="text-xs text-secondary-500">
                                    {formatRelativeTime(item.timestamp)}
                                  </p>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveFromHistory(item.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Filtros */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFilterToggle}
              leftIcon={<Filter />}
              className="md:hidden"
            >
              Filtros
            </Button>

            {/* Modo de visualização */}
            <div className="hidden md:flex items-center bg-secondary-100 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3 py-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3 py-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="space-y-6">
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-square bg-secondary-200 rounded-lg shimmer" />
                <div className="space-y-2">
                  <div className="h-4 bg-secondary-200 rounded shimmer" />
                  <div className="h-4 bg-secondary-200 rounded shimmer w-2/3" />
                  <div className="h-6 bg-secondary-200 rounded shimmer w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && results.length === 0 && query && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-secondary-600 mb-6">
              Tente buscar com termos diferentes ou verifique a ortografia
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => onQueryChange("")}>
                Limpar busca
              </Button>
            </div>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <motion.div
            layout
            className={clsx(
              "grid gap-4 lg:gap-6",
              viewMode === "grid"
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "grid-cols-1"
            )}
          >
            <AnimatePresence mode="popLayout">
              {results.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard
                    product={product}
                    onViewDetails={handleProductView}
                    className={clsx({
                      "flex flex-row": viewMode === "list",
                    })}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Overlay para fechar histórico */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-5"
            onClick={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchResults;
