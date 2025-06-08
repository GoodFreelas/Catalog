import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  MessageCircle,
  Package,
} from "lucide-react";
import Button from "../components/atoms/Button";
import Badge from "../components/atoms/Badge";
import { useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";

const CartPage = () => {
  const {
    items,
    total,
    itemCount,
    updateQuantity,
    removeItem,
    clearCart,
    sendToWhatsApp,
  } = useCart();

  const [whatsappNumber, setWhatsappNumber] = useState("5551999999999");
  const [showWhatsappForm, setShowWhatsappForm] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId, productName) => {
    removeItem(productId);
    toast.success(`${productName} removido do carrinho`);
  };

  const handleClearCart = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o carrinho?")) {
      clearCart();
    }
  };

  const handleSendToWhatsApp = () => {
    if (items.length === 0) {
      toast.error("Carrinho está vazio!");
      return;
    }

    sendToWhatsApp(whatsappNumber);
    toast.success("Redirecionando para o WhatsApp...");
  };

  const formatPrice = (price) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-600 mb-8">
              Adicione alguns produtos ao seu carrinho para continuar
            </p>
            <Link to="/">
              <Button size="large">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Carrinho de Compras
            </h1>
            <p className="text-gray-600">
              {itemCount} {itemCount === 1 ? "item" : "itens"} no seu carrinho
            </p>
          </div>

          <Link
            to="/"
            className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuar Comprando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cabeçalho da lista */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Itens do Carrinho
              </h2>

              {items.length > 1 && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar Carrinho
                </Button>
              )}
            </div>

            {/* Itens */}
            {items.map((item) => {
              const finalPrice =
                item.preco_promocional > 0
                  ? item.preco_promocional
                  : item.preco;
              const itemTotal = finalPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex gap-4">
                    {/* Imagem do produto */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imagem ? (
                        <img
                          src={item.imagem}
                          alt={item.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Informações do produto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <Link
                            to={`/produto/${item.id}`}
                            className="font-medium text-gray-900 hover:text-primary-600 block truncate"
                          >
                            {item.nome}
                          </Link>

                          {item.categoria && (
                            <Badge
                              variant="default"
                              size="small"
                              className="mt-1"
                            >
                              {item.categoria}
                            </Badge>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleRemoveItem(item.id, item.nome)}
                          className="text-red-600 hover:text-red-700 p-1 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Preço e quantidade */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-green-600">
                            {formatPrice(finalPrice)}
                          </span>

                          {item.preco_promocional > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.preco)}
                            </span>
                          )}
                        </div>

                        {/* Controles de quantidade */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="p-1 text-gray-600 hover:text-gray-800"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="px-3 py-1 border-x border-gray-300 min-w-[50px] text-center text-sm">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="p-1 text-gray-600 hover:text-gray-800"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <span className="text-sm font-medium text-gray-900 min-w-[80px] text-right">
                            {formatPrice(itemTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-6">
            {/* Card do Resumo */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo do Pedido
              </h3>

              {/* Itens do resumo */}
              <div className="space-y-3 mb-4">
                {items.map((item) => {
                  const finalPrice =
                    item.preco_promocional > 0
                      ? item.preco_promocional
                      : item.preco;
                  const itemTotal = finalPrice * item.quantity;

                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate">
                        {item.quantity}x {item.nome}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(itemTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Formulário WhatsApp */}
                {!showWhatsappForm ? (
                  <Button
                    onClick={() => setShowWhatsappForm(true)}
                    size="large"
                    className="w-full mb-3"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Finalizar via WhatsApp
                  </Button>
                ) : (
                  <div className="space-y-3 mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Número do WhatsApp (com código do país)
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="5551999999999"
                      className="input-field"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSendToWhatsApp} className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Enviar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowWhatsappForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-600 text-center">
                  Você será redirecionado para o WhatsApp com os detalhes do seu
                  pedido
                </p>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                💡 Como funciona?
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Clique em "Finalizar via WhatsApp"</li>
                <li>• Você será redirecionado com os detalhes</li>
                <li>• Nossa equipe entrará em contato</li>
                <li>• Combinamos pagamento e entrega</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botão mobile para continuar comprando */}
        <div className="md:hidden mt-8">
          <Link to="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuar Comprando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
