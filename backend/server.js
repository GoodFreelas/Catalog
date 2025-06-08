const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cron = require('node-cron');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração do MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tiny_products', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema do Produto
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nome: String,
  codigo: String,
  unidade: String,
  preco: Number,
  preco_promocional: Number,
  ncm: String,
  origem: String,
  gtin: String,
  gtin_embalagem: String,
  localizacao: String,
  peso_liquido: Number,
  peso_bruto: Number,
  estoque_minimo: Number,
  estoque_maximo: Number,
  id_fornecedor: Number,
  nome_fornecedor: String,
  codigo_fornecedor: String,
  codigo_pelo_fornecedor: String,
  unidade_por_caixa: String,
  preco_custo: Number,
  preco_custo_medio: Number,
  situacao: String,
  tipo: String,
  classe_ipi: String,
  valor_ipi_fixo: String,
  cod_lista_servicos: String,
  descricao_complementar: String,
  garantia: String,
  cest: String,
  obs: String,
  tipoVariacao: String,
  variacoes: String,
  idProdutoPai: String,
  sob_encomenda: String,
  dias_preparacao: String,
  marca: String,
  tipoEmbalagem: String,
  alturaEmbalagem: String,
  comprimentoEmbalagem: String,
  larguraEmbalagem: String,
  diametroEmbalagem: String,
  qtd_volumes: String,
  categoria: String,
  anexos: [{ anexo: String }],
  imagens_externas: [String],
  classe_produto: String,
  seo_title: String,
  seo_keywords: String,
  link_video: String,
  seo_description: String,
  slug: String,
  last_updated: { type: Date, default: Date.now },
  sync_date: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Configuração da API Tiny
const TINY_API_CONFIG = {
  token: process.env.TINY_TOKEN || '6126c965d5c8d23c0da7b7bc33372c40463b9368fce27eeb36c6e0b3a5e13929',
  baseURL: 'https://api.tiny.com.br',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

// Rate Limiter para API do Tiny (25 req/min)
class TinyRateLimiter {
  constructor(maxRequests = 25, windowMs = 60000) { // 25 req por 60 segundos
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
    this.totalRequests = 0;
  }

  async waitForAvailability() {
    const now = Date.now();

    // Remove requisições antigas (fora da janela de tempo)
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    // Se atingiu o limite, aguarda
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest) + 1000; // +1s de segurança

      console.log(`⏱️ Rate limit atingido. Aguardando ${Math.ceil(waitTime / 1000)}s...`);
      console.log(`📊 Requisições na janela atual: ${this.requests.length}/${this.maxRequests}`);

      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForAvailability(); // Verifica novamente após esperar
    }

    // Registra a nova requisição
    this.requests.push(now);
    this.totalRequests++;

    console.log(`🌐 Requisição ${this.totalRequests} - (${this.requests.length}/${this.maxRequests} na janela atual)`);
  }

  getStats() {
    const now = Date.now();
    const activeRequests = this.requests.filter(time => now - time < this.windowMs);

    return {
      total_requests: this.totalRequests,
      requests_in_current_window: activeRequests.length,
      max_requests_per_window: this.maxRequests,
      window_duration_ms: this.windowMs,
      available_slots: this.maxRequests - activeRequests.length
    };
  }
}

// Instanciar o rate limiter com configurações do ambiente
const tinyRateLimiter = new TinyRateLimiter(
  parseInt(process.env.TINY_RATE_LIMIT_REQUESTS) || 25,
  parseInt(process.env.TINY_RATE_LIMIT_WINDOW) || 60000
);

