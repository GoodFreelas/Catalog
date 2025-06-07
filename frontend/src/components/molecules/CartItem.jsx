import React, { useState } from "react";
import { Plus, Minus, X, Edit3 } from "lucide-react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

export const CartItem = ({
  item,
  onUpdateQuantity,
  onRemove,
  showImage = true,
  editable = true,
  className = "",
}) => {
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(item.quantity.toString());
  const [imageError, setImageError] = useState(false);

  const price =
    item.preco_promocional > 0 ? item.preco_promocional : item.preco;
  const total = price * item.quantity;
  const hasPromotion = item.preco_promocional > 0;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    onUpdateQuantity(item.id, newQuantity);
  };

  const handleEditQuantity = () => {
    setIsEditingQuantity(true);
    setTempQuantity(item.quantity.toString());
  };

  const handleSaveQuantity = () => {
    const newQuantity = parseInt(tempQuantity);
    if (newQuantity > 0) {
      onUpdateQuantity(item.id, newQuantity);
    }
    setIsEditingQuantity(false);
  };

  const handleCancelEdit = () => {
    setIsEditingQuantity(false);
    setTempQuantity(item.quantity.toString());
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSaveQuantity();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${className}`}
    >
      {/* Product Image */}
      {showImage && (
        <div className="flex-shrink-0">
          {!imageError ? (
            <img
              src={
                item.anexos &&
                Array.isArray(item.anexos) &&
                item.anexos.length > 0 &&
                item.anexos[0]?.anexo
                  ? item.anexos[0].anexo
                  : `https://via.placeholder.com/80x80/e5e7eb/6b7280?text=${encodeURIComponent(
                      "Vonixx"
                    )}`
              }
              alt={item.nome}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-500">Sem foto</span>
            </div>
          )}
        </div>
      )}

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
          {item.nome}
        </h4>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>
            R$ {price.toFixed(2)} / {item.unidade}
          </span>
          {hasPromotion && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
              Promoção
            </span>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      {editable && (
        <div className="flex items-center gap-2">
          {!isEditingQuantity ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-8 h-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1">
                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={handleEditQuantity}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Editar quantidade"
                >
                  <Edit3 className="w-3 h-3 text-gray-400" />
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="w-8 h-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={tempQuantity}
                onChange={(e) => setTempQuantity(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-16 text-center"
                min="1"
                autoFocus
              />
              <Button
                variant="success"
                size="sm"
                onClick={handleSaveQuantity}
                className="w-8 h-8 p-0"
              >
                ✓
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelEdit}
                className="w-8 h-8 p-0"
              >
                ✕
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Price Display */}
      <div className="text-right min-w-0">
        {hasPromotion && (
          <div className="text-xs text-gray-500 line-through">
            R$ {(item.preco * item.quantity).toFixed(2)}
          </div>
        )}
        <p className="font-semibold text-lg">R$ {total.toFixed(2)}</p>
      </div>

      {/* Remove Button */}
      {editable && (
        <Button
          variant="danger"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="w-8 h-8 p-0 flex-shrink-0"
          title="Remover item"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
