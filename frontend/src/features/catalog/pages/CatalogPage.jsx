import { useState, useEffect } from "react";
import {
  Grid,
  List,
  Filter,
  ArrowUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import clsx from "clsx";

import Button from "../../../shared/components/atoms/Button/Button";
import ProductCard from "../../../shared/components/molecules/ProductCard/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { useUIStore } from "../../../core/stores/uiStore";
import { PAGINATION } from "../../../core/constants/api";
import { assets } from "../../../assets";

const CatalogPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { filters, searchTerm, isMobile, openModal, setLoading, clearSearch } =
    useUIStore();

  // Query dos produtos
  const {
    data: productsData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useProducts({
    params: {
      page,
      limit: isMobile ? PAGINATION.MOBILE_LIMIT : PAGINATION.DEFAULT_LIMIT,
      search: searchTerm,
    },
    onError: (error) => {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos. Tente novamente.");
    },
  });

  // Atualizar loading global
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Detectar scroll para botão "voltar ao topo"
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Resetar página quando filtros ou busca mudarem
  useEffect(() => {
    setPage(1);
  }, [filters, searchTerm]);

  const handleFilterToggle = () => {
    openModal("filters");
  };

  const handleProductView = (product) => {
    openModal("productDetail", { productId: product.id });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  // Estados de carregamento e erro
  if (isError) {
    return (
      <div
        className="min-h-screen transition-all duration-300"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-secondary-900 mb-2">
              Ops! Algo deu errado
            </h2>
            <p className="text-secondary-600 mb-6">
              {error?.message || "Erro ao carregar produtos"}
            </p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    );
  }

  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination || {};
  const stats = productsData?.data?.stats || {};

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="container mx-auto px-4 py-6">
        {/* Header da página */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
          {/* Título e estatísticas */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-2">
              {searchTerm ? "Resultados da busca" : ""}
            </h1>
          </div>

          {/* Controles de visualização */}
          <div className="flex items-center gap-3">
            {/* Seletor de modo de visualização */}
            <div className="hidden md:flex items-center bg-secondary-100 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3 py-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3 py-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="text-secondary-600">
                {searchTerm ? "Buscando produtos..." : "Carregando produtos..."}
              </span>
            </div>
          </div>
        )}

        {/* Lista de produtos */}
        {!isLoading && (
          <>
            {products.length === 0 ? (
              // Estado vazio
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {searchTerm
                    ? "Nenhum produto encontrado"
                    : "Nenhum produto disponível"}
                </h3>
                <p className="text-secondary-600 mb-6">
                  {searchTerm
                    ? `Não encontramos produtos para "${searchTerm}". Tente buscar com outros termos.`
                    : "Não há produtos disponíveis no momento"}
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={handleClearSearch}>
                    Limpar busca
                  </Button>
                )}
              </div>
            ) : (
              // Grid de produtos
              <motion.div
                layout
                className={clsx(
                  "grid gap-4 lg:gap-6",
                  viewMode === "grid"
                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                    : "grid-cols-1"
                )}
              >
                <AnimatePresence mode="popLayout">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard
                        product={product}
                        onViewDetails={handleProductView}
                        className={clsx({
                          "flex flex-row": viewMode === "list",
                        })}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Paginação Customizada */}
            {pagination.total_pages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.total_pages}
                  onPageChange={handlePageChange}
                  isLoading={isFetching}
                />
              </div>
            )}
          </>
        )}

        {/* Botão voltar ao topo */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-6 right-6 z-30"
            >
              <Button
                variant="primary"
                size="sm"
                onClick={scrollToTop}
                className="rounded-full p-3 shadow-strong"
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Componente de paginação customizada
const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Botão Anterior - Amarelo */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
        className="border-none"
      >
        <img src={assets.arrowL} alt="Anterior" className="w-8 h-8" />
      </Button>

      {/* Indicador de Páginas - Vermelho */}
      <div
        className="px-4 py-2 rounded-full text-sm font-medium text-white"
        style={{ backgroundColor: "#C80F2E" }}
      >
        {currentPage} de {totalPages}
      </div>

      {/* Botão Próxima - Verde */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
        className="border-none"
      >
        <img src={assets.arrowR} alt="Próxima" className="w-8 h-8" />
      </Button>
    </div>
  );
};

export default CatalogPage;
