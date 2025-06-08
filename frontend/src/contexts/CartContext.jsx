import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

const initialState = {
  items: [],
  total: 0,
  itemCount: 0
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        return calculateTotals({ ...state, items: updatedItems })
      }
      
      const newItems = [...state.items, { ...action.payload, quantity: 1 }]
      return calculateTotals({ ...state, items: newItems })
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload)
      return calculateTotals({ ...state, items: updatedItems })
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const updatedItems = state.items.filter(item => item.id !== action.payload.id)
        return calculateTotals({ ...state, items: updatedItems })
      }
      
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      return calculateTotals({ ...state, items: updatedItems })
    }
    
    case 'CLEAR_CART': {
      return { ...initialState }
    }
    
    case 'LOAD_CART': {
      return calculateTotals({ ...state, items: action.payload })
    }
    
    default:
      return state
  }
}

function calculateTotals(state) {
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0)
  const total = state.items.reduce((total, item) => {
    const price = item.preco_promocional > 0 ? item.preco_promocional : item.preco
    return total + (price * item.quantity)
  }, 0)
  
  return {
    ...state,
    itemCount,
    total: Math.round(total * 100) / 100 // Arredondar para 2 casas decimais
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
      }
    }
  }, [])

  // Salvar carrinho no localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: {
      id: product.tinyId,
      nome: product.nome,
      preco: product.preco,
      preco_promocional: product.preco_promocional,
      imagem: product.anexos?.[0]?.anexo || '',
      categoria: product.categoria
    }})
    toast.success('Produto adicionado ao carrinho!')
  }

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
    toast.success('Produto removido do carrinho!')
  }

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity }})
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Carrinho limpo!')
  }

  const generateWhatsAppMessage = () => {
    if (state.items.length === 0) return ''
    
    let message = '🛒 *Meu Pedido:*\n\n'
    
    state.items.forEach((item, index) => {
      const price = item.preco_promocional > 0 ? item.preco_promocional : item.preco
      const itemTotal = price * item.quantity
      
      message += `${index + 1}. *${item.nome}*\n`
      message += `   Quantidade: ${item.quantity}\n`
      message += `   Preço unitário: R$ ${price.toFixed(2).replace('.', ',')}\n`
      message += `   Subtotal: R$ ${itemTotal.toFixed(2).replace('.', ',')}\n\n`
    })
    
    message += `💰 *Total: R$ ${state.total.toFixed(2).replace('.', ',')}*\n\n`
    message += 'Gostaria de finalizar este pedido! 😊'
    
    return encodeURIComponent(message)
  }

  const sendToWhatsApp = (phoneNumber = '5551999999999') => {
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    sendToWhatsApp,
    generateWhatsAppMessage
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider')
  }
  return context
}
