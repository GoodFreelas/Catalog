// React & React Hooks
import { Suspense, lazy } from 'react';

// React Router
import { Routes, Route } from 'react-router-dom';

// External Libraries
import { Loader2 } from 'lucide-react';

// Types
import { LoadingProps } from '../types/components';

// ================================
// Lazy Loading das Páginas
// ================================

const CatalogPage = lazy(() => import('../features/catalog/pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('../features/catalog/pages/ProductDetailPage'));
const CartPage = lazy(() => import('../features/cart/pages/CartPage'));

// ================================
// Componentes de Loading
// ================================

/**
 * Componente de loading para páginas lazy-loaded
 */
const PageLoader: React.FC<LoadingProps> = ({ text = 'Carregando...' }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="flex items-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      <span className="text-secondary-600">{text}</span>
    </div>
  </div>
);

// ================================
// Páginas de Erro
// ================================

/**
 * Componente de página não encontrada (404)
 */
const NotFoundPage: React.FC = () => (
  <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-secondary-300 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-secondary-900 mb-2">
        Página não encontrada
      </h2>
      <p className="text-secondary-600 mb-6">
        A página que você está procurando não existe ou foi removida.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={() => (window.location.href = "/#/catalog")}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Ir para o Catálogo
        </button>
      </div>
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Catálogo de produtos */}
        <Route path="/" element={<CatalogPage />} />

        {/* Detalhes do produto */}
        <Route path="/product/:id" element={<ProductDetailPage />} />

        {/* Página do carrinho */}
        <Route path="/cart" element={<CartPage />} />

        {/* Página não encontrada - deve ser a última rota */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
