import React, { useState } from "react";
import { TinyAPI } from "../services/TinyAPI";
import { useCart } from "../contexts/CartContext";
import { useProducts } from "../hooks/useProducts";
import { Header } from "../components/organisms/Header";
import { SearchAndFilters } from "../components/molecules/SearchAndFilters";
import { ProductGrid } from "../components/organisms/ProductGrid";
import { CartSidebar } from "../components/organisms/CartSidebar";
import { Pagination } from "../components/organisms/Pagination";
import { LoadingSpinner } from "../components/atoms/LoadingSpinner";
import { Button } from "../components/atoms/Button";

export const HomePage = () => {
  // State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  // Hooks
  const { addToCart, getCartItemsCount } = useCart();
  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    searchTerm,
    filters,
    handlePageChange,
    handleSearch,
    handleFilterChange,
    reloadProducts,
    clearFilters,
    getProductDetails,
    hasFilters,
    filteredCount,
  } = useProducts();

  // Handlers
  const handleAddToCart = async (product) => {
    try {
      // Get full product details including images
      const productDetails = await getProductDetails(product.id);
      const fullProduct = productDetails || product;
      addToCart(fullProduct);

      // Optional: Show success feedback
      // Could implement a toast notification here
    } catch (error) {
      console.error("Erro ao adicionar produto ao carrinho:", error);
      // Fallback: add product without full details
      addToCart(product);
    }
  };

  const handleViewDetails = async (productId) => {
    try {
      const details = await getProductDetails(productId);
      if (details) {
        // Here you could open a modal or navigate to product details page
        alert(
          `Detalhes do produto: ${details.nome}\n\nDescrição: ${
            details.descricao_complementar || "Sem descrição"
          }\nCódigo: ${details.codigo || "N/A"}`
        );
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
      alert("Erro ao carregar detalhes do produto");
    }
  };

  const handleToggleFavorite = (productId) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Event handlers for header actions
  const handleSearchClick = () => {
    // Could implement a search modal or focus search input
    const searchInput = document.querySelector('input[placeholder*="Buscar"]');
    if (searchInput) {
      searchInput.focus();
    }
  };

  const handleUserClick = () => {
    // Implement user account logic
    alert("Funcionalidade de usuário em desenvolvimento");
  };

  const handleFavoritesClick = () => {
    // Could implement favorites page/modal
    alert(`Você tem ${favorites.length} produtos favoritos`);
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onCartClick={() => setIsCartOpen(true)}
          cartItemsCount={getCartItemsCount()}
          onSearchClick={handleSearchClick}
          onUserClick={handleUserClick}
          onFavoritesClick={handleFavoritesClick}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Erro ao carregar produtos
              </h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={reloadProducts}>Tentar Novamente</Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Recarregar Página
                </Button>
              </div>
            </div>
          </div>
        </main>

        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        cartItemsCount={getCartItemsCount()}
        onSearchClick={handleSearchClick}
        onUserClick={handleUserClick}
        onFavoritesClick={handleFavoritesClick}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          onSearch={() => handleSearch(searchTerm)}
          filters={filters}
          onFilterChange={handleFilterChange}
          className="mb-6"
        />

        {/* Results Summary */}
        {hasFilters && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800">
                  {filteredCount} produto{filteredCount !== 1 ? "s" : ""}{" "}
                  encontrado{filteredCount !== 1 ? "s" : ""}
                  {searchTerm && ` para "${searchTerm}"`}
                </p>
                {filteredCount === 0 && (
                  <p className="text-sm text-blue-600 mt-1">
                    Tente ajustar seus filtros ou termos de busca
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner size="lg" text="Carregando produtos..." />}

        {/* Products Grid */}
        {!loading && (
          <ProductGrid
            products={products}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
            loading={loading}
            error={error}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        {/* Pagination */}
        {!loading && products.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-8"
          />
        )}

        {/* Empty State for Filtered Results */}
        {!loading && hasFilters && filteredCount === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-6">
                <svg
                  className="w-20 h-20 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 mb-6">
                Não encontramos produtos que correspondam aos seus critérios de
                busca. Tente ajustar os filtros ou usar outros termos.
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={clearFilters}
                  className="w-full sm:w-auto"
                >
                  Limpar todos os filtros
                </Button>
                <p className="text-sm text-gray-500">
                  ou navegue por nossas categorias principais
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Categories - Show when no filters applied */}
        {!loading && !hasFilters && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Explore por Categoria
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Limpeza", value: "limpeza", icon: "🧽", count: 15 },
                {
                  name: "Polimento",
                  value: "polimento",
                  icon: "✨",
                  count: 23,
                },
                {
                  name: "Ferramentas",
                  value: "ferramentas",
                  icon: "🔧",
                  count: 12,
                },
                {
                  name: "Acessórios",
                  value: "acessorios",
                  icon: "🎯",
                  count: 18,
                },
              ].map((category) => (
                <button
                  key={category.value}
                  onClick={() =>
                    handleFilterChange({ category: category.value })
                  }
                  className="p-4 text-center border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="font-medium text-gray-900">
                    {category.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.count} produtos
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Featured/Promotional Banner */}
        {!loading && !hasFilters && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ofertas Especiais Vonixx
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Produtos selecionados com até 30% de desconto + frete grátis
                acima de R$ 150
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleFilterChange({ onSale: true })}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Ver Promoções
              </Button>
            </div>
          </div>
        )}

        {/* Statistics Bar */}
        {!loading && products.length > 0 && (
          <div className="mt-8 bg-gray-800 text-white rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {filteredCount}
                </div>
                <div className="text-sm text-gray-300">
                  Produtos Disponíveis
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {products.filter((p) => p.preco_promocional > 0).length}
                </div>
                <div className="text-sm text-gray-300">Em Promoção</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {getCartItemsCount()}
                </div>
                <div className="text-sm text-gray-300">Itens no Carrinho</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {favorites.length}
                </div>
                <div className="text-sm text-gray-300">Favoritos</div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Top Button */}
        {!loading && products.length > 10 && (
          <div className="fixed bottom-8 right-8 z-30">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-shadow"
              title="Voltar ao topo"
            >
              ↑
            </Button>
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 left-8 flex flex-col gap-3 z-30">
          {/* WhatsApp Contact Button */}
          <Button
            variant="success"
            size="sm"
            onClick={() =>
              window.open(
                "https://wa.me/5551999999999?text=Olá! Preciso de ajuda.",
                "_blank"
              )
            }
            className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-shadow"
            title="Falar no WhatsApp"
          >
            📱
          </Button>

          {/* Favorites Button */}
          <Button
            variant="danger"
            size="sm"
            onClick={handleFavoritesClick}
            className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-shadow relative"
            title="Meus Favoritos"
          >
            ❤️
            {favorites.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {favorites.length > 9 ? "9+" : favorites.length}
              </span>
            )}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Loja Vonixx</h3>
              <p className="text-gray-300 mb-4">
                Produtos de qualidade para detalhamento automotivo.
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                <div>📞 (51) 99999-9999</div>
                <div>📧 contato@lojavonixx.com.br</div>
                <div>📍 Porto Alegre, RS</div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#produtos" className="hover:text-white">
                    Produtos
                  </a>
                </li>
                <li>
                  <a href="#categorias" className="hover:text-white">
                    Categorias
                  </a>
                </li>
                <li>
                  <a href="#promocoes" className="hover:text-white">
                    Promoções
                  </a>
                </li>
                <li>
                  <a href="#sobre" className="hover:text-white">
                    Sobre Nós
                  </a>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Categorias</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button
                    onClick={() => handleFilterChange({ category: "limpeza" })}
                    className="hover:text-white"
                  >
                    Limpeza
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      handleFilterChange({ category: "polimento" })
                    }
                    className="hover:text-white"
                  >
                    Polimento
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      handleFilterChange({ category: "ferramentas" })
                    }
                    className="hover:text-white"
                  >
                    Ferramentas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      handleFilterChange({ category: "acessorios" })
                    }
                    className="hover:text-white"
                  >
                    Acessórios
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Atendimento</h3>
              <div className="space-y-3">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() =>
                    window.open("https://wa.me/5551999999999", "_blank")
                  }
                  className="w-full"
                >
                  📱 WhatsApp
                </Button>
                <p className="text-sm text-gray-300">
                  Segunda a Sexta: 8h às 18h
                  <br />
                  Sábado: 8h às 12h
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Loja Vonixx. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};
