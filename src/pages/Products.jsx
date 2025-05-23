import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import PaginationStats from "../components/PaginationStats";
import {
  Search,
  Filter,
  RefreshCw,
  Database,
  Wifi,
  WifiOff,
  Grid,
  List,
  Eye,
  Plus,
  Package,
} from "lucide-react";
import { usePagination } from "../hooks/usePagination";
import { useCart } from "../context/CartContext";
import {
  fetchProductsFromTiny,
  testTinyConnection,
  getCacheInfo,
  clearCache,
  shouldUpdateCache,
  getApiStatus,
} from "../services/apiService";

// Produtos de exemplo - mantidos como fallback
const EXAMPLE_PRODUCTS = [
  {
    id: "1",
    nome: "Smartphone Galaxy A54",
    preco: 1299.9,
    descricao:
      'Smartphone Samsung Galaxy A54 5G com tela de 6.4", 128GB de armazenamento, câmera tripla de 50MP e bateria de 5000mAh.',
    codigo: "SMAR001",
    unidade: "UN",
    peso: "0.2",
    imagens: [],
    categoria: "Eletrônicos",
  },
  {
    id: "2",
    nome: "Notebook Lenovo IdeaPad",
    preco: 2499.9,
    descricao:
      'Notebook Lenovo IdeaPad 3 com processador Intel Core i5, 8GB RAM, SSD 256GB e tela de 15.6".',
    codigo: "NOTE001",
    unidade: "UN",
    peso: "2.1",
    imagens: [],
    categoria: "Eletrônicos",
  },
  {
    id: "3",
    nome: "Cafeteira Elétrica Philco",
    preco: 129.9,
    descricao:
      "Cafeteira elétrica Philco com capacidade para 15 xícaras, sistema corta-pingos e placa aquecedora.",
    codigo: "CAFE001",
    unidade: "UN",
    peso: "1.5",
    imagens: [],
    categoria: "Casa",
  },
  {
    id: "4",
    nome: "Tênis Nike Air Max",
    preco: 399.9,
    descricao:
      "Tênis Nike Air Max com tecnologia de amortecimento, design moderno e conforto para o dia a dia.",
    codigo: "TENI001",
    unidade: "PAR",
    peso: "0.8",
    imagens: [],
    categoria: "Esportes",
  },
  {
    id: "5",
    nome: 'Smart TV LG 43"',
    preco: 1899.9,
    descricao:
      'Smart TV LG 43" 4K UHD com WebOS, HDR10 e controle remoto com inteligência artificial.',
    codigo: "TV001",
    unidade: "UN",
    peso: "12.5",
    imagens: [],
    categoria: "Eletrônicos",
  },
  {
    id: "6",
    nome: "Kit Panelas Tramontina",
    preco: 299.9,
    descricao:
      "Kit com 5 panelas Tramontina em alumínio antiaderente com cabo ergonômico e tampa de vidro.",
    codigo: "PANE001",
    unidade: "KIT",
    peso: "3.2",
    imagens: [],
    categoria: "Casa",
  },
];

const EXAMPLE_CATEGORIES = ["Eletrônicos", "Casa", "Esportes"];

