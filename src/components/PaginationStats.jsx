import React from "react";
import { Package, Grid, List, Filter } from "lucide-react";

const PaginationStats = ({
  totalItems,
  filteredItems,
  currentPageItems,
  currentPage,
  totalPages,
  itemsPerPage,
  hasFilters,
  viewMode,
}) => {
  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Estatísticas principais */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <div className="text-sm">
              <span className="font-semibold text-gray-900">{totalItems}</span>
              <span className="text-gray-600 ml-1">produtos total</span>
            </div>
          </div>

          {hasFilters && filteredItems !== totalItems && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-green-600" />
              <div className="text-sm">
                <span className="font-semibold text-gray-900">
                  {filteredItems}
                </span>
                <span className="text-gray-600 ml-1">filtrados</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {viewMode === "grid" ? (
              <Grid className="h-4 w-4 text-purple-600" />
            ) : (
              <List className="h-4 w-4 text-purple-600" />
            )}
            <div className="text-sm">
              <span className="font-semibold text-gray-900">
                {currentPageItems}
              </span>
              <span className="text-gray-600 ml-1">nesta página</span>
            </div>
          </div>
        </div>

        {/* Informações da página */}
        {totalPages > 1 && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Página <span className="font-semibold">{currentPage}</span> de{" "}
              <span className="font-semibold">{totalPages}</span>
            </span>
            <span className="text-gray-400">•</span>
            <span>
              <span className="font-semibold">{itemsPerPage}</span> itens por
              página
            </span>
          </div>
        )}
      </div>

      {/* Barra de progresso da paginação */}
      {totalPages > 1 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginationStats;
