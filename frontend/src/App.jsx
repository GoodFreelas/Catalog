import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";

// Hooks
import { useProducts } from "./hooks/useProducts";
import { useCart } from "./hooks/useCart";
import { useFavorites } from "./hooks/useFavorites";
import { useNotifications } from "./hooks/useNotifications";

// Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import SearchBar from "./components/layout/SearchBar";
import ProductCard from "./components/product/ProductCard";
import ProductDetailModal from "./components/product/ProductDetailModal";
import CartModal from "./components/cart/CartModal";
import FilterModal from "./components/product/FilterModal";
import NotificationContainer from "./components/ui/NotificationContainer";
import Button from "./components/ui/Button";

// Utils
import { SORT_OPTIONS } from "./utils/constants";

function App() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    categoria: "",
    precoMin: "",
    precoMax: "",
    ordenacao: SORT_OPTIONS.NAME_ASC,
    apenasDisponiveis: false,
  });

  // Hooks
  const { products, categories, loading, error } = useProducts();
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    sendToWhatsApp,
    isInCart,
  } = useCart();

  const { favorites, toggleFavorite, isFavorite, getFavoritesCount } =
    useFavorites();

  const { notifications, removeNotification, notifySuccess, notifyError } =
    useNotifications();

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    let filtered = products.filter((product) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        product.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        !filters.categoria ||
        product.categoria?.id.toString() === filters.categoria;

      // Price filters
      const matchesPriceMin =
        !filters.precoMin || product.preco >= parseFloat(filters.precoMin);
      const matchesPriceMax =
        !filters.precoMax || product.preco <= parseFloat(filters.precoMax);

      // Stock filter
      const matchesStock =
        !filters.apenasDisponiveis ||
        (product.estoque > 0 && product.situacao === "A");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPriceMin &&
        matchesPriceMax &&
        matchesStock
      );
    });

    // Sort products
    switch (filters.ordenacao) {
      case SORT_OPTIONS.NAME_ASC:
        filtered.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case SORT_OPTIONS.NAME_DESC:
        filtered.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case SORT_OPTIONS.PRICE_ASC:
        filtered.sort((a, b) => a.preco - b.preco);
        break;
      case SORT_OPTIONS.PRICE_DESC:
        filtered.sort((a, b) => b.preco - a.preco);
        break;
      case SORT_OPTIONS.NEWEST:
        filtered.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  // Check if filters are active
  const hasActiveFilters = () => {
    return (
      filters.categoria ||
      filters.precoMin ||
      filters.precoMax ||
      filters.apenasDisponiveis
    );
  };

  // Event handlers
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleAddToCart = (product, quantity = 1) => {
    try {
      addToCart(product, quantity);
      notifySuccess(`${product.nome} adicionado ao carrinho!`);
    } catch (error) {
      notifyError("Erro ao adicionar produto ao carrinho");
    }
  };

  const handleSendToWhatsApp = (customerInfo) => {
    try {
      sendToWhatsApp(customerInfo);
      notifySuccess("Pedido enviado para o WhatsApp!");
    } catch (error) {
      notifyError(error.message);
      throw error;
    }
  };

  const handleToggleFavorite = (productId) => {
    toggleFavorite(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      if (isFavorite(productId)) {
        notifySuccess(`${product.nome} removido dos favoritos`);
      } else {
        notifySuccess(`${product.nome} adicionado aos favoritos`);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilters((prev) => ({
      ...prev,
      categoria: "",
      precoMin: "",
      precoMax: "",
      apenasDisponiveis: false,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        cartItemCount={getTotalItems()}
        onCartClick={() => setShowCartModal(true)}
        favoritesCount={getFavoritesCount()}
      />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search and Filters */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterClick={() => setShowFilterModal(true)}
            onClearSearch={handleClearSearch}
            hasActiveFilters={hasActiveFilters()}
            resultsCount={filteredProducts.length}
          />

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando produtos...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 font-medium">
                  Erro ao carregar produtos
                </p>
                <p className="text-red-500 text-sm mt-2">{error}</p>
                <p className="text-gray-600 text-sm mt-4">
                  Exibindo produtos de exemplo
                </p>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && (
            <>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={handleViewDetails}
                      onAddToCart={handleAddToCart}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite(product.id)}
                      isInCart={isInCart(product.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">
                    Nenhum produto encontrado
                  </p>
                  <p className="text-gray-400 mb-6">
                    Tente ajustar os filtros ou termo de busca
                  </p>
                  <Button onClick={handleClearSearch} variant="outline">
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedProduct ? isFavorite(selectedProduct.id) : false}
      />

      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getTotalPrice={getTotalPrice}
        sendToWhatsApp={handleSendToWhatsApp}
        clearCart={clearCart}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      {/* Floating Cart Button (Mobile) */}
      {getTotalItems() > 0 && (
        <button
          onClick={() => setShowCartModal(true)}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 md:hidden z-50 transition-colors"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
              {getTotalItems()}
            </span>
          </div>
        </button>
      )}

      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}

export default App;
