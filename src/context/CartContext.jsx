import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.preco * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const sendToWhatsApp = () => {
    if (cart.length === 0) {
      alert("Carrinho vazio!");
      return;
    }

    const WHATSAPP_NUMBER = "5551986485232"; // Substitua pelo seu número

    let message = "🛒 *Pedido do Catálogo*\n\n";

    cart.forEach((item) => {
      message += `• ${item.nome}\n`;
      message += `  Qtd: ${item.quantity}\n`;
      message += `  Valor unit.: R$ ${item.preco.toFixed(2)}\n`;
      message += `  Subtotal: R$ ${(item.preco * item.quantity).toFixed(
        2
      )}\n\n`;
    });

    message += `💰 *Total: R$ ${getTotalPrice().toFixed(2)}*\n\n`;
    message += "Gostaria de finalizar este pedido!";

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart,
    sendToWhatsApp,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