// Função para fazer requisições à API do Tiny com rate limiting
async function tinyApiRequest(endpoint, data) {
  try {
    // Aguardar disponibilidade antes de fazer a requisição
    await tinyRateLimiter.waitForAvailability();

    console.log(`🌐 Fazendo requisição para: ${endpoint}`);
    console.log(`📤 Dados enviados:`, { ...data, token: '***' }); // Ocultar token nos logs

    const response = await axios.post(`${TINY_API_CONFIG.baseURL}${endpoint}`,
      new URLSearchParams({
        token: TINY_API_CONFIG.token,
        formato: 'json',
        ...data
      }).toString(),
      {
        headers: TINY_API_CONFIG.headers,
        timeout: 30000 // 30 segundos de timeout
      }
    );

    console.log(`📥 Status da resposta: ${response.status}`);

    if (response.data.retorno) {
      console.log(`📋 Status do retorno: ${response.data.retorno.status}`);
      if (response.data.retorno.erro) {
        console.log(`⚠️ Erro retornado pela API:`, response.data.retorno.erro);
      }
    }

    return response.data;
  } catch (error) {
    console.error(`❌ Erro na requisição para ${endpoint}:`);
    console.error(`📋 Mensagem:`, error.message);

    if (error.response) {
      console.error(`📊 Status HTTP:`, error.response.status);
      console.error(`📄 Dados da resposta:`, error.response.data);
    } else if (error.request) {
      console.error(`📡 Erro de rede - sem resposta do servidor`);
    }

    throw error;
  }
}

