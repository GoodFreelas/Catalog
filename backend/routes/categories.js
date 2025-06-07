const express = require('express');
const tinyApiClient = require('../utils/tinyApiClient');
const { handleApiError } = require('../utils/helpers');

const router = express.Router();

// Listar todas as categorias (API v3)
router.get('/', async (req, res) => {
  try {
    console.log('📂 Buscando todas as categorias v3');

    const params = {
      page: parseInt(req.query.pagina || req.query.page) || 1,
      limit: parseInt(req.query.limite || req.query.limit) || 100,
      status: req.query.status || 'active'
    };

    const data = await tinyApiClient.getCategories(params);

    // Transformar dados para o frontend (formato compatível)
    const categories = (data.data || []).map(category =>
      tinyApiClient.convertCategoryToV2Format(category)
    );

    res.json({
      data: categories,
      total: data.meta?.total || categories.length,
      pagination: {
        page: data.meta?.current_page || params.page,
        limit: data.meta?.per_page || params.limit,
        total: data.meta?.total || categories.length,
        totalPages: data.meta?.last_page || Math.ceil((data.meta?.total || categories.length) / params.limit)
      },
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar categorias');
  }
});

// Buscar categorias hierárquicas (organizadas em árvore)
router.get('/tree', async (req, res) => {
  try {
    console.log('🌳 Buscando árvore de categorias v3');

    // Buscar todas as categorias
    const data = await tinyApiClient.getCategories({ limit: 1000 });
    const categories = (data.data || []).map(category =>
      tinyApiClient.convertCategoryToV2Format(category)
    );

    // Organizar em estrutura hierárquica
    const categoryTree = buildCategoryTree(categories);

    res.json({
      data: categoryTree,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar árvore de categorias');
  }
});

// Buscar categoria específica (API v3)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔍 Buscando categoria v3 ID: ${id}`);

    const data = await tinyApiClient.getCategory(id);

    if (!data.data) {
      return res.status(404).json({
        error: 'Categoria não encontrada',
        success: false
      });
    }

    // Converter para formato compatível
    const transformedCategory = tinyApiClient.convertCategoryToV2Format(data.data);

    res.json({
      data: transformedCategory,
      success: true
    });

  } catch (error) {
    if (error.message.includes('404')) {
      return res.status(404).json({
        error: 'Categoria não encontrada',
        success: false
      });
    }
    handleApiError(error, res, 'Erro ao buscar categoria');
  }
});

// Buscar produtos de uma categoria (API v3)
router.get('/:id/produtos', async (req, res) => {
  try {
    const { id } = req.params;
    const params = {
      category_id: id,
      status: req.query.situacao === 'A' ? 'active' : req.query.status || 'active',
      page: parseInt(req.query.pagina || req.query.page) || 1,
      limit: parseInt(req.query.limite || req.query.limit) || 20,
      sort: req.query.sort,
      order: req.query.order
    };

    console.log(`📦 Buscando produtos v3 da categoria ID: ${id}`);

    const data = await tinyApiClient.getProductsByCategory(id, params);

    // Converter produtos para formato compatível
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
      category_id: id,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar produtos da categoria');
  }
});

// Buscar subcategorias de uma categoria (API v3)
router.get('/:id/subcategorias', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📁 Buscando subcategorias v3 da categoria ID: ${id}`);

    const params = {
      parent_id: id,
      status: req.query.status || 'active',
      limit: parseInt(req.query.limit) || 100
    };

    const data = await tinyApiClient.getCategories(params);

    // Converter para formato compatível
    const subcategories = (data.data || []).map(category =>
      tinyApiClient.convertCategoryToV2Format(category)
    );

    res.json({
      data: subcategories,
      parent_id: id,
      total: data.meta?.total || subcategories.length,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar subcategorias');
  }
});

// Buscar estatísticas de categorias (API v3)
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas de categorias v3');

    // Buscar categorias e produtos em paralelo
    const [categoriesData, productsData] = await Promise.all([
      tinyApiClient.getCategories({ limit: 1000 }),
      tinyApiClient.getProducts({ limit: 1000, status: 'active' })
    ]);

    const categories = (categoriesData.data || []).map(category =>
      tinyApiClient.convertCategoryToV2Format(category)
    );

    const products = (productsData.data || []).map(product =>
      tinyApiClient.convertProductToV2Format(product)
    );

    // Calcular estatísticas
    const stats = categories.map(category => {
      const categoryProducts = products.filter(product =>
        product.categoria?.id === category.id
      );

      return {
        id: category.id,
        descricao: category.descricao,
        total_produtos: categoryProducts.length,
        produtos_ativos: categoryProducts.filter(p => p.situacao === 'A').length,
        produtos_com_estoque: categoryProducts.filter(p => p.estoque > 0).length,
        valor_total_estoque: categoryProducts.reduce((sum, p) =>
          sum + ((p.preco || 0) * (p.estoque || 0)), 0
        )
      };
    });

    res.json({
      data: stats,
      summary: {
        total_categorias: categories.length,
        total_produtos: products.length,
        categorias_com_produtos: stats.filter(s => s.total_produtos > 0).length,
        categorias_ativas: categories.filter(c => c.ativo).length
      },
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar estatísticas de categorias');
  }
});

// Buscar categorias raiz (sem pai)
router.get('/root/list', async (req, res) => {
  try {
    console.log('🌱 Buscando categorias raiz v3');

    const params = {
      parent_id: null, // ou pode ser que a API v3 use outro parâmetro
      status: 'active',
      limit: 100
    };

    const data = await tinyApiClient.getCategories(params);

    // Converter para formato compatível
    const rootCategories = (data.data || [])
      .map(category => tinyApiClient.convertCategoryToV2Format(category))
      .filter(category => !category.pai_id);

    res.json({
      data: rootCategories,
      total: rootCategories.length,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar categorias raiz');
  }
});

// Função auxiliar para construir árvore de categorias
function buildCategoryTree(categories) {
  const categoryMap = new Map();
  const tree = [];

  // Primeiro, criar um mapa de todas as categorias
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: []
    });
  });

  // Depois, construir a árvore
  categories.forEach(category => {
    const categoryNode = categoryMap.get(category.id);

    if (category.pai_id && categoryMap.has(category.pai_id)) {
      // Tem pai, adicionar como filho
      categoryMap.get(category.pai_id).children.push(categoryNode);
    } else {
      // Não tem pai, é categoria raiz
      tree.push(categoryNode);
    }
  });

  return tree;
}

module.exports = router;