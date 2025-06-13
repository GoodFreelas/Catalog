import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import Button from "../../../shared/components/atoms/Button/Button";
import SearchBar from "../../../shared/components/molecules/SearchBar/SearchBar";
import SearchResults from "../components/SearchResults/SearchResults";
import { useSearch } from "../hooks/useSearch";
import { useUIStore } from "../../../core/stores/uiStore";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isMobile } = useUIStore();

  const initialQuery = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(initialQuery);

  const {
    query,
    setQuery,
    data,
    isLoading,
    isError,
    error,
    searchHistory,
    clearHistory,
    removeFromHistory,
    hasResults,
    resultCount,
    refetch,
  } = useSearch(initialQuery);

  // Sincronizar URL com query
  useEffect(() => {
    if (query !== initialQuery) {
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }
  }, [query, initialQuery, setSearchParams]);

  // Sincronizar query local com hook de busca
  useEffect(() => {
    setQuery(localQuery);
  }, [localQuery, setQuery]);

  const handleSearch = (searchTerm) => {
    setLocalQuery(searchTerm);
  };

  const handleQueryChange = (newQuery) => {
    setLocalQuery(newQuery);
  };

  const handleProductView = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleBack = () => {
    navigate("/catalog");
  };

  const products = data?.data?.products || [];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header da página */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          leftIcon={<ArrowLeft />}
          className="flex-shrink-0"
        >
          {isMobile ? "" : "Voltar"}
        </Button>

        <div className="flex-1">
          <SearchBar
            value={localQuery}
            onSearch={handleSearch}
            placeholder="Buscar produtos..."
            showFilters={false}
            autoFocus
          />
        </div>
      </div>

      {/* Breadcrumb */}
      {query && (
        <div className="flex items-center gap-2 text-sm text-secondary-600 mb-6">
          <span>Início</span>
          <span>/</span>
          <span>Busca</span>
          <span>/</span>
          <span className="text-secondary-900 font-medium">"{query}"</span>
        </div>
      )}

      {/* Resultados */}
      <SearchResults
        query={query}
        results={products}
        isLoading={isLoading}
        isError={isError}
        error={error}
        resultCount={resultCount}
        searchHistory={searchHistory}
        onClearHistory={clearHistory}
        onRemoveFromHistory={removeFromHistory}
        onQueryChange={handleQueryChange}
        onProductView={handleProductView}
      />

      {/* Estados especiais */}
      {!query && !isLoading && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">
              O que você está procurando?
            </h2>
            <p className="text-secondary-600 mb-6">
              Digite o nome do produto, código ou categoria para encontrar o que
              precisa
            </p>

            {/* Sugestões de busca populares */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary-700">
                Buscas populares:
              </h3>

              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Pneu",
                  "Óleo motor",
                  "Filtro",
                  "Bateria",
                  "Amortecedor",
                  "Pastilha freio",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(suggestion)}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
