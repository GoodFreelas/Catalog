const express = require('express');
const Product = require('../models/Product');
const { logger } = require('../utils/logger'); // Corrigido: destructuring do logger

const router = express.Router();

/**
 * @route GET /products
 * @desc Listar produtos com paginação e filtros
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Máximo 100 por página
    const skip = (page - 1) * limit;

    // Filtros opcionais
    const filters = {};

    if (req.query.situacao) {
      filters.situacao = req.query.situacao;
    }

    if (req.query.categoria) {
      filters.categoria = new RegExp(req.query.categoria, 'i');
    }

    if (req.query.search) {
      filters.$or = [
        { nome: new RegExp(req.query.search, 'i') },
        { codigo: new RegExp(req.query.search, 'i') },
        { descricao_complementar: new RegExp(req.query.search, 'i') }
      ];
    }

    if (req.query.preco_min || req.query.preco_max) {
      filters.preco = {};
      if (req.query.preco_min) filters.preco.$gte = parseFloat(req.query.preco_min);
      if (req.query.preco_max) filters.preco.$lte = parseFloat(req.query.preco_max);
    }

    // Ordenação
    let sortBy = { sync_date: -1 }; // Padrão: mais recentes primeiro

    if (req.query.sort) {
      const sortField = req.query.sort;
      const sortOrder = req.query.order === 'asc' ? 1 : -1;
      sortBy = { [sortField]: sortOrder };
    }

    // Buscar produtos
    const products = await Product.find(filters)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select('-__v'); // Excluir campo de versioning

    const total = await Product.countDocuments(filters);

    // Estatísticas adicionais
    const stats = {
      total_products: total,
      active_products: await Product.countDocuments({ ...filters, situacao: 'A' }),
      products_with_images: await Product.countDocuments({
        ...filters,
        'anexos.0': { $exists: true }
      })
    };

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_products: total,
          per_page: limit,
          has_next: page < Math.ceil(total / limit),
          has_prev: page > 1
        },
        filters_applied: filters,
        stats
      }
    });

  } catch (error) {
    logger.error('Erro ao listar produtos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

/**
 * @route GET /products/:id
 * @desc Buscar produto específico por ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id }).select('-__v');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado',
        message: `Produto com ID ${req.params.id} não existe`
      });
    }

    // Metadados adicionais
    const metadata = {
      is_active: product.isActive(),
      has_images: product.hasImages(),
      main_image: product.getMainImage(),
      last_sync: product.sync_date,
      days_since_sync: Math.floor((new Date() - product.sync_date) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      data: {
        product,
        metadata
      }
    });

  } catch (error) {
    logger.error(`Erro ao buscar produto ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

/**
 * @route GET /products/search/text
 * @desc Busca textual em produtos
 * @access Public
 */
router.get('/search/text', async (req, res) => {
  try {
    const { q: searchTerm, limit = 10 } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro de busca obrigatório',
        message: 'Forneça o parâmetro "q" com o termo de busca'
      });
    }

    const products = await Product.searchByName(searchTerm)
      .limit(parseInt(limit))
      .select('id nome preco categoria anexos situacao');

    res.json({
      success: true,
      data: {
        search_term: searchTerm,
        results_count: products.length,
        products
      }
    });

  } catch (error) {
    logger.error('Erro na busca textual:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

/**
 * @route GET /products/stats/general
 * @desc Estatísticas gerais dos produtos
 * @access Public
 */
router.get('/stats/general', async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          total_products: { $sum: 1 },
          active_products: {
            $sum: { $cond: [{ $eq: ['$situacao', 'A'] }, 1, 0] }
          },
          inactive_products: {
            $sum: { $cond: [{ $eq: ['$situacao', 'I'] }, 1, 0] }
          },
          products_with_images: {
            $sum: { $cond: [{ $gt: [{ $size: '$anexos' }, 0] }, 1, 0] }
          },
          avg_price: { $avg: '$preco' },
          max_price: { $max: '$preco' },
          min_price: { $min: '$preco' },
          total_categories: { $addToSet: '$categoria' }
        }
      }
    ]);

    const categoriesCount = await Product.aggregate([
      { $match: { categoria: { $ne: null, $ne: '' } } },
      { $group: { _id: '$categoria', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const recentSync = await Product.findOne()
      .sort({ sync_date: -1 })
      .select('sync_date');

    res.json({
      success: true,
      data: {
        general_stats: stats[0] || {},
        top_categories: categoriesCount,
        last_sync: recentSync?.sync_date || null,
        total_unique_categories: categoriesCount.length
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

/**
 * @route GET /products/categories
 * @desc Listar categorias disponíveis
 * @access Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { categoria: { $ne: null, $ne: '' } } },
      {
        $group: {
          _id: '$categoria',
          count: { $sum: 1 },
          active_count: {
            $sum: { $cond: [{ $eq: ['$situacao', 'A'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        total_categories: categories.length,
        categories: categories.map(cat => ({
          name: cat._id,
          total_products: cat.count,
          active_products: cat.active_count
        }))
      }
    });

  } catch (error) {
    logger.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

/**
 * @route GET /products/category/:category
 * @desc Listar produtos de uma categoria específica
 * @access Public
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const products = await Product.findByCategory(category)
      .skip(skip)
      .limit(limit)
      .select('id nome preco anexos sync_date');

    const total = await Product.countDocuments({
      categoria: category,
      situacao: 'A'
    });

    res.json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_products: total,
          per_page: limit
        }
      }
    });

  } catch (error) {
    logger.error(`Erro ao buscar produtos da categoria ${req.params.category}:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

module.exports = router;