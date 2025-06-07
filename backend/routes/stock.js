const express = require('express');
const tinyApiClient = require('../utils/tinyApiClient');
const { validateParams, handleApiError } = require('../utils/helpers');

const router = express.Router();

// Buscar estoque de um produto
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateParams({ id }, ['id'])) {
      return res.status(400).json({
        error: 'ID do produto é obrigatório'
      });
    }

    console.log(`📦 Buscando estoque do produto ID: ${id}`);

    const data = await tinyApiClient.getStock(id);

    // Transformar dados para formato consistente
    const stockInfo = {
      produto_id: id,
      quantidade: data.data?.quantidade || data.quantidade || 0,
      quantidade_reservada: data.data?.quantidade_reservada || 0,
      quantidade_disponivel: (data.data?.quantidade || data.quantidade || 0) -
        (data.data?.quantidade_reservada || 0),
      localizacao: data.data?.localizacao || '',
      ultima_atualizacao: data.data?.ultima_atualizacao || new Date().toISOString()
    };

    res.json({
      data: stockInfo,
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar estoque do produto');
  }
});

// Atualizar estoque de um produto
router.post('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      quantidade,
      operacao = 'substituir', // 'substituir', 'adicionar', 'subtrair'
      motivo,
      localizacao
    } = req.body;

    if (!validateParams({ id, quantidade }, ['id', 'quantidade'])) {
      return res.status(400).json({
        error: 'ID do produto e quantidade são obrigatórios'
      });
    }

    if (quantidade < 0) {
      return res.status(400).json({
        error: 'Quantidade não pode ser negativa'
      });
    }

    console.log(`📝 Atualizando estoque do produto ID: ${id} - Operação: ${operacao}`);

    const stockData = {
      quantidade,
      operacao,
      motivo: motivo || 'Atualização via API',
      localizacao
    };

    const data = await tinyApiClient.updateStock(id, stockData);

    res.json({
      data: data.data || data,
      message: 'Estoque atualizado com sucesso',
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao atualizar estoque do produto');
  }
});

// Buscar histórico de movimentação de estoque
router.get('/:id/historico', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      data_inicio,
      data_fim,
      tipo_movimento,
      pagina = 1,
      limite = 50
    } = req.query;

    console.log(`📜 Buscando histórico de estoque do produto ID: ${id}`);

    // Como a API do Tiny pode não ter endpoint específico para histórico,
    // vamos simular ou adaptar conforme a documentação real
    const params = new URLSearchParams();
    if (data_inicio) params.append('data_inicio', data_inicio);
    if (data_fim) params.append('data_fim', data_fim);
    if (tipo_movimento) params.append('tipo_movimento', tipo_movimento);
    params.append('pagina', pagina);
    params.append('limite', limite);

    const endpoint = `/estoque/${id}/historico?${params.toString()}`;

    try {
      const data = await tinyApiClient.makeRequest(endpoint);

      res.json({
        data: data.data || [],
        pagination: {
          page: parseInt(pagina),
          limit: parseInt(limite),
          total: data.total || 0
        },
        success: true
      });
    } catch (error) {
      // Se o endpoint não existir, retornar dados mock ou erro amigável
      if (error.message.includes('404')) {
        res.json({
          data: [],
          message: 'Histórico de estoque não disponível nesta versão da API',
          success: true
        });
      } else {
        throw error;
      }
    }

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar histórico de estoque');
  }
});

