import { cacheService } from './cacheService.js'

// Configurações da API
const TINY_TOKEN = '6126c965d5c8d23c0da7b7bc33372c40463b9368fce27eeb36c6e0b3a5e13929'

// Detectar se estamos em desenvolvimento ou produção
const isDevelopment = import.meta.env.DEV
const API_BASE = isDevelopment ? '/api/tiny/api2' : 'https://api.tiny.com.br/api2'

// Controle de rate limiting
const API_RATE_LIMIT = {
  maxRequestsPerMinute: 30,
  requests: [],

  canMakeRequest() {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // Remove requisições antigas
    this.requests = this.requests.filter(time => time > oneMinuteAgo)

    if (this.requests.length >= this.maxRequestsPerMinute) {
      console.warn('⚠️ Rate limit atingido, aguarde antes de fazer mais requisições')
      return false
    }

    this.requests.push(now)
    return true
  },

  getWaitTime() {
    if (this.requests.length === 0) return 0
    const oldestRequest = Math.min(...this.requests)
    const waitTime = 60000 - (Date.now() - oldestRequest)
    return Math.max(0, waitTime)
  }
}

// Função para fazer requisições com cache
const makeRequest = async (endpoint, data, method = 'POST', useCache = true) => {
  try {
    // Verificar rate limiting
    if (!API_RATE_LIMIT.canMakeRequest()) {
      const waitTime = API_RATE_LIMIT.getWaitTime()
      throw new Error(`Rate limit atingido. Aguarde ${Math.ceil(waitTime / 1000)} segundos`)
    }

    const url = `${API_BASE}${endpoint}`
    console.log(`🔄 Fazendo requisição para: ${url}`)

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: data ? new URLSearchParams(data).toString() : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const textResponse = await response.text()

    // Verificar se a resposta é JSON válido
    if (textResponse.trim() === '' || textResponse.trim().startsWith('<')) {
      throw new Error('Resposta vazia ou HTML recebido ao invés de JSON')
    }

    const jsonResponse = JSON.parse(textResponse)
    return jsonResponse

  } catch (error) {
    console.error(`❌ Erro na requisição:`, error.message)
    throw error
  }
}

// Função para testar conexão com a API do Tiny (com cache)
export const testTinyConnection = async () => {
  try {
    // Verificar cache primeiro
    const cachedStatus = cacheService.getApiStatus()
    if (cachedStatus) {
      console.log('✅ Status da API encontrado no cache:', cachedStatus.connected)
      return cachedStatus.connected
    }

    console.log('🔍 Testando conexão com API do Tiny...')

    const data = {
      token: TINY_TOKEN,
      formato: 'json'
    }

    const response = await makeRequest('/info.php', data, 'POST', false)

    const isConnected = response && response.retorno && response.retorno.status === 'OK'

    // Salvar no cache
    cacheService.saveApiStatus({
      connected: isConnected,
      timestamp: new Date().toISOString(),
      accountInfo: isConnected ? response.retorno : null
    })

    if (isConnected) {
      console.log('✅ Conexão com API do Tiny estabelecida!')
      console.log('📊 Dados da conta:', response.retorno)
    } else {
      console.log('⚠️ API respondeu mas com status:', response.retorno?.status)
    }

    return isConnected

  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error.message)

    // Em caso de erro, salvar status negativo no cache por um tempo menor
    cacheService.saveApiStatus({
      connected: false,
      timestamp: new Date().toISOString(),
      error: error.message
    })

    return false
  }
}

