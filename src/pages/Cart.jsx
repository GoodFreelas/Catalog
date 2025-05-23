import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Phone, ArrowLeft, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

const Cart = () => {
  const { cart, getTotalPrice, getTotalItems, clearCart, sendToWhatsApp } =
    useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Seu carrinho está vazio
          </h2>
          <p className="text-gray-600 mb-8">
            Que tal explorar nossos produtos e adicionar alguns itens ao seu
            carrinho?
          </p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Continuar Comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Carrinho de Compras
          </h1>
          <p className="text-gray-600">
            {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""} no seu
            carrinho
          </p>
        </div>

        <Link
          to="/products"
          className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Continuar Comprando
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Itens do Carrinho
              </h2>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Carrinho
              </button>
            </div>

            <div className="space-y-4">
              {cart.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo do Pedido
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  R$ {getTotalPrice().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Quantidade de itens</span>
                <span className="font-medium">{getTotalItems()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">
                    R$ {getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={sendToWhatsApp}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <Phone className="h-5 w-5" />
              Finalizar via WhatsApp
            </button>

            <p className="text-xs text-gray-500 text-center">
              Você será redirecionado para o WhatsApp para finalizar seu pedido
            </p>

            {/* Order Details */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-3">
                Detalhes do Pedido
              </h3>
              <div className="space-y-2 text-sm">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-600 truncate pr-2">
                      {item.quantity}x {item.nome}
                    </span>
                    <span className="font-medium">
                      R$ {(item.preco * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
