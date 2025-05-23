import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Package,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useCart } from "../context/CartContext";

// Cache simples para imagens
const imageLoadCache = new Map();

const ProductModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesState, setImagesState] = useState({
    loading: false,
    loadedImages: [],
    errors: new Set(),
  });

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  // Processar URLs das imagens
  const getImageUrls = () => {
    if (!product.imagens || product.imagens.length === 0) return [];

    return product.imagens
      .map((img, index) => {
        let url = null;

        if (typeof img === "string") {
          url = img;
        } else if (img && typeof img === "object") {
          url = img.url || img.anexo || img.src || img.link;
        }

        return {
          id: `${product.id}_${index}`,
          url,
          index,
          original: img,
        };
      })
      .filter((item) => item.url);
  };

  const imageUrls = getImageUrls();

  // Carregar todas as imagens
  const loadImages = async () => {
    if (imageUrls.length === 0) {
      setImagesState({ loading: false, loadedImages: [], errors: new Set() });
      return;
    }

    setImagesState((prev) => ({ ...prev, loading: true }));

    const loadedImages = [];
    const errors = new Set();

    for (const imageData of imageUrls) {
      const { url } = imageData;

      try {
        // Verificar cache
        if (imageLoadCache.has(url)) {
          const cached = imageLoadCache.get(url);
          if (cached.success) {
            loadedImages.push({ ...imageData, fromCache: true });
          } else {
            errors.add(url);
          }
          continue;
        }

        // Carregar imagem
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        // Sucesso
        imageLoadCache.set(url, { success: true, timestamp: Date.now() });
        loadedImages.push({ ...imageData, fromCache: false });
      } catch (error) {
        // Erro
        imageLoadCache.set(url, { success: false, timestamp: Date.now() });
        errors.add(url);
        console.warn(`❌ Falha ao carregar imagem: ${url}`);
      }
    }

    setImagesState({
      loading: false,
      loadedImages,
      errors,
    });
  };

  // Resetar e carregar imagens quando o produto mudar
  useEffect(() => {
    setCurrentImageIndex(0);
    if (product?.id) {
      loadImages();
    }
  }, [product?.id]);

  const validImages = imagesState.loadedImages;
  const currentImage = validImages[currentImageIndex];

  const nextImage = () => {
    if (validImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }
  };

  const prevImage = () => {
    if (validImages.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + validImages.length) % validImages.length
      );
    }
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleImageReload = async (imageUrl) => {
    // Remover do cache e recarregar
    imageLoadCache.delete(imageUrl);

    // Remover dos erros
    setImagesState((prev) => ({
      ...prev,
      errors: new Set([...prev.errors].filter((url) => url !== imageUrl)),
    }));

    // Recarregar apenas esta imagem
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Sucesso - atualizar estado
      imageLoadCache.set(imageUrl, { success: true, timestamp: Date.now() });

      const imageData = imageUrls.find((img) => img.url === imageUrl);
      if (imageData) {
        setImagesState((prev) => ({
          ...prev,
          loadedImages: [
            ...prev.loadedImages,
            { ...imageData, fromCache: false },
          ],
        }));
      }
    } catch (error) {
      imageLoadCache.set(imageUrl, { success: false, timestamp: Date.now() });
      setImagesState((prev) => ({
        ...prev,
        errors: new Set([...prev.errors, imageUrl]),
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                {product.nome}
              </h2>
              {product.marca && (
                <p className="text-sm text-gray-600">
                  Marca: <span className="font-medium">{product.marca}</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Product Image Gallery */}
          <div className="mb-6">
            {/* Image loading indicator */}
            {imagesState.loading && (
              <div className="mb-2 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  Carregando imagens... ({validImages.length}/{imageUrls.length}
                  )
                </div>
              </div>
            )}

            {/* Main Image */}
            <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden mb-4">
              {validImages.length > 0 && currentImage ? (
                <>
                  <img
                    src={currentImage.url}
                    alt={product.nome}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />

                  {/* Cache indicator */}
                  {currentImage?.fromCache && (
                    <div className="absolute top-2 left-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full shadow-sm">
                        📋 Cache
                      </span>
                    </div>
                  )}

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
                  <span className="text-center">
                    {imagesState.loading
                      ? "Carregando imagens..."
                      : "Nenhuma imagem disponível"}
                  </span>
                  {imagesState.errors.size > 0 && (
                    <p className="text-sm text-red-500 mt-2">
                      {imagesState.errors.size} imagem(ns) falharam
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {validImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {validImages.map((img, index) => (
                  <button
                    key={img.id || index}
                    onClick={() => selectImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
                      index === currentImageIndex
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.nome} - Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {img.fromCache && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Error images section */}
            {imagesState.errors.size > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Imagens com erro ({imagesState.errors.size}):
                </h4>
                <div className="space-y-1">
                  {Array.from(imagesState.errors).map((errorUrl, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-red-600 truncate flex-1">
                        {errorUrl}
                      </span>
                      <button
                        onClick={() => handleImageReload(errorUrl)}
                        className="ml-2 p-1 bg-red-100 hover:bg-red-200 rounded"
                        title="Tentar recarregar"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
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

            {product.gtin && (
              <div>
                <span className="font-semibold text-gray-700">GTIN/EAN:</span>
                <p className="text-gray-600 font-mono">{product.gtin}</p>
              </div>
            )}

            {product.descricao && (
              <div>
                <span className="font-semibold text-gray-700">Descrição:</span>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  {product.descricao}
                </p>
              </div>
            )}

            {/* Additional details if available */}
            {product.detalhes_carregados && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Informações Adicionais:
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.ncm && (
                    <div>
                      <span className="font-medium text-gray-600">NCM:</span>
                      <p className="text-gray-500">{product.ncm}</p>
                    </div>
                  )}
                  {product.garantia && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Garantia:
                      </span>
                      <p className="text-gray-500">{product.garantia}</p>
                    </div>
                  )}
                  {product.localizacao && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Localização:
                      </span>
                      <p className="text-gray-500">{product.localizacao}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-600">Situação:</span>
                    <p className="text-gray-500">
                      {product.situacao === "A" ? "Ativo" : "Inativo"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price and Add to Cart */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                {product.preco_promocional &&
                product.preco_promocional < product.preco ? (
                  <div>
                    <span className="text-lg text-gray-400 line-through">
                      R$ {product.preco.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl font-bold text-red-600">
                        R$ {product.preco_promocional.toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-700 text-sm px-2 py-1 rounded">
                        PROMOÇÃO
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-blue-600">
                    R$ {product.preco.toFixed(2)}
                  </span>
                )}
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

            {/* Product info summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Resumo do Produto:
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  ID: {product.id} | Código: {product.codigo}
                </div>
                <div>
                  Imagens: {imageUrls.length} total, {validImages.length}{" "}
                  carregadas
                  {imagesState.errors.size > 0 &&
                    `, ${imagesState.errors.size} com erro`}
                </div>
                {product.detalhes_carregados ? (
                  <div className="text-green-600">
                    ✓ Detalhes completos carregados
                  </div>
                ) : (
                  <div className="text-yellow-600">⚠ Dados básicos apenas</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
