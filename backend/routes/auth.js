const express = require('express');
const axios = require('axios');
const tokenManager = require('../utils/tokenManager');

const router = express.Router();

const TINY_CONFIG = {
  clientId: process.env.TINY_CLIENT_ID,
  clientSecret: process.env.TINY_CLIENT_SECRET,
  authUrl: process.env.TINY_AUTH_URL,
  baseUrl: process.env.TINY_BASE_URL,
  redirectUri: process.env.REDIRECT_URI
};

// Validar configurações necessárias
if (!TINY_CONFIG.clientId || !TINY_CONFIG.clientSecret || !TINY_CONFIG.authUrl) {
  console.error('❌ Configurações OAuth2 da Tiny não encontradas no .env');
  console.error('Verifique: TINY_CLIENT_ID, TINY_CLIENT_SECRET, TINY_AUTH_URL');
}

// Rota para iniciar autenticação OAuth 2.0
router.get('/login', (req, res) => {
  try {
    const state = Math.random().toString(36).substring(7); // Estado para segurança

    // Scopes específicos para a API da Tiny - tentar diferentes opções
    const scope = req.query.scope || 'read write'; // Permitir teste de diferentes scopes

    const authUrl = `${TINY_CONFIG.authUrl}/auth?` + new URLSearchParams({
      client_id: TINY_CONFIG.clientId,
      redirect_uri: TINY_CONFIG.redirectUri,
      scope: scope,
      response_type: 'code',
      state: state
    }).toString();

    console.log('🔐 Iniciando autenticação OAuth 2.0');
    console.log('📍 Redirect URI:', TINY_CONFIG.redirectUri);
    console.log('🔑 Scope usado:', scope);
    console.log('🔗 Auth URL:', authUrl);

    // Em produção, você pode salvar o state em sessão/cache para validar
    res.redirect(authUrl);

  } catch (error) {
    console.error('❌ Erro ao iniciar autenticação:', error);
    res.status(500).json({
      error: 'Erro ao iniciar processo de autenticação',
      details: error.message
    });
  }
});

// Rota alternativa para testar diferentes scopes
router.get('/login-test/:scope', (req, res) => {
  try {
    const { scope } = req.params;
    const state = Math.random().toString(36).substring(7);

    const authUrl = `${TINY_CONFIG.authUrl}/auth?` + new URLSearchParams({
      client_id: TINY_CONFIG.clientId,
      redirect_uri: TINY_CONFIG.redirectUri,
      scope: scope,
      response_type: 'code',
      state: state
    }).toString();

    console.log('🧪 Testando autenticação com scope:', scope);
    console.log('🔗 Auth URL:', authUrl);

    res.redirect(authUrl);

  } catch (error) {
    console.error('❌ Erro ao iniciar teste de autenticação:', error);
    res.status(500).json({
      error: 'Erro ao iniciar teste de autenticação',
      details: error.message
    });
  }
});

