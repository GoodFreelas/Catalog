// Configurações da API
const TINY_TOKEN = '6126c965d5c8d23c0da7b7bc33372c40463b9368fce27eeb36c6e0b3a5e13929'

// Detectar se estamos em desenvolvimento ou produção
const isDevelopment = import.meta.env.DEV
const API_BASE = isDevelopment ? '/api/tiny/api2' : 'https://api.tiny.com.br/api2'

// Função para fazer requisições
const makeRequest = async (endpoint, data, method = 'POST') => {
  try {
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

// Função para testar conexão com a API do Tiny
export const testTinyConnection = async () => {
  try {
    console.log('🔍 Testando conexão com API do Tiny...')

    const data = {
      token: TINY_TOKEN,
      formato: 'json'
    }

    const response = await makeRequest('/info.php', data)

    console.log('📋 Resposta completa da API info:', response)

    if (response && response.retorno) {
      if (response.retorno.status === 'OK') {
        console.log('✅ Conexão com API do Tiny estabelecida!')
        console.log('📊 Dados da conta:', response.retorno)
        return true
      } else {
        console.log('⚠️ API respondeu mas com status:', response.retorno.status)
        if (response.retorno.erros && response.retorno.erros.length > 0) {
          console.log('❌ Erros da API:', response.retorno.erros)
        }
        if (response.retorno.codigo_erro) {
          console.log('❌ Código de erro:', response.retorno.codigo_erro)
        }
        return false
      }
    } else {
      console.log('⚠️ Resposta da API não tem formato esperado:', response)
      return false
    }

  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error.message)

    // Se estamos em desenvolvimento e o erro for de rede, pode ser problema do proxy
    if (isDevelopment && error.message.includes('fetch')) {
      console.log('💡 Dica: Verifique se o proxy está configurado corretamente no vite.config.js')
    }

    return false
  }
}

// Função para buscar produtos do Tiny com detalhes completos
export const fetchProductsFromTiny = async () => {
  try {
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
        console.log('🔄 Carregando detalhes completos (incluindo imagens)...')

        // Carregar detalhes de todos os produtos (limitando para não sobrecarregar)
        const productsWithDetails = await Promise.allSettled(
          basicProducts.slice(0, 50).map(async (product) => { // Limitar a 50 produtos para não sobrecarregar
            try {
              const detailedProduct = await fetchProductById(product.id)
              if (detailedProduct.success) {
                return {
                  ...detailedProduct.product,
                  detalhes_carregados: true
                }
              } else {
                // Se falhar, manter dados básicos
                return {
                  ...product,
                  descricao: 'Sem descrição disponível',
                  peso: '0',
                  imagens: [],
                  categoria: 'Produtos',
                  marca: '',
                  detalhes_carregados: false
                }
              }
            } catch (error) {
              console.warn(`⚠️ Erro ao carregar detalhes do produto ${product.id}:`, error.message)
              return {
                ...product,
                descricao: 'Sem descrição disponível',
                peso: '0',
                imagens: [],
                categoria: 'Produtos',
                marca: '',
                detalhes_carregados: false
              }
            }
          })
        )

        // Processar resultados
        const finalProducts = productsWithDetails.map(result => {
          if (result.status === 'fulfilled') {
            return result.value
          } else {
            console.warn('⚠️ Produto não carregado:', result.reason)
            return null
          }
        }).filter(Boolean) // Remove nulls

        // Extrair categorias únicas
        const categories = [...new Set(finalProducts.map(p => p.categoria).filter(Boolean))]

        console.log(`🎉 ${finalProducts.length} produtos carregados com detalhes completos!`)
        console.log(`📸 Produtos com imagens: ${finalProducts.filter(p => p.imagens.length > 0).length}`)

        return {
          success: true,
          products: finalProducts,
          categories: categories.length > 0 ? categories : ['Produtos'],
          pagination: {
            current_page: parseInt(response.retorno.pagina),
            total_pages: parseInt(response.retorno.numero_paginas)
          }
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
    return {
      success: false,
      products: [],
      categories: [],
      error: error.message
    }
  }
}

// Função para carregar detalhes completos do produto (incluindo imagens)
export const fetchProductWithDetails = async (productId) => {
  try {
    console.log(`🔍 Carregando detalhes do produto ID: ${productId}`)

    const result = await fetchProductById(productId)

    if (result.success) {
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

      return {
        success: true,
        product: {
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
          data_criacao: produto.data_criacao || ''
        }
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

// Função para buscar todos os produtos usando produto.obter.php
export const fetchAllProductsIndividually = async (productIds) => {
  try {
    console.log('📦 Buscando produtos individualmente...')

    const products = []
    const errors = []

    for (const id of productIds) {
      try {
        const result = await fetchProductById(id)
        if (result.success) {
          products.push(result.product)
        } else {
          errors.push({ id, error: result.error })
        }
      } catch (error) {
        errors.push({ id, error: error.message })
      }
    }

    console.log(`✅ ${products.length} produtos carregados individualmente`)
    if (errors.length > 0) {
      console.log(`⚠️ ${errors.length} produtos com erro:`, errors)
    }

    return {
      success: true,
      products,
      errors,
      categories: [...new Set(products.map(p => p.categoria))]
    }

  } catch (error) {
    console.error('❌ Erro ao buscar produtos individualmente:', error.message)
    return {
      success: false,
      products: [],
      errors: [{ error: error.message }],
      categories: []
    }
  }
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

    const response = await makeRequest('/produtos.pesquisa.php', data)

    console.log('📋 Resposta completa da API:', JSON.stringify(response, null, 2))

    if (response?.retorno?.produtos?.[0]) {
      const produto = response.retorno.produtos[0].produto
      console.log('🔍 Estrutura do primeiro produto:', {
        id: produto.id,
        nome: produto.nome,
        anexos: produto.anexos,
        imagens_externas: produto.imagens_externas,
        // Mostrar todas as propriedades que começam com 'imag'
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

    // Teste 1: Verificar se o proxy está funcionando
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
  return {
    connected: isConnected,
    environment: isDevelopment ? 'development' : 'production',
    apiBase: API_BASE,
    timestamp: new Date().toISOString()
  }
}