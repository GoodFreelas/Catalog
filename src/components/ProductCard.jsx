import React, { useState, useEffect } from "react";
import { Plus, Eye, Package, RefreshCw } from "lucide-react";
import { useCart } from "../context/CartContext";

// Cache simples para imagens
const imageLoadCache = new Map();

const ProductCard = ({ product, onViewProduct }) => {
  const { addToCart } = useCart();
  const [imageState, setImageState] = useState({
    loading: false,
    loaded: false,
    error: false,
    url: null,
  });

  // Extrair URL da primeira imagem
  const getImageUrl = () => {
    if (!product.imagens || product.imagens.length === 0) return null;

    const firstImage = product.imagens[0];
    if (typeof firstImage === "string") return firstImage;
    if (firstImage && typeof firstImage === "object") {
      return (
        firstImage.url || firstImage.anexo || firstImage.src || firstImage.link
      );
    }

    return null;
  };

  const imageUrl = getImageUrl();

  // Função para carregar imagem
  const loadImage = async (url) => {
    if (!url) {
      setImageState({ loading: false, loaded: false, error: false, url: null });
      return;
    }

    // Verificar cache
    if (imageLoadCache.has(url)) {
      const cached = imageLoadCache.get(url);
      setImageState({
        loading: false,
        loaded: cached.success,
        error: !cached.success,
        url: cached.success ? url : null,
      });
      return;
    }

    setImageState({ loading: true, loaded: false, error: false, url: null });

    try {
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      // Sucesso
      imageLoadCache.set(url, { success: true, timestamp: Date.now() });
      setImageState({ loading: false, loaded: true, error: false, url });
    } catch (error) {
      // Erro
      imageLoadCache.set(url, { success: false, timestamp: Date.now() });
      setImageState({ loading: false, loaded: false, error: true, url: null });
    }
  };

  // Carregar imagem quando URL mudar
  useEffect(() => {
    loadImage(imageUrl);
  }, [imageUrl]);

  const handleImageReload = (e) => {
    e.stopPropagation();
    if (imageUrl) {
      imageLoadCache.delete(imageUrl);
      loadImage(imageUrl);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {imageState.loading ? (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
            <span className="text-xs">Carregando...</span>
          </div>
        ) : imageState.loaded && imageState.url ? (
          <>
            <img
              src={imageState.url}
              alt={product.nome}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
            {/* Indicador de cache */}
            {imageLoadCache.has(imageState.url) && (
              <div className="absolute top-2 left-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full shadow-sm">
                  📋
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 group">
            <Package className="h-16 w-16 mb-2" />
            <span className="text-xs text-center px-2 mb-2">
              {imageState.error ? "Erro ao carregar" : "Sem imagem"}
            </span>
            {imageState.error && imageUrl && (
              <button
                onClick={handleImageReload}
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 hover:bg-gray-300 p-1 rounded-full"
                title="Tentar recarregar imagem"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
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

        {/* Badge de promoção */}
        {product.preco_promocional &&
          product.preco_promocional < product.preco && (
            <div className="absolute bottom-2 left-2">
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full shadow-sm">
                Promoção
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

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            {product.preco_promocional &&
            product.preco_promocional < product.preco ? (
              <>
                <p className="text-sm text-gray-400 line-through">
                  R$ {product.preco.toFixed(2)}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {product.preco_promocional.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-blue-600">
                R$ {product.preco.toFixed(2)}
              </p>
            )}
          </div>

          {product.unidade && (
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              por {product.unidade}
            </span>
          )}
        </div>

        {/* Additional Info */}
        {product.marca && (
          <p className="text-xs text-gray-500 mb-2">
            Marca: <span className="font-medium">{product.marca}</span>
          </p>
        )}

        {/* Status badges */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {product.situacao === "A" && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Ativo
            </span>
          )}

          {product.detalhes_carregados && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Detalhes
            </span>
          )}

          {product.imagens && product.imagens.length > 1 && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
              +{product.imagens.length - 1} fotos
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

        {/* Debug info (apenas em desenvolvimento) */}
        {import.meta.env.DEV && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500">
            <div>ID: {product.id}</div>
            <div>Imagens: {product.imagens?.length || 0}</div>
            <div>
              Estado:{" "}
              {imageState.loading
                ? "Carregando"
                : imageState.loaded
                ? "Carregada"
                : imageState.error
                ? "Erro"
                : "Sem imagem"}
            </div>
            {imageUrl && <div className="truncate">URL: {imageUrl}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
