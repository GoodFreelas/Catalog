import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import QuickPageJumper from "./QuickPageJumper";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  showPageNumbers = true,
  showQuickJumper = true,
  maxPageNumbers = 5,
}) => {
  if (totalPages <= 1) return null;

  // Calcular quais números de página mostrar
  const getVisiblePages = () => {
    const delta = Math.floor(maxPageNumbers / 2);
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    // Ajustar se estamos próximos do início ou fim
    if (end - start + 1 < maxPageNumbers) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxPageNumbers - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - maxPageNumbers + 1);
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-4">
      {/* Quick Page Jumper */}
      {showQuickJumper && totalPages > 10 && (
        <div className="flex justify-center">
          <QuickPageJumper
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            className="bg-gray-50 px-4 py-2 rounded-lg"
          />
        </div>
      )}

      {/* Main Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
        {/* Informações da paginação */}
        {showInfo && (
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Mostrando <span className="font-medium">{startItem}</span> até{" "}
            <span className="font-medium">{endItem}</span> de{" "}
            <span className="font-medium">{totalItems}</span> produtos
          </div>
        )}

        {/* Controles de paginação */}
        <div className="flex items-center gap-2 order-1 sm:order-2">
          {/* Primeira página */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Primeira página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Página anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Números das páginas */}
          {showPageNumbers && (
            <div className="flex items-center gap-1">
              {/* Reticências no início */}
              {visiblePages[0] > 1 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    1
                  </button>
                  {visiblePages[0] > 2 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                </>
              )}

              {/* Páginas visíveis */}
              {visiblePages.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    page === currentPage
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Reticências no final */}
              {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                  {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Página seguinte */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Última página */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>

        {/* Informação móvel */}
        <div className="text-sm text-gray-600 order-3 sm:hidden">
          Página {currentPage} de {totalPages}
        </div>
      </div>
    </div>
  );
};

export default Pagination;
