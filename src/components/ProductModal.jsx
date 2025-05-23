import React, { useState } from "react";
import { X, Plus, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  // Processar imagens válidas
  const validImages =
    product.imagens?.filter((img) => {
      const url = img?.url || img?.anexo || img;
      return url && !imageErrors[url];
    }) || [];

  const hasImages = validImages.length > 0;
  const currentImage = hasImages ? validImages[currentImageIndex] : null;
  const currentImageUrl =
    currentImage?.url || currentImage?.anexo || currentImage;

  const handleImageError = (imageUrl) => {
    setImageErrors((prev) => ({ ...prev, [imageUrl]: true }));
  };

  const nextImage = () => {
    if (hasImages && validImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }
  };

  const prevImage = () => {
    if (hasImages && validImages.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + validImages.length) % validImages.length
      );
    }
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 pr-4 leading-tight">
              {product.nome}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Product Image Gallery */}
          <div className="mb-6">
            {/* Main Image */}
            <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden mb-4">
              {hasImages && currentImageUrl ? (
                <>
                  <img
                    src={currentImageUrl}
                    alt={product.nome}
                    className="w-full h-full object-contain"
                    onError={() => handleImageError(currentImageUrl)}
                  />

                  {/* Navigation arrows */}
                  {validImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  {validImages.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                      {currentImageIndex + 1} / {validImages.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Package className="h-24 w-24 mb-4" />
                  <span>Nenhuma imagem disponível</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {validImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {validImages.map((img, index) => {
                  const thumbUrl = img?.url || img?.anexo || img;
                  return (
                    <button
                      key={index}
                      onClick={() => selectImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={thumbUrl}
                        alt={`${product.nome} - Imagem ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(thumbUrl)}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Código:</span>
                <p className="text-gray-600 font-mono">{product.codigo}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Categoria:</span>
                <p className="text-gray-600">{product.categoria}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Unidade:</span>
                <p className="text-gray-600">{product.unidade}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Peso:</span>
                <p className="text-gray-600">{product.peso} kg</p>
              </div>
            </div>

            {product.descricao && (
              <div>
                <span className="font-semibold text-gray-700">Descrição:</span>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  {product.descricao}
                </p>
              </div>
            )}
          </div>

          {/* Price and Add to Cart */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-4xl font-bold text-blue-600">
                  R$ {product.preco.toFixed(2)}
                </span>
                {product.unidade && (
                  <p className="text-sm text-gray-500 mt-1">
                    por {product.unidade}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-lg"
            >
              <Plus className="h-5 w-5" />
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
