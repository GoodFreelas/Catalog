import { useEffect } from "react";
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import clsx from "clsx";

import Button from "../../../../shared/components/atoms/Button/Button";
import { useCartStore } from "../../../../core/stores/cartStore";
import { formatCurrency } from "../../../../core/utils/formatters";
import {
  sendWhatsAppMessage,
  formatCartMessage,
} from "../../../../core/utils/whatsapp";

const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
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

  // Bloquear scroll quando drawer está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Carrinho vazio!");
      return;
    }

    try {
      const message = formatCartMessage(items);
      sendWhatsAppMessage(message);

      toast.success("Redirecionando para WhatsApp!");
      closeCart();
    } catch (error) {
      console.error("Erro ao enviar para WhatsApp:", error);
      toast.error("Erro ao abrir WhatsApp. Tente novamente.");
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Carrinho limpo!");
  };

  const drawerVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
    exit: { x: "100%" },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-40 lg:z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-strong z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-secondary-900">
                  Carrinho
                </h2>
                {totalItems > 0 && (
                  <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={closeCart}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                // Carrinho vazio
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <ShoppingCart className="w-16 h-16 text-secondary-300 mb-4" />
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">
                    Seu carrinho está vazio
                  </h3>
                  <p className="text-secondary-600 text-sm mb-6">
                    Adicione produtos para começar suas compras
                  </p>
                  <Button onClick={closeCart}>Continuar comprando</Button>
                </div>
              ) : (
                // Lista de produtos
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onRemove={removeItem}
                      onUpdateQuantity={updateQuantity}
                      onIncrement={incrementQuantity}
                      onDecrement={decrementQuantity}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer com totais e ações */}
            {items.length > 0 && (
              <div className="border-t border-secondary-200 p-4 space-y-4">
                {/* Resumo */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">
                      Itens ({totalItems})
                    </span>
                    <span className="text-secondary-900">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-secondary-900">Total</span>
                    <span className="text-primary-600">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleCheckout}
                    leftIcon={<MessageCircle />}
                  >
                    Finalizar no WhatsApp
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={handleClearCart}
                    leftIcon={<Trash2 />}
                    className="text-error-600 hover:text-error-700 hover:bg-error-50"
                  >
                    Limpar carrinho
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Componente do item do carrinho
const CartItem = ({
  item,
  onRemove,
  onUpdateQuantity,
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
      className="flex gap-3 p-3 bg-secondary-50 rounded-lg"
    >
      {/* Imagem do produto */}
      <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg overflow-hidden border border-secondary-200">
        {hasImage ? (
          <img
            src={item.anexos[0].anexo}
            alt={item.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary-100">
            <ShoppingCart className="w-6 h-6 text-secondary-400" />
          </div>
        )}
      </div>

      {/* Informações do produto */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm text-secondary-900 line-clamp-2">
            {item.nome}
          </h4>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => onRemove(item.id)}
            className="p-1 text-secondary-400 hover:text-error-600 hover:bg-error-50 ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          {/* Controles de quantidade */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onDecrement(item.id)}
              className="p-1 hover:bg-secondary-200"
            >
              <Minus className="w-3 h-3" />
            </Button>

            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => onIncrement(item.id)}
              className="p-1 hover:bg-secondary-200"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Preços */}
          <div className="text-right">
            <div className="text-xs text-secondary-600">
              {formatCurrency(item.preco)} cada
            </div>
            <div className="font-semibold text-sm text-primary-600">
              {formatCurrency(itemTotal)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartDrawer;