// Página de teste de scopes
router.get('/test-scopes', (req, res) => {
  const testScopes = [
    'read',
    'write',
    'read write',
    'api',
    'tiny:read',
    'tiny:write',
    'tiny:api',
    'produtos',
    'products',
    'catalog',
    'openid',
    '', // Sem scope
  ];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Teste de Scopes - Tiny OAuth</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .scope-test { margin: 10px 0; }
            .scope-test a { 
                display: inline-block; 
                padding: 10px 15px; 
                background: #007bff; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 5px;
            }
            .scope-test a:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <h1>🧪 Teste de Scopes OAuth - Tiny API</h1>
        <p>Teste diferentes scopes para encontrar o correto:</p>
        
        ${testScopes.map(scope => `
            <div class="scope-test">
                <a href="/auth/login-test/${encodeURIComponent(scope)}">
                    Testar: "${scope || '(sem scope)'}"
                </a>
            </div>
        `).join('')}
        
        <hr>
        <h3>📋 Informações de Debug:</h3>
        <p><strong>Client ID:</strong> ${TINY_CONFIG.clientId?.substring(0, 30)}...</p>
        <p><strong>Auth URL:</strong> ${TINY_CONFIG.authUrl}</p>
        <p><strong>Redirect URI:</strong> ${TINY_CONFIG.redirectUri}</p>
        
        <hr>
        <p><a href="/auth/status">📊 Status da Autenticação</a></p>
        <p><a href="/api/debug">🔍 Debug da API</a></p>
    </body>
    </html>
  `;

  res.send(html);
});

// Callback de autenticação OAuth 2.0
router.get('/callback', async (req, res) => {
  try {
    const { code, error, state } = req.query;

    if (error) {
      console.error('❌ Erro na autorização OAuth2:', error);

      // Página de erro mais amigável
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Erro de Autenticação</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
                .error-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 5px; }
                .info-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 5px; margin-top: 20px; }
                .suggestion { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <h1>❌ Erro na Autenticação OAuth2</h1>
            
            <div class="error-box">
                <h3>Detalhes do Erro:</h3>
                <p><strong>Erro:</strong> ${error}</p>
                <p><strong>Descrição:</strong> ${req.query.error_description || 'Não fornecida'}</p>
            </div>
            
            <div class="suggestion">
                <h3>💡 Possíveis Soluções:</h3>
                <ul>
                    <li><strong>Scope inválido:</strong> <a href="/auth/test-scopes">Testar diferentes scopes</a></li>
                    <li><strong>Client ID/Secret:</strong> Verificar se as credenciais estão corretas</li>
                    <li><strong>Redirect URI:</strong> Verificar se a URI está configurada corretamente no painel da Tiny</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>🔧 Actions:</h3>
                <p><a href="/auth/test-scopes">🧪 Testar Scopes Diferentes</a></p>
                <p><a href="/auth/debug">🔍 Ver Configurações de Debug</a></p>
                <p><a href="/api/debug">📊 Debug Geral da API</a></p>
            </div>
        </body>
        </html>
      `;

      return res.status(400).send(errorHtml);
    }

    if (!code) {
      return res.status(400).json({
        error: 'Código de autorização não fornecido'
      });
    }

    console.log('🔄 Trocando código por tokens...');
    console.log('📝 Authorization code recebido:', code.substring(0, 20) + '...');

    // Fazer requisição para trocar código por tokens
    const tokenUrl = `${TINY_CONFIG.authUrl}/token`;

    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: TINY_CONFIG.clientId,
        client_secret: TINY_CONFIG.clientSecret,
        redirect_uri: TINY_CONFIG.redirectUri,
        code: code
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    const tokenData = response.data;
    console.log('✅ Tokens recebidos com sucesso');
    console.log('📊 Token info:', {
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope
    });

    // Salvar tokens usando o token manager
    await tokenManager.saveTokens({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type || 'Bearer',
      scope: tokenData.scope
    });

    console.log('💾 Tokens salvos com sucesso!');

    // Página de sucesso
    const successHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Autenticação Realizada</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
              .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; }
              .info-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 5px; margin-top: 20px; }
              .token-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 10px 0; }
          </style>
      </head>
      <body>
          <h1>✅ Autenticação Realizada com Sucesso!</h1>
          
          <div class="success-box">
              <h3>🎉 OAuth2 Configurado</h3>
              <p>Sua aplicação agora está autenticada com a API v3 da Tiny!</p>
          </div>
          
          <div class="token-info">
              <h3>📊 Informações do Token:</h3>
              <p><strong>Tipo:</strong> ${tokenData.token_type}</p>
              <p><strong>Expira em:</strong> ${tokenData.expires_in} segundos</p>
              <p><strong>Scope:</strong> ${tokenData.scope || 'N/A'}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          
          <div class="info-box">
              <h3>🚀 Próximos Passos:</h3>
              <p><a href="/api/status">📊 Verificar Status da API</a></p>
              <p><a href="/api/produtos/debug/v3">🧪 Testar Produtos v3</a></p>
              <p><a href="/auth/status">🔍 Status da Autenticação</a></p>
              <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">🌐 Ir para o Frontend</a></p>
          </div>
      </body>
      </html>
    `;

    res.send(successHtml);

  } catch (error) {
    console.error('❌ Erro no callback de autenticação:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });

    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Erro no Callback</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
              .error-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 5px; }
          </style>
      </head>
      <body>
          <h1>❌ Erro no Callback de Autenticação</h1>
          
          <div class="error-box">
              <h3>Detalhes do Erro:</h3>
              <p><strong>Mensagem:</strong> ${error.message}</p>
              <p><strong>Status:</strong> ${error.response?.status || 'N/A'}</p>
              <p><strong>Resposta:</strong> ${JSON.stringify(error.response?.data || 'N/A', null, 2)}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          
          <p><a href="/auth/test-scopes">🧪 Testar Diferentes Scopes</a></p>
          <p><a href="/auth/debug">🔍 Debug de Configuração</a></p>
      </body>
      </html>
    `;

    res.status(500).send(errorHtml);
  }
});

