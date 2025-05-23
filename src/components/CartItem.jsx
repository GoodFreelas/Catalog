import React from "react";
import { Plus, Minus, X, Package } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
      {/* Product Image */}
      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
        {item.imagens && item.imagens.length > 0 ? (
          <img
            src={item.imagens[0].url}
            alt={item.nome}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div className="flex items-center justify-center">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.nome}</h4>
        <p className="text-sm text-gray-600">R$ {item.preco.toFixed(2)} cada</p>
        <p className="text-sm font-medium text-blue-600">
          Subtotal: R$ {(item.preco * item.quantity).toFixed(2)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default CartItem;
