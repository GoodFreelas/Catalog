import { BrowserRouter, HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Toaster } from "react-hot-toast";

import AppRouter from "./router";
import Header from "../shared/components/organisms/Header/Header";
import CartDrawer from "../features/cart/components/CartDrawer/CartDrawer";
import { useUIStore } from "../core/stores/uiStore";

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
  const { searchTerm, setSearchTerm } = useUIStore();

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterToggle = () => {
    // Implementar abertura do modal de filtros
    console.log("Toggle filters");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <div className="min-h-screen bg-secondary-50">
          {/* Header global */}
          <Header onSearch={handleSearch} onFilterToggle={handleFilterToggle} />

          {/* Conteúdo principal */}
          <main className="pb-6">
            <AppRouter />
          </main>

          {/* Carrinho lateral */}
          <CartDrawer />

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

        {/* React Query Devtools - apenas em desenvolvimento */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
