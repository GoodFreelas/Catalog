import React, { useEffect } from 'react';
import { X, Phone, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { WhatsAppService } from '../../services/WhatsAppService';
import { Button } from '../atoms/Button';
import { CartItem } from '../molecules/CartItem';
import { Badge } from '../atoms/Badge';

export const CartSidebar = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    clearCart,
    getCartItemsCount
  } = useCart();

  // Close sidebar with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    WhatsAppService.sendOrder(cartItems, getCartTotal());

    // Optional: Clear cart after sending to WhatsApp
    // clearCart();
    // onClose();
  };

  const handleClearCart = () => {
    if (window.confirm('Tem certeza que deseja limpar o carrinho?')) {
      clearCart();
    }
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 ? 0 : 15; // Frete grátis acima de R$ 150
  const total = subtotal + shipping;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform ${className}`}>
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Carrinho</h2>
                <p className="text-sm text-gray-500">
                  {getCartItemsCount()} {getCartItemsCount() === 1 ? 'item' : 'itens'}
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              // Empty Cart State
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Seu carrinho está vazio
                </h3>
                <p className="text-gray-500 mb-6">
                  Adicione produtos para começar suas compras
                </p>
                <Button onClick={onClose} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continuar Comprando
                </Button>
              </div>
            ) : (
              // Cart Items
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer - Totals and Actions */}
          {cartItems.length > 0 && (
            <div className="border-t bg-gray-50 p-4 space-y-4">

              {/* Shipping Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-800">Frete:</span>
                  <div className="text-right">
                    {shipping === 0 ? (
                      <div>
                        <span className="text-green-600 font-medium">Grátis</span>
                        <div className="text-xs text-blue-600">
                          Frete grátis atingido! 🎉
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-blue-800">R$ {shipping.toFixed(2)}</span>
                        <div className="text-xs text-blue-600">
                          Faltam R$ {(150 - subtotal).toFixed(2)} para frete grátis
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frete:</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant="success"
                  size="lg"
                  className="w-full"
                  onClick={handleWhatsAppCheckout}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Finalizar via WhatsApp
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={onClose}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Continuar
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleClearCart}
                    className="px-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Security Info */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  🔒 Suas informações estão seguras
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};