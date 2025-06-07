// backend/server.js - Sistema completo de sincronização com Tiny API
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const fetch = require('node-fetch');
const app = express();

// Configurações
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tiny-products';
const TINY_TOKEN = process.env.TINY_TOKEN || '6126c965d5c8d23c0da7b7bc33372c40463b9368fce27eeb36c6e0b3a5e13929';

// Middleware
app.use(cors());
app.use(express.json());

// Schema do Produto
const ProductSchema = new mongoose.Schema({
  tinyId: { type: String, required: true, unique: true, index: true },
  nome: { type: String, required: true },
  codigo: String,
  preco: { type: Number, required: true },
  preco_promocional: { type: Number, default: 0 },
  unidade: String,
  situacao: { type: String, default: 'A' },
  gtin: String,
  categoria: String,
  marca: String,
  descricao_complementar: String,
  peso_liquido: Number,
  peso_bruto: Number,
  anexos: [{
    anexo: String,
    _id: false
  }],
  lastSync: { type: Date, default: Date.now },
  dataSync: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', ProductSchema);

// Schema de Log de Sync
const SyncLogSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  totalProducts: Number,
  newProducts: Number,
  updatedProducts: Number,
  errors: Number,
  status: { type: String, enum: ['running', 'completed', 'failed'] },
  errorDetails: [String]
}, {
  timestamps: true
});

const SyncLog = mongoose.model('SyncLog', SyncLogSchema);

