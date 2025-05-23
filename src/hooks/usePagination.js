import { useState, useMemo, useCallback, useEffect } from 'react';

export const usePagination = ({
  data = [],
  itemsPerPage = 20,
  initialPage = 1,
  resetOnDataChange = true
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Resetar página quando os dados mudarem (se habilitado)
  useEffect(() => {
    if (resetOnDataChange) {
      setCurrentPage(1);
    }
  }, [data.length, resetOnDataChange]);

  // Calcular informações da paginação
  const paginationInfo = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

    // Se a página atual não é válida, ajustar
    if (validCurrentPage !== currentPage && totalPages > 0) {
      setCurrentPage(validCurrentPage);
    }

    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      totalItems,
      totalPages,
      currentPage: validCurrentPage,
      startIndex,
      endIndex,
      hasNextPage: validCurrentPage < totalPages,
      hasPreviousPage: validCurrentPage > 1,
      startItem: startIndex + 1,
      endItem: endIndex
    };
  }, [data.length, itemsPerPage, currentPage]);

  // Obter os itens da página atual
  const currentPageData = useMemo(() => {
    const { startIndex, endIndex } = paginationInfo;
    return data.slice(startIndex, endIndex);
  }, [data, paginationInfo.startIndex, paginationInfo.endIndex]);

  // Funções de navegação
  const goToPage = useCallback((page) => {
    const targetPage = Math.min(Math.max(1, page), paginationInfo.totalPages || 1);
    setCurrentPage(targetPage);

    // Scroll para o topo suavemente
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [paginationInfo.totalPages]);

  const goToNextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [goToPage, currentPage, paginationInfo.hasNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (paginationInfo.hasPreviousPage) {
      goToPage(currentPage - 1);
    }
  }, [goToPage, currentPage, paginationInfo.hasPreviousPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(paginationInfo.totalPages);
  }, [goToPage, paginationInfo.totalPages]);

  // Função para mudar itens por página
  const changeItemsPerPage = useCallback((newItemsPerPage) => {
    // Calcular em qual item estamos atualmente
    const currentItemIndex = (currentPage - 1) * itemsPerPage;

    // Calcular nova página baseada no item atual
    const newPage = Math.floor(currentItemIndex / newItemsPerPage) + 1;

    setCurrentPage(newPage);
  }, [currentPage, itemsPerPage]);

  // Função para buscar página de um item específico
  const getPageOfItem = useCallback((itemIndex) => {
    return Math.floor(itemIndex / itemsPerPage) + 1;
  }, [itemsPerPage]);

  return {
    // Dados paginados
    currentPageData,

    // Informações da paginação
    ...paginationInfo,
    itemsPerPage,

    // Funções de navegação
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changeItemsPerPage,
    getPageOfItem,

    // Estado
    setCurrentPage
  };
};