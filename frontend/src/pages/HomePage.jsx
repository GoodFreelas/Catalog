import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Package, Users } from "lucide-react";
import Button from "../components/atoms/Button";
import Loading, { ProductGridSkeleton } from "../components/atoms/Loading";
import ProductCard from "../components/molecules/ProductCard";
import SearchFilters from "../components/molecules/SearchFilters";
import { productService, cacheService } from "../services/api";
import toast from "react-hot-toast";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    search: "",
    categoria: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "nome",
    sortOrder: "asc",
  });

  // Carregar produtos
  const loadProducts = useCallback(async (currentFilters) => {
    try {
      // Tentar buscar do cache primeiro
      const cacheKey = `home_${JSON.stringify(currentFilters)}`;
      const cachedData = cacheService.getProducts(cacheKey);

      if (cachedData) {
        setProducts(cachedData.products || []);
        setPagination(cachedData.pagination || null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await productService.getProducts(currentFilters);

      setProducts(data.products || []);
      setPagination(data.pagination || null);

      // Salvar no cache
      cacheService.setProducts(cacheKey, data, 15); // Cache por 15 minutos
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    try {
      const cachedStats = cacheService.getProducts("stats");

      if (cachedStats) {
        setStats(cachedStats);
        return;
      }

      const data = await productService.getStats();
      setStats(data);

      // Cache por 1 hora
      cacheService.setProducts("stats", data, 60);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  }, []);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    loadProducts(filters);
    loadStats();
  }, [loadProducts, loadStats]);

  // Manipular mudanças nos filtros
  const handleFiltersChange = useCallback(
    (newFilters) => {
      const updatedFilters = {
        ...filters,
        ...newFilters,
        page: 1, // Resetar para primeira página ao filtrar
      };
      setFilters(updatedFilters);
      loadProducts(updatedFilters);
    },
    [filters, loadProducts]
  );

  // Carregar mais produtos (paginação)
  const handleLoadMore = () => {
    const nextPage = filters.page + 1;
    const updatedFilters = { ...filters, page: nextPage };
    setFilters(updatedFilters);

    // Para load more, vamos anexar os produtos
    const loadMoreProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts(updatedFilters);

        setProducts((prev) => [...prev, ...(data.products || [])]);
        setPagination(data.pagination || null);
      } catch (error) {
        console.error("Erro ao carregar mais produtos:", error);
        toast.error("Erro ao carregar mais produtos");
      } finally {
        setLoading(false);
      }
    };

    loadMoreProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Encontre os Melhores Produtos
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 animate-slide-in">
              Catálogo completo com preços competitivos e qualidade garantida.
              Sua experiência de compra começa aqui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-bounce-in">
              <Button
                size="large"
                variant="secondary"
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Ver Produtos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="large"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                Explorar Categorias
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      {stats && (
        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.totalProducts.toLocaleString()}
                </h3>
                <p className="text-gray-600">Produtos Disponíveis</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.totalCategories}
                </h3>
                <p className="text-gray-600">Categorias</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  R$ {stats.priceRange?.minPrice?.toFixed(2) || "0,00"}
                </h3>
                <p className="text-gray-600">A partir de</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Seção de Produtos */}
      <section className="py-12">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nossos Produtos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubra nossa seleção cuidadosamente escolhida de produtos de
              alta qualidade
            </p>
          </div>

          {/* Filtros de Pesquisa */}
          <SearchFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />

          {/* Grid de Produtos */}
          {loading && products.length === 0 ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product.tinyId} product={product} />
                ))}
              </div>

              {/* Mensagem quando não há produtos */}
              {!loading && products.length === 0 && (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Tente ajustar os filtros de pesquisa ou remover alguns
                    critérios
                  </p>
                  <Button onClick={() => handleFiltersChange({})}>
                    Limpar Filtros
                  </Button>
                </div>
              )}

              {/* Botão Carregar Mais */}
              {pagination && pagination.hasNextPage && (
                <div className="text-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    loading={loading}
                    size="large"
                    variant="outline"
                  >
                    Carregar Mais Produtos
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Mostrando {products.length} de {pagination.totalProducts}{" "}
                    produtos
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
