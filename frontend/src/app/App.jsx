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

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
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

  // Estados simples - sempre mostra intro no carregamento da página
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Debug state
  const [debugKey, setDebugKey] = useState(0);

  // Scroll handler
  const handleScroll = useCallback(() => {
    setShowBackToTop(window.scrollY > 400);
  }, []);

  useEffect(() => {
    if (!showIntro) {
      let timeoutId;
      const debouncedScroll = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleScroll, 100);
      };

      window.addEventListener("scroll", debouncedScroll, { passive: true });
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("scroll", debouncedScroll);
      };
    }
  }, [handleScroll, showIntro]);

  // Handlers do intro
  const handleIntroEnd = () => {
    console.log("🏁 App: intro terminado");

    setIntroFinished(true);
    // Removido sessionStorage - sempre mostra intro no reload

    setTimeout(() => {
      setShowIntro(false);
    }, 500);
  };

  const handleSkipIntro = () => {
    console.log("⏭️ App: intro pulado");
    handleIntroEnd();
  };

  // Debug: forçar intro
  const forceIntro = () => {
    console.log("🔄 Reiniciando intro...");

    // Não precisa mais limpar sessionStorage
    setShowIntro(true);
    setIntroFinished(false);
    setDebugKey((prev) => prev + 1);
  };

  // Outros handlers
  const handleSearch = useCallback((term) => {
    console.log("Search:", term);
  }, []);

  const handleFilterToggle = useCallback(() => {
    openModal("filters");
  }, [openModal]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  console.log("🔄 App render:", { showIntro, introFinished, debugKey });

  return (
    <QueryClientProvider client={queryClient}>
      {/* Intro Video */}
      {showIntro && (
        <IntroVideo
          key={`intro-${debugKey}`}
          onEnd={handleIntroEnd}
          onSkip={handleSkipIntro}
          isFinished={introFinished}
        />
      )}

      {/* Main Content */}
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
            <Header
              onSearch={handleSearch}
              onFilterToggle={handleFilterToggle}
            />

            <main className="pb-6 bg-white">
              <AppRouter />
            </main>

            <CartDrawer />
            <ProductModal />
            <FilterModal />

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

            <AnimatePresence>
              {showBackToTop && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="fixed bottom-6 right-6 z-[9999]"
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
          <Footer />

          {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          )}
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
