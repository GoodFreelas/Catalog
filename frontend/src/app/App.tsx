// React & React Hooks
import { useState, useEffect, useCallback } from 'react';

// External Libraries
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Internal Components
import AppRouter from './router';
import Header from '../shared/components/organisms/Header/Header';
import CartDrawer from '../features/cart/components/CartDrawer/CartDrawer';
import ProductModal from '../features/catalog/components/ProductModal/ProductModal';
import FilterModal from '../features/catalog/components/FilterModal/FilterModal';
import Footer from '../shared/components/organisms/Footer/Footer';
import IntroVideo from './IntroVideo';

// Stores & Hooks
import { useUIStore } from '../core/stores/uiStore';

// Types
import { AppProps, AppState, QueryClientConfig, ToasterConfig } from '../types/app';

// ================================
// Constants & Configurations
// ================================

const QUERY_CLIENT_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 15000),
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
};

const TOASTER_CONFIG: ToasterConfig = {
  position: 'top-right',
  toastOptions: {
    duration: 4000,
    style: {
      background: '#ffffff',
      color: '#1e293b',
      border: '1px solid #e2e8f0',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      boxShadow: '0 4px 25px -2px rgba(0, 0, 0, 0.1)',
    },
    success: {
      iconTheme: {
        primary: '#22c55e',
        secondary: '#ffffff',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
    },
  },
};

// ================================
// Helper Functions
// ================================

const createQueryClient = (): QueryClient => new QueryClient(QUERY_CLIENT_CONFIG);

/**
 * Componente principal da aplicação.
 * Gerencia o estado global da UI, intro video, e layout principal.
 */
const App: React.FC<AppProps> = () => {
  const { openModal } = useUIStore();

  // ================================
  // State Management
  // ================================

  // Estados do intro video - sempre mostra intro no carregamento da página
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [introFinished, setIntroFinished] = useState<boolean>(false);
  
  // Estado do botão back to top
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  
  // Debug state para forçar re-render do intro
  const [debugKey, setDebugKey] = useState<number>(0);

  // ================================
  // Event Handlers
  // ================================

  /**
   * Handler para scroll da página - controla visibilidade do botão back to top
   */
  const handleScroll = useCallback((): void => {
    setShowBackToTop(window.scrollY > 400);
  }, []);

  /**
   * Handler para finalização do intro video
   */
  const handleIntroEnd = useCallback((): void => {
    setIntroFinished(true);
    
    // Delay para transição suave
    setTimeout(() => {
      setShowIntro(false);
    }, 500);
  }, []);

  /**
   * Handler para pular o intro video
   */
  const handleSkipIntro = useCallback((): void => {
    handleIntroEnd();
  }, [handleIntroEnd]);

  /**
   * Handler para busca de produtos
   */
  const handleSearch = useCallback((term: string): void => {
    // TODO: Implementar lógica de busca
  }, []);

  /**
   * Handler para toggle do modal de filtros
   */
  const handleFilterToggle = useCallback((): void => {
    openModal('filters');
  }, [openModal]);

  /**
   * Handler para scroll suave para o topo
   */
  const scrollToTop = useCallback((): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ================================
  // Effects
  // ================================

  useEffect(() => {
    if (!showIntro) {
      let timeoutId: NodeJS.Timeout;
      
      const debouncedScroll = (): void => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleScroll, 100);
      };

      window.addEventListener('scroll', debouncedScroll, { passive: true });
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', debouncedScroll);
      };
    }
  }, [handleScroll, showIntro]);

  // ================================
  // Early Returns
  // ================================

  // Early return se ainda estiver no intro
  if (showIntro && !introFinished) {
    return (
      <QueryClientProvider client={createQueryClient()}>
        <IntroVideo
          key={`intro-${debugKey}`}
          onEnd={handleIntroEnd}
          onSkip={handleSkipIntro}
          isFinished={introFinished}
        />
      </QueryClientProvider>
    );
  }

  // ================================
  // Main JSX
  // ================================

  return (
    <QueryClientProvider client={createQueryClient()}>
      <div
        className={`transition-opacity duration-500 ${
          showIntro && !introFinished ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          display: showIntro && !introFinished ? 'none' : 'block',
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

            {/* Modals */}
            <CartDrawer />
            <ProductModal />
            <FilterModal />

            {/* Toast Notifications */}
            <Toaster {...TOASTER_CONFIG} />

            {/* Back to Top Button */}
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
                    aria-label="Voltar ao topo"
                  >
                    <ArrowUp className="w-6 h-6" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-secondary-900"></div>
          <Footer />

          {/* React Query DevTools - apenas em desenvolvimento */}
          {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          )}
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
};

export default App;
