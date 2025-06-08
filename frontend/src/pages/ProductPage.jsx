import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Share2,
  Heart,
  Package,
  Shield,
  Truck,
} from "lucide-react";
import Button from "../components/atoms/Button";
import Badge from "../components/atoms/Badge";
import Loading from "../components/atoms/Loading";
import { productService, cacheService } from "../services/api";
import { useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        // Tentar buscar do cache primeiro
        const cachedProduct = cacheService.getProduct(id);

        if (cachedProduct) {
          setProduct(cachedProduct);
          setLoading(false);
          return;
        }

        setLoading(true);
        const data = await productService.getProduct(id);
        setProduct(data);

        // Salvar no cache
        cacheService.setProduct(id, data);
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
        toast.error("Produto não encontrado");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }

    toast.success(
      `${quantity} ${
        quantity > 1 ? "itens adicionados" : "item adicionado"
      } ao carrinho!`
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.nome,
          text: `Confira este produto: ${product.nome}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <Loading centered text="Carregando produto..." />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-16">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Produto não encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              O produto que você está procurando não existe ou foi removido.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasPromotion = product.preco_promocional > 0;
  const finalPrice = hasPromotion ? product.preco_promocional : product.preco;
  const discount = hasPromotion
    ? Math.round(
        ((product.preco - product.preco_promocional) / product.preco) * 100
      )
    : 0;
  const images = product.anexos?.filter((anexo) => anexo.anexo) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-primary-600">
            Início
          </Link>
          <span>/</span>
          {product.categoria && (
            <>
              <span className="hover:text-primary-600">
                {product.categoria}
              </span>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate">
            {product.nome}
          </span>
        </nav>

        {/* Botão Voltar */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos produtos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            {/* Imagem Principal */}
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]?.anexo}
                  alt={product.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-primary-600"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image.anexo}
                      alt={`${product.nome} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.nome}
                  </h1>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.categoria && (
                      <Badge variant="primary">{product.categoria}</Badge>
                    )}
                    {product.marca && (
                      <Badge variant="default">{product.marca}</Badge>
                    )}
                    {hasPromotion && (
                      <Badge variant="danger">-{discount}%</Badge>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={handleShare}
                    className="p-2"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="small" className="p-2">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Preços */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-green-600">
                  R$ {finalPrice.toFixed(2).replace(".", ",")}
                </span>
                {hasPromotion && (
                  <span className="text-xl text-gray-500 line-through">
                    R$ {product.preco.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
            </div>

            {/* Descrição */}
            {product.descricao_complementar && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.descricao_complementar}
                </p>
              </div>
            )}

            {/* Informações Técnicas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Informações do Produto
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {product.codigo && (
                  <div>
                    <span className="text-gray-600">Código:</span>
                    <span className="ml-2 font-medium">{product.codigo}</span>
                  </div>
                )}
                {product.unidade && (
                  <div>
                    <span className="text-gray-600">Unidade:</span>
                    <span className="ml-2 font-medium">{product.unidade}</span>
                  </div>
                )}
                {product.peso_liquido > 0 && (
                  <div>
                    <span className="text-gray-600">Peso:</span>
                    <span className="ml-2 font-medium">
                      {product.peso_liquido}kg
                    </span>
                  </div>
                )}
                {product.garantia && (
                  <div>
                    <span className="text-gray-600">Garantia:</span>
                    <span className="ml-2 font-medium">{product.garantia}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Seletor de Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  Total: R${" "}
                  {(finalPrice * quantity).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              <Button onClick={handleAddToCart} size="large" className="w-full">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho
              </Button>

              <Button
                variant="outline"
                size="large"
                className="w-full"
                onClick={() => {
                  handleAddToCart();
                  // Redirecionar para o carrinho após um pequeno delay
                  setTimeout(() => {
                    window.location.href = "/carrinho";
                  }, 500);
                }}
              >
                Comprar Agora
              </Button>
            </div>

            {/* Informações de Entrega e Garantia */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary-600" />
                  <span className="text-sm text-gray-700">
                    Entrega para todo o Brasil
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Produto original com garantia
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    Embalagem segura e protegida
                  </span>
                </div>
              </div>
            </div>

            {/* Observações */}
            {product.obs && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Observações
                </h3>
                <p className="text-yellow-700 text-sm">{product.obs}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
