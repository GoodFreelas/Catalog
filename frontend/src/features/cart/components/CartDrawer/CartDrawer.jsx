import { useEffect } from "react";
import { X, ShoppingCart, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import Button from "../../../../shared/components/atoms/Button/Button";
import { useCartStore } from "../../../../core/stores/cartStore";
import { formatCurrency } from "../../../../core/utils/formatters";
import {
  sendWhatsAppMessage,
  formatCartMessage,
} from "../../../../core/utils/whatsapp";
import { assets } from "../../../../assets";
import ExitIcon from "../ExitIcon/ExitIcon";

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
            {/* Header Customizado */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              {/* Título à esquerda */}
              <h2
                className="text-xl font-semibold text-secondary-900"
                style={{ fontFamily: "Mona Sans, sans-serif" }}
              >
                Carrinho
              </h2>

              {/* ExitIcon à direita */}
              <button
                onClick={closeCart}
                className="p-2 rounded hover:scale-110 transition-transform duration-200 ease-in-out focus:outline-none"
              >
                <ExitIcon size={16} className="text-secondary-600" />
              </button>
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
                      Produtos ({totalItems})
                    </span>
                    <span className="text-secondary-900">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-secondary-900">Total</span>
                    <span className="text-black-600">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="space-y-3">
                  {/* Botão WhatsApp com primary-600 e animação */}
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
                  >
                    {/* Efeito de brilho animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] hover:animate-[shimmer_1.5s_ease-in-out] pointer-events-none"></div>

                    <img
                      src={assets.whats}
                      alt="WhatsApp"
                      className="w-6 h-6"
                    />
                    <span className="text-lg font-bold tracking-wide">
                      Finalizar no WhatsApp
                    </span>
                  </button>

                  {/* Botão limpar carrinho com hover scale */}
                  <button
                    onClick={handleClearCart}
                    className="w-full py-3 px-4 text-gray-600 hover:text-red-600 font-medium hover:scale-105 transition-all duration-200 ease-in-out flex items-center justify-center gap-2"
                  >
                    <img src={assets.trash} alt="Limpar" className="w-5 h-5" />
                    <span>Limpar carrinho</span>
                  </button>
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
      className="border border-secondary-300 rounded-lg p-3 bg-white"
    >
      <div className="flex gap-3 items-center">
        {/* Imagem do produto */}
        <div
          className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${assets.bgItem})`,
            backgroundSize: "75%",
          }}
        >
          {hasImage ? (
            <img
              src={item.anexos[0].anexo}
              alt={item.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-secondary-400" />
            </div>
          )}
        </div>

        {/* Informações do produto */}
        <div className="flex-1 min-w-0">
          {/* Título */}
          <div className="flex justify-between items-start">
            <h4
              className="font-medium text-sm text-secondary-900 line-clamp-2 pr-2"
              style={{ fontFamily: "Mona Sans" }}
            >
              {item.nome}
            </h4>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onRemove(item.id)}
              className="text-secondary-400 hover:text-error-600 hover:scale-110 transition-all duration-200 ease-in-out"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Valor */}
          <div className="text-left">
            <div
              className="text-sm text-black"
              style={{ fontFamily: "Mona Sans", fontWeight: 700 }}
            >
              {formatCurrency(itemTotal)}
            </div>

            {/* Controles de quantidade */}
            <div className="flex items-center gap-1 mt-2">
              {/* Botão - (vermelho) */}
              <button
                onClick={() => onDecrement(item.id)}
                className="w-3 h-3 rounded-full flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform duration-200 ease-in-out"
                style={{ backgroundColor: "#C80F2E" }}
              >
                <Minus className="w-2 h-2" />
              </button>

              {/* Quantidade no meio */}
              <span
                className="w-4 text-center text-base font-medium"
                style={{ fontFamily: "Mona Sans" }}
              >
                {item.quantity}
              </span>

              {/* Botão + (verde) */}
              <button
                onClick={() => onIncrement(item.id)}
                className="w-3 h-3 rounded-full flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform duration-200 ease-in-out"
                style={{ backgroundColor: "#006336" }}
              >
                <Plus className="w-2 h-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartDrawer;