// Função para buscar produtos do Tiny com cache inteligente
export const fetchProductsFromTiny = async (forceRefresh = false) => {
  try {
    // Verificar cache primeiro (a menos que seja forçado o refresh)
    if (!forceRefresh) {
      const cachedProducts = cacheService.getProducts()
      if (cachedProducts) {
        console.log(`🎯 ${cachedProducts.length} produtos carregados do cache!`)
        return {
          success: true,
          products: cachedProducts,
          categories: [...new Set(cachedProducts.map(p => p.categoria).filter(Boolean))],
          fromCache: true
        }
      }
    }

    console.log('📦 Buscando produtos da API do Tiny...')

    const data = {
      token: TINY_TOKEN,
      formato: 'json',
      pesquisa: '',
      pagina: 1
    }

    const response = await makeRequest('/produtos.pesquisa.php', data)

    if (response && response.retorno) {
      if (response.retorno.status === 'OK' && response.retorno.produtos) {
        const basicProducts = response.retorno.produtos.map(item => ({
          id: item.produto.id.toString(),
          nome: item.produto.nome?.trim() || 'Produto sem nome',
          preco: parseFloat(item.produto.preco) || 0,
          preco_promocional: parseFloat(item.produto.preco_promocional) || null,
          codigo: item.produto.codigo || `ID-${item.produto.id}`,
          unidade: item.produto.unidade || 'UN',
          gtin: item.produto.gtin || '',
          situacao: item.produto.situacao || 'A',
          data_criacao: item.produto.data_criacao || ''
        }))

        console.log(`✅ ${basicProducts.length} produtos encontrados`)
        console.log('🔄 Carregando detalhes completos (limitado para economizar requisições)...')

        // Carregar detalhes de um número limitado de produtos para economizar requisições
        const maxProductsWithDetails = 20 // Reduzido para economizar API calls
        const productsToDetail = basicProducts.slice(0, maxProductsWithDetails)

        const productsWithDetails = await Promise.allSettled(
          productsToDetail.map(async (product) => {
            try {
              // Verificar se já temos os detalhes no cache
              const cachedDetails = cacheService.getProductDetails(product.id)
              if (cachedDetails) {
                console.log(`📋 Detalhes do produto ${product.id} encontrados no cache`)
                return cachedDetails
              }

              // Se não estiver no cache, buscar da API
              const detailedProduct = await fetchProductById(product.id)
              if (detailedProduct.success) {
                // Salvar detalhes no cache
                cacheService.saveProductDetails(product.id, detailedProduct.product)
                return detailedProduct.product
              } else {
                // Se falhar, usar dados básicos
                return createBasicProduct(product)
              }
            } catch (error) {
              console.warn(`⚠️ Erro ao carregar detalhes do produto ${product.id}:`, error.message)
              return createBasicProduct(product)
            }
          })
        )

        // Processar produtos restantes com dados básicos
        const remainingProducts = basicProducts.slice(maxProductsWithDetails).map(createBasicProduct)

        // Combinar produtos com detalhes e produtos básicos
        const detailedProducts = productsWithDetails.map(result => {
          if (result.status === 'fulfilled') {
            return result.value
          } else {
            console.warn('⚠️ Produto não carregado:', result.reason)
            return null
          }
        }).filter(Boolean)

        const finalProducts = [...detailedProducts, ...remainingProducts]

        // Salvar no cache
        cacheService.saveProducts(finalProducts)

        const categories = [...new Set(finalProducts.map(p => p.categoria).filter(Boolean))]

        console.log(`🎉 ${finalProducts.length} produtos processados (${detailedProducts.length} com detalhes completos)!`)
        console.log(`📸 Produtos com imagens: ${finalProducts.filter(p => p.imagens.length > 0).length}`)

        return {
          success: true,
          products: finalProducts,
          categories: categories.length > 0 ? categories : ['Produtos'],
          pagination: {
            current_page: parseInt(response.retorno.pagina),
            total_pages: parseInt(response.retorno.numero_paginas)
          },
          fromCache: false
        }
      } else {
        console.log('⚠️ API não retornou produtos:', response.retorno.erro || 'Erro desconhecido')
        return {
          success: false,
          products: [],
          categories: [],
          error: response.retorno.erro || 'Nenhum produto encontrado'
        }
      }
    } else {
      throw new Error('Resposta da API não tem formato esperado')
    }

  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error.message)

    // Em caso de erro, tentar retornar do cache mesmo que tenha expirado
    const cachedProducts = cacheService.get('products_cache_expired') || cacheService.getProducts()
    if (cachedProducts) {
      console.log('🔄 Retornando produtos do cache devido a erro na API')
      return {
        success: true,
        products: cachedProducts,
        categories: [...new Set(cachedProducts.map(p => p.categoria).filter(Boolean))],
        fromCache: true,
        hasError: true,
        error: error.message
      }
    }

    return {
      success: false,
      products: [],
      categories: [],
      error: error.message
    }
  }
}

// Função auxiliar para criar produto básico
const createBasicProduct = (product) => {
  return {
    ...product,
    descricao: 'Informações detalhadas disponíveis em breve',
    peso: '0',
    imagens: [],
    categoria: 'Produtos',
    marca: '',
    detalhes_carregados: false
  }
}

// Função para carregar detalhes completos do produto (com cache)
export const fetchProductWithDetails = async (productId) => {
  try {
    // Verificar cache primeiro
    const cachedDetails = cacheService.getProductDetails(productId)
    if (cachedDetails) {
      console.log(`📋 Detalhes do produto ${productId} encontrados no cache`)
      return cachedDetails
    }

    console.log(`🔍 Carregando detalhes do produto ID: ${productId}`)

    const result = await fetchProductById(productId)

    if (result.success) {
      // Salvar no cache
      cacheService.saveProductDetails(productId, result.product)

      console.log(`✅ Detalhes carregados para produto: ${result.product.nome}`)
      console.log(`📸 Encontradas ${result.product.imagens.length} imagens`)
      return result.product
    } else {
      console.log(`❌ Erro ao carregar detalhes: ${result.error}`)
      return null
    }

  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do produto:', error.message)
    return null
  }
}

