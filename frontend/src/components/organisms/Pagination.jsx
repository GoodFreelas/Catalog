import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '../atoms/Button';

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Calculate the range of pages to show
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Add first page
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Add pages in range
    rangeWithDots.push(...range);

    // Add last page
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const PageButton = ({ page, isActive, disabled, children, ...props }) => (
    <Button
      variant={isActive ? 'primary' : 'secondary'}
      size="sm"
      disabled={disabled}
      onClick={() => handlePageClick(page)}
      className={`min-w-[2.5rem] ${isActive ? 'pointer-events-none' : ''}`}
      {...props}
    >
      {children || page}
    </Button>
  );

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>

      {/* Page Info */}
      {showInfo && (
        <div className="text-sm text-gray-600">
          Página <span className="font-medium">{currentPage}</span> de{' '}
          <span className="font-medium">{totalPages}</span>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">

        {/* Previous Button */}
        <PageButton
          page={currentPage - 1}
          disabled={currentPage === 1}
          className="mr-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Anterior</span>
        </PageButton>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <div
                  key={`dots-${index}`}
                  className="flex items-center justify-center min-w-[2.5rem] h-9"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              );
            }

            return (
              <PageButton
                key={page}
                page={page}
                isActive={page === currentPage}
              />
            );
          })}
        </div>

        {/* Next Button */}
        <PageButton
          page={currentPage + 1}
          disabled={currentPage === totalPages}
          className="ml-2"
        >
          <span className="hidden sm:inline mr-1">Próxima</span>
          <ChevronRight className="w-4 h-4" />
        </PageButton>
      </div>

      {/* Quick Navigation */}
      <div className="flex items-center space-x-4 text-sm">

        {/* Go to First */}
        {currentPage > 3 && (
          <button
            onClick={() => handlePageClick(1)}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Primeira página
          </button>
        )}

        {/* Go to Last */}
        {currentPage < totalPages - 2 && (
          <button
            onClick={() => handlePageClick(totalPages)}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Última página
          </button>
        )}
      </div>

      {/* Mobile Navigation - Alternative compact version */}
      <div className="flex sm:hidden items-center justify-between w-full max-w-xs">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handlePageClick(currentPage - 1)}
          className="flex-1 mr-3"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        <span className="text-sm text-gray-600 whitespace-nowrap">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => handlePageClick(currentPage + 1)}
          className="flex-1 ml-3"
        >
          Próxima
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};