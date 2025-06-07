import React from "react";
import { Search, Filter, X } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const SearchBar = ({
  searchTerm,
  onSearchChange,
  onFilterClick,
  onClearSearch,
  hasActiveFilters = false,
  resultsCount = 0,
}) => {
  const handleClear = () => {
    onSearchChange("");
    if (onClearSearch) {
      onClearSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            placeholder="Buscar produtos por nome ou código..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={Search}
            rightIcon={searchTerm ? X : undefined}
            onRightIconClick={searchTerm ? handleClear : undefined}
            className="text-base"
          />
        </div>

        {/* Filter Button */}
        <Button
          onClick={onFilterClick}
          variant={hasActiveFilters ? "primary" : "secondary"}
          className="relative"
          icon={Filter}
        >
          Filtros
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Results Count */}
      {resultsCount !== undefined && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {resultsCount} produto{resultsCount !== 1 ? "s" : ""} encontrado
            {resultsCount !== 1 ? "s" : ""}
          </p>

          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-xs text-blue-600 font-medium">
                Filtros ativos
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
