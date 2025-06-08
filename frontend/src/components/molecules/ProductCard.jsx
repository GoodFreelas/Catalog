import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import Button from "../atoms/Button";
import Badge from "../atoms/Badge";
import { useCart } from "../../contexts/CartContext";

const ProductCard = ({ product }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();

  const hasPromotion = product.preco_promocional > 0;
  const finalPrice = hasPromotion ? product.preco_promocional : product.preco;
  const discount = hasPromotion
    ? Math.round(
        ((product.preco - product.preco_promocional) / product.preco) * 100
      )
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="card group overflow-hidden hover:scale-105 transition-transform duration-200">
      <Link to={`/produto/${product.tinyId}`} className="block">
        {/* Imagem do produto */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="loading-spinner h-8 w-8"></div>
            </div>
          )}

          {!imageError && product.anexos?.[0]?.anexo ? (
            <img
              src={product.anexos[0].anexo}
              alt={product.nome}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-sm">Sem imagem</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasPromotion && (
              <Badge variant="danger" size="small">
                -{discount}%
              </Badge>
            )}
            {product.categoria && (
              <Badge variant="primary" size="small">
                {product.categoria}
              </Badge>
            )}
          </div>

          {/* Overlay com ações */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="small"
                variant="ghost"
                className="bg-white text-gray-800 hover:bg-gray-100"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              <Button
                size="small"
                variant="ghost"
                className="bg-white text-gray-800 hover:bg-gray-100"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Informações do produto */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
            {product.nome}
          </h3>

          {/* Preços */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-semibold text-green-600">
              R$ {finalPrice.toFixed(2).replace(".", ",")}
            </span>
            {hasPromotion && (
              <span className="text-sm text-gray-500 line-through">
                R$ {product.preco.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>

          {/* Marca */}
          {product.marca && (
            <p className="text-sm text-gray-600 mb-3">Marca: {product.marca}</p>
          )}
        </div>
      </Link>

      {/* Botão adicionar ao carrinho */}
      <div className="px-4 pb-4">
        <Button onClick={handleAddToCart} className="w-full" size="small">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
