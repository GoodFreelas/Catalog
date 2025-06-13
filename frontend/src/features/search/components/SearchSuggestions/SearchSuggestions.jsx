import { Search, TrendingUp, Clock, X } from "lucide-react";
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
    onSuggestionClick?.(suggestion.text);
  };

  const handleHistoryClick = (historyItem) => {
    onHistoryClick?.(historyItem.query);
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
                <span className="text-sm">Buscando...</span>
              </div>
            </div>
          )}

          {/* Sugestões baseadas na query atual */}
          {!isLoading && suggestions.length > 0 && (
            <div className="border-b border-secondary-100">
              <div className="p-3 bg-secondary-50">
                <h4 className="text-xs font-medium text-secondary-700 uppercase tracking-wide">
                  Sugestões
                </h4>
              </div>

              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id || index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary-50 transition-colors group"
                  >
                    <Search className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-colors" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-secondary-900 truncate">
                          {suggestion.text}
                        </span>

                        {suggestion.category && (
                          <span className="text-xs text-secondary-500 bg-secondary-100 px-2 py-0.5 rounded-full">
                            {suggestion.category}
                          </span>
                        )}
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
                      <Clock className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-colors" />

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
