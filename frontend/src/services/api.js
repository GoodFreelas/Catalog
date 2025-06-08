import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Interceptador para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error)
    return Promise.reject(error)
  }
)

export const productService = {
  // Buscar produtos com filtros e paginação
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao buscar produtos')
    }
  },

  // Buscar produto específico por ID
  async getProduct(id) {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao buscar produto')
    }
  },

  // Buscar categorias disponíveis
  async getCategories() {
    try {
      const response = await api.get('/products/categories')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao buscar categorias')
    }
  },

  // Buscar estatísticas gerais
  async getStats() {
    try {
      const response = await api.get('/products/stats/summary')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao buscar estatísticas')
    }
  },

  // Sincronizar produtos manualmente
  async syncProducts() {
    try {
      const response = await api.post('/products/sync')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro na sincronização')
    }
  }
}

// Serviço para cache de produtos no sessionStorage
export const cacheService = {
  // Armazenar produtos no cache
  setProducts(key, data, expirationMinutes = 30) {
    const expirationTime = Date.now() + (expirationMinutes * 60 * 1000)
    const cacheData = {
      data,
      expiration: expirationTime
    }
    sessionStorage.setItem(`products_${key}`, JSON.stringify(cacheData))
  },

  // Recuperar produtos do cache
  getProducts(key) {
    try {
      const cached = sessionStorage.getItem(`products_${key}`)
      if (!cached) return null

      const cacheData = JSON.parse(cached)
      
      // Verificar se o cache expirou
      if (Date.now() > cacheData.expiration) {
        sessionStorage.removeItem(`products_${key}`)
        return null
      }

      return cacheData.data
    } catch (error) {
      console.error('Erro ao ler cache:', error)
      return null
    }
  },

  // Limpar todo o cache de produtos
  clearProductsCache() {
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith('products_')) {
        sessionStorage.removeItem(key)
      }
    })
  },

  // Armazenar produto individual
  setProduct(id, data) {
    this.setProducts(`product_${id}`, data, 60) // Cache por 1 hora
  },

  // Recuperar produto individual
  getProduct(id) {
    return this.getProducts(`product_${id}`)
  }
}

export default api
