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

// Rota para iniciar autenticação OAuth 2.0 (OFICIAL DA TINY)
router.get('/login', (req, res) => {
  try {
    const state = Math.random().toString(36).substring(7); // Estado para segurança

    // URL EXATA conforme documentação oficial da Tiny
    const authUrl = `${TINY_CONFIG.authUrl}/auth?` + new URLSearchParams({
      client_id: TINY_CONFIG.clientId,
      redirect_uri: TINY_CONFIG.redirectUri,
      scope: 'openid', // 🎯 SCOPE CORRETO conforme documentação oficial
      response_type: 'code',
      state: state
    }).toString();

    console.log('🔐 Iniciando autenticação OAuth 2.0 (Oficial Tiny)');
    console.log('📍 Redirect URI:', TINY_CONFIG.redirectUri);
    console.log('🎯 Scope oficial:', 'openid');
    console.log('🔗 Auth URL:', authUrl);

    res.redirect(authUrl);

  } catch (error) {
    console.error('❌ Erro ao iniciar autenticação:', error);
    res.status(500).json({
      error: 'Erro ao iniciar processo de autenticação',
      details: error.message
    });
  }
});

// Callback de autenticação OAuth 2.0 (OFICIAL DA TINY)
router.get('/callback', async (req, res) => {
  try {
    const { code, error, state } = req.query;

    if (error) {
      console.error('❌ Erro na autorização OAuth2:', error);

      // Página de erro amigável
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>❌ Erro de Autenticação</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
                .error-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; }
                .solution-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <h1>❌ Erro na Autenticação OAuth2</h1>
            
            <div class="error-box">
                <h3>Detalhes do Erro:</h3>
                <p><strong>Erro:</strong> ${error}</p>
                <p><strong>Descrição:</strong> ${req.query.error_description || 'Não fornecida'}</p>
            </div>
            
            <div class="solution-box">
                <h3>🔧 Soluções:</h3>
                <p><a href="/auth/debug">🔍 Ver Configurações de Debug</a></p>
                <p><a href="/auth/login">🔄 Tentar Novamente</a></p>
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

    console.log('🔄 Trocando código por tokens (conforme doc oficial)...');
    console.log('📝 Authorization code recebido:', code.substring(0, 20) + '...');

    // Fazer requisição EXATA conforme documentação oficial da Tiny
    const tokenUrl = `${TINY_CONFIG.authUrl}/token`;

    console.log('📡 Fazendo requisição para:', tokenUrl);

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
      scope: tokenData.scope,
      has_refresh_token: !!tokenData.refresh_token
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

    // Página de sucesso com informações detalhadas
    const successHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>✅ Autenticação Realizada</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
              .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; }
              .info-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .action-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; }
              .btn { display: inline-block; padding: 10px 20px; margin: 5px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
              .btn:hover { background: #0056b3; }
              .btn-success { background: #28a745; }
              .btn-success:hover { background: #1e7e34; }
          </style>
      </head>
      <body>
          <h1>🎉 Autenticação OAuth2 Realizada com Sucesso!</h1>
          
          <div class="success-box">
              <h3>✅ Conectado com a API v3 da Tiny</h3>
              <p>Sua aplicação agora está autenticada e pode acessar a API v3 da Tiny!</p>
          </div>
          
          <div class="info-box">
              <h3>📊 Informações do Token:</h3>
              <p><strong>Tipo:</strong> ${tokenData.token_type}</p>
              <p><strong>Expira em:</strong> ${tokenData.expires_in} segundos (${Math.round(tokenData.expires_in / 3600)} horas)</p>
              <p><strong>Scope:</strong> ${tokenData.scope || 'openid'}</p>
              <p><strong>Refresh Token:</strong> ${tokenData.refresh_token ? '✅ Disponível' : '❌ Não fornecido'}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          
          <div class="action-box">
              <h3>🚀 Próximos Passos:</h3>
              <a href="/api/status" class="btn">📊 Status da API</a>
              <a href="/api/produtos/debug/v3" class="btn">🧪 Testar Produtos v3</a>
              <a href="/auth/status" class="btn">🔍 Status da Autenticação</a>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn btn-success">🌐 Ir para o Frontend</a>
          </div>
          
          <div class="info-box">
              <h3>ℹ️ Informações Importantes:</h3>
              <ul>
                  <li>Token expira em <strong>4 horas</strong> (será renovado automaticamente)</li>
                  <li>Refresh token expira em <strong>1 dia</strong></li>
                  <li>Sua aplicação já está configurada para renovação automática</li>
              </ul>
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
          <title>❌ Erro no Callback</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
              .error-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; }
              .debug-box { background: #e2e3e5; border: 1px solid #d6d8db; padding: 15px; border-radius: 8px; margin: 15px 0; }
              pre { background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto; }
          </style>
      </head>
      <body>
          <h1>❌ Erro no Callback de Autenticação</h1>
          
          <div class="error-box">
              <h3>Detalhes do Erro:</h3>
              <p><strong>Mensagem:</strong> ${error.message}</p>
              <p><strong>Status HTTP:</strong> ${error.response?.status || 'N/A'}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          
          <div class="debug-box">
              <h3>🔍 Resposta do Servidor:</h3>
              <pre>${JSON.stringify(error.response?.data || 'N/A', null, 2)}</pre>
          </div>
          
          <p><a href="/auth/login">🔄 Tentar Autenticação Novamente</a></p>
          <p><a href="/auth/debug">🔍 Ver Debug de Configuração</a></p>
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
        timestamp: new Date().toISOString(),
        hoursToExpire: Math.round((tokenInfo.expiresAt - Date.now()) / (1000 * 60 * 60) * 100) / 100
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
        <title>🔍 Debug OAuth - Tiny API v3</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
            .config-box { background: #e2e3e5; border: 1px solid #d6d8db; padding: 20px; border-radius: 8px; margin: 15px 0; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 15px 0; }
            .test-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 15px 0; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 14px; }
            .btn { display: inline-block; margin: 5px; padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            .btn:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <h1>🔍 Debug OAuth - Tiny API v3</h1>
        
        <div class="success-box">
            <h3>✅ Configuração Oficial da Tiny</h3>
            <p>Usando a configuração exata da documentação oficial da Tiny:</p>
            <ul>
                <li><strong>Scope:</strong> <code>openid</code> ✅</li>
                <li><strong>Grant Type:</strong> <code>authorization_code</code> ✅</li>
                <li><strong>Response Type:</strong> <code>code</code> ✅</li>
                <li><strong>Token Duration:</strong> 4 horas ✅</li>
                <li><strong>Refresh Token Duration:</strong> 1 dia ✅</li>
            </ul>
        </div>
        
        <div class="config-box">
            <h3>⚙️ Configurações Atuais:</h3>
            <pre>${JSON.stringify({
    clientId: TINY_CONFIG.clientId ? `${TINY_CONFIG.clientId.substring(0, 30)}...` : 'NOT_SET',
    clientSecret: TINY_CONFIG.clientSecret ? 'SET ✅' : 'NOT_SET ❌',
    authUrl: TINY_CONFIG.authUrl,
    baseUrl: TINY_CONFIG.baseUrl,
    redirectUri: TINY_CONFIG.redirectUri,
    environment: process.env.NODE_ENV
  }, null, 2)}</pre>
        </div>
        
        <div class="test-box">
            <h3>🧪 Testes Disponíveis:</h3>
            <a href="/auth/login" class="btn">🔐 Fazer Login OAuth</a>
            <a href="/auth/status" class="btn">📊 Status da Autenticação</a>
            <a href="/api/debug" class="btn">🔍 Debug Geral da API</a>
            <a href="/api/status" class="btn">📡 Status da API v3</a>
        </div>
        
        <div class="config-box">
            <h3>📋 URLs da Documentação Oficial:</h3>
            <p><strong>Autorização:</strong><br>
            <code>${TINY_CONFIG.authUrl}/auth?client_id=${TINY_CONFIG.clientId}&redirect_uri=${TINY_CONFIG.redirectUri}&scope=openid&response_type=code</code></p>
            
            <p><strong>Token:</strong><br>
            <code>${TINY_CONFIG.authUrl}/token</code></p>
        </div>
    </body>
    </html>
  `;

  res.send(html);
});

// Middleware para verificar autenticação (para usar em outras rotas)
const requireAuth = async (req, res, next) => {
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
};

module.exports = { router, requireAuth };