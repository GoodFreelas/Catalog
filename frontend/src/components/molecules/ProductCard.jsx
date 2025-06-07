import React, { useState, useEffect } from "react";
import { Heart, Star, ShoppingCart, Eye, Package } from "lucide-react";
import { Button } from "../atoms/Button";
import { Badge } from "../atoms/Badge";
import { TinyAPI } from "../../services/TinyAPI";

export const ProductCard = ({
  product,
  onAddToCart,
  onViewDetails,
  onToggleFavorite,
  isFavorite = false,
  showRating = true,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const price =
    product.preco_promocional > 0 ? product.preco_promocional : product.preco;
  const hasPromotion = product.preco_promocional > 0;
  const discount = hasPromotion
    ? Math.round(
        ((product.preco - product.preco_promocional) / product.preco) * 100
      )
    : 0;

  // Carregar detalhes do produto (incluindo imagem) quando o componente é montado
  useEffect(() => {
    const loadProductDetails = async () => {
      // Se já tem anexos, não precisa buscar detalhes
      if (product.anexos && product.anexos.length > 0) {
        setProductDetails(product);
        return;
      }

      try {
        setLoadingDetails(true);
        console.log(`🔍 Carregando detalhes para produto ID: ${product.id}`);

        const response = await TinyAPI.fetchProductDetails(product.id);
        if (response?.retorno?.produto) {
          setProductDetails(response.retorno.produto);
          console.log(
            `✅ Detalhes carregados para: ${response.retorno.produto.nome}`
          );
          console.log(
            `📸 Anexos encontrados:`,
            response.retorno.produto.anexos
          );
        }
      } catch (error) {
        console.error(
          `❌ Erro ao carregar detalhes do produto ${product.id}:`,
          error
        );
      } finally {
        setLoadingDetails(false);
      }
    };

    loadProductDetails();
  }, [product.id]);

  // Função para obter URL da imagem
  const getImageUrl = () => {
    const detailsToUse = productDetails || product;

    // Verificar se tem anexos
    if (
      detailsToUse.anexos &&
      Array.isArray(detailsToUse.anexos) &&
      detailsToUse.anexos.length > 0
    ) {
      const primeiroAnexo = detailsToUse.anexos[0];
      if (
        primeiroAnexo &&
        primeiroAnexo.anexo &&
        primeiroAnexo.anexo.trim() !== ""
      ) {
        return primeiroAnexo.anexo;
      }
    }

    // Fallback para placeholder
    const productName = product.nome.substring(0, 15).replace(/[^\w\s]/g, "");
    return `https://via.placeholder.com/300x300/f8fafc/64748b?text=${encodeURIComponent(
      productName
    )}`;
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      // Usar os detalhes completos se disponíveis
      const productToAdd = productDetails || product;
      await onAddToCart(productToAdd);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product.id);
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    }
  };

  const handleImageError = (event) => {
    const imgSrc = event.target.src;
    console.log(`❌ Erro ao carregar imagem: ${imgSrc}`);
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Determinar se ainda está carregando imagem
  const isLoadingImage = loadingDetails || (!imageLoaded && !imageError);

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group ${className}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100">
        {isLoadingImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!imageError ? (
          <img
            src={getImageUrl()}
            alt={product.nome}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
            <Package className="w-16 h-16 mb-3 text-gray-400" />
            <div className="text-center px-4">
              <div className="font-medium text-sm text-gray-600 mb-1">
                {product.nome.length > 30
                  ? product.nome.substring(0, 30) + "..."
                  : product.nome}
              </div>
              <div className="text-xs text-gray-500">Vonixx</div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {hasPromotion && (
            <Badge variant="danger" size="sm">
              -{discount}%
            </Badge>
          )}
          {product.situacao === "A" && (
            <Badge variant="success" size="sm">
              Disponível
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors ${
            isFavorite
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
          onClick={handleToggleFavorite}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="bg-white"
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {isLoading ? "Add..." : "Add"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3
          className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]"
          title={product.nome}
        >
          {product.nome}
        </h3>

        {/* Product Code */}
        {product.codigo && (
          <p className="text-xs text-gray-500 mb-2">Cód: {product.codigo}</p>
        )}

        {/* Rating */}
        {showRating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-yellow-400 fill-current"
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">(0 avaliações)</span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            {hasPromotion && (
              <span className="text-sm text-gray-500 line-through">
                R$ {product.preco.toFixed(2)}
              </span>
            )}
            <span
              className={`font-bold text-lg ${
                hasPromotion ? "text-red-600" : "text-gray-900"
              }`}
            >
              R$ {price.toFixed(2)}
            </span>
          </div>
          <Badge variant="info" size="sm">
            {product.unidade || "un"}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Detalhes
          </Button>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isLoading}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {isLoading ? "Adicionando..." : "Adicionar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
