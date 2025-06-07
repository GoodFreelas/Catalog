const express = require('express');
const tinyApiClient = require('../utils/tinyApiClient');
const { validateParams, handleApiError } = require('../utils/helpers');

const router = express.Router();

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const params = {
      pesquisa: req.query.pesquisa,
      categoria: req.query.categoria,
      situacao: req.query.situacao || 'A', // Por padrão, apenas produtos ativos
      pagina: parseInt(req.query.pagina) || 1,
      limite: parseInt(req.query.limite) || 50
    };

    // Remover parâmetros vazios
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    console.log('📋 Buscando produtos com parâmetros:', params);

    const data = await tinyApiClient.getProducts(params);

    // Transformar dados para o frontend
    const transformedData = {
      data: data.data || [],
      pagination: {
        page: params.pagina,
        limit: params.limite,
        total: data.total || data.data?.length || 0,
        totalPages: Math.ceil((data.total || data.data?.length || 0) / params.limite)
      },
      success: true
    };

    res.json(transformedData);

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar produtos');
  }
});

// Buscar produto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateParams({ id }, ['id'])) {
      return res.status(400).json({
        error: 'ID do produto é obrigatório'
      });
    }

    console.log(`🔍 Buscando produto ID: ${id}`);

    const data = await tinyApiClient.getProduct(id);

    res.json({
      data: data.data || data,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar produto');
  }
});

// Buscar custos de um produto
router.get('/:id/custos', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`💰 Buscando custos do produto ID: ${id}`);

    const data = await tinyApiClient.makeRequest(`/produtos/${id}/custos`);

    res.json({
      data: data.data || data,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar custos do produto');
  }
});

// Buscar tags de um produto
router.get('/:id/tags', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🏷️ Buscando tags do produto ID: ${id}`);

    const data = await tinyApiClient.makeRequest(`/produtos/${id}/tags`);

    res.json({
      data: data.data || data,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar tags do produto');
  }
});

// Atualizar preço de um produto
router.put('/:id/preco', async (req, res) => {
  try {
    const { id } = req.params;
    const { preco, lista_preco_id } = req.body;

    if (!preco || preco <= 0) {
      return res.status(400).json({
        error: 'Preço deve ser maior que zero'
      });
    }

    console.log(`💲 Atualizando preço do produto ID: ${id}`);

    const data = await tinyApiClient.updateProductPrice(id, {
      preco,
      lista_preco_id
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

// Buscar variações de um produto
router.get('/:id/variacoes', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔄 Buscando variações do produto ID: ${id}`);

    const data = await tinyApiClient.makeRequest(`/produtos/${id}/variacoes`);

    res.json({
      data: data.data || data,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar variações do produto');
  }
});

// Buscar produtos fabricados/kits
router.get('/:id/fabricado', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🏭 Buscando info de fabricação do produto ID: ${id}`);

    const data = await tinyApiClient.makeRequest(`/produtos/${id}/fabricado`);

    res.json({
      data: data.data || data,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar informações de fabricação');
  }
});

// Buscar informações de kit
router.get('/:id/kit', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📦 Buscando info de kit do produto ID: ${id}`);

    const data = await tinyApiClient.makeRequest(`/produtos/${id}/kit`);

    res.json({
      data: data.data || data,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar informações de kit');
  }
});

// Buscar produtos em destaque (personalizado)
router.get('/featured/list', async (req, res) => {
  try {
    console.log('⭐ Buscando produtos em destaque');

    // Buscar produtos ativos com estoque
    const data = await tinyApiClient.getProducts({
      situacao: 'A',
      limite: 12
    });

    // Filtrar produtos com estoque e ordenar por algum critério
    let featured = (data.data || [])
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

// ROTA DE DEBUG - adicionar no início
router.get('/debug', async (req, res) => {
  try {
    const tinyApiClient = require('../utils/tinyApiClient');

    console.log('🔍 Debug - testando API Tiny diretamente...');

    // Testar sem filtros
    const response = await tinyApiClient.makeRequest('/produtos');

    console.log('📊 Resposta da API Tiny:', {
      total: response.data?.length || 0,
      primeiros3: response.data?.slice(0, 3),
      paginacao: response.pagination
    });

    res.json({
      debug: true,
      totalProdutos: response.data?.length || 0,
      primeiros3Produtos: response.data?.slice(0, 3),
      respostaCompleta: response
    });

  } catch (error) {
    console.error('❌ Erro no debug:', error);
    res.status(500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

module.exports = router;