import { useState } from "react";
import { ShoppingCart, Eye, Heart, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import Button from "../../atoms/Button/Button";
import { useCartStore } from "../../../../core/stores/cartStore";
import { useUIStore } from "../../../../core/stores/uiStore";
import {
  formatCurrency,
  truncateText,
} from "../../../../core/utils/formatters";
import { assets } from "../../../../assets";

const ProductCard = ({
  product,
  onViewDetails,
  onAddToWishlist,
  className,
  ...props
}) => {
  const navigate = useNavigate();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const { addItem, getItemQuantity, isInCart } = useCartStore();
  const { openModal } = useUIStore();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      // Abrir modal por padrão
      openModal("productDetail", { productId: product.id });
    }
  };

  const handleCardClick = () => {
    // Navegar para página de detalhes quando clicar no card
    navigate(`/product/${product.id}`);
  };

  const handleAddToWishlist = (e) => {
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  const currentQuantity = getItemQuantity(product.id);
  const isActive = product.situacao === "A";
  const hasImage = product.anexos && product.anexos.length > 0;
  const imageUrl = hasImage ? product.anexos[0].anexo : null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -4, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={clsx(
        "group relative bg-white rounded-xl border border-secondary-500",
        "shadow-soft hover:shadow-medium transition-all duration-300",
        "overflow-hidden cursor-pointer",
        "h-auto flex flex-col", // mudou de altura fixa para auto
        {
          "opacity-75": !isActive,
        },
        className
      )}
      onClick={handleCardClick}
      {...props}
    >
      {/* Badge de status */}
      {!isActive && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-secondary-100 text-white text-xs font-medium px-2 py-1 rounded-md">
            Inativo
          </span>
        </div>
      )}

      {/* Badge de carrinho */}
      {currentQuantity > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
            {currentQuantity}
          </span>
        </div>
      )}

      {/* Container da imagem - reduzido para proporção 1:1 */}
      <div
        className="relative w-full aspect-square overflow-hidden flex-shrink-0 p-2 bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${assets.bgItem})`,
          backgroundSize: "70%",
        }}
      >
        {hasImage && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-2 flex items-center justify-center animate-pulse rounded-lg">
                <ImageIcon className="w-6 h-6 text-secondary-400" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.nome}
              className={clsx(
                "w-full h-full object-cover transition-all duration-300 rounded-lg",
                "group-hover:scale-105",
                { "opacity-0": imageLoading }
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-lg">
            <ImageIcon className="w-8 h-8 text-secondary-400" />
          </div>
        )}

        {/* Overlay com ações */}
        <div className="absolute inset-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 rounded-lg">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleViewDetails}
            className="bg-white/90 text-secondary-900 hover:bg-white"
          >
            <Eye size={14} />
          </Button>
          {onAddToWishlist && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddToWishlist}
              className="bg-white/90 text-secondary-900 hover:bg-white"
            >
              <Heart size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo do card - otimizado para mobile */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div className="space-y-2">
          {/* Nome do produto */}
          <div>
            <h3 className="font-semibold text-secondary-900 text-sm leading-tight line-clamp-3 h-[3.4rem] overflow-hidden flex items-start">
              {product.nome}
            </h3>

            {product.codigo && (
              <p className="text-xs text-secondary-500 mt-1 truncate">
                Cód: {product.codigo}
              </p>
            )}
          </div>

          {/* Descrição - mais compacta */}
          {product.descricao && (
            <p className="text-xs text-secondary-600 line-clamp-2 min-h-[2rem]">
              {product.descricao}
            </p>
          )}

          {/* Preço */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0">
              <span className="text-lg font-bold text-black">
                {formatCurrency(
                  product.preco_promocional &&
                    parseFloat(product.preco_promocional || 0) > 0 &&
                    parseFloat(product.preco_promocional) <
                      parseFloat(product.preco || 0)
                    ? product.preco_promocional
                    : product.preco
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Botão de comprar/carrinho - compacto */}
        <Button
          variant={isInCart(product.id) ? "success" : "primary"}
          size="sm"
          fullWidth
          onClick={handleAddToCart}
          disabled={!isActive}
          leftIcon={
            isInCart(product.id) ? (
              <div className="flex items-center gap-1">
                <ShoppingCart size={16} />
                <span>{currentQuantity}</span>
              </div>
            ) : (
              <img src={assets.compra} alt="Comprar" className="w-4 h-4" />
            )
          }
          className={clsx("mt-3 rounded-2xl text-white font-semibold", {
            "justify-center": isInCart(product.id),
          })}
          style={{
            backgroundColor: isInCart(product.id) ? "#C80F2E" : "#006336",
            borderColor: isInCart(product.id) ? "#C80F2E" : "#006336",
          }}
        >
          {isInCart(product.id) ? "" : "Comprar"}
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
