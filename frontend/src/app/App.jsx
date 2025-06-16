import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
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

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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

function App() {
  const { openModal } = useUIStore();
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Verifica se o usuário já viu a introdução nesta sessão
  useEffect(() => {}, []);

  // Detectar scroll para botão "voltar ao topo"
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleIntroEnd = () => {
    setIntroFinished(true);
    sessionStorage.setItem("hasSeenIntro", "true");

    // Delay para permitir a transição suave
    setTimeout(() => {
      setShowIntro(false);
    }, 500);
  };

  const handleSkipIntro = () => {
    handleIntroEnd();
  };

  const handleSearch = (term) => {
    console.log("App received search term:", term);
    // A busca será gerenciada pela navegação para SearchPage
    // Não precisamos fazer nada aqui além de logar
  };

  const handleFilterToggle = () => {
    openModal("filters");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <QueryClientProvider client={queryClient}>
      {/* Vídeo de Introdução */}
      {showIntro && (
        <IntroVideo
          onEnd={handleIntroEnd}
          onSkip={handleSkipIntro}
          isFinished={introFinished}
        />
      )}

      {/* Conteúdo principal do site */}
      <div
        className={`transition-opacity duration-500 ${
          showIntro && !introFinished ? "opacity-0" : "opacity-100"
        }`}
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

            {/* Componentes globais */}
            <CartDrawer />
            <ProductModal />
            <FilterModal />

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#ffffff",
                  color: "#1e293b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  boxShadow: "0 4px 25px -2px rgba(0, 0, 0, 0.1)",
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
              }}
            />

            {/* Botão Voltar ao Topo Global */}
            <AnimatePresence>
              {showBackToTop && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
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
                    className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
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
          {/* React Query Devtools - apenas em desenvolvimento */}
          {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          )}
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
