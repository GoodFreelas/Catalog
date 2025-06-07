import React from "react";
import { Eye, ShoppingCart, Heart } from "lucide-react";
import { formatters } from "../../utils/formatters";
import Button from "../ui/Button";

const ProductCard = ({
  product,
  onViewDetails,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  isInCart = false,
}) => {
  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product, 1);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    }
  };

  const handleViewDetails = () => {
    onViewDetails(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.urlImagem || "/api/placeholder/300/300"}
          alt={product.nome}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge de Status */}
        {product.situacao === "I" && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            Indisponível
          </div>
        )}

        {/* Badge de Estoque Baixo */}
        {product.estoque > 0 && product.estoque <= 5 && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
            Últimas unidades
          </div>
        )}

        {/* Botão de Favorito */}
        {onToggleFavorite && (
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-white text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}

        {/* Overlay com botões de ação */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity">
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              onClick={handleViewDetails}
              variant="secondary"
              size="sm"
              className="w-full"
              icon={Eye}
            >
              Ver Detalhes
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.nome}
        </h3>

        {/* Product Code */}
        <p className="text-sm text-gray-600 mb-2">Código: {product.codigo}</p>

        {/* Category */}
        {product.categoria && (
          <p className="text-xs text-gray-500 mb-3">
            {product.categoria.descricao}
          </p>
        )}

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-green-600">
            {formatters.currency(product.preco)}
          </span>
          <span className="text-sm text-gray-500">
            {product.estoque > 0
              ? `${product.estoque} disponíveis`
              : "Esgotado"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleViewDetails}
            variant="outline"
            size="sm"
            className="flex-1"
            icon={Eye}
          >
            Detalhes
          </Button>

          {product.estoque > 0 && product.situacao === "A" && (
            <Button
              onClick={handleAddToCart}
              variant="primary"
              size="sm"
              className="flex-1"
              icon={ShoppingCart}
            >
              {isInCart ? "Adicionado" : "Comprar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
