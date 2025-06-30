import { useState, useEffect, useRef } from "react";
import {
  Grid,
  List,
  Filter,
  ArrowUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
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

  // Estados para controle de auto-reload
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [showReloadMessage, setShowReloadMessage] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [hasAutoReloaded, setHasAutoReloaded] = useState(false);

  const reloadTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

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

  // Controle de auto-reload quando API está dormindo
  useEffect(() => {
    if (isLoading && !hasAutoReloaded) {
      // Marcar quando começou a carregar
      if (!loadingStartTime) {
        setLoadingStartTime(Date.now());
      }

      // Configurar timeout de 5 segundos
      reloadTimeoutRef.current = setTimeout(() => {
        console.log("API parece estar dormindo, preparando para recarregar...");
        setShowReloadMessage(true);

        // Iniciar countdown
        let timeLeft = 5;
        setCountdown(timeLeft);

        countdownIntervalRef.current = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);

          if (timeLeft <= 0) {
            clearInterval(countdownIntervalRef.current);
            console.log("Recarregando página para acordar a API...");
            setHasAutoReloaded(true);
            window.location.reload();
          }
        }, 1000);
      }, 5000);
    } else if (!isLoading) {
      // Limpar timeouts quando parar de carregar
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
        reloadTimeoutRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      setLoadingStartTime(null);
      setShowReloadMessage(false);
      setCountdown(5);
    }

    // Cleanup
    return () => {
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isLoading, hasAutoReloaded, loadingStartTime]);

  // Marcar que já fez auto-reload no sessionStorage para evitar loops
  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("hasAutoReloaded");
    if (hasReloaded === "true") {
      setHasAutoReloaded(true);
      // Limpar flag após 30 segundos
      setTimeout(() => {
        sessionStorage.removeItem("hasAutoReloaded");
        setHasAutoReloaded(false);
      }, 30000);
    }
  }, []);

  // Marcar no sessionStorage antes de recarregar
  useEffect(() => {
    if (hasAutoReloaded) {
      sessionStorage.setItem("hasAutoReloaded", "true");
    }
  }, [hasAutoReloaded]);

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

  const handleManualReload = () => {
    setHasAutoReloaded(true);
    window.location.reload();
  };

  const cancelAutoReload = () => {
    if (reloadTimeoutRef.current) {
      clearTimeout(reloadTimeoutRef.current);
      reloadTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowReloadMessage(false);
    setCountdown(5);
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

        {/* Mensagem de auto-reload */}
        <AnimatePresence>
          {showReloadMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      API está acordando...
                    </p>
                    <p className="text-xs text-yellow-600">
                      Recarregando automaticamente em {countdown} segundos
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleManualReload}
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    Recarregar agora
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelAutoReload}
                    className="text-yellow-700 hover:bg-yellow-100"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <span className="text-secondary-600">
                {searchTerm ? "Buscando produtos..." : "Carregando produtos..."}
              </span>
              {loadingStartTime && !showReloadMessage && (
                <span className="text-xs text-secondary-500">
                  ({Math.floor((Date.now() - loadingStartTime) / 1000)}s)
                </span>
              )}
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
      </div>
    </div>
  );
};

// Componente de paginação customizada
const Pagination = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Botão Anterior - Apenas com escala no hover */}
      <button
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
        className="disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform duration-200 ease-out"
      >
        <img src={assets.arrowL} alt="Anterior" className="w-8 h-8" />
      </button>

      {/* Indicador de Páginas - Vermelho */}
      <div
        className="px-4 py-2 rounded-full text-sm font-medium text-white"
        style={{ backgroundColor: "#C80F2E" }}
      >
        {currentPage} de {totalPages}
      </div>

      {/* Botão Próxima - Apenas com escala no hover */}
      <button
        disabled={currentPage === totalPages || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
        className="disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform duration-200 ease-out"
      >
        <img src={assets.arrowR} alt="Próxima" className="w-8 h-8" />
      </button>
    </div>
  );
};

export default CatalogPage;
