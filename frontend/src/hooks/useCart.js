import { useState, useEffect } from 'react';
import { whatsappService } from '../services/whatsapp';

export const useCart = () => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Salvar no localStorage sempre que o carrinho mudar
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }, [cart]);

  // Adicionar produto ao carrinho
  const addToCart = (product, quantity = 1) => {
    if (!product || quantity <= 0) return;

    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);

      if (existingItem) {
        // Se já existe, atualiza a quantidade respeitando o estoque
        return prev.map(item =>
          item.id === product.id
            ? {
              ...item,
              quantity: Math.min(item.quantity + quantity, product.estoque || 999)
            }
            : item
        );
      }

      // Se não existe, adiciona novo item
      return [...prev, {
        ...product,
        quantity: Math.min(quantity, product.estoque || 999)
      }];
    });
  };

  // Atualizar quantidade de um item
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.id === productId) {
          const maxQuantity = item.estoque || 999;
          return {
            ...item,
            quantity: Math.min(newQuantity, maxQuantity)
          };
        }
        return item;
      })
    );
  };

  // Remover produto do carrinho
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Limpar carrinho
  const clearCart = () => {
    setCart([]);
  };

  // Verificar se produto está no carrinho
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  // Obter quantidade de um produto no carrinho
  const getItemQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Calcular total de itens
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Calcular subtotal (sem descontos)
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.preco * item.quantity), 0);
  };

  // Calcular total com descontos (se houver)
  const getTotalPrice = (discount = 0) => {
    const subtotal = getSubtotal();
    return Math.max(0, subtotal - discount);
  };

  // Verificar se carrinho tem itens
  const hasItems = () => {
    return cart.length > 0;
  };

  // Obter resumo do carrinho
  const getCartSummary = () => {
    return {
      itemCount: getTotalItems(),
      subtotal: getSubtotal(),
      total: getTotalPrice(),
      isEmpty: !hasItems()
    };
  };

  // Validar carrinho (verificar estoque)
  const validateCart = () => {
    const errors = [];

    cart.forEach(item => {
      if (item.quantity > (item.estoque || 0)) {
        errors.push({
          productId: item.id,
          productName: item.nome,
          requestedQuantity: item.quantity,
          availableStock: item.estoque || 0,
          message: `${item.nome}: apenas ${item.estoque || 0} unidades disponíveis`
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Enviar carrinho via WhatsApp
  const sendToWhatsApp = (customerInfo = {}) => {
    if (!hasItems()) {
      throw new Error('Carrinho vazio');
    }

    const validation = validateCart();
    if (!validation.isValid) {
      throw new Error(`Problemas com estoque: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    try {
      whatsappService.sendCart(cart, customerInfo);
      return true;
    } catch (error) {
      console.error('Erro ao enviar para WhatsApp:', error);
      throw error;
    }
  };

  // Aplicar cupom de desconto (funcionalidade futura)
  const applyCoupon = (couponCode) => {
    // Implementar lógica de cupons aqui
    console.log('Aplicando cupom:', couponCode);
  };

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity,
    getTotalItems,
    getSubtotal,
    getTotalPrice,
    hasItems,
    getCartSummary,
    validateCart,
    sendToWhatsApp,
    applyCoupon
  };
};