// Função para buscar produto específico
export const fetchProductById = async (productId) => {
  try {
    console.log(`🔍 Buscando produto ID: ${productId}`)

    const data = {
      token: TINY_TOKEN,
      id: productId,
      formato: 'json'
    }

    const response = await makeRequest('/produto.obter.php', data)

    if (response && response.retorno && response.retorno.status === 'OK') {
      const produto = response.retorno.produto

      // Processar imagens do produto específico conforme documentação
      let imagens = [];

      // 1. Anexos (retorno.produto.anexos[].anexo)
      if (produto.anexos && Array.isArray(produto.anexos)) {
        imagens = produto.anexos.map(anexoItem => ({
          url: anexoItem.anexo,
          descricao: 'Imagem do produto',
          tipo: 'anexo'
        }));
      }

      // 2. Imagens externas (retorno.produto.imagens_externas[].imagem_externa.url)
      if (produto.imagens_externas && Array.isArray(produto.imagens_externas)) {
        const imagensExternas = produto.imagens_externas.map(imgItem => ({
          url: imgItem.imagem_externa?.url,
          descricao: 'Imagem externa',
          tipo: 'externa'
        })).filter(img => img.url); // Remove imagens sem URL

        imagens = [...imagens, ...imagensExternas];
      }

      const productData = {
        id: produto.id.toString(),
        nome: produto.nome || 'Produto sem nome',
        preco: parseFloat(produto.preco) || 0,
        preco_promocional: parseFloat(produto.preco_promocional) || null,
        descricao: produto.descricao_complementar || produto.obs || 'Sem descrição',
        codigo: produto.codigo || '',
        unidade: produto.unidade || 'UN',
        peso: produto.peso_liquido || produto.peso_bruto || '0',
        imagens: imagens,
        categoria: produto.categoria || 'Geral',
        marca: produto.marca || '',
        situacao: produto.situacao || 'A',
        gtin: produto.gtin || '',
        ncm: produto.ncm || '',
        garantia: produto.garantia || '',
        estoque_minimo: produto.estoque_minimo || 0,
        estoque_maximo: produto.estoque_maximo || 0,
        localizacao: produto.localizacao || '',
        data_criacao: produto.data_criacao || '',
        detalhes_carregados: true
      }

      return {
        success: true,
        product: productData
      }
    } else {
      return {
        success: false,
        error: response?.retorno?.erro || 'Produto não encontrado'
      }
    }

  } catch (error) {
    console.error('❌ Erro ao buscar produto:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Função para obter informações do cache
export const getCacheInfo = () => {
  return cacheService.getCacheInfo()
}

// Função para limpar cache
export const clearCache = () => {
  cacheService.clear()
  console.log('🧹 Cache limpo!')
}

// Função para verificar se deve atualizar o cache
export const shouldUpdateCache = () => {
  const cacheInfo = getCacheInfo()
  return !cacheInfo.hasProducts ||
    (cacheInfo.lastUpdate &&
      new Date() - new Date(cacheInfo.lastUpdate) > 30 * 60 * 1000) // 30 minutos
}

// Função para debugar a resposta da API (para desenvolvimento)
export const debugTinyApiResponse = async () => {
  try {
    console.log('🔍 Debug: Testando resposta da API do Tiny...')

    const data = {
      token: TINY_TOKEN,
      formato: 'json',
      pesquisa: '',
      pagina: 1
    }

    const response = await makeRequest('/produtos.pesquisa.php', data, 'POST', false)

    console.log('📋 Resposta completa da API:', JSON.stringify(response, null, 2))

    if (response?.retorno?.produtos?.[0]) {
      const produto = response.retorno.produtos[0].produto
      console.log('🔍 Estrutura do primeiro produto:', {
        id: produto.id,
        nome: produto.nome,
        anexos: produto.anexos,
        imagens_externas: produto.imagens_externas,
        imagensProps: Object.keys(produto).filter(key => key.toLowerCase().includes('imag'))
      })
    }

    return response
  } catch (error) {
    console.error('❌ Erro no debug:', error.message)
    return null
  }
}

// Função para testar diretamente no console (debug)
export const testApiDirectly = async () => {
  try {
    console.log('🔧 Teste direto da API...')

    const url = `${API_BASE}/info.php`
    console.log('🌐 URL completa:', url)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        token: TINY_TOKEN,
        formato: 'json'
      })
    })

    console.log('📡 Status da resposta:', response.status, response.statusText)
    console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()))

    const textResponse = await response.text()
    console.log('📄 Resposta em texto:', textResponse)

    try {
      const jsonResponse = JSON.parse(textResponse)
      console.log('📊 Resposta em JSON:', jsonResponse)
      return jsonResponse
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError.message)
      console.log('📄 Conteúdo que não é JSON:', textResponse.substring(0, 200))
      return null
    }

  } catch (error) {
    console.error('❌ Erro no teste direto:', error.message)
    return null
  }
}

// Função utilitária para verificar status da API
export const getApiStatus = async () => {
  const isConnected = await testTinyConnection()
  const cacheInfo = getCacheInfo()

  return {
    connected: isConnected,
    environment: isDevelopment ? 'development' : 'production',
    apiBase: API_BASE,
    timestamp: new Date().toISOString(),
    cache: cacheInfo,
    rateLimit: {
      requestsThisMinute: API_RATE_LIMIT.requests.length,
      maxPerMinute: API_RATE_LIMIT.maxRequestsPerMinute,
      canMakeRequest: API_RATE_LIMIT.canMakeRequest()
    }
  }
}