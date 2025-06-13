import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy loading das páginas
const CatalogPage = lazy(() => import("../features/catalog/pages/CatalogPage"));
// Componente de loading
const PageLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="flex items-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      <span className="text-secondary-600">Carregando...</span>
    </div>
  </div>
);

// Componente de página não encontrada
const NotFoundPage = () => (
  <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-secondary-300 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-secondary-900 mb-2">
        Página não encontrada
      </h2>
      <p className="text-secondary-600 mb-6">
        A página que você está procurando não existe ou foi removida.
      </p>
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Voltar
      </button>
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Página inicial - redireciona para catálogo */}
        <Route path="/" element={<Navigate to="/catalog" replace />} />

        {/* Catálogo de produtos */}
        <Route path="/catalog" element={<CatalogPage />} />

        {/* Página não encontrada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
