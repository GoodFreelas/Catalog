// External Libraries
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
import { CartStoreState, CartStoreItem, CartPersistState, Product } from '../../types/stores';

export const useCartStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      items: [],
      isOpen: false,

      // Ações
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);

          if (existingItem) {
            // Atualiza quantidade se já existe
            return {
              items: state.items.map(item =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          } else {
            // Adiciona novo item
            return {
              items: [...state.items, { ...product, quantity }],
            };
          }
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.id === productId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      incrementQuantity: (productId) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }));
      },

      decrementQuantity: (productId) => {
        set((state) => {
          const item = state.items.find(item => item.id === productId);
          if (!item) return state;

          if (item.quantity <= 1) {
            return {
              items: state.items.filter(item => item.id !== productId),
            };
          }

          return {
            items: state.items.map(item =>
              item.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      // Getters computados
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = parseFloat(item.preco) || 0;
          return total + (price * item.quantity);
        }, 0);
      },

      getItemQuantity: (productId) => {
        const item = get().items.find(item => item.id === productId);
        return item ? item.quantity : 0;
      },

      isInCart: (productId) => {
        return get().items.some(item => item.id === productId);
      },

      // Formatação para WhatsApp
      getWhatsAppMessage: () => {
        const { items } = get();
        const totalPrice = get().getTotalPrice();

        if (items.length === 0) {
          return 'Carrinho vazio';
        }

        let message = '🛒 *Meu Pedido:*\n\n';

        items.forEach((item, index) => {
          const itemTotal = parseFloat(item.preco) * item.quantity;
          message += `${index + 1}. *${item.nome}*\n`;
          message += `   Qtd: ${item.quantity}x\n`;
          message += `   Preço: R$ ${parseFloat(item.preco).toFixed(2)}\n`;
          message += `   Subtotal: R$ ${itemTotal.toFixed(2)}\n\n`;
        });

        message += `💰 *Total: R$ ${totalPrice.toFixed(2)}*\n\n`;
        message += 'Gostaria de finalizar este pedido! 😊';

        return message;
      },
    }),
    {
      name: 'cart-storage', // Nome da chave no localStorage
      partialize: (state) => ({
        items: state.items // Apenas os items são persistidos
      }),
    }
  )
);