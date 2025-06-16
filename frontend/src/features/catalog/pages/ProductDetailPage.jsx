import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  ZoomIn,
  Package,
  Tag,
  Calendar,
  ImageIcon,
  Minus,
  Plus,
  Check,
  AlertCircle,
  X,
  ArrowRight,
  Hash,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import clsx from "clsx";

import Button from "../../../shared/components/atoms/Button/Button";
import { useProduct } from "../hooks/useProducts";
import { useCartStore } from "../../../core/stores/cartStore";
import {
  formatCurrency,
  formatDate,
  truncateText,
} from "../../../core/utils/formatters";
import { assets } from "../../../assets"; // Importa o assets

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const {
    data: productData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(id);

  const { addItem, getItemQuantity, isInCart, openCart } = useCartStore();

  const product = productData?.data?.product;
  const metadata = productData?.data?.metadata;
  const cartQuantity = getItemQuantity(id);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem(product, quantity);
    toast.success(
      `${quantity}x ${truncateText(product.nome, 30)} adicionado ao carrinho!`,
      { duration: 3000 }
    );
  };

  const handleBuyNow = () => {
    if (!product) return;

    addItem(product, quantity);
    openCart();
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Confira este produto: ${product?.nome}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: product?.nome, text, url });
      } catch (error) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado para área de transferência!");
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  // Processar descrição HTML
  const getDescriptionText = (htmlDescription) => {
    if (!htmlDescription) return null;

    // Remove tags HTML e converte entidades
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlDescription;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Processar keywords
  const getKeywords = (keywords) => {
    if (!keywords) return [];
    return keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  };

  const images = product?.anexos || [];
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[selectedImageIndex]?.anexo : null;
  const description = getDescriptionText(product?.descricao_complementar);
  const keywords = getKeywords(product?.seo_keywords);

  // Estados de loading e erro
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div
        className="min-h-screen transition-all duration-300"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-error-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-secondary-900 mb-2">
              Produto não encontrado
            </h2>
            <p className="text-secondary-600 mb-6">
              {error?.message ||
                "O produto que você está procurando não existe ou foi removido."}
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-sm text-secondary-500">ID do produto: {id}</p>
              <p className="text-sm text-secondary-500">
                Erro: {JSON.stringify(error)}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleBack}>
                Voltar
              </Button>
              <Button onClick={() => navigate("/catalog")}>Ver catálogo</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isActive = product.situacao === "A";
  const hasPromotion =
    product.preco_promocional &&
    parseFloat(product.preco_promocional) > 0 &&
    parseFloat(product.preco_promocional) < parseFloat(product.preco);

  return (
    <div
      className="min-h-screen transition-all duration-300"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="container mx-auto px-4 py-6">
        {/* Header com navegação */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            leftIcon={<ArrowLeft />}
          >
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-2"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-secondary-600 mb-6">
          <span>Início</span>
          <span>/</span>
          <span>Produtos</span>
          {product.categoria && (
            <>
              <span>/</span>
              <span>{product.categoria}</span>
            </>
          )}
          <span>/</span>
          <span className="text-secondary-900 font-medium">
            {truncateText(product.nome, 30)}
          </span>
        </div>

        {/* Conteúdo principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galeria de imagens */}
          <div className="space-y-4">
            {/* Imagem principal - ADICIONADO BACKGROUND */}
            <div
              className="relative aspect-square overflow-hidden border border-secondary-200 group bg-center bg-no-repeat rounded-xl p-4"
              style={{
                backgroundImage: `url(${assets.bgItem})`,
                backgroundSize: "70%",
              }}
            >
              {hasImages && !imageError ? (
                <>
                  {imageLoading && (
                    <div className="absolute inset-4 flex items-center justify-center bg-secondary-100 animate-pulse rounded-lg">
                      <ImageIcon className="w-12 h-12 text-secondary-400" />
                    </div>
                  )}
                  <img
                    src={currentImage}
                    alt={product.nome}
                    className={clsx(
                      "w-full h-full object-cover transition-all duration-300 rounded-lg",
                      { "opacity-0": imageLoading }
                    )}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                  />

                  {/* Botão de zoom */}
                  {!imageLoading && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowImageModal(true)}
                      className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary-100 rounded-lg">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-secondary-400 mx-auto mb-2" />
                    <p className="text-sm text-secondary-600">
                      Sem imagem disponível
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails - ADICIONADO BACKGROUND */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={clsx(
                      "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all bg-center bg-no-repeat p-1",
                      selectedImageIndex === index
                        ? "border-primary-600 ring-2 ring-primary-200"
                        : "border-secondary-200 hover:border-primary-300"
                    )}
                    style={{
                      backgroundImage: `url(${assets.bgItem})`,
                      backgroundSize: "70%",
                    }}
                  >
                    <img
                      src={image.anexo}
                      alt={`${product.nome} - ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do produto */}
          <div className="space-y-6">
            {/* Status do produto */}
            {!isActive && (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-600" />
                  <span className="text-sm font-medium text-warning-800">
                    Produto inativo
                  </span>
                </div>
              </div>
            )}

            {/* Título e código */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 mb-2">
                {product.nome}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600">
                {product.codigo && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>Código: {product.codigo}</span>
                  </div>
                )}

                {product.gtin && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span>GTIN: {product.gtin}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Descrição */}
            {description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-secondary-700 leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* Keywords/Tags */}
            {keywords.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-secondary-700">
                  Tags:
                </span>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-primary-50 text-white rounded-full border border-primary-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preços */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(
                    hasPromotion ? product.preco_promocional : product.preco
                  )}
                </span>
              </div>{" "}
            </div>

            {/* Controles de quantidade */}
            {isActive && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-secondary-700">
                    Quantidade:
                  </span>

                  <div className="flex items-center border border-secondary-200 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-2 rounded-none"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value) || 1)
                      }
                      className="w-16 text-center border-0 focus:outline-none focus:ring-0"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 10}
                      className="px-3 py-2 rounded-none"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleBuyNow}
                    leftIcon={<ShoppingCart />}
                  >
                    Comprar agora
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={handleAddToCart}
                    leftIcon={isInCart(id) ? <Check /> : <ShoppingCart />}
                  >
                    {isInCart(id)
                      ? `Adicionar mais (${cartQuantity} no carrinho)`
                      : "Adicionar ao carrinho"}
                  </Button>
                </div>
              </div>
            )}

            {/* Informações adicionais */}
            <div className="space-y-4 pt-6 border-t border-secondary-200">
              <h3 className="font-semibold text-secondary-900">
                Informações do produto
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {product.categoria && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-secondary-500" />
                    <span className="text-secondary-600">Categoria:</span>
                    <span className="font-medium">{product.categoria}</span>
                  </div>
                )}

                {product.unidade && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-secondary-500" />
                    <span className="text-secondary-600">Unidade:</span>
                    <span className="font-medium">{product.unidade}</span>
                  </div>
                )}

                {product.marca && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-secondary-500" />
                    <span className="text-secondary-600">Marca:</span>
                    <span className="font-medium">{product.marca}</span>
                  </div>
                )}

                {metadata?.days_since_sync !== undefined && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary-500" />
                    <span className="text-secondary-600">Atualizado:</span>
                    <span className="font-medium">
                      {metadata.days_since_sync === 0
                        ? "Hoje"
                        : `${metadata.days_since_sync} dias atrás`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de imagem */}
        <ImageModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          images={images}
          initialIndex={selectedImageIndex}
          productName={product.nome}
        />
      </div>
    </div>
  );
};

// Componente de loading skeleton
const ProductDetailSkeleton = () => (
  <div
    className="min-h-screen transition-all duration-300"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
    }}
  >
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="w-20 h-8 bg-secondary-200 rounded shimmer" />
        <div className="w-8 h-8 bg-secondary-200 rounded shimmer" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-secondary-200 rounded-xl shimmer" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-20 h-20 bg-secondary-200 rounded-lg shimmer"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="w-3/4 h-8 bg-secondary-200 rounded shimmer" />
            <div className="w-1/2 h-5 bg-secondary-200 rounded shimmer" />
          </div>
          <div className="space-y-2">
            <div className="w-full h-4 bg-secondary-200 rounded shimmer" />
            <div className="w-5/6 h-4 bg-secondary-200 rounded shimmer" />
            <div className="w-2/3 h-4 bg-secondary-200 rounded shimmer" />
          </div>
          <div className="w-1/3 h-10 bg-secondary-200 rounded shimmer" />
          <div className="space-y-3">
            <div className="w-full h-12 bg-secondary-200 rounded shimmer" />
            <div className="w-full h-12 bg-secondary-200 rounded shimmer" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modal de imagem - ADICIONADO BACKGROUND NO MODAL TAMBÉM
const ImageModal = ({ isOpen, onClose, images, initialIndex, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      if (e.key === "ArrowRight")
        setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, images.length]);

  if (!isOpen || !images.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative max-w-4xl max-h-full bg-center bg-no-repeat p-8 rounded-2xl"
          style={{
            backgroundImage: `url(${assets.bgItem})`,
            backgroundSize: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={images[currentIndex]?.anexo}
            alt={`${productName} - ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
          />

          {/* Controles */}
          <Button
            variant="secondary"
            className="absolute top-4 right-4 bg-white/90"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <Button
                variant="secondary"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90"
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(images.length - 1, prev + 1)
                  )
                }
                disabled={currentIndex === images.length - 1}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} de {images.length}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductDetailPage;
