#!/usr/bin/env node

/**
 * Script de debug para testar a sincronização e componentes do sistema
 * Uso: npm run debug ou node scripts/debug.js
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const { validateConfig } = require('../src/config/tiny');
const { TinyRateLimiter } = require('../src/services/rateLimiter');

// Configurações
const TINY_TOKEN = process.env.TINY_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;

// Utilitários de log colorido
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  section: (msg) => {
    console.log('\n' + '='.repeat(50));
    console.log(`${colors.blue}${msg}${colors.reset}`);
    console.log('='.repeat(50));
  }
};

console.log(`${colors.blue}🔍 TINY ERP SYNC - SCRIPT DE DEBUG${colors.reset}`);
console.log(`📅 Executado em: ${new Date().toLocaleString('pt-BR')}\n`);

/**
 * 1. Verificar variáveis de ambiente
 */
async function checkEnvironment() {
  log.section('1️⃣ VERIFICANDO VARIÁVEIS DE AMBIENTE');

  const checks = [
    { name: 'TINY_TOKEN', value: TINY_TOKEN, required: true },
    { name: 'MONGODB_URI', value: MONGODB_URI, required: true },
    { name: 'SYNC_ON_START', value: process.env.SYNC_ON_START, required: false },
    { name: 'LOG_LEVEL', value: process.env.LOG_LEVEL, required: false },
    { name: 'TINY_RATE_LIMIT_REQUESTS', value: process.env.TINY_RATE_LIMIT_REQUESTS, required: false },
    { name: 'TINY_RATE_LIMIT_WINDOW', value: process.env.TINY_RATE_LIMIT_WINDOW, required: false }
  ];

  let allPassed = true;

  checks.forEach(check => {
    if (check.required && !check.value) {
      log.error(`${check.name}: Não definido (OBRIGATÓRIO)`);
      allPassed = false;
    } else if (check.value) {
      // Mascarar tokens/URIs sensíveis
      let displayValue = check.value;
      if (check.name.includes('TOKEN')) {
        displayValue = check.value.substring(0, 8) + '***';
      } else if (check.name.includes('URI')) {
        try {
          const url = new URL(check.value);
          displayValue = `${url.protocol}//${url.hostname}/${url.pathname.split('/')[1] || ''}***`;
        } catch {
          displayValue = 'URI válida***';
        }
      }
      log.success(`${check.name}: ${displayValue}`);
    } else {
      log.info(`${check.name}: Não definido (opcional)`);
    }
  });

  // Testar validação de configuração
  try {
    validateConfig();
    log.success('Configuração da API Tiny válida');
  } catch (error) {
    log.error(`Configuração inválida: ${error.message}`);
    allPassed = false;
  }

  return allPassed;
}

/**
 * 2. Testar conexão MongoDB
 */
