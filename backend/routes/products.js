const express = require('express');
const tinyApiClient = require('../utils/tinyApiClient');
const { validateParams, handleApiError } = require('../utils/helpers');

const router = express.Router();

// Listar todos os produtos (API v3)
router.get('/', async (req, res) => {
  try {
    const params = {
      search: req.query.pesquisa || req.query.search, // Compatibilidade com frontend antigo
      category_id: req.query.categoria || req.query.category_id,
      status: req.query.situacao === 'A' ? 'active' : req.query.status, // Converter formato
      page: parseInt(req.query.pagina || req.query.page) || 1,
      limit: parseInt(req.query.limite || req.query.limit) || 50,
      sort: req.query.sort,
      order: req.query.order
    };

    // Remover parâmetros vazios
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    console.log('📋 Buscando produtos v3 com parâmetros:', params);

    const data = await tinyApiClient.getProducts(params);

    // Converter dados para formato compatível com frontend
    const transformedProducts = (data.data || []).map(product =>
      tinyApiClient.convertProductToV2Format(product)
    );

    const transformedData = {
      data: transformedProducts,
      pagination: {
        page: data.meta?.current_page || params.page,
        limit: data.meta?.per_page || params.limit,
        total: data.meta?.total || transformedProducts.length,
        totalPages: data.meta?.last_page || Math.ceil((data.meta?.total || transformedProducts.length) / params.limit)
      },
      success: true
    };

    res.json(transformedData);

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar produtos');
  }
});

// Buscar produto específico (API v3)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateParams({ id }, ['id'])) {
      return res.status(400).json({
        error: 'ID do produto é obrigatório'
      });
    }

    console.log(`🔍 Buscando produto v3 ID: ${id}`);

    const data = await tinyApiClient.getProduct(id);

    // Converter para formato compatível
    const transformedProduct = tinyApiClient.convertProductToV2Format(data.data);

    res.json({
      data: transformedProduct,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar produto');
  }
});

// Buscar imagens de um produto (API v3)
router.get('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🖼️ Buscando imagens do produto v3 ID: ${id}`);

    const data = await tinyApiClient.getProductImages(id);

    res.json({
      data: data.data || [],
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar imagens do produto');
  }
});

// Buscar estoque de um produto (compatibilidade)
router.get('/:id/estoque', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📦 Buscando estoque v3 do produto ID: ${id}`);

    const stockData = await tinyApiClient.getStock(id);

    res.json({
      data: stockData.data,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar estoque do produto');
  }
});

// Buscar produtos por categoria (API v3)
router.get('/categoria/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const params = {
      category_id: categoryId,
      status: req.query.situacao === 'A' ? 'active' : req.query.status,
      page: parseInt(req.query.pagina) || 1,
      limit: parseInt(req.query.limite) || 20
    };

    console.log(`📦 Buscando produtos v3 da categoria ID: ${categoryId}`);

    const data = await tinyApiClient.getProductsByCategory(categoryId, params);

    // Converter dados para formato compatível
    const transformedProducts = (data.data || []).map(product =>
      tinyApiClient.convertProductToV2Format(product)
    );

    res.json({
      data: transformedProducts,
      pagination: {
        page: data.meta?.current_page || params.page,
        limit: data.meta?.per_page || params.limit,
        total: data.meta?.total || transformedProducts.length,
        totalPages: data.meta?.last_page || Math.ceil((data.meta?.total || transformedProducts.length) / params.limit)
      },
      category_id: categoryId,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar produtos da categoria');
  }
});

// Buscar produtos em destaque (personalizado)
router.get('/featured/list', async (req, res) => {
  try {
    console.log('⭐ Buscando produtos em destaque v3');

    // Buscar produtos ativos com limite
    const data = await tinyApiClient.getProducts({
      status: 'active',
      limit: 12,
      sort: 'updated_at',
      order: 'desc'
    });

    // Converter e filtrar produtos com estoque
    let featured = (data.data || [])
      .map(product => tinyApiClient.convertProductToV2Format(product))
      .filter(product => product.estoque > 0)
      .slice(0, 8);

    res.json({
      data: featured,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar produtos em destaque');
  }
});

// ROTA DE DEBUG - versão v3
router.get('/debug/v3', async (req, res) => {
  try {
    console.log('🔍 Debug v3 - testando API Tiny v3 diretamente...');

    // Testar conectividade
    const connectionTest = await tinyApiClient.testConnection();

    if (!connectionTest.success) {
      return res.status(500).json({
        error: 'Falha na conexão com API v3',
        details: connectionTest
      });
    }

    // Testar busca de produtos
    const response = await tinyApiClient.getProducts({ limit: 3 });

    console.log('📊 Resposta da API Tiny v3:', {
      total: response.data?.length || 0,
      primeiros3: response.data?.slice(0, 3),
      meta: response.meta
    });

    res.json({
      debug: true,
      version: 'v3',
      connectionTest,
      totalProdutos: response.data?.length || 0,
      primeiros3Produtos: response.data?.slice(0, 3),
      meta: response.meta,
      respostaCompleta: response
    });

  } catch (error) {
    console.error('❌ Erro no debug v3:', error);
    res.status(500).json({
      error: error.message,
      version: 'v3',
      details: error.response?.data
    });
  }
});

// ROTA PARA DESCOBRIR ENDPOINTS VÁLIDOS DA V3
router.get('/discover/v3', async (req, res) => {
  try {
    const endpointsToTest = [
      '/products',
      '/product_categories',
      '/products?limit=1',
      '/product_categories?limit=1'
    ];

    const results = {};

    for (const endpoint of endpointsToTest) {
      try {
        const response = await tinyApiClient.makeRequest(endpoint);
        results[endpoint] = {
          status: 'SUCCESS',
          hasData: !!response.data,
          count: Array.isArray(response.data) ? response.data.length : 'N/A',
          meta: response.meta || null
        };
      } catch (error) {
        results[endpoint] = {
          status: 'ERROR',
          code: error.response?.status || 'unknown',
          message: error.message
        };
      }

      // Delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    res.json({
      discovery: results,
      version: 'v3'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      version: 'v3'
    });
  }
});

// ENDPOINT TEMPORÁRIO COM DADOS MOCK v3
router.get('/mock/v3', (req, res) => {
  const mockProducts = [
    {
      id: 1,
      nome: 'Produto Teste v3',
      codigo: 'TEST-v3-001',
      preco: 299.99,
      descricao: 'Produto de teste da API v3',
      urlImagem: '/api/placeholder/300/300',
      categoria: { id: 1, descricao: 'Categoria Teste v3' },
      situacao: 'A',
      estoque: 15
    }
  ];

  res.json({
    data: mockProducts,
    pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    success: true,
    version: 'v3',
    note: 'Dados mock v3 para testar interface'
  });
});

// Atualizar preço de um produto (v3)
router.put('/:id/preco', async (req, res) => {
  try {
    const { id } = req.params;
    const { preco, lista_preco_id } = req.body;

    if (!preco || preco <= 0) {
      return res.status(400).json({
        error: 'Preço deve ser maior que zero'
      });
    }

    console.log(`💲 Atualizando preço v3 do produto ID: ${id}`);

    // Adaptar para API v3
    const data = await tinyApiClient.updateProductPrice(id, {
      price: preco,
      price_list_id: lista_preco_id
    });

    res.json({
      data: data.data || data,
      message: 'Preço atualizado com sucesso',
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao atualizar preço do produto');
  }
});

module.exports = router;