// Buscar estoque de múltiplos produtos
router.post('/bulk', async (req, res) => {
  try {
    const { produto_ids } = req.body;

    if (!Array.isArray(produto_ids) || produto_ids.length === 0) {
      return res.status(400).json({
        error: 'Lista de IDs de produtos é obrigatória'
      });
    }

    if (produto_ids.length > 100) {
      return res.status(400).json({
        error: 'Máximo de 100 produtos por consulta'
      });
    }

    console.log(`📦 Buscando estoque de ${produto_ids.length} produtos`);

    // Buscar estoque de cada produto (em paralelo, mas com limite)
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < produto_ids.length; i += batchSize) {
      const batch = produto_ids.slice(i, i + batchSize);

      const batchPromises = batch.map(async (id) => {
        try {
          const stockData = await tinyApiClient.getStock(id);
          return {
            produto_id: id,
            quantidade: stockData.data?.quantidade || stockData.quantidade || 0,
            quantidade_reservada: stockData.data?.quantidade_reservada || 0,
            success: true
          };
        } catch (error) {
          return {
            produto_id: id,
            error: error.message,
            success: false
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    res.json({
      data: successful,
      errors: failed,
      summary: {
        total_solicitados: produto_ids.length,
        total_sucesso: successful.length,
        total_erro: failed.length
      },
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao buscar estoque em lote');
  }
});

// Relatório de estoque baixo
router.get('/relatorio/baixo', async (req, res) => {
  try {
    const { limite_minimo = 5, categoria, pagina = 1, limite = 50 } = req.query;

    console.log(`⚠️ Gerando relatório de estoque baixo (limite: ${limite_minimo})`);

    // Buscar produtos para análise
    const productsData = await tinyApiClient.getProducts({
      situacao: 'A',
      categoria,
      limite: 1000 // Buscar muitos produtos para análise
    });

    const products = productsData.data || [];

    // Filtrar produtos com estoque baixo
    const lowStockProducts = products
      .filter(product => {
        const stock = product.estoque || 0;
        return stock > 0 && stock <= parseInt(limite_minimo);
      })
      .map(product => ({
        id: product.id,
        nome: product.nome,
        codigo: product.codigo,
        categoria: product.categoria?.descricao || 'Sem categoria',
        estoque_atual: product.estoque || 0,
        preco: product.preco || 0,
        valor_estoque: (product.preco || 0) * (product.estoque || 0)
      }))
      .sort((a, b) => a.estoque_atual - b.estoque_atual);

    // Paginação manual
    const startIndex = (parseInt(pagina) - 1) * parseInt(limite);
    const endIndex = startIndex + parseInt(limite);
    const paginatedResults = lowStockProducts.slice(startIndex, endIndex);

    res.json({
      data: paginatedResults,
      pagination: {
        page: parseInt(pagina),
        limit: parseInt(limite),
        total: lowStockProducts.length,
        totalPages: Math.ceil(lowStockProducts.length / parseInt(limite))
      },
      summary: {
        total_produtos_estoque_baixo: lowStockProducts.length,
        limite_minimo_usado: parseInt(limite_minimo),
        valor_total_estoque_baixo: lowStockProducts.reduce((sum, p) => sum + p.valor_estoque, 0)
      },
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao gerar relatório de estoque baixo');
  }
});

// Relatório geral de estoque
router.get('/relatorio/geral', async (req, res) => {
  try {
    const { categoria } = req.query;

    console.log('📊 Gerando relatório geral de estoque');

    const productsData = await tinyApiClient.getProducts({
      situacao: 'A',
      categoria,
      limite: 1000
    });

    const products = productsData.data || [];

    // Calcular estatísticas
    const stats = {
      total_produtos: products.length,
      produtos_com_estoque: products.filter(p => (p.estoque || 0) > 0).length,
      produtos_sem_estoque: products.filter(p => (p.estoque || 0) === 0).length,
      produtos_estoque_baixo: products.filter(p => (p.estoque || 0) > 0 && (p.estoque || 0) <= 5).length,
      total_unidades_estoque: products.reduce((sum, p) => sum + (p.estoque || 0), 0),
      valor_total_estoque: products.reduce((sum, p) => sum + ((p.preco || 0) * (p.estoque || 0)), 0),
      preco_medio: products.length > 0 ?
        products.reduce((sum, p) => sum + (p.preco || 0), 0) / products.length : 0
    };

    // Top 10 produtos por valor de estoque
    const topByValue = products
      .map(p => ({
        id: p.id,
        nome: p.nome,
        codigo: p.codigo,
        estoque: p.estoque || 0,
        preco: p.preco || 0,
        valor_estoque: (p.preco || 0) * (p.estoque || 0)
      }))
      .sort((a, b) => b.valor_estoque - a.valor_estoque)
      .slice(0, 10);

    res.json({
      data: {
        estatisticas: stats,
        top_produtos_por_valor: topByValue
      },
      success: true
    });

  } catch (error) {
    handleApiError(error, res, 'Erro ao gerar relatório geral de estoque');
  }
});

module.exports = router;