import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
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

  // Verifica se o usuário já viu a introdução nesta sessão
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      setShowIntro(false);
      setIntroFinished(true);
    }
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
        <HashRouter>
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
          </div>
          <div className="border-t border-secondary-900"></div>
          {/* Footer global */}
          <Footer />
          {/* React Query Devtools - apenas em desenvolvimento */}
          {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          )}
        </HashRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
