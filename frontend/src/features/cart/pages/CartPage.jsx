import { useState } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Store,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import Button from "../../../shared/components/atoms/Button/Button";
import Input from "../../../shared/components/atoms/Input/Input";
import { useCartStore } from "../../../core/stores/cartStore";
import { formatCurrency } from "../../../core/utils/formatters";
import {
  sendWhatsAppMessage,
  formatCartMessage,
} from "../../../core/utils/whatsapp";

const CartPage = () => {
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const {
    items,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleBack = () => {
    navigate("/catalog");
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = parseInt(newQuantity) || 0;
    if (quantity < 1) {
      removeItem(productId);
    } else {
      updateQuantity(productId, quantity);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Carrinho vazio!");
      return;
    }

    try {
      const message = formatCartMessage(items, customerInfo);
      sendWhatsAppMessage(message);

      toast.success("Redirecionando para WhatsApp!");

      // Opcional: limpar carrinho após envio
      // clearCart();
    } catch (error) {
      toast.error("Erro ao abrir WhatsApp. Tente novamente.");
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Tem certeza que deseja limpar o carrinho?")) {
      clearCart();
      toast.success("Carrinho limpo!");
    }
  };

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            leftIcon={<ArrowLeft />}
          >
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-secondary-900">
              Meu Carrinho
            </h1>
            {totalItems > 0 && (
              <span className="bg-primary-600 text-white text-sm font-medium px-2 py-1 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
        </div>

        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            leftIcon={<Trash2 />}
            className="text-error-600 hover:text-error-700 hover:bg-error-50"
          >
            Limpar carrinho
          </Button>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-secondary-600 mb-6">
        <span>Início</span>
        <span>/</span>
        <span className="text-secondary-900 font-medium">Carrinho</span>
      </div>

      {items.length === 0 ? (
        // Carrinho vazio
        <div className="text-center py-16">
          <ShoppingCart className="w-24 h-24 text-secondary-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-secondary-900 mb-4">
            Seu carrinho está vazio
          </h2>
          <p className="text-secondary-600 mb-8 max-w-md mx-auto">
            Adicione produtos ao seu carrinho para continuar com a compra.
            Navegue pelo nosso catálogo e encontre produtos incríveis!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/catalog")}
              leftIcon={<Store />}
              size="lg"
            >
              Ver catálogo
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/search")}
              size="lg"
            >
              Buscar produtos
            </Button>
          </div>
        </div>
      ) : (
        // Carrinho com itens
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de produtos */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              Produtos ({totalItems} {totalItems === 1 ? "item" : "itens"})
            </h2>

            <div className="space-y-4">
              {items.map((item, index) => (
                <CartItem
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={removeItem}
                  onQuantityChange={handleQuantityChange}
                  onIncrement={incrementQuantity}
                  onDecrement={decrementQuantity}
                />
              ))}
            </div>
          </div>

          {/* Resumo e checkout */}
          <div className="space-y-6">
            {/* Informações do cliente */}
            <div className="bg-white border border-secondary-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Informações para contato
              </h3>

              <div className="space-y-4">
                <Input
                  label="Nome completo"
                  value={customerInfo.name}
                  onChange={(e) =>
                    handleCustomerInfoChange("name", e.target.value)
                  }
                  placeholder="Seu nome completo"
                />

                <Input
                  label="WhatsApp"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    handleCustomerInfoChange("phone", e.target.value)
                  }
                  placeholder="(11) 99999-9999"
                  type="tel"
                />

                <Input
                  label="Endereço (opcional)"
                  value={customerInfo.address}
                  onChange={(e) =>
                    handleCustomerInfoChange("address", e.target.value)
                  }
                  placeholder="Endereço para entrega"
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) =>
                      handleCustomerInfoChange("notes", e.target.value)
                    }
                    placeholder="Observações sobre o pedido..."
                    rows={3}
                    className="w-full px-4 py-3 text-base border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className="bg-white border border-secondary-200 rounded-xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Resumo do pedido
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal ({totalItems} itens)</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>

                <div className="flex justify-between text-secondary-600">
                  <span>Entrega</span>
                  <span className="text-success-600">A combinar</span>
                </div>

                <div className="border-t border-secondary-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-secondary-900">
                    <span>Total</span>
                    <span className="text-primary-600">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleCheckout}
                leftIcon={<MessageCircle />}
                className="mb-3"
              >
                Finalizar no WhatsApp
              </Button>

              <p className="text-xs text-secondary-600 text-center">
                Você será redirecionado para o WhatsApp para finalizar o pedido
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente do item do carrinho
const CartItem = ({
  item,
  index,
  onRemove,
  onQuantityChange,
  onIncrement,
  onDecrement,
}) => {
  const itemTotal = parseFloat(item.preco) * item.quantity;
  const hasImage = item.anexos && item.anexos.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-secondary-200 rounded-xl p-6"
    >
      <div className="flex gap-4">
        {/* Imagem do produto */}
        <div className="flex-shrink-0 w-24 h-24 bg-secondary-50 rounded-lg overflow-hidden border border-secondary-200">
          {hasImage ? (
            <img
              src={item.anexos[0].anexo}
              alt={item.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary-100">
              <ShoppingCart className="w-8 h-8 text-secondary-400" />
            </div>
          )}
        </div>

        {/* Informações do produto */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="font-semibold text-secondary-900 line-clamp-2 mb-1">
                {item.nome}
              </h3>

              {item.codigo && (
                <p className="text-sm text-secondary-600">
                  Código: {item.codigo}
                </p>
              )}

              <p className="text-sm text-secondary-600">
                {formatCurrency(item.preco)} cada
              </p>
            </div>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => onRemove(item.id)}
              className="p-2 text-secondary-400 hover:text-error-600 hover:bg-error-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            {/* Controles de quantidade */}
            <div className="flex items-center border border-secondary-200 rounded-lg">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onDecrement(item.id)}
                className="px-3 py-2 hover:bg-secondary-100 rounded-none rounded-l-lg"
              >
                <Minus className="w-4 h-4" />
              </Button>

              <input
                type="number"
                min="1"
                max="99"
                value={item.quantity}
                onChange={(e) => onQuantityChange(item.id, e.target.value)}
                className="w-16 text-center border-0 focus:outline-none focus:ring-0 py-2"
              />

              <Button
                variant="ghost"
                size="xs"
                onClick={() => onIncrement(item.id)}
                className="px-3 py-2 hover:bg-secondary-100 rounded-none rounded-r-lg"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Subtotal */}
            <div className="text-right">
              <div className="font-semibold text-lg text-primary-600">
                {formatCurrency(itemTotal)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage;