// Função para buscar todos os produtos (com paginação e rate limiting)
async function fetchAllProducts() {
  let allProducts = [];
  let currentPage = 1;
  let hasMorePages = true;

  console.log('📦 Iniciando busca paginada de produtos...');

  while (hasMorePages) {
    try {
      console.log(`📄 Buscando página ${currentPage}...`);

      const response = await tinyApiRequest('/api2/produtos.pesquisa.php', {
        pagina: currentPage
      });

      if (response.retorno.status === 'OK' && response.retorno.produtos) {
        const products = response.retorno.produtos;
        allProducts = allProducts.concat(products);

        // Verificar se há mais páginas
        const totalPages = response.retorno.numero_paginas || 1;
        hasMorePages = currentPage < totalPages;

        console.log(`✅ Página ${currentPage}/${totalPages} processada`);
        console.log(`📊 Produtos encontrados nesta página: ${products.length}`);
        console.log(`📈 Total acumulado: ${allProducts.length}`);

        currentPage++;

        // Rate limiter já controla o timing, não precisa de delay adicional aqui

      } else {
        console.log('⚠️ Nenhum produto encontrado ou erro na resposta:', response.retorno);
        hasMorePages = false;
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar página ${currentPage}:`, error.message);

      // Em caso de erro de rate limit, tenta novamente após esperar
      if (error.response?.status === 429) {
        console.log('⏱️ Rate limit detectado pelo servidor. Aguardando 2 minutos...');
        await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutos
        continue; // Tenta a mesma página novamente
      }

      hasMorePages = false;
    }
  }

  console.log(`🎯 Busca concluída: ${allProducts.length} produtos encontrados`);
  return allProducts;
}

// Função para buscar detalhes de um produto específico
async function fetchProductDetails(productId) {
  try {
    const response = await tinyApiRequest('/api2/produto.obter.php', {
      id: productId
    });

    if (response.retorno.status === 'OK' && response.retorno.produto) {
      return response.retorno.produto;
    } else {
      console.log(`Produto ${productId} não encontrado ou erro:`, response.retorno);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao buscar detalhes do produto ${productId}:`, error.message);
    return null;
  }
}

// Função para salvar ou atualizar produto no MongoDB
async function saveOrUpdateProduct(productData) {
  try {
    const existingProduct = await Product.findOne({ id: productData.id });

    if (existingProduct) {
      // Atualizar produto existente
      await Product.findOneAndUpdate(
        { id: productData.id },
        {
          ...productData,
          last_updated: new Date(),
          sync_date: new Date()
        },
        { new: true }
      );
      console.log(`Produto ${productData.id} atualizado: ${productData.nome}`);
    } else {
      // Criar novo produto
      const newProduct = new Product({
        ...productData,
        sync_date: new Date()
      });
      await newProduct.save();
      console.log(`Produto ${productData.id} criado: ${productData.nome}`);
    }
  } catch (error) {
    console.error(`Erro ao salvar produto ${productData.id}:`, error.message);
  }
}

// Função principal de sincronização
async function syncProducts() {
  try {
    console.log('🔄 Iniciando sincronização de produtos...');
    console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'));
    const startTime = new Date();

    // Testar conexão com a API do Tiny primeiro
    console.log('🔍 Testando conexão com API do Tiny...');
    const testResponse = await tinyApiRequest('/api2/produtos.pesquisa.php', { pagina: 1 });

    if (testResponse.retorno.status !== 'OK') {
      throw new Error(`Erro na API do Tiny: ${testResponse.retorno.erro || 'Status não OK'}`);
    }

    console.log('✅ Conexão com API do Tiny estabelecida');

    // Buscar lista de produtos
    console.log('📦 Buscando lista de produtos...');
    const productsList = await fetchAllProducts();
    console.log(`📊 Total de produtos encontrados: ${productsList.length}`);

    if (productsList.length === 0) {
      console.log('⚠️ Nenhum produto encontrado para sincronizar');
      await saveSyncLog(0, 0, 'Nenhum produto encontrado');
      return;
    }

    // Buscar detalhes de cada produto e salvar no banco
    let processedCount = 0;
    let errorCount = 0;

    console.log('🔍 Iniciando busca de detalhes dos produtos...');

    for (let i = 0; i < productsList.length; i++) {
      const productSummary = productsList[i];
      const productName = productSummary.produto?.nome || 'Nome não disponível';
      const productId = productSummary.produto?.id;

      console.log(`⏳ ${i + 1}/${productsList.length}: ${productName} (ID: ${productId})`);

      try {
        // Buscar detalhes completos do produto (rate limiter aplicado automaticamente)
        const productDetails = await fetchProductDetails(productId);

        if (productDetails) {
          await saveOrUpdateProduct(productDetails);
          processedCount++;
          console.log(`✅ Produto ${productId} salvo com sucesso`);
        } else {
          console.log(`⚠️ Detalhes do produto ${productId} não encontrados`);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao processar produto ${productId}:`, error.message);
        errorCount++;

        // Se for erro de rate limit, aguarda mais tempo
        if (error.response?.status === 429) {
          console.log('⏱️ Rate limit crítico detectado. Aguardando 3 minutos...');
          await new Promise(resolve => setTimeout(resolve, 180000)); // 3 minutos
        }
      }

      // Log de progresso a cada 10 produtos
      if ((i + 1) % 10 === 0) {
        const stats = tinyRateLimiter.getStats();
        console.log(`📈 Progresso: ${i + 1}/${productsList.length} | Sucessos: ${processedCount} | Erros: ${errorCount}`);
        console.log(`📊 Rate Limiter: ${stats.requests_in_current_window}/${stats.max_requests_per_window} requisições na janela atual`);
      }
    }

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    console.log('🎉 Sincronização concluída!');
    console.log(`⏱️ Duração: ${duration.toFixed(2)} segundos`);
    console.log(`✅ Produtos processados com sucesso: ${processedCount}`);
    console.log(`❌ Produtos com erro: ${errorCount}`);
    console.log(`📊 Total no banco: ${await Product.countDocuments()}`);

    // Salvar log de sincronização
    await saveSyncLog(processedCount, duration, errorCount > 0 ? `${errorCount} produtos com erro` : null);

  } catch (error) {
    console.error('❌ Erro crítico durante a sincronização:', error.message);
    console.error('📋 Stack trace:', error.stack);

    // Salvar log de erro
    await saveSyncLog(0, 0, error.message);
    throw error; // Re-throw para que o caller saiba que houve erro
  }
}

// Schema para logs de sincronização
const syncLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  products_processed: Number,
  duration_seconds: Number,
  status: { type: String, enum: ['success', 'error'], default: 'success' },
  error_message: String
});

const SyncLog = mongoose.model('SyncLog', syncLogSchema);

// Função para salvar log de sincronização
async function saveSyncLog(productsProcessed, duration, errorMessage = null) {
  try {
    const log = new SyncLog({
      products_processed: productsProcessed,
      duration_seconds: duration,
      status: errorMessage ? 'error' : 'success',
      error_message: errorMessage
    });
    await log.save();
  } catch (error) {
    console.error('Erro ao salvar log de sincronização:', error.message);
  }
}

// Rotas da API
app.get('/', (req, res) => {
  res.json({
    message: 'API de Sincronização Tiny ERP',
    endpoints: {
      '/products': 'GET - Listar todos os produtos',
      '/products/:id': 'GET - Buscar produto específico',
      '/sync': 'POST - Executar sincronização manual',
      '/sync/logs': 'GET - Ver logs de sincronização',
      '/sync/status': 'GET - Status da última sincronização'
    }
  });
});

// Listar todos os produtos
app.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .sort({ sync_date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments();

    res.json({
      products,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_products: total,
        per_page: limit
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar produto específico
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sincronização manual
app.post('/sync', async (req, res) => {
  try {
    res.json({ message: 'Sincronização iniciada', status: 'processing' });

    // Executar sincronização em background
    syncProducts().catch(error => {
      console.error('Erro na sincronização manual:', error.message);
      saveSyncLog(0, 0, error.message);
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ver logs de sincronização
app.get('/sync/logs', async (req, res) => {
  try {
    const logs = await SyncLog.find()
      .sort({ date: -1 })
      .limit(10);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Status da última sincronização
app.get('/sync/status', async (req, res) => {
  try {
    const lastSync = await SyncLog.findOne().sort({ date: -1 });
    const totalProducts = await Product.countDocuments();

    res.json({
      last_sync: lastSync,
      total_products_in_db: totalProducts,
      mongodb_connected: mongoose.connection.readyState === 1,
      environment: {
        sync_on_start: process.env.SYNC_ON_START,
        node_env: process.env.NODE_ENV,
        port: process.env.PORT
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Novo endpoint para testar conexão com Tiny
app.get('/debug/test-tiny', async (req, res) => {
  try {
    console.log('🧪 Testando conexão com API do Tiny...');

    const response = await tinyApiRequest('/api2/produtos.pesquisa.php', { pagina: 1 });

    res.json({
      success: true,
      message: 'Conexão com Tiny API estabelecida',
      status: response.retorno.status,
      total_pages: response.retorno.numero_paginas || 0,
      sample_response: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: {
        stack: error.stack,
        response_data: error.response?.data || null,
        response_status: error.response?.status || null
      }
    });
  }
});

// Endpoint para verificar variáveis de ambiente
app.get('/debug/env', (req, res) => {
  res.json({
    port: process.env.PORT,
    node_env: process.env.NODE_ENV,
    sync_on_start: process.env.SYNC_ON_START,
    has_mongodb_uri: !!process.env.MONGODB_URI,
    has_tiny_token: !!process.env.TINY_TOKEN,
    mongodb_connection_state: mongoose.connection.readyState,
    mongodb_states: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
  });
});

// Endpoint para verificar status do rate limiter
app.get('/debug/rate-limiter', (req, res) => {
  const stats = tinyRateLimiter.getStats();
  const now = Date.now();
  const recentRequests = tinyRateLimiter.requests.filter(time => now - time < 60000);

  res.json({
    ...stats,
    recent_requests_timeline: recentRequests.map(time => ({
      timestamp: time,
      seconds_ago: Math.floor((now - time) / 1000),
      datetime: new Date(time).toLocaleString('pt-BR')
    })),
    next_window_reset_in_seconds: recentRequests.length > 0 ?
      Math.ceil((60000 - (now - Math.min(...recentRequests))) / 1000) : 0,
    is_rate_limited: recentRequests.length >= 25
  });
});

// Configurar cron job para sincronização automática
// Executar todos os dias às 02:00
cron.schedule('0 2 * * *', () => {
  console.log('Executando sincronização automática...');
  syncProducts().catch(error => {
    console.error('Erro na sincronização automática:', error.message);
    saveSyncLog(0, 0, error.message);
  });
});

// Inicializar servidor
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Sincronização automática configurada para todos os dias às 02:00`);
  console.log(`SYNC_ON_START está definido como: ${process.env.SYNC_ON_START}`);

  // Aguardar conexão com MongoDB antes de sincronizar
  mongoose.connection.once('open', () => {
    console.log('✅ Conectado ao MongoDB');

    // Executar sincronização inicial (opcional)
    if (process.env.SYNC_ON_START === 'true') {
      console.log('🔄 Iniciando sincronização automática...');
      setTimeout(async () => {
        try {
          await syncProducts();
          console.log('✅ Sincronização inicial concluída com sucesso');
        } catch (error) {
          console.error('❌ Erro na sincronização inicial:', error.message);
          console.error('Stack trace:', error.stack);
        }
      }, 3000); // Reduzido para 3 segundos
    }
  });

  mongoose.connection.on('error', (error) => {
    console.error('❌ Erro de conexão MongoDB:', error.message);
  });
});

module.exports = app;