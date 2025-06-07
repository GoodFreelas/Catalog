import React, { useState } from "react";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  X,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { formatters } from "../../utils/formatters";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
      {/* Product Image */}
      <img
        src={item.urlImagem || "/api/placeholder/80/80"}
        alt={item.nome}
        className="w-16 h-16 object-cover rounded"
      />

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{item.nome}</h4>
        <p className="text-sm text-gray-600">Código: {item.codigo}</p>
        <p className="text-lg font-bold text-green-600">
          {formatters.currency(item.preco)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          variant="outline"
          size="sm"
          icon={Minus}
          disabled={item.quantity <= 1}
        />
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <Button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          variant="outline"
          size="sm"
          icon={Plus}
          disabled={item.quantity >= (item.estoque || 999)}
        />
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-0">
        <p className="font-semibold">
          {formatters.currency(item.preco * item.quantity)}
        </p>
        <p className="text-xs text-gray-500">
          {item.quantity} × {formatters.currency(item.preco)}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        onClick={() => onRemove(item.id)}
        variant="ghost"
        size="sm"
        icon={Trash2}
        className="text-red-500 hover:text-red-700"
      />
    </div>
  );
};

const CustomerForm = ({ customerInfo, onCustomerInfoChange }) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900">Informações para Contato</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome"
          placeholder="Seu nome"
          value={customerInfo.name || ""}
          onChange={(e) =>
            onCustomerInfoChange({ ...customerInfo, name: e.target.value })
          }
        />
        <Input
          label="Telefone"
          placeholder="(11) 99999-9999"
          value={customerInfo.phone || ""}
          onChange={(e) =>
            onCustomerInfoChange({ ...customerInfo, phone: e.target.value })
          }
        />
        <Input
          label="Email (opcional)"
          type="email"
          placeholder="seu@email.com"
          value={customerInfo.email || ""}
          onChange={(e) =>
            onCustomerInfoChange({ ...customerInfo, email: e.target.value })
          }
          containerClassName="md:col-span-2"
        />
      </div>
    </div>
  );
};

const CartModal = ({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeFromCart,
  getTotalPrice,
  sendToWhatsApp,
  clearCart,
}) => {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const handleSendToWhatsApp = () => {
    try {
      if (showCustomerForm && !customerInfo.name.trim()) {
        alert("Por favor, preencha seu nome");
        return;
      }

      sendToWhatsApp(showCustomerForm ? customerInfo : {});

      // Opcional: limpar carrinho após envio
      // clearCart();
      onClose();
    } catch (error) {
      alert("Erro ao enviar pedido: " + error.message);
    }
  };

  const handleClearCart = () => {
    if (confirm("Tem certeza que deseja limpar o carrinho?")) {
      clearCart();
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = getTotalPrice();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Carrinho (${totalItems} ${totalItems === 1 ? "item" : "itens"})`}
      size="max-w-4xl"
    >
      <div className="p-6">
        {cart.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-12">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Seu carrinho está vazio
            </h3>
            <p className="text-gray-500 mb-6">
              Adicione alguns produtos ao seu carrinho para continuar
            </p>
            <Button onClick={onClose} variant="primary">
              Continuar Comprando
            </Button>
          </div>
        ) : (
          /* Cart with Items */
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            {/* Customer Information Toggle */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCustomerForm}
                  onChange={(e) => setShowCustomerForm(e.target.checked)}
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Incluir meus dados no pedido
                </span>
              </label>
            </div>

            {/* Customer Form */}
            {showCustomerForm && (
              <CustomerForm
                customerInfo={customerInfo}
                onCustomerInfoChange={setCustomerInfo}
              />
            )}

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "itens"}
                    ):
                  </span>
                  <span>{formatters.currency(totalPrice)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatters.currency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSendToWhatsApp}
                  variant="success"
                  size="lg"
                  className="flex-1"
                  icon={MessageCircle}
                >
                  Finalizar Pedido no WhatsApp
                </Button>

                <Button onClick={onClose} variant="outline" size="lg">
                  Continuar Comprando
                </Button>
              </div>

              {/* Clear Cart */}
              <div className="text-center">
                <Button
                  onClick={handleClearCart}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  Limpar Carrinho
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CartModal;
