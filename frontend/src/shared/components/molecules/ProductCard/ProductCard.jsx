import { useState } from "react";
import { ShoppingCart, Eye, Heart, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

import Button from "../../atoms/Button/Button";
import { useCartStore } from "../../../../core/stores/cartStore";
import {
  formatCurrency,
  truncateText,
} from "../../../../core/utils/formatters";

const ProductCard = ({
  product,
  onViewDetails,
  onAddToWishlist,
  className,
  ...props
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const { addItem, getItemQuantity, isInCart } = useCartStore();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    onViewDetails?.(product);
  };

  const handleAddToWishlist = (e) => {
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  const currentQuantity = getItemQuantity(product.id);
  const isActive = product.situacao === "A";
  const hasImage = product.anexos && product.anexos.length > 0;
  const imageUrl = hasImage ? product.anexos[0].anexo : null;

  // Debug temporário - remova depois
  if (import.meta.env.DEV) {
    console.log("Product data:", {
      id: product.id,
      nome: product.nome,
      preco: product.preco,
      preco_promocional: product.preco_promocional,
      precoType: typeof product.preco,
      precoPromocionalType: typeof product.preco_promocional,
    });
  }

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
        "group relative bg-white rounded-xl border border-secondary-200",
        "shadow-soft hover:shadow-medium transition-all duration-300",
        "overflow-hidden cursor-pointer",
        {
          "opacity-75": !isActive,
        },
        className
      )}
      onClick={handleViewDetails}
      {...props}
    >
      {/* Badge de status */}
      {!isActive && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-secondary-900 text-white text-xs font-medium px-2 py-1 rounded-md">
            Inativo
          </span>
        </div>
      )}

      {/* Badge de carrinho */}
      {currentQuantity > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
            {currentQuantity}
          </span>
        </div>
      )}

      {/* Container da imagem */}
      <div className="relative aspect-square bg-secondary-50 overflow-hidden">
        {hasImage && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary-100 animate-pulse">
                <ImageIcon className="w-8 h-8 text-secondary-400" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.nome}
              className={clsx(
                "w-full h-full object-cover transition-all duration-300",
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
          <div className="w-full h-full flex items-center justify-center bg-secondary-100">
            <ImageIcon className="w-12 h-12 text-secondary-400" />
          </div>
        )}

        {/* Overlay com ações */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleViewDetails}
            className="bg-white/90 text-secondary-900 hover:bg-white"
          >
            <Eye size={16} />
          </Button>

          {onAddToWishlist && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddToWishlist}
              className="bg-white/90 text-secondary-900 hover:bg-white"
            >
              <Heart size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className="p-4 space-y-3">
        {/* Nome do produto */}
        <div>
          <h3 className="font-semibold text-secondary-900 text-sm leading-tight">
            {truncateText(product.nome, 60)}
          </h3>

          {product.codigo && (
            <p className="text-xs text-secondary-500 mt-1">
              Cód: {product.codigo}
            </p>
          )}
        </div>

        {/* Descrição */}
        {product.descricao && (
          <p className="text-xs text-secondary-600 line-clamp-2">
            {truncateText(product.descricao, 80)}
          </p>
        )}

        {/* Preço */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {/* Preço principal */}
            <span className="text-lg font-bold text-primary-600">
              {formatCurrency(
                product.preco_promocional &&
                  parseFloat(product.preco_promocional || 0) > 0 &&
                  parseFloat(product.preco_promocional) <
                    parseFloat(product.preco || 0)
                  ? product.preco_promocional
                  : product.preco
              )}
            </span>{" "}
          </div>
        </div>

        {/* Botão de adicionar ao carrinho */}
        <Button
          variant={isInCart(product.id) ? "success" : "primary"}
          size="sm"
          fullWidth
          onClick={handleAddToCart}
          disabled={!isActive}
          leftIcon={<ShoppingCart />}
          className="mt-3"
        >
          {isInCart(product.id)
            ? `${currentQuantity} no carrinho`
            : "Adicionar ao carrinho"}
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
