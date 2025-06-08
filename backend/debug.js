// debug.js - Script para testar a sincronização
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

// Configuração
const TINY_TOKEN = process.env.TINY_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 INICIANDO DEBUG...\n');

// 1. Verificar variáveis de ambiente
console.log('1️⃣ VERIFICANDO VARIÁVEIS DE AMBIENTE:');
console.log(`   TINY_TOKEN: ${TINY_TOKEN ? '✅ Definido' : '❌ Não definido'}`);
console.log(`   MONGODB_URI: ${MONGODB_URI ? '✅ Definido' : '❌ Não definido'}`);
console.log(`   SYNC_ON_START: ${process.env.SYNC_ON_START}`);
console.log('');

// 2. Testar conexão com MongoDB
async function testMongoDB() {
  console.log('2️⃣ TESTANDO CONEXÃO COM MONGODB...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('   ✅ Conectado ao MongoDB com sucesso');
    return true;
  } catch (error) {
    console.log('   ❌ Erro ao conectar ao MongoDB:', error.message);
    return false;
  }
}

// 3. Testar API do Tiny
async function testTinyAPI() {
  console.log('3️⃣ TESTANDO API DO TINY...');
  try {
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

    console.log(`   Status HTTP: ${response.status}`);
    console.log(`   Status Tiny: ${response.data.retorno.status}`);

    if (response.data.retorno.status === 'OK') {
      console.log('   ✅ API do Tiny funcionando');
      console.log(`   📊 Produtos encontrados: ${response.data.retorno.produtos?.length || 0}`);
      console.log(`   📄 Páginas totais: ${response.data.retorno.numero_paginas || 1}`);
      return true;
    } else {
      console.log('   ❌ Erro na API do Tiny:', response.data.retorno.erro);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Erro ao conectar com API do Tiny:', error.message);
    if (error.response) {
      console.log(`   📊 Status HTTP: ${error.response.status}`);
      console.log(`   📄 Resposta:`, error.response.data);
    }
    return false;
  }
}

// 4. Testar busca de detalhes de um produto
async function testProductDetails() {
  console.log('4️⃣ TESTANDO BUSCA DE DETALHES DO PRODUTO...');
  try {
    // Primeiro, pegar um ID de produto
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

      console.log(`   📦 Testando com produto ID: ${productId}`);

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
        console.log('   ✅ Detalhes do produto obtidos com sucesso');
        const produto = detailResponse.data.retorno.produto;
        console.log(`   📋 Nome: ${produto.nome}`);
        console.log(`   💰 Preço: R$ ${produto.preco}`);
        console.log(`   🖼️ Anexos: ${produto.anexos?.length || 0}`);
        return true;
      } else {
        console.log('   ❌ Erro ao buscar detalhes:', detailResponse.data.retorno.erro);
        return false;
      }
    } else {
      console.log('   ⚠️ Nenhum produto encontrado para testar');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Erro ao testar detalhes do produto:', error.message);
    return false;
  }
}

// 5. Executar todos os testes
async function runAllTests() {
  console.log('🧪 EXECUTANDO TODOS OS TESTES...\n');

  const mongoOK = await testMongoDB();
  console.log('');

  const tinyOK = await testTinyAPI();
  console.log('');

  const detailsOK = await testProductDetails();
  console.log('');

  console.log('📊 RESUMO DOS TESTES:');
  console.log(`   MongoDB: ${mongoOK ? '✅' : '❌'}`);
  console.log(`   API Tiny: ${tinyOK ? '✅' : '❌'}`);
  console.log(`   Detalhes: ${detailsOK ? '✅' : '❌'}`);

  if (mongoOK && tinyOK && detailsOK) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! A sincronização deve funcionar.');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verifique as configurações.');
  }

  // Fechar conexão
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
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

module.exports = { testMongoDB, testTinyAPI, testProductDetails };