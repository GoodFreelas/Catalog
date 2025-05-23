import React, { useState } from "react";
import { Plus, Eye, Package } from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product, onViewProduct }) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);

  // Função para obter a primeira imagem válida
  const getProductImage = () => {
    if (!product.imagens || product.imagens.length === 0) return null;

    // Tentar encontrar uma imagem válida
    const validImage = product.imagens.find(
      (img) => img && (img.url || img.anexo || typeof img === "string")
    );

    if (validImage) {
      return validImage.url || validImage.anexo || validImage;
    }

    return null;
  };

  const imageUrl = getProductImage();
  const hasValidImage = imageUrl && !imageError;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={product.nome}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Package className="h-16 w-16 mb-2" />
            <span className="text-xs text-center px-2">Sem imagem</span>
          </div>
        )}

        {/* Badge da categoria */}
        {product.categoria && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-white/90 text-gray-700 px-2 py-1 rounded-full shadow-sm">
              {product.categoria}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] leading-tight">
          {product.nome}
        </h3>

        <p className="text-sm text-gray-500 mb-3">
          Código: <span className="font-medium">{product.codigo}</span>
        </p>

        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold text-blue-600">
            R$ {product.preco.toFixed(2)}
          </p>
          {product.unidade && (
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              por {product.unidade}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewProduct(product)}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            Ver Detalhes
          </button>
          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
