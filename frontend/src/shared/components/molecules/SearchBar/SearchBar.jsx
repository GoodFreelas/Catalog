import { useState, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import Button from "../../atoms/Button/Button";
import { useUIStore } from "../../../../core/stores/uiStore";
import { useDebounce } from "../../../../core/hooks/useDebounce";

const SearchBar = ({
  onSearch,
  onFilterToggle,
  placeholder = "Buscar produtos...",
  showFilters = true,
  className,
  ...props
}) => {
  const {
    searchTerm,
    setSearchTerm,
    clearSearch,
    hasActiveFilters,
    getActiveFiltersCount,
  } = useUIStore();

  const [localValue, setLocalValue] = useState(searchTerm);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce da busca para evitar muitas requisições
  const debouncedSearchTerm = useDebounce(localValue, 300);

  // Atualiza o termo de busca global quando o debounced value muda
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setSearchTerm(debouncedSearchTerm);
      onSearch?.(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchTerm, setSearchTerm, onSearch]);

  // Sincroniza valor local com o store
  useEffect(() => {
    setLocalValue(searchTerm);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue("");
    clearSearch();
    onSearch?.("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(localValue);
    onSearch?.(localValue);
  };

  const activeFiltersCount = getActiveFiltersCount();
  const hasFilters = hasActiveFilters();

  return (
    <div className={clsx("relative", className)} {...props}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Container principal */}
        <div
          className={clsx(
            "relative flex items-center",
            "bg-white border rounded-lg transition-all duration-200",
            "hover:shadow-soft",
            {
              "border-primary-300 shadow-soft": isFocused,
              "border-secondary-200": !isFocused,
            }
          )}
        >
          {/* Ícone de busca */}
          <div className="absolute left-3 flex items-center pointer-events-none">
            <Search
              className={clsx(
                "w-5 h-5 transition-colors duration-200",
                isFocused ? "text-primary-500" : "text-secondary-400"
              )}
            />
          </div>

          {/* Input de busca */}
          <input
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={clsx(
              "w-full pl-10 pr-20 py-3 text-sm",
              "bg-transparent border-none outline-none",
              "placeholder-secondary-400 text-secondary-900"
            )}
          />

          {/* Botões de ação */}
          <div className="absolute right-2 flex items-center gap-1">
            {/* Botão de limpar busca */}
            <AnimatePresence>
              {localValue && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleClear}
                    className="p-1.5 hover:bg-secondary-100 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botão de filtros */}
            {showFilters && (
              <div className="relative">
                <Button
                  type="button"
                  variant={hasFilters ? "primary" : "ghost"}
                  size="xs"
                  onClick={onFilterToggle}
                  className={clsx(
                    "p-1.5 rounded-md relative",
                    hasFilters
                      ? "bg-primary-100 text-primary-600 hover:bg-primary-200"
                      : "hover:bg-secondary-100"
                  )}
                >
                  <Filter className="w-4 h-4" />
                </Button>

                {/* Badge com contador de filtros ativos */}
                {activeFiltersCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {activeFiltersCount}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Indicador de busca ativa */}
      <AnimatePresence>
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-primary-50 border border-primary-200 rounded-lg p-3 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-primary-700">
                  Buscando por: <strong>"{searchTerm}"</strong>
                </span>
              </div>

              <Button
                variant="ghost"
                size="xs"
                onClick={handleClear}
                className="text-primary-600 hover:text-primary-700 hover:bg-primary-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