// Verificar status da autenticação
router.get('/status', async (req, res) => {
  try {
    const tokenInfo = await tokenManager.getValidToken();

    if (tokenInfo) {
      res.json({
        authenticated: true,
        tokenType: tokenInfo.tokenType,
        expiresAt: new Date(tokenInfo.expiresAt).toISOString(),
        timeToExpire: Math.max(0, tokenInfo.expiresAt - Date.now()),
        isExpiring: (tokenInfo.expiresAt - Date.now()) < 300000, // 5 minutos
        scope: tokenInfo.scope,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        authenticated: false,
        message: 'Token não encontrado',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
    res.json({
      authenticated: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Renovar token manualmente
router.post('/refresh', async (req, res) => {
  try {
    console.log('🔄 Renovando token manualmente...');

    const tokenInfo = await tokenManager.refreshToken();

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        tokenType: tokenInfo.tokenType,
        expiresAt: new Date(tokenInfo.expiresAt).toISOString(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao renovar token:', error.message);
    res.status(500).json({
      error: 'Erro ao renovar token',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Logout - limpar tokens
router.post('/logout', async (req, res) => {
  try {
    console.log('🚪 Fazendo logout...');

    await tokenManager.clearTokens();

    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no logout:', error.message);
    res.status(500).json({
      error: 'Erro no logout',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de debug para verificar configurações
router.get('/debug', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Debug OAuth - Tiny API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
            .config-box { background: #e2e3e5; border: 1px solid #d6d8db; padding: 20px; border-radius: 5px; margin: 10px 0; }
            .test-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 5px; margin: 10px 0; }
            pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <h1>🔍 Debug OAuth - Tiny API</h1>
        
        <div class="config-box">
            <h3>⚙️ Configurações:</h3>
            <pre>${JSON.stringify({
    clientId: TINY_CONFIG.clientId ? `${TINY_CONFIG.clientId.substring(0, 30)}...` : 'NOT_SET',
    clientSecret: TINY_CONFIG.clientSecret ? 'SET' : 'NOT_SET',
    authUrl: TINY_CONFIG.authUrl,
    baseUrl: TINY_CONFIG.baseUrl,
    redirectUri: TINY_CONFIG.redirectUri,
    environment: process.env.NODE_ENV
  }, null, 2)}</pre>
        </div>
        
        <div class="test-box">
            <h3>🧪 Testes Disponíveis:</h3>
            <p><a href="/auth/test-scopes">🔑 Testar Diferentes Scopes</a></p>
            <p><a href="/auth/status">📊 Status da Autenticação</a></p>
            <p><a href="/api/debug">🔍 Debug Geral da API</a></p>
            <p><a href="/api/status">📡 Status da API v3</a></p>
        </div>
        
        <div class="config-box">
            <h3>📋 URLs de Teste:</h3>
            <p><strong>Login padrão:</strong> <a href="/auth/login">/auth/login</a></p>
            <p><strong>Login sem scope:</strong> <a href="/auth/login-test/">/auth/login-test/</a></p>
            <p><strong>Login só read:</strong> <a href="/auth/login-test/read">/auth/login-test/read</a></p>
            <p><strong>Login só write:</strong> <a href="/auth/login-test/write">/auth/login-test/write</a></p>
        </div>
    </body>
    </html>
  `;

  res.send(html);
});

module.exports = {
  router, requireAuth: async (req, res, next) => {
    try {
      const tokenInfo = await tokenManager.getValidToken();
      req.tokenInfo = tokenInfo;
      next();
    } catch (error) {
      res.status(401).json({
        error: 'Autenticação necessária',
        details: error.message,
        authUrl: `/auth/login`
      });
    }
  }
};