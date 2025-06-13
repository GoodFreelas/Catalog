import { useState, useEffect, useRef } from "react";
import { Search, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import Button from "../../atoms/Button/Button";
import SearchSuggestions from "../../../../features/search/components/SearchSuggestions/SearchSuggestions";
import { useUIStore } from "../../../../core/stores/uiStore";
import { useDebounce } from "../../../../core/hooks/useDebounce";
import { useSearchSuggestions } from "../../../../features/search/hooks/useSearch";

const SearchBar = ({
  value = "",
  onSearch,
  onFilterToggle,
  placeholder = "Buscar produtos...",
  showFilters = true,
  showSuggestions = true,
  autoFocus = false,
  className,
  ...props
}) => {
  const { hasActiveFilters, getActiveFiltersCount } = useUIStore();

  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Debounce apenas do valor local - sem circular dependency
  const debouncedValue = useDebounce(localValue, 300);

  // Hook para buscar sugestões
  const { data: suggestionsData, isLoading: suggestionsLoading } =
    useSearchSuggestions(localValue, {
      enabled:
        showSuggestions && localValue.length > 0 && localValue.length < 4,
    });

  const suggestions = suggestionsData?.suggestions || [];

  // Carregar histórico do localStorage apenas uma vez
  useEffect(() => {
    try {
      const saved = localStorage.getItem("search-history");
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  }, []);

  // Atualizar valor local quando prop value mudar
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]); // Removido localValue da dependência para evitar loop

  // Chamar onSearch quando debouncedValue mudar
  useEffect(() => {
    if (debouncedValue !== value) {
      onSearch?.(debouncedValue);
    }
  }, [debouncedValue, onSearch]); // Removido value da dependência

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowSuggestionsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Mostrar sugestões quando começar a digitar
    if (newValue.length > 0 && showSuggestions) {
      setShowSuggestionsDropdown(true);
    } else {
      setShowSuggestionsDropdown(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Mostrar histórico/sugestões ao focar se tiver conteúdo
    if (
      (localValue.length > 0 || searchHistory.length > 0) &&
      showSuggestions
    ) {
      setShowSuggestionsDropdown(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay para permitir cliques nas sugestões
    setTimeout(() => {
      setShowSuggestionsDropdown(false);
    }, 200);
  };

  const handleClear = () => {
    setLocalValue("");
    onSearch?.("");
    setShowSuggestionsDropdown(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(localValue);
    setShowSuggestionsDropdown(false);
    inputRef.current?.blur();

    // Adicionar ao histórico
    if (localValue.trim().length >= 2) {
      addToHistory(localValue.trim());
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    setLocalValue(suggestionText);
    onSearch?.(suggestionText);
    setShowSuggestionsDropdown(false);
    addToHistory(suggestionText);
  };

  const handleHistoryClick = (historyQuery) => {
    setLocalValue(historyQuery);
    onSearch?.(historyQuery);
    setShowSuggestionsDropdown(false);
  };

  const addToHistory = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) return;

    const newItem = {
      id: Date.now(),
      query: searchTerm,
      timestamp: new Date().toISOString(),
    };

    setSearchHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.query.toLowerCase() !== searchTerm.toLowerCase()
      );
      const updated = [newItem, ...filtered].slice(0, 10);

      localStorage.setItem("search-history", JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("search-history");
  };

  const removeFromHistory = (id) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      localStorage.setItem("search-history", JSON.stringify(filtered));
      return filtered;
    });
  };

  const activeFiltersCount = getActiveFiltersCount();
  const hasFilters = hasActiveFilters();

  const shouldShowSuggestions =
    showSuggestionsDropdown &&
    showSuggestions &&
    (suggestions.length > 0 || searchHistory.length > 0 || suggestionsLoading);

  return (
    <div className={clsx("relative", className)} ref={containerRef} {...props}>
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
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
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

      {/* Dropdown de sugestões */}
      {shouldShowSuggestions && (
        <SearchSuggestions
          suggestions={suggestions}
          searchHistory={searchHistory}
          isLoading={suggestionsLoading}
          query={localValue}
          onSuggestionClick={handleSuggestionClick}
          onHistoryClick={handleHistoryClick}
          onRemoveFromHistory={removeFromHistory}
          onClearHistory={clearHistory}
          show={shouldShowSuggestions}
        />
      )}

      {/* Indicador de busca ativa */}
      <AnimatePresence>
        {debouncedValue && !showSuggestionsDropdown && (
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
                  Buscando por: <strong>"{debouncedValue}"</strong>
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
