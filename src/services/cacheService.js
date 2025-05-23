const CACHE_KEYS = {
  PRODUCTS: 'products_cache',
  PRODUCT_DETAILS: 'product_details_cache',
  API_STATUS: 'api_status_cache',
  LAST_UPDATE: 'last_update_timestamp'
}

const CACHE_DURATION = {
  PRODUCTS: 30 * 60 * 1000, // 30 minutos
  PRODUCT_DETAILS: 60 * 60 * 1000, // 1 hora
  API_STATUS: 5 * 60 * 1000 // 5 minutos
}

class CacheService {
  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability()
  }

  checkLocalStorageAvailability() {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      console.warn('⚠️ localStorage não disponível, usando cache em memória')
      this.memoryCache = new Map()
      return false
    }
  }

  // Função para criar chave de cache com timestamp
  createCacheItem(data, duration = CACHE_DURATION.PRODUCTS) {
    return {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration
    }
  }

  // Função para verificar se o cache expirou
  isExpired(cacheItem) {
    if (!cacheItem || !cacheItem.expiresAt) return true
    return Date.now() > cacheItem.expiresAt
  }

  // Salvar no cache
  set(key, data, duration = CACHE_DURATION.PRODUCTS) {
    try {
      const cacheItem = this.createCacheItem(data, duration)

      if (this.isLocalStorageAvailable) {
        localStorage.setItem(key, JSON.stringify(cacheItem))
      } else {
        this.memoryCache.set(key, cacheItem)
      }

      console.log(`💾 Cache salvo: ${key}`)
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error)
      return false
    }
  }

  // Buscar do cache
  get(key) {
    try {
      let cacheItem

      if (this.isLocalStorageAvailable) {
        const cached = localStorage.getItem(key)
        if (!cached) return null
        cacheItem = JSON.parse(cached)
      } else {
        cacheItem = this.memoryCache.get(key)
        if (!cacheItem) return null
      }

      if (this.isExpired(cacheItem)) {
        console.log(`⏰ Cache expirado: ${key}`)
        this.delete(key)
        return null
      }

      console.log(`✅ Cache encontrado: ${key}`)
      return cacheItem.data
    } catch (error) {
      console.error('❌ Erro ao buscar cache:', error)
      return null
    }
  }

  // Deletar do cache
  delete(key) {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.removeItem(key)
      } else {
        this.memoryCache.delete(key)
      }
      console.log(`🗑️ Cache removido: ${key}`)
    } catch (error) {
      console.error('❌ Erro ao remover cache:', error)
    }
  }

  // Limpar todo o cache
  clear() {
    try {
      if (this.isLocalStorageAvailable) {
        Object.values(CACHE_KEYS).forEach(key => {
          localStorage.removeItem(key)
        })
      } else {
        this.memoryCache.clear()
      }
      console.log('🧹 Cache limpo completamente')
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error)
    }
  }

  // Verificar se existe cache válido
  hasValidCache(key) {
    const cached = this.get(key)
    return cached !== null
  }

  // Obter informações do cache
  getCacheInfo() {
    const info = {
      hasProducts: this.hasValidCache(CACHE_KEYS.PRODUCTS),
      hasApiStatus: this.hasValidCache(CACHE_KEYS.API_STATUS),
      lastUpdate: this.get(CACHE_KEYS.LAST_UPDATE),
      storageType: this.isLocalStorageAvailable ? 'localStorage' : 'memory'
    }

    // Calcular tamanho do cache (apenas localStorage)
    if (this.isLocalStorageAvailable) {
      try {
        const totalSize = Object.values(CACHE_KEYS).reduce((size, key) => {
          const item = localStorage.getItem(key)
          return size + (item ? item.length : 0)
        }, 0)
        info.cacheSizeKB = Math.round(totalSize / 1024 * 100) / 100
      } catch (error) {
        info.cacheSizeKB = 0
      }
    }

    return info
  }

  // Validar integridade dos dados do cache
  validateCacheData(data, type = 'products') {
    if (!data) return false

    switch (type) {
      case 'products':
        return Array.isArray(data) && data.length > 0 &&
          data.every(p => p.id && p.nome && typeof p.preco === 'number')

      case 'product_details':
        return data.id && data.nome && typeof data.preco === 'number'

      case 'api_status':
        return typeof data.connected === 'boolean'

      default:
        return true
    }
  }

  // Métodos específicos para produtos
  saveProducts(products) {
    if (!this.validateCacheData(products, 'products')) {
      console.warn('⚠️ Dados de produtos inválidos, não salvando no cache')
      return false
    }

    const success = this.set(CACHE_KEYS.PRODUCTS, products, CACHE_DURATION.PRODUCTS)
    if (success) {
      this.set(CACHE_KEYS.LAST_UPDATE, new Date().toISOString(), CACHE_DURATION.PRODUCTS)
    }
    return success
  }

  getProducts() {
    const products = this.get(CACHE_KEYS.PRODUCTS)
    if (products && this.validateCacheData(products, 'products')) {
      return products
    }
    return null
  }

  saveProductDetails(productId, details) {
    if (!this.validateCacheData(details, 'product_details')) {
      console.warn('⚠️ Detalhes do produto inválidos, não salvando no cache')
      return false
    }

    const key = `${CACHE_KEYS.PRODUCT_DETAILS}_${productId}`
    return this.set(key, details, CACHE_DURATION.PRODUCT_DETAILS)
  }

  getProductDetails(productId) {
    const key = `${CACHE_KEYS.PRODUCT_DETAILS}_${productId}`
    const details = this.get(key)
    if (details && this.validateCacheData(details, 'product_details')) {
      return details
    }
    return null
  }

  saveApiStatus(status) {
    if (!this.validateCacheData(status, 'api_status')) {
      console.warn('⚠️ Status da API inválido, não salvando no cache')
      return false
    }

    return this.set(CACHE_KEYS.API_STATUS, status, CACHE_DURATION.API_STATUS)
  }

  getApiStatus() {
    const status = this.get(CACHE_KEYS.API_STATUS)
    if (status && this.validateCacheData(status, 'api_status')) {
      return status
    }
    return null
  }
}

// Instância singleton do serviço de cache
export const cacheService = new CacheService()

// Exportar constantes para uso em outros módulos
export { CACHE_KEYS, CACHE_DURATION }