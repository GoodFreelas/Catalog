import { useState, useEffect, useRef } from "react";
import { Search, X, Filter, Tag, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import Button from "../../atoms/Button/Button";
import SearchSuggestions from "../../../../features/search/components/SearchSuggestions/SearchSuggestions";
import { useUIStore } from "../../../../core/stores/uiStore";
import { useDebounce } from "../../../../core/hooks/useDebounce";
import { useProducts } from "../../../../features/catalog/hooks/useProducts";

const SearchBar = ({
  value = "",
  onSearch,
  onFilterToggle,
  placeholder = "Buscar produtos...",
  showFilters = true,
  autoFocus = false,
  showSuggestions = true,
  className,
  ...props
}) => {
  const {
    searchTerm,
    setSearchTerm,
    hasActiveFilters,
    getActiveFiltersCount,
    searchHistory = [], // Valor padrão
    addToSearchHistory = () => {}, // Função padrão
    removeFromSearchHistory = () => {}, // Função padrão
    clearSearchHistory = () => {}, // Função padrão
  } = useUIStore();

  const [localValue, setLocalValue] = useState(value || searchTerm);
  const [isFocused, setIsFocused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const inputRef = useRef(null);

  // Debounce para busca automática e sugestões
  const debouncedValue = useDebounce(localValue, 300);
  const debouncedSearchValue = useDebounce(localValue, 500);

  // Query para buscar sugestões
  const { data: suggestionsData } = useProducts({
    params: {
      search: debouncedValue,
      limit: 5,
      suggest_only: true,
    },
    enabled: showSuggestions && debouncedValue.length >= 2,
    staleTime: 30 * 1000, // 30 segundos
  });

  // Inicializar apenas uma vez
  useEffect(() => {
    if (!isInitialized) {
      setLocalValue(searchTerm || "");
      setIsInitialized(true);
    }
  }, [searchTerm, isInitialized]);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Sincronizar com store apenas quando necessário
  useEffect(() => {
    if (isInitialized && debouncedSearchValue !== searchTerm) {
      setSearchTerm(debouncedSearchValue);
      onSearch?.(debouncedSearchValue);

      // Adicionar ao histórico se não estiver vazio e a função existir
      if (debouncedSearchValue.trim().length > 0 && addToSearchHistory) {
        addToSearchHistory(debouncedSearchValue.trim());
      }
    }
  }, [debouncedSearchValue, isInitialized]);

  // Sincronizar apenas mudanças externas
  useEffect(() => {
    if (
      isInitialized &&
      searchTerm !== localValue &&
      searchTerm !== debouncedSearchValue
    ) {
      setLocalValue(searchTerm);
    }
  }, [searchTerm, isInitialized]);

  // Gerar sugestões baseadas nos produtos encontrados
  useEffect(() => {
    if (suggestionsData?.data?.products && debouncedValue.length >= 2) {
      setSuggestionsLoading(false);

      const products = suggestionsData.data.products;
      const newSuggestions = [];
      const seen = new Set();

      // Adicionar produtos que fazem match
      products.slice(0, 3).forEach((product) => {
        if (!seen.has(product.nome.toLowerCase())) {
          newSuggestions.push({
            id: `product-${product.id}`,
            text: product.nome,
            type: "product",
            category: product.categoria,
            product: product,
          });
          seen.add(product.nome.toLowerCase());
        }
      });

      // Extrair categorias únicas
      const categories = [
        ...new Set(products.map((p) => p.categoria).filter(Boolean)),
      ];
      categories.slice(0, 2).forEach((categoria) => {
        if (!seen.has(categoria.toLowerCase())) {
          newSuggestions.push({
            id: `category-${categoria}`,
            text: categoria,
            type: "category",
            icon: Package,
          });
          seen.add(categoria.toLowerCase());
        }
      });

      // Extrair keywords únicas
      const keywords = new Set();
      products.forEach((product) => {
        if (product.seo_keywords) {
          product.seo_keywords.split(",").forEach((keyword) => {
            const cleanKeyword = keyword.trim().toLowerCase();
            if (
              cleanKeyword.length > 2 &&
              cleanKeyword.includes(debouncedValue.toLowerCase()) &&
              !seen.has(cleanKeyword)
            ) {
              keywords.add(keyword.trim());
              seen.add(cleanKeyword);
            }
          });
        }
      });

      // Adicionar keywords como sugestões
      Array.from(keywords)
        .slice(0, 2)
        .forEach((keyword) => {
          newSuggestions.push({
            id: `keyword-${keyword}`,
            text: keyword,
            type: "keyword",
            icon: Tag,
          });
        });

      setSuggestions(newSuggestions);
    } else if (debouncedValue.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
    }
  }, [suggestionsData, debouncedValue]);

  // Controlar loading das sugestões
  useEffect(() => {
    if (debouncedValue.length >= 2 && showSuggestions) {
      setSuggestionsLoading(true);
    }
  }, [debouncedValue, showSuggestions]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions) {
      setShowSuggestionsDropdown(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay para permitir clicks nas sugestões
    setTimeout(() => {
      setShowSuggestionsDropdown(false);
    }, 200);
  };

  const handleClear = () => {
    setLocalValue("");
    setSearchTerm("");
    onSearch?.("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Força a busca imediatamente
    setSearchTerm(localValue);
    onSearch?.(localValue);

    if (localValue.trim().length > 0 && addToSearchHistory) {
      addToSearchHistory(localValue.trim());
    }

    setShowSuggestionsDropdown(false);
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (suggestion) => {
    setLocalValue(suggestion.text);
    setSearchTerm(suggestion.text);
    onSearch?.(suggestion.text);
    if (addToSearchHistory) {
      addToSearchHistory(suggestion.text);
    }
    setShowSuggestionsDropdown(false);
    inputRef.current?.blur();
  };

  const handleHistoryClick = (query) => {
    setLocalValue(query);
    setSearchTerm(query);
    onSearch?.(query);
    setShowSuggestionsDropdown(false);
  };

  // Filtrar props que não devem ir para o DOM
  const {
    onSearch: _onSearch,
    onFilterToggle: _onFilterToggle,
    showFilters: _showFilters,
    showSuggestions: _showSuggestions,
    autoFocus: _autoFocus,
    ...domProps
  } = props;

  const activeFiltersCount = getActiveFiltersCount();
  const hasFilters = hasActiveFilters();

  const shouldShowSuggestions =
    showSuggestionsDropdown &&
    (suggestions.length > 0 ||
      (searchHistory && searchHistory.length > 0) ||
      suggestionsLoading);

  return (
    <div className={clsx("relative", className)} {...domProps}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Container principal */}
        <div
          className={clsx(
            "relative flex items-center",
            "bg-white border rounded-2xl transition-all duration-200",
            "hover:shadow-soft",
            {
              "border-primary-300 shadow-soft": isFocused,
              "border-secondary-900": !isFocused,
            }
          )}
        >
          {/* Ícone de busca */}
          <div className="absolute left-3 flex items-center pointer-events-none">
            <Search
              className={clsx(
                "w-5 h-5 transition-colors duration-200",
                isFocused ? "text-primary-500" : "text-secondary-900"
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
              "placeholder-secondary-900 text-secondary-900"
            )}
            autoComplete="off"
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

      {/* Sugestões */}
      {showSuggestions && (
        <SearchSuggestions
          suggestions={suggestions}
          searchHistory={searchHistory}
          isLoading={suggestionsLoading}
          query={localValue}
          show={shouldShowSuggestions}
          onSuggestionClick={handleSuggestionClick}
          onHistoryClick={handleHistoryClick}
          onRemoveFromHistory={removeFromSearchHistory}
          onClearHistory={clearSearchHistory}
        />
      )}

      {/* Indicador de busca ativa */}
      <AnimatePresence>
        {searchTerm && !showSuggestionsDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-primary-50 border border-primary-200 rounded-lg p-3 shadow-soft z-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-white">
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
