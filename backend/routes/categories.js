const express = require('express');
const tinyApiClient = require('../utils/tinyApiClient');
const { handleApiError } = require('../utils/helpers');

const router = express.Router();

// Listar todas as categorias
router.get('/', async (req, res) => {
  try {
    console.log('📂 Buscando todas as categorias');

    const data = await tinyApiClient.getCategories();

    // Transformar dados para o frontend
    const categories = (data.data || []).map(category => ({
      id: category.id,
      descricao: category.descricao || category.nome,
      pai_id: category.pai_id,
      nivel: category.nivel || 0,
      ativo: category.ativo !== false
    }));

    res.json({
      data: categories,
      total: categories.length,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar categorias');
  }
});

// Buscar categorias hierárquicas (organizadas em árvore)
router.get('/tree', async (req, res) => {
  try {
    console.log('🌳 Buscando árvore de categorias');

    const data = await tinyApiClient.getCategories();
    const categories = data.data || [];

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

// Buscar categoria específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔍 Buscando categoria ID: ${id}`);

    // Como a API do Tiny não tem endpoint específico para uma categoria,
    // vamos buscar todas e filtrar
    const data = await tinyApiClient.getCategories();
    const category = (data.data || []).find(cat => cat.id.toString() === id);

    if (!category) {
      return res.status(404).json({
        error: 'Categoria não encontrada',
        success: false
      });
    }

    res.json({
      data: {
        id: category.id,
        descricao: category.descricao || category.nome,
        pai_id: category.pai_id,
        nivel: category.nivel || 0,
        ativo: category.ativo !== false
      },
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar categoria');
  }
});

// Buscar produtos de uma categoria
router.get('/:id/produtos', async (req, res) => {
  try {
    const { id } = req.params;
    const params = {
      categoria: id,
      situacao: req.query.situacao || 'A',
      pagina: parseInt(req.query.pagina) || 1,
      limite: parseInt(req.query.limite) || 20
    };

    console.log(`📦 Buscando produtos da categoria ID: ${id}`);

    const data = await tinyApiClient.getProducts(params);

    res.json({
      data: data.data || [],
      pagination: {
        page: params.pagina,
        limit: params.limite,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / params.limite)
      },
      category_id: id,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar produtos da categoria');
  }
});

// Buscar estatísticas de categorias
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas de categorias');

    const [categoriesData, productsData] = await Promise.all([
      tinyApiClient.getCategories(),
      tinyApiClient.getProducts({ limite: 1000 }) // Buscar muitos produtos para estatísticas
    ]);

    const categories = categoriesData.data || [];
    const products = productsData.data || [];

    // Calcular estatísticas
    const stats = categories.map(category => {
      const categoryProducts = products.filter(product =>
        product.categoria?.id === category.id
      );

      return {
        id: category.id,
        descricao: category.descricao || category.nome,
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
        categorias_com_produtos: stats.filter(s => s.total_produtos > 0).length
      },
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar estatísticas de categorias');
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