async function testMongoDB() {
  log.section('2️⃣ TESTANDO CONEXÃO COM MONGODB');

  try {
    log.info('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });

    const db = mongoose.connection.db;
    const admin = db.admin();
    const info = await admin.serverStatus();

    log.success(`Conectado ao MongoDB ${info.version}`);
    log.info(`Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    log.info(`Database: ${mongoose.connection.name}`);
    log.info(`Uptime: ${Math.floor(info.uptime / 3600)}h ${Math.floor((info.uptime % 3600) / 60)}m`);

    return true;
  } catch (error) {
    log.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    return false;
  }
}

/**
 * 3. Testar API do Tiny
 */
async function testTinyAPI() {
  log.section('3️⃣ TESTANDO API DO TINY');

  try {
    log.info('Fazendo requisição para API do Tiny...');

    const response = await axios.post(
      'https://api.tiny.com.br/api2/produtos.pesquisa.php',
      new URLSearchParams({
        token: TINY_TOKEN,
        formato: 'json',
        pagina: 1
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      }
    );

    log.success(`Status HTTP: ${response.status}`);
    log.success(`Status Tiny: ${response.data.retorno.status}`);

    if (response.data.retorno.status === 'OK') {
      const produtos = response.data.retorno.produtos || [];
      const totalPaginas = response.data.retorno.numero_paginas || 1;

      log.success(`Produtos encontrados na primeira página: ${produtos.length}`);
      log.success(`Total de páginas: ${totalPaginas}`);

      if (produtos.length > 0) {
        log.info(`Primeiro produto: ${produtos[0].produto.nome} (ID: ${produtos[0].produto.id})`);
      }

      return { success: true, totalPages: totalPaginas, productsCount: produtos.length };
    } else {
      log.error(`Erro na API do Tiny: ${response.data.retorno.erro}`);
      return { success: false, error: response.data.retorno.erro };
    }
  } catch (error) {
    log.error(`Erro ao conectar com API do Tiny: ${error.message}`);

    if (error.response) {
      log.error(`Status HTTP: ${error.response.status}`);
      if (error.response.data) {
        log.error(`Resposta: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }

    return { success: false, error: error.message };
  }
}

/**
 * 4. Testar busca de detalhes de produto
 */
async function testProductDetails(tinyResult) {
  log.section('4️⃣ TESTANDO BUSCA DE DETALHES DO PRODUTO');

  if (!tinyResult.success) {
    log.warn('Pulando teste - API do Tiny não está funcionando');
    return false;
  }

  try {
    // Primeiro, pegar um ID de produto
    log.info('Buscando lista de produtos para obter um ID...');

    const listResponse = await axios.post(
      'https://api.tiny.com.br/api2/produtos.pesquisa.php',
      new URLSearchParams({
        token: TINY_TOKEN,
        formato: 'json',
        pagina: 1
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    if (listResponse.data.retorno.produtos && listResponse.data.retorno.produtos.length > 0) {
      const firstProduct = listResponse.data.retorno.produtos[0];
      const productId = firstProduct.produto.id;
      const productName = firstProduct.produto.nome;

      log.info(`Testando com produto: ${productName} (ID: ${productId})`);

      // Buscar detalhes
      const detailResponse = await axios.post(
        'https://api.tiny.com.br/api2/produto.obter.php',
        new URLSearchParams({
          token: TINY_TOKEN,
          formato: 'json',
          id: productId
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      if (detailResponse.data.retorno.status === 'OK') {
        const produto = detailResponse.data.retorno.produto;

        log.success('Detalhes do produto obtidos com sucesso');
        log.info(`Nome: ${produto.nome}`);
        log.info(`Preço: R$ ${produto.preco}`);
        log.info(`Situação: ${produto.situacao === 'A' ? 'Ativo' : 'Inativo'}`);
        log.info(`Anexos: ${produto.anexos?.length || 0}`);

        if (produto.anexos && produto.anexos.length > 0) {
          log.info(`URL primeira imagem: ${produto.anexos[0].anexo}`);
        }

        return true;
      } else {
        log.error(`Erro ao buscar detalhes: ${detailResponse.data.retorno.erro}`);
        return false;
      }
    } else {
      log.warn('Nenhum produto encontrado para testar');
      return false;
    }
  } catch (error) {
    log.error(`Erro ao testar detalhes do produto: ${error.message}`);
    return false;
  }
}

/**
 * 5. Testar Rate Limiter
 */
async function testRateLimiter() {
  log.section('5️⃣ TESTANDO RATE LIMITER');

  try {
    const limiter = new TinyRateLimiter(5, 10000); // 5 req por 10 segundos para teste

    log.info('Testando rate limiter com 5 requisições em 10 segundos...');

    for (let i = 1; i <= 7; i++) {
      const start = Date.now();

      await limiter.waitForAvailability();
      const waitTime = Date.now() - start;

      const stats = limiter.getStats();

      if (waitTime > 100) {
        log.warn(`Requisição ${i}: aguardou ${waitTime}ms - (${stats.requests_in_current_window}/${stats.max_requests_per_window})`);
      } else {
        log.success(`Requisição ${i}: liberada imediatamente - (${stats.requests_in_current_window}/${stats.max_requests_per_window})`);
      }

      if (i === 5) {
        log.info('Limite atingido, próximas requisições devem aguardar...');
      }
    }

    log.success('Rate limiter funcionando corretamente');
    return true;

  } catch (error) {
    log.error(`Erro ao testar rate limiter: ${error.message}`);
    return false;
  }
}

/**
 * 6. Teste de performance
 */
async function performanceTest() {
  log.section('6️⃣ TESTE DE PERFORMANCE');

  try {
    log.info('Testando performance de múltiplas requisições...');

    const start = Date.now();
    const promises = [];

    // Fazer 3 requisições simultâneas
    for (let i = 0; i < 3; i++) {
      promises.push(
        axios.post(
          'https://api.tiny.com.br/api2/produtos.pesquisa.php',
          new URLSearchParams({
            token: TINY_TOKEN,
            formato: 'json',
            pagina: 1
          }).toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 5000
          }
        )
      );
    }

    const results = await Promise.allSettled(promises);
    const duration = Date.now() - start;

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    log.info(`Tempo total: ${duration}ms`);
    log.info(`Requisições bem-sucedidas: ${successful}/3`);
    log.info(`Requisições com falha: ${failed}/3`);

    if (successful === 3) {
      log.success('Performance adequada');
    } else if (successful > 0) {
      log.warn('Performance parcial - algumas requisições falharam');
    } else {
      log.error('Performance ruim - todas as requisições falharam');
    }

    return successful > 0;

  } catch (error) {
    log.error(`Erro no teste de performance: ${error.message}`);
    return false;
  }
}

/**
 * Executar todos os testes
 */
async function runAllTests() {
  const startTime = Date.now();

  const results = {
    environment: false,
    mongodb: false,
    tinyApi: false,
    productDetails: false,
    rateLimiter: false,
    performance: false
  };

  try {
    // 1. Verificar ambiente
    results.environment = await checkEnvironment();

    // 2. Testar MongoDB
    results.mongodb = await testMongoDB();

    // 3. Testar API Tiny
    const tinyResult = await testTinyAPI();
    results.tinyApi = tinyResult.success;

    // 4. Testar detalhes do produto
    results.productDetails = await testProductDetails(tinyResult);

    // 5. Testar Rate Limiter
    results.rateLimiter = await testRateLimiter();

    // 6. Teste de performance
    results.performance = await performanceTest();

    // Resumo final
    log.section('📊 RESUMO DOS TESTES');

    Object.entries(results).forEach(([test, passed]) => {
      const icon = passed ? '✅' : '❌';
      const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
      console.log(`   ${icon} ${testName}: ${passed ? 'PASSOU' : 'FALHOU'}`);
    });

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    const successRate = Math.round((passedTests / totalTests) * 100);

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`\n📈 Taxa de sucesso: ${passedTests}/${totalTests} (${successRate}%)`);
    console.log(`⏱️ Tempo total: ${duration}s`);

    if (passedTests === totalTests) {
      log.success('🎉 TODOS OS TESTES PASSARAM! A sincronização deve funcionar perfeitamente.');
    } else if (passedTests >= totalTests * 0.8) {
      log.warn('⚠️ MAIORIA DOS TESTES PASSOU. Verifique os itens com falha.');
    } else {
      log.error('❌ MUITOS TESTES FALHARAM. Verifique as configurações antes de executar a sincronização.');
    }

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');

    if (!results.environment) {
      console.log('   - Configure as variáveis de ambiente necessárias');
    }

    if (!results.mongodb) {
      console.log('   - Verifique a string de conexão do MongoDB');
      console.log('   - Certifique-se que o MongoDB está acessível');
    }

    if (!results.tinyApi) {
      console.log('   - Verifique o token da API do Tiny');
      console.log('   - Confirme que sua conta tem acesso à API');
    }

    if (!results.rateLimiter) {
      console.log('   - Pode afetar a sincronização em larga escala');
    }

    if (!results.performance) {
      console.log('   - Considere ajustar timeouts e configurações de rede');
    }

  } catch (error) {
    log.error(`Erro crítico durante os testes: ${error.message}`);
    console.error(error.stack);
  } finally {
    // Fechar conexão MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log.info('Conexão MongoDB fechada');
    }
  }

  process.exit(0);
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Erro crítico:', error);
    process.exit(1);
  });
}

module.exports = {
  checkEnvironment,
  testMongoDB,
  testTinyAPI,
  testProductDetails,
  testRateLimiter,
  performanceTest
};