// Classe para gerenciar a sincronização
class TinySync {
  constructor() {
    this.isRunning = false;
    this.currentLog = null;
    this.delay = 2000; // 2s entre requisições
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchFromTiny(endpoint, body) {
    const response = await fetch(`https://api.tiny.com.br/api2/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.retorno?.status === 'Erro') {
      throw new Error(data.retorno.erros?.[0]?.erro || 'Erro na API Tiny');
    }

    return data;
  }

  async getAllProductIds() {
    console.log('📋 Buscando lista de produtos...');
    const allProducts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await this.fetchFromTiny('produtos.pesquisa.php', {
          token: TINY_TOKEN,
          formato: 'json',
          pagina: page.toString()
        });

        if (response.retorno?.produtos) {
          const products = response.retorno.produtos.map(p => ({
            id: p.produto.id,
            nome: p.produto.nome,
            preco: p.produto.preco,
            preco_promocional: p.produto.preco_promocional,
            situacao: p.produto.situacao
          }));

          allProducts.push(...products);
          console.log(`📄 Página ${page}: ${products.length} produtos encontrados`);

          const totalPages = parseInt(response.retorno.numero_paginas);
          hasMore = page < totalPages;
          page++;
        } else {
          hasMore = false;
        }

        // Delay entre páginas
        if (hasMore) {
          await this.delay(this.delay);
        }

      } catch (error) {
        console.error(`❌ Erro na página ${page}:`, error.message);

        // Se for rate limit, aguardar mais tempo
        if (error.message.includes('API Bloqueada')) {
          console.log('⏳ Rate limit detectado, aguardando 2 minutos...');
          await this.delay(120000); // 2 minutos
        } else {
          throw error;
        }
      }
    }

    console.log(`✅ Total de produtos encontrados: ${allProducts.length}`);
    return allProducts;
  }

  async getProductDetails(productId) {
    try {
      const response = await this.fetchFromTiny('produto.obter.php', {
        token: TINY_TOKEN,
        formato: 'json',
        id: productId
      });

      return response.retorno?.produto;
    } catch (error) {
      if (error.message.includes('API Bloqueada')) {
        console.log('⏳ Rate limit no detalhe, aguardando...');
        await this.delay(60000); // 1 minuto
        return this.getProductDetails(productId); // Retry
      }
      throw error;
    }
  }

  async syncAllProducts() {
    if (this.isRunning) {
      console.log('⚠️ Sincronização já está rodando');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Iniciando sincronização completa...');

    // Criar log de sincronização
    this.currentLog = new SyncLog({
      startTime: new Date(),
      status: 'running',
      totalProducts: 0,
      newProducts: 0,
      updatedProducts: 0,
      errors: 0,
      errorDetails: []
    });
    await this.currentLog.save();

    try {
      // Buscar todos os IDs de produtos
      const productList = await this.getAllProductIds();
      this.currentLog.totalProducts = productList.length;
      await this.currentLog.save();

      // Sincronizar cada produto
      for (let i = 0; i < productList.length; i++) {
        const basicProduct = productList[i];

        try {
          console.log(`🔄 Sincronizando produto ${i + 1}/${productList.length}: ${basicProduct.nome}`);

          // Buscar detalhes completos
          const fullProduct = await this.getProductDetails(basicProduct.id);

          if (fullProduct) {
            // Verificar se produto já existe
            const existingProduct = await Product.findOne({ tinyId: basicProduct.id });

            const productData = {
              tinyId: basicProduct.id,
              nome: fullProduct.nome?.trim() || '',
              codigo: fullProduct.codigo || '',
              preco: parseFloat(fullProduct.preco) || 0,
              preco_promocional: parseFloat(fullProduct.preco_promocional) || 0,
              unidade: fullProduct.unidade || '',
              situacao: fullProduct.situacao || 'A',
              gtin: fullProduct.gtin || '',
              categoria: fullProduct.categoria || '',
              marca: fullProduct.marca || '',
              descricao_complementar: fullProduct.descricao_complementar || '',
              peso_liquido: parseFloat(fullProduct.peso_liquido) || 0,
              peso_bruto: parseFloat(fullProduct.peso_bruto) || 0,
              anexos: fullProduct.anexos || [],
              lastSync: new Date()
            };

            if (existingProduct) {
              // Atualizar produto existente
              await Product.findByIdAndUpdate(existingProduct._id, productData);
              this.currentLog.updatedProducts++;
              console.log(`✅ Produto atualizado: ${productData.nome}`);
            } else {
              // Criar novo produto
              const newProduct = new Product(productData);
              await newProduct.save();
              this.currentLog.newProducts++;
              console.log(`🆕 Novo produto criado: ${productData.nome}`);
            }
          }

        } catch (error) {
          console.error(`❌ Erro ao sincronizar produto ${basicProduct.id}:`, error.message);
          this.currentLog.errors++;
          this.currentLog.errorDetails.push(`${basicProduct.id}: ${error.message}`);
        }

        // Delay entre produtos
        await this.delay(this.delay);

        // Salvar progresso a cada 10 produtos
        if ((i + 1) % 10 === 0) {
          await this.currentLog.save();
          console.log(`📊 Progresso: ${i + 1}/${productList.length} (${Math.round((i + 1) / productList.length * 100)}%)`);
        }
      }

      // Finalizar sincronização
      this.currentLog.endTime = new Date();
      this.currentLog.status = 'completed';
      await this.currentLog.save();

      console.log('🎉 Sincronização concluída!');
      console.log(`📊 Resumo: ${this.currentLog.newProducts} novos, ${this.currentLog.updatedProducts} atualizados, ${this.currentLog.errors} erros`);

    } catch (error) {
      console.error('💥 Erro na sincronização:', error);
      this.currentLog.status = 'failed';
      this.currentLog.endTime = new Date();
      this.currentLog.errorDetails.push(`Erro geral: ${error.message}`);
      await this.currentLog.save();
    } finally {
      this.isRunning = false;
    }
  }

  async quickSync() {
    // Sincronização rápida - apenas produtos modificados nas últimas 24h
    console.log('⚡ Iniciando sincronização rápida...');
    // Implementar lógica para buscar apenas produtos modificados
  }
}

const tinySync = new TinySync();

// Rotas da API
app.get('/api/produtos', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, categoria, situacao } = req.query;

    // Construir query
    const query = {};
    if (search) {
      query.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } }
      ];
    }
    if (categoria) query.categoria = categoria;
    if (situacao) query.situacao = situacao;

    // Buscar produtos com paginação
    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ nome: 1 });

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      retorno: {
        status: 'OK',
        produtos: products.map(p => ({ produto: p })),
        pagina: page.toString(),
        numero_paginas: totalPages,
        total_produtos: total
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/produtos/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ tinyId: req.params.id });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({
      retorno: {
        status: 'OK',
        produto: product
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de controle da sincronização
app.post('/api/sync/start', async (req, res) => {
  if (tinySync.isRunning) {
    return res.status(400).json({ error: 'Sincronização já está rodando' });
  }

  // Iniciar sincronização em background
  tinySync.syncAllProducts().catch(console.error);

  res.json({ message: 'Sincronização iniciada' });
});

app.get('/api/sync/status', async (req, res) => {
  const lastLog = await SyncLog.findOne().sort({ createdAt: -1 });

  res.json({
    isRunning: tinySync.isRunning,
    lastSync: lastLog,
    totalProducts: await Product.countDocuments()
  });
});

app.get('/api/sync/logs', async (req, res) => {
  const logs = await SyncLog.find().sort({ createdAt: -1 }).limit(10);
  res.json({ logs });
});

// Estatísticas
app.get('/api/stats', async (req, res) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        comImagem: { $sum: { $cond: [{ $gt: [{ $size: "$anexos" }, 0] }, 1, 0] } },
        promocoes: { $sum: { $cond: [{ $gt: ["$preco_promocional", 0] }, 1, 0] } },
        precoMedio: { $avg: "$preco" }
      }
    }
  ]);

  res.json({
    stats: stats[0] || {},
    lastSync: await SyncLog.findOne().sort({ createdAt: -1 })
  });
});

// Conectar ao MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Conectado ao MongoDB');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 API disponível em http://localhost:${PORT}`);
    });

    // Agendar sincronização diária às 02:00
    cron.schedule('0 2 * * *', () => {
      console.log('⏰ Iniciando sincronização agendada...');
      tinySync.syncAllProducts().catch(console.error);
    });

    // Sincronização rápida a cada 4 horas
    cron.schedule('0 */4 * * *', () => {
      console.log('⏰ Iniciando sincronização rápida...');
      tinySync.quickSync().catch(console.error);
    });

  })
  .catch(err => {
    console.error('❌ Erro ao conectar MongoDB:', err);
    process.exit(1);
  });