const Products = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [apiStatus, setApiStatus] = useState("testing");
  const [dataSource, setDataSource] = useState("loading");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [cacheInfo, setCacheInfo] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [viewMode, setViewMode] = useState("grid"); // "grid" ou "list"

  // Derivar categorias dos produtos usando useMemo
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((p) => p.categoria))];
    return uniqueCategories.length > 0 ? uniqueCategories : EXAMPLE_CATEGORIES;
  }, [products]);

  // Filtrar produtos usando useMemo para melhor performance
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.nome.toLowerCase().includes(searchLower) ||
          product.codigo.toLowerCase().includes(searchLower) ||
          product.categoria.toLowerCase().includes(searchLower) ||
          (product.marca && product.marca.toLowerCase().includes(searchLower))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.categoria === selectedCategory
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  // Hook de paginação
  const {
    currentPageData,
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
  } = usePagination({
    data: filteredProducts,
    itemsPerPage,
    initialPage: 1,
    resetOnDataChange: true,
  });

  // Função simplificada para carregar produtos de exemplo
  const loadExampleProducts = () => {
    console.log("📋 Carregando produtos de exemplo");
    setProducts(EXAMPLE_PRODUCTS);
    setApiStatus("failed");
    setDataSource("example");
  };

  // Função para buscar produtos da API com gerenciamento de cache
  const fetchProducts = async (forceRefresh = false) => {
    try {
      setRefreshing(forceRefresh);

      const result = await fetchProductsFromTiny(forceRefresh);

      if (result.success && result.products.length > 0) {
        setProducts(result.products);
        setApiStatus("connected");
        setDataSource(result.fromCache ? "cache" : "api");

        if (!result.fromCache) {
          setLastUpdate(new Date().toISOString());
        }

        console.log(
          `🎉 ${result.products.length} produtos carregados ${
            result.fromCache ? "do cache" : "da API"
          }!`
        );

        if (result.hasError) {
          console.warn(
            "⚠️ Dados do cache usados devido a erro na API:",
            result.error
          );
        }
      } else {
        console.log("⚠️ Fallback para produtos de exemplo");
        loadExampleProducts();
      }
    } catch (error) {
      console.error("❌ Erro ao carregar produtos:", error);
      loadExampleProducts();
    } finally {
      setRefreshing(false);
    }
  };

  // Função principal de inicialização
  const initializeProducts = async () => {
    setLoading(true);
    console.log("🔄 Inicializando catálogo de produtos...");

    // Verificar informações do cache
    const cache = getCacheInfo();
    setCacheInfo(cache);

    // Verificar se deve usar cache ou fazer nova requisição
    const shouldUpdate = shouldUpdateCache();

    if (!shouldUpdate && cache.hasProducts) {
      console.log("📋 Usando produtos do cache existente");
      await fetchProducts(false); // Usar cache
    } else {
      console.log("🔄 Cache expirado ou inexistente, buscando da API");
      const isConnected = await testTinyConnection();

      if (isConnected) {
        console.log("✅ API do Tiny conectada!");
        await fetchProducts(true); // Forçar busca da API
      } else {
        console.log("❌ API do Tiny não conectada, tentando cache ou exemplos");
        await fetchProducts(false); // Tentar cache primeiro
      }
    }

    setLoading(false);
  };

  // Função para forçar atualização
  const handleForceRefresh = async () => {
    console.log("🔄 Forçando atualização dos produtos...");
    await fetchProducts(true);

    // Atualizar informações do cache
    const cache = getCacheInfo();
    setCacheInfo(cache);
  };

  // Função para limpar cache
  const handleClearCache = () => {
    clearCache();
    setCacheInfo(getCacheInfo());
    console.log("🧹 Cache limpo! Recarregue a página para buscar dados novos.");
  };

  // Handlers para o modal
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Função para debugar a API (apenas desenvolvimento)
  const handleDebugApi = async () => {
    console.log("🐛 Iniciando debug da API e cache...");
    console.log("=====================================");

    // Informações do cache
    const cache = getCacheInfo();
    console.log("📋 Informações do cache:", cache);

    // Status da API
    const status = await getApiStatus();
    console.log("📡 Status da API:", status);

    console.log("=====================================");
    console.log("🐛 Debug concluído - verifique os logs acima");
  };

  // Componente para o indicador de status
  const StatusIndicator = () => {
    const getStatusConfig = () => {
      switch (dataSource) {
        case "api":
          return {
            icon: <Wifi className="h-4 w-4" />,
            bg: "bg-green-100",
            text: "text-green-800",
            label: "API Conectada",
            description: "Dados atualizados da API",
          };
        case "cache":
          return {
            icon: <Database className="h-4 w-4" />,
            bg: "bg-blue-100",
            text: "text-blue-800",
            label: "Cache Local",
            description: "Dados salvos localmente",
          };
        case "example":
          return {
            icon: <WifiOff className="h-4 w-4" />,
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            label: "Modo Exemplo",
            description: "Usando dados de demonstração",
          };
        default:
          return {
            icon: <RefreshCw className="h-4 w-4 animate-spin" />,
            bg: "bg-gray-100",
            text: "text-gray-800",
            label: "Carregando...",
            description: "Verificando fontes de dados",
          };
      }
    };

    const config = getStatusConfig();

    return (
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} ${config.text}`}
        >
          {config.icon}
          <div className="flex flex-col">
            <span className="text-sm font-medium">{config.label}</span>
            <span className="text-xs opacity-75">{config.description}</span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleForceRefresh}
            disabled={refreshing}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar dados"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>

          {cacheInfo.hasProducts && (
            <button
              onClick={handleClearCache}
              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
              title="Limpar cache"
            >
              <Database className="h-4 w-4" />
            </button>
          )}

          {/* Botão de debug apenas em desenvolvimento */}
          {import.meta.env.DEV && (
            <button
              onClick={handleDebugApi}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
              title="Debug API e Cache"
            >
              🐛
            </button>
          )}
        </div>
      </div>
    );
  };

  // Componente para estatísticas do cache
  const CacheStats = () => {
    if (!cacheInfo.hasProducts) return null;

    return (
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Cache:{" "}
              {cacheInfo.storageType === "localStorage"
                ? "Navegador"
                : "Memória"}
            </span>
            {cacheInfo.cacheSizeKB && (
              <span className="text-gray-600">
                Tamanho: {cacheInfo.cacheSizeKB}KB
              </span>
            )}
            {lastUpdate && (
              <span className="text-gray-600">
                Atualizado: {new Date(lastUpdate).toLocaleString()}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {products.length} produtos carregados
          </div>
        </div>
      </div>
    );
  };

  // Componente para exibir quando não há produtos
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Search className="h-16 w-16 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Nenhum produto encontrado
      </h3>
      <p className="text-gray-600 mb-4">
        Tente ajustar seus filtros ou termo de busca
      </p>
      {searchTerm || selectedCategory ? (
        <button
          onClick={() => {
            setSearchTerm("");
            setSelectedCategory("");
          }}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Limpar filtros
        </button>
      ) : null}
    </div>
  );

  // Effect para inicializar produtos
  useEffect(() => {
    initializeProducts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner message="Carregando produtos e verificando cache..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nossos Produtos
            </h1>
            <p className="text-gray-600">
              Encontre os melhores produtos com qualidade garantida
            </p>
          </div>
          <StatusIndicator />
        </div>

        <CacheStats />

        {/* Pagination Stats */}
        <PaginationStats
          totalItems={products.length}
          filteredItems={filteredProducts.length}
          currentPageItems={currentPageData.length}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          hasFilters={!!(searchTerm || selectedCategory)}
          viewMode={viewMode}
        />
      </div>

      {/* Filters and Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Items per page */}
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              title="Visualização em grade"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              title="Visualização em lista"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Results summary and active filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {filteredProducts.length} produto
              {filteredProducts.length !== 1 ? "s" : ""} encontrado
              {filteredProducts.length !== 1 ? "s" : ""}
            </span>
            {totalPages > 1 && (
              <span>
                Página {currentPage} de {totalPages}
              </span>
            )}
          </div>

          {(searchTerm || selectedCategory) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Filtros ativos:</span>
              {searchTerm && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                  "{searchTerm}"
                </span>
              )}
              {selectedCategory && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                  {selectedCategory}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                className="text-red-600 hover:text-red-700 text-xs underline ml-2"
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid/List */}
      {currentPageData.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentPageData.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={handleViewProduct}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {currentPageData.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-6">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {product.imagens && product.imagens.length > 0 ? (
                        <img
                          src={
                            product.imagens[0].url ||
                            product.imagens[0].anexo ||
                            product.imagens[0]
                          }
                          alt={product.nome}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {product.nome}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            Código: {product.codigo} | Categoria:{" "}
                            {product.categoria}
                          </p>
                          {product.descricao && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {product.descricao}
                            </p>
                          )}
                        </div>

                        {/* Price and Actions */}
                        <div className="flex flex-col items-end gap-3 ml-4">
                          <div className="text-right">
                            {product.preco_promocional &&
                            product.preco_promocional < product.preco ? (
                              <>
                                <p className="text-sm text-gray-400 line-through">
                                  R$ {product.preco.toFixed(2)}
                                </p>
                                <p className="text-xl font-bold text-red-600">
                                  R$ {product.preco_promocional.toFixed(2)}
                                </p>
                              </>
                            ) : (
                              <p className="text-xl font-bold text-blue-600">
                                R$ {product.preco.toFixed(2)}
                              </p>
                            )}
                            {product.unidade && (
                              <p className="text-xs text-gray-500">
                                por {product.unidade}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                            >
                              <Eye className="h-4 w-4 inline mr-1" />
                              Ver
                            </button>
                            <button
                              onClick={() => addToCart(product)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Plus className="h-4 w-4 inline mr-1" />
                              Adicionar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={goToPage}
          />
        </>
      )}

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Products;
