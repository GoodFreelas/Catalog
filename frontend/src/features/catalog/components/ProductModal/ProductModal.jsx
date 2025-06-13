import { useState, useEffect } from "react";
import {
  X,
  ShoppingCart,
  Heart,
  Share2,
  ZoomIn,
  Plus,
  Minus,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import Button from "../../../../shared/components/atoms/Button/Button";
import { useProduct } from "../../hooks/useProducts";
import { useCartStore } from "../../../../core/stores/cartStore";
import { useUIStore } from "../../../../core/stores/uiStore";
import {
  formatCurrency,
  truncateText,
} from "../../../../core/utils/formatters";

const ProductModal = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { modals, closeModal } = useUIStore();
  const { addItem, getItemQuantity, isInCart } = useCartStore();

  const isOpen = modals.productDetail?.isOpen || false;
  const productId = modals.productDetail?.productId;

  const {
    data: productData,
    isLoading,
    isError,
  } = useProduct(productId, {
    enabled: isOpen && Boolean(productId),
  });

  const product = productData?.data?.product;
  const cartQuantity = getItemQuantity(productId);

  // Resetar estado quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedImageIndex(0);
    }
  }, [isOpen, productId]);

  // Fechar modal com ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    closeModal("productDetail");
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem(product, quantity);
    toast.success(
      `${quantity}x ${truncateText(product.nome, 30)} adicionado ao carrinho!`
    );
  };

  const handleViewFullDetails = () => {
    navigate(`/product/${productId}`);
    handleClose();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${productId}`;
    const text = `Confira este produto: ${product?.nome}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: product?.nome, text, url });
      } catch (error) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  if (!isOpen) return null;

  const images = product?.anexos || [];
  const hasImages = images.length > 0;
  const isActive = product?.situacao === "A";
  const hasPromotion =
    product?.preco_promocional &&
    parseFloat(product.preco_promocional) < parseFloat(product.preco);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-2xl shadow-strong max-w-4xl max-h-[90vh] w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900">
              Detalhes do produto
            </h2>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="p-2"
              >
                <Share2 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            {isLoading ? (
              <ProductModalSkeleton />
            ) : isError || !product ? (
              <div className="p-8 text-center">
                <p className="text-secondary-600">Erro ao carregar produto</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Imagens */}
                <div className="space-y-4">
                  {/* Imagem principal */}
                  <div className="relative aspect-square bg-secondary-50 rounded-xl overflow-hidden">
                    {hasImages ? (
                      <img
                        src={images[selectedImageIndex]?.anexo}
                        alt={product.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary-100">
                        <span className="text-secondary-500">Sem imagem</span>
                      </div>
                    )}

                    {hasImages && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleViewFullDetails}
                        className="absolute top-3 right-3 bg-white/90"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.slice(0, 4).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={clsx(
                            "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                            selectedImageIndex === index
                              ? "border-primary-600"
                              : "border-secondary-200 hover:border-primary-300"
                          )}
                        >
                          <img
                            src={image.anexo}
                            alt={`${product.nome} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}

                      {images.length > 4 && (
                        <button
                          onClick={handleViewFullDetails}
                          className="flex-shrink-0 w-16 h-16 rounded-lg bg-secondary-100 border-2 border-secondary-200 hover:border-primary-300 flex items-center justify-center text-xs text-secondary-600 transition-all"
                        >
                          +{images.length - 4}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="space-y-4">
                  {/* Status */}
                  {!isActive && (
                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                      <span className="text-sm font-medium text-warning-800">
                        Produto inativo
                      </span>
                    </div>
                  )}

                  {/* Título */}
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900 mb-1">
                      {product.nome}
                    </h3>
                    {product.codigo && (
                      <p className="text-sm text-secondary-600">
                        Código: {product.codigo}
                      </p>
                    )}
                  </div>

                  {/* Descrição */}
                  {product.descricao && (
                    <p className="text-sm text-secondary-700 line-clamp-3">
                      {product.descricao}
                    </p>
                  )}

                  {/* Preços */}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(
                          hasPromotion
                            ? product.preco_promocional
                            : product.preco
                        )}
                      </span>

                      {hasPromotion && (
                        <span className="text-lg text-secondary-500 line-through">
                          {formatCurrency(product.preco)}
                        </span>
                      )}
                    </div>

                    {hasPromotion && (
                      <span className="inline-block bg-error-100 text-error-600 text-xs font-medium px-2 py-1 rounded-full">
                        PROMOÇÃO
                      </span>
                    )}
                  </div>

                  {/* Controles de quantidade */}
                  {isActive && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-secondary-700">
                          Quantidade:
                        </span>

                        <div className="flex items-center border border-secondary-200 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                            className="px-3 py-1.5 rounded-none"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>

                          <span className="px-4 py-1.5 text-sm font-medium min-w-[3rem] text-center">
                            {quantity}
                          </span>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={quantity >= 99}
                            className="px-3 py-1.5 rounded-none"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="space-y-2">
                        <Button
                          variant="primary"
                          fullWidth
                          onClick={handleAddToCart}
                          leftIcon={<ShoppingCart />}
                        >
                          {isInCart(productId)
                            ? `Adicionar mais (${cartQuantity} no carrinho)`
                            : "Adicionar ao carrinho"}
                        </Button>

                        <Button
                          variant="outline"
                          fullWidth
                          onClick={handleViewFullDetails}
                          leftIcon={<ExternalLink />}
                        >
                          Ver detalhes completos
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Info adicional */}
                  {product.categoria && (
                    <div className="pt-4 border-t border-secondary-200">
                      <p className="text-sm text-secondary-600">
                        <span className="font-medium">Categoria:</span>{" "}
                        {product.categoria}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Skeleton do modal
const ProductModalSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
    <div className="space-y-4">
      <div className="aspect-square bg-secondary-200 rounded-xl shimmer" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-16 h-16 bg-secondary-200 rounded-lg shimmer"
          />
        ))}
      </div>
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <div className="w-3/4 h-6 bg-secondary-200 rounded shimmer" />
        <div className="w-1/2 h-4 bg-secondary-200 rounded shimmer" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-4 bg-secondary-200 rounded shimmer" />
        <div className="w-5/6 h-4 bg-secondary-200 rounded shimmer" />
      </div>
      <div className="w-1/3 h-8 bg-secondary-200 rounded shimmer" />
      <div className="space-y-2">
        <div className="w-full h-12 bg-secondary-200 rounded shimmer" />
        <div className="w-full h-12 bg-secondary-200 rounded shimmer" />
      </div>
    </div>
  </div>
);

export default ProductModal;
