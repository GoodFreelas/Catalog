import React, { useState } from "react";
import {
  Plus,
  Minus,
  ShoppingCart,
  Heart,
  Share2,
  MessageCircle,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { formatters } from "../../utils/formatters";
import { whatsappService } from "../../services/whatsapp";

const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;

  const images = product.imagens || [
    product.urlImagem || "/api/placeholder/400/400",
  ];
  const maxQuantity = product.estoque || 0;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.nome,
          text: `Confira este produto: ${product.nome}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      // Fallback para dispositivos que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  const handleWhatsAppInquiry = () => {
    whatsappService.sendInquiry(product);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Produto"
      size="max-w-5xl"
    >
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={images[selectedImage]}
                alt={product.nome}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded border-2 transition-colors ${
                      selectedImage === index
                        ? "border-blue-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.nome} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {product.nome}
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      onToggleFavorite && onToggleFavorite(product.id)
                    }
                    variant="ghost"
                    size="sm"
                    icon={Heart}
                    className={isFavorite ? "text-red-500" : ""}
                  />
                  <Button
                    onClick={handleShare}
                    variant="ghost"
                    size="sm"
                    icon={Share2}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Código: {product.codigo}</span>
                {product.sku && <span>SKU: {product.sku}</span>}
                {product.categoria && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {product.categoria.descricao}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {formatters.currency(product.preco)}
              </div>
              {quantity > 1 && (
                <div className="text-lg text-gray-600">
                  Total: {formatters.currency(product.preco * quantity)}
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Disponibilidade:</span>
                {product.estoque > 0 ? (
                  <span className="text-green-600 font-medium">
                    {product.estoque} unidades em estoque
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    Produto esgotado
                  </span>
                )}
              </div>

              {product.estoque > 0 && product.estoque <= 5 && (
                <div className="text-yellow-600 text-sm">
                  ⚠️ Últimas unidades disponíveis!
                </div>
              )}
            </div>

            {/* Description */}
            {product.descricao && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Descrição</h4>
                <p className="text-gray-600 leading-relaxed">
                  {product.descricao}
                </p>
              </div>
            )}

            {/* Specifications */}
            {product.especificacoes && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Especificações</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {product.especificacoes}
                  </pre>
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            {product.estoque > 0 && product.situacao === "A" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantidade
                  </label>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      variant="outline"
                      size="sm"
                      disabled={quantity <= 1}
                      icon={Minus}
                    />
                    <span className="text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <Button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      variant="outline"
                      size="sm"
                      disabled={quantity >= maxQuantity}
                      icon={Plus}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Máximo: {maxQuantity} unidades
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    icon={ShoppingCart}
                  >
                    Adicionar ao Carrinho
                  </Button>

                  <Button
                    onClick={handleWhatsAppInquiry}
                    variant="secondary"
                    size="lg"
                    icon={MessageCircle}
                  >
                    Perguntar
                  </Button>
                </div>
              </div>
            )}

            {/* Out of Stock Message */}
            {(product.estoque <= 0 || product.situacao !== "A") && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-center">
                  Este produto está temporariamente indisponível.
                </p>
                <div className="mt-3">
                  <Button
                    onClick={handleWhatsAppInquiry}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    icon={MessageCircle}
                  >
                    Receber Notificação de Disponibilidade
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailModal;
