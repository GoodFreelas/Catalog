import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { Search, Filter } from "lucide-react";
import {
  fetchProductsFromTiny,
  testTinyConnection,
  debugTinyApiResponse,
  fetchProductWithDetails,
  testApiDirectly,
} from "../services/apiService";

// Produtos de exemplo - movido para fora do componente
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [apiStatus, setApiStatus] = useState("testing");

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
          product.categoria.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.categoria === selectedCategory
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  // Função simplificada para carregar produtos de exemplo
  const loadExampleProducts = () => {
    console.log("📋 Carregando produtos de exemplo");
    setProducts(EXAMPLE_PRODUCTS);
    setApiStatus("failed");
  };

  // Função para buscar produtos da API
  const fetchProducts = async () => {
    try {
      const result = await fetchProductsFromTiny();

      if (result.success && result.products.length > 0) {
        setProducts(result.products);
        setApiStatus("connected");
        console.log(`🎉 ${result.products.length} produtos carregados da API!`);
      } else {
        console.log("⚠️ Fallback para produtos de exemplo");
        loadExampleProducts();
      }
    } catch (error) {
      console.error("❌ Erro ao carregar produtos:", error);
      loadExampleProducts();
    }
  };

  // Função principal de inicialização
  const initializeProducts = async () => {
    setLoading(true);
    console.log("🔄 Inicializando catálogo de produtos...");

    const isConnected = await testTinyConnection();

    if (isConnected) {
      console.log("✅ API do Tiny conectada!");
      await fetchProducts();
    } else {
      console.log("❌ API do Tiny não conectada, usando produtos de exemplo");
      loadExampleProducts();
    }

    setLoading(false);
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
    console.log("🐛 Iniciando debug da API...");
    console.log("=====================================");

    // Teste 1: Teste direto
    console.log("1️⃣ Testando API diretamente...");
    await testApiDirectly();

    console.log("=====================================");

    // Teste 2: Teste de conexão normal
    console.log("2️⃣ Testando conexão normal...");
    const isConnected = await testTinyConnection();
    console.log("Resultado:", isConnected);

    console.log("=====================================");

    // Teste 3: Se conectou, tentar buscar produtos
    if (isConnected) {
      console.log("3️⃣ Tentando buscar produtos...");
      await debugTinyApiResponse();
    }

    console.log("=====================================");
    console.log("🐛 Debug concluído - verifique os logs acima");
  };

  // Componente para o indicador de status da API
  const ApiStatusIndicator = () => {
    const statusConfig = {
      connected: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "🟢 API Conectada",
      },
      failed: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "🟡 Modo Exemplo",
      },
      testing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "🔵 Testando...",
      },
    };

    const config = statusConfig[apiStatus];

    return (
      <div className="flex items-center gap-2">
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
        >
          {config.label}
        </div>
        {/* Botão de debug apenas em desenvolvimento */}
        {import.meta.env.DEV && (
          <button
            onClick={handleDebugApi}
            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
            title="Debug API (apenas desenvolvimento)"
          >
            🐛 Debug
          </button>
        )}
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
      <p className="text-gray-600">
        Tente ajustar seus filtros ou termo de busca
      </p>
    </div>
  );

  // Effect para inicializar produtos
  useEffect(() => {
    initializeProducts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner message="Carregando produtos e imagens..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nossos Produtos
            </h1>
            <p className="text-gray-600">
              Encontre os melhores produtos com qualidade garantida
            </p>
          </div>
          <ApiStatusIndicator />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          {filteredProducts.length} produto
          {filteredProducts.length !== 1 ? "s" : ""} encontrado
          {filteredProducts.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewProduct={handleViewProduct}
            />
          ))}
        </div>
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
