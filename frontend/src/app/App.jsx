import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppRouter from "./router";
import Header from "../shared/components/organisms/Header/Header";
import CartDrawer from "../features/cart/components/CartDrawer/CartDrawer";
import ProductModal from "../features/catalog/components/ProductModal/ProductModal";
import FilterModal from "../features/catalog/components/FilterModal/FilterModal";
import { useUIStore } from "../core/stores/uiStore";
import Footer from "../shared/components/organisms/Footer/Footer";
import IntroVideo from "./IntroVideo";

// Configuração otimizada do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Reduzido para navegadores lentos
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000), // Timeout menor
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Função para detectar navegadores lentos
const detectSlowEnvironment = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("instagram") ||
    userAgent.includes("fbav") ||
    userAgent.includes("twitter") ||
    userAgent.includes("wv") || // WebView
    navigator.deviceMemory < 4 ||
    (navigator.connection &&
      ["slow-2g", "2g"].includes(navigator.connection.effectiveType))
  );
};

function App() {
  const { openModal } = useUIStore();
  const [showIntro, setShowIntro] = useState(() => {
    // Verifica se deve mostrar intro baseado no ambiente
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    const isSlowEnvironment = detectSlowEnvironment();

    // Em ambientes lentos, permite pular mais facilmente
    if (isSlowEnvironment && hasSeenIntro) {
      return false;
    }

    return !hasSeenIntro;
  });

  const [introFinished, setIntroFinished] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isSlowEnvironment] = useState(detectSlowEnvironment());

  // Otimização: debounce do scroll para performance
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setShowBackToTop(scrollY > 400);
  }, []);

  useEffect(() => {
    let timeoutId;

    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100); // Debounce de 100ms
    };

    if (!showIntro) {
      // Só adiciona listener após intro
      window.addEventListener("scroll", debouncedScroll, { passive: true });
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", debouncedScroll);
    };
  }, [handleScroll, showIntro]);

  const handleIntroEnd = useCallback(() => {
    setIntroFinished(true);
    sessionStorage.setItem("hasSeenIntro", "true");

    // Marca timestamp para controle adicional
    sessionStorage.setItem("introEndTime", Date.now().toString());

    // Delay otimizado baseado no ambiente
    const delay = isSlowEnvironment ? 300 : 500;
    setTimeout(() => {
      setShowIntro(false);
    }, delay);
  }, [isSlowEnvironment]);

  const handleSkipIntro = useCallback(() => {
    handleIntroEnd();
  }, [handleIntroEnd]);

  const handleSearch = useCallback((term) => {
    console.log("App received search term:", term);
    // A busca será gerenciada pela navegação para SearchPage
  }, []);

  const handleFilterToggle = useCallback(() => {
    openModal("filters");
  }, [openModal]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Configuração otimizada do Toaster baseada no ambiente
  const toasterOptions = {
    position: "top-right",
    toastOptions: {
      duration: isSlowEnvironment ? 3000 : 4000, // Duração menor em ambientes lentos
      style: {
        background: "#ffffff",
        color: "#1e293b",
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        fontSize: "0.875rem",
        fontWeight: "500",
        boxShadow: isSlowEnvironment
          ? "0 2px 10px -1px rgba(0, 0, 0, 0.1)" // Shadow mais leve
          : "0 4px 25px -2px rgba(0, 0, 0, 0.1)",
      },
      success: {
        iconTheme: {
          primary: "#22c55e",
          secondary: "#ffffff",
        },
      },
      error: {
        iconTheme: {
          primary: "#ef4444",
          secondary: "#ffffff",
        },
      },
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      {/* Vídeo de Introdução Otimizado */}
      {showIntro && (
        <IntroVideo
          onEnd={handleIntroEnd}
          onSkip={handleSkipIntro}
          isFinished={introFinished}
        />
      )}

      {/* Conteúdo principal do site */}
      <div
        className={`transition-opacity ${
          isSlowEnvironment ? "duration-300" : "duration-500"
        } ${showIntro && !introFinished ? "opacity-0" : "opacity-100"}`}
        style={{
          display: showIntro && !introFinished ? "none" : "block",
        }}
      >
        <BrowserRouter>
          <div className="min-h-screen bg-secondary-50">
            {/* Header global */}
            <Header
              onSearch={handleSearch}
              onFilterToggle={handleFilterToggle}
            />

            {/* Conteúdo principal */}
            <main className="pb-6 bg-white">
              <AppRouter />
            </main>

            {/* Componentes globais - carregamento lazy em ambientes lentos */}
            <CartDrawer />
            <ProductModal />
            <FilterModal />

            {/* Toast notifications otimizadas */}
            <Toaster {...toasterOptions} />

            {/* Botão Voltar ao Topo Otimizado */}
            <AnimatePresence>
              {showBackToTop && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: isSlowEnvironment ? 0.15 : 0.2, // Animação mais rápida
                  }}
                  className="fixed bottom-6 right-6 z-[9999]"
                  style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    zIndex: 9999,
                  }}
                >
                  <button
                    onClick={scrollToTop}
                    className={`bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all ${
                      isSlowEnvironment ? "duration-150" : "duration-200"
                    } flex items-center justify-center`}
                    style={{
                      // Otimização para touch em mobile
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <ArrowUp className="w-6 h-6" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-secondary-900"></div>

          {/* Footer global */}
          <Footer />

          {/* React Query Devtools - apenas em desenvolvimento e não em ambientes lentos */}
          {import.meta.env.DEV && !isSlowEnvironment && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          )}
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
