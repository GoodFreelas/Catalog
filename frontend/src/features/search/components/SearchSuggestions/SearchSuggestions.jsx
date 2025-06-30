import { Search, TrendingUp, Clock, X, Package, Tag, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import Button from "../../../../shared/components/atoms/Button/Button";

const SearchSuggestions = ({
  suggestions = [],
  searchHistory = [],
  isLoading,
  query,
  onSuggestionClick,
  onHistoryClick,
  onRemoveFromHistory,
  onClearHistory,
  show = false,
  className,
  ...props
}) => {
  const hasContent = suggestions.length > 0 || searchHistory.length > 0;

  if (!show || (!hasContent && !isLoading)) {
    return null;
  }

  const handleSuggestionClick = (suggestion) => {
    onSuggestionClick?.(suggestion);
  };

  const handleHistoryClick = (historyItem) => {
    onHistoryClick?.(historyItem.query);
  };

  // Agrupar sugestões por tipo
  const groupedSuggestions = {
    products: suggestions.filter((s) => s.type === "product"),
    categories: suggestions.filter((s) => s.type === "category"),
    keywords: suggestions.filter((s) => s.type === "keyword"),
  };

  const getSuggestionIcon = (suggestion) => {
    switch (suggestion.type) {
      case "product":
        return <Search className="w-4 h-4" />;
      case "category":
        return <Package className="w-4 h-4" />;
      case "keyword":
        return <Tag className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getSuggestionTypeLabel = (type) => {
    switch (type) {
      case "product":
        return "Produto";
      case "category":
        return "Categoria";
      case "keyword":
        return "Tag";
      default:
        return "";
    }
  };

  const getSuggestionTypeColor = (type) => {
    switch (type) {
      case "product":
        return "text-primary-700 bg-white border-blue-200";
      case "category":
        return "text-green-600 bg-green-50 border-green-200";
      case "keyword":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-secondary-600 bg-secondary-50 border-secondary-200";
    }
  };

  const highlightMatch = (text, query) => {
    if (!query || query.length < 2) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={index} className="font-semibold text-secondary-600">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={clsx(
          "absolute top-full left-0 right-0 mt-2 bg-white border border-secondary-200",
          "rounded-lg shadow-strong z-20 max-h-96 overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="overflow-y-auto max-h-96">
          {/* Loading state */}
          {isLoading && (
            <div className="p-4">
              <div className="flex items-center gap-3 text-secondary-600">
                <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                <span className="text-sm">Buscando sugestões...</span>
              </div>
            </div>
          )}

          {/* Sugestões agrupadas por tipo */}
          {!isLoading && suggestions.length > 0 && (
            <div className="border-b border-secondary-100">
              <div className="p-3 bg-secondary-50">
                <h4 className="text-xs font-medium text-secondary-700 uppercase tracking-wide">
                  Sugestões para "{query}"
                </h4>
              </div>

              <div className="py-2">
                {/* Produtos */}
                {groupedSuggestions.products.map((suggestion, index) => (
                  <button
                    key={suggestion.id || index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary-50 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-primary-700 group-hover:bg-red transition-colors">
                      {getSuggestionIcon(suggestion)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-secondary-900 truncate">
                          {highlightMatch(suggestion.text, query)}
                        </span>
                        <span
                          className={clsx(
                            "text-xs px-1.5 py-0.5 rounded border text-primary-700 bg-white border-blue-200"
                          )}
                        >
                          Produto
                        </span>
                      </div>
                      {suggestion.category && (
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3 text-secondary-400" />
                          <span className="text-xs text-secondary-500">
                            {suggestion.category}
                          </span>
                        </div>
                      )}
                    </div>

                    <TrendingUp className="w-3 h-3 text-secondary-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}

                {/* Categorias */}
                {groupedSuggestions.categories.map((suggestion, index) => (
                  <button
                    key={suggestion.id || index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary-50 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                      {getSuggestionIcon(suggestion)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary-900 truncate">
                          {highlightMatch(suggestion.text, query)}
                        </span>
                        <span
                          className={clsx(
                            "text-xs px-1.5 py-0.5 rounded border text-green-600 bg-green-50 border-green-200"
                          )}
                        >
                          Categoria
                        </span>
                      </div>
                    </div>

                    <TrendingUp className="w-3 h-3 text-secondary-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}

                {/* Keywords */}
                {groupedSuggestions.keywords.map((suggestion, index) => (
                  <button
                    key={suggestion.id || index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary-50 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                      {getSuggestionIcon(suggestion)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary-900 truncate">
                          {highlightMatch(suggestion.text, query)}
                        </span>
                        <span
                          className={clsx(
                            "text-xs px-1.5 py-0.5 rounded border text-purple-600 bg-purple-50 border-purple-200"
                          )}
                        >
                          Tag
                        </span>
                      </div>
                    </div>

                    <TrendingUp className="w-3 h-3 text-secondary-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Histórico de buscas */}
          {!isLoading && searchHistory.length > 0 && (
            <div>
              <div className="p-3 bg-secondary-50 flex items-center justify-between">
                <h4 className="text-xs font-medium text-secondary-700 uppercase tracking-wide">
                  Buscas recentes
                </h4>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onClearHistory}
                  className="text-secondary-500 hover:text-error-600 text-xs"
                >
                  Limpar
                </Button>
              </div>

              <div className="py-2">
                {searchHistory.slice(0, 5).map((historyItem) => (
                  <div
                    key={historyItem.id}
                    className="flex items-center group hover:bg-secondary-50 transition-colors"
                  >
                    <button
                      onClick={() => handleHistoryClick(historyItem)}
                      className="flex-1 flex items-center gap-3 px-4 py-2 text-left"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200 transition-colors">
                        <Clock className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-secondary-900 truncate block">
                          {historyItem.query}
                        </span>
                        <span className="text-xs text-secondary-500">
                          {formatTimeAgo(historyItem.timestamp)}
                        </span>
                      </div>
                    </button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onRemoveFromHistory(historyItem.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 p-1"
                    >
                      <X className="w-3 h-3 text-secondary-400 hover:text-error-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {!isLoading && !hasContent && query.length > 0 && (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-secondary-300 mx-auto mb-2" />
              <p className="text-sm text-secondary-600">
                Nenhuma sugestão encontrada
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                Tente termos diferentes ou verifique a ortografia
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Função helper para formatar tempo relativo
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now - time) / (1000 * 60));

  if (diffInMinutes < 1) return "agora";
  if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h atrás`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d atrás`;

  return time.toLocaleDateString("pt-BR");
};

export default SearchSuggestions;
