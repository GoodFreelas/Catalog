import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import clsx from "clsx";

import Button from "../../components/atoms/Button/Button";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  siblingCount = 1,
  boundaryCount = 1,
  isLoading = false,
  className,
  ...props
}) => {
  // Gerar array de páginas visíveis
  const generatePages = () => {
    const pages = [];

    // Sempre mostrar primeira página
    if (boundaryCount > 0) {
      for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) {
        pages.push(i);
      }
    }

    // Calcular páginas ao redor da página atual
    const startPage = Math.max(boundaryCount + 1, currentPage - siblingCount);
    const endPage = Math.min(
      totalPages - boundaryCount,
      currentPage + siblingCount
    );

    // Adicionar ellipsis antes das páginas centrais se necessário
    if (startPage > boundaryCount + 1) {
      pages.push("ellipsis-start");
    }

    // Adicionar páginas centrais
    for (let i = startPage; i <= endPage; i++) {
      if (i > boundaryCount && i <= totalPages - boundaryCount) {
        pages.push(i);
      }
    }

    // Adicionar ellipsis depois das páginas centrais se necessário
    if (endPage < totalPages - boundaryCount) {
      pages.push("ellipsis-end");
    }

    // Sempre mostrar últimas páginas
    if (boundaryCount > 0) {
      for (
        let i = Math.max(totalPages - boundaryCount + 1, boundaryCount + 1);
        i <= totalPages;
        i++
      ) {
        if (i > endPage) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !isLoading) {
      onPageChange?.(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  const pages = generatePages();

  return (
    <nav
      className={clsx("flex items-center justify-center", className)}
      {...props}
    >
      <div className="flex items-center gap-1">
        {/* Primeira página */}
        {showFirstLast && currentPage > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={isLoading}
            className="hidden sm:flex"
          >
            Primeira
          </Button>
        )}

        {/* Página anterior */}
        {showPrevNext && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            leftIcon={<ChevronLeft />}
            className="sm:px-3"
          >
            <span className="hidden sm:inline">Anterior</span>
          </Button>
        )}

        {/* Páginas numeradas */}
        <div className="flex items-center gap-1">
          {pages.map((page, index) => {
            if (typeof page === "string" && page.startsWith("ellipsis")) {
              return (
                <div key={page} className="px-3 py-2 text-secondary-500">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              );
            }

            const isActive = page === currentPage;

            return (
              <Button
                key={page}
                variant={isActive ? "primary" : "ghost"}
                size="sm"
                onClick={() => handlePageChange(page)}
                disabled={isLoading}
                className={clsx(
                  "min-w-[2.5rem] px-3 py-2",
                  isActive && "font-semibold"
                )}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Próxima página */}
        {showPrevNext && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            rightIcon={<ChevronRight />}
            className="sm:px-3"
          >
            <span className="hidden sm:inline">Próxima</span>
          </Button>
        )}

        {/* Última página */}
        {showFirstLast && currentPage < totalPages && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={isLoading}
            className="hidden sm:flex"
          >
            Última
          </Button>
        )}
      </div>

      {/* Info mobile */}
      <div className="sm:hidden ml-4 text-sm text-secondary-600">
        {currentPage} de {totalPages}
      </div>
    </nav>
  );
};

export default Pagination;
