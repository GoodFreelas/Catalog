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

    const authUrl = `${TINY_CONFIG.authUrl}/auth?` + new URLSearchParams({
      client_id: TINY_CONFIG.clientId,
      redirect_uri: TINY_CONFIG.redirectUri,
      scope: 'openid profile email', // Ajuste os scopes conforme necessário
      response_type: 'code',
      state: state
    }).toString();

    console.log('🔐 Iniciando autenticação OAuth 2.0');
    console.log('📍 Redirect URI:', TINY_CONFIG.redirectUri);
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

// Callback de autenticação OAuth 2.0
router.get('/callback', async (req, res) => {
  try {
    const { code, error, state } = req.query;

    if (error) {
      console.error('❌ Erro na autorização OAuth2:', error);
      return res.status(400).json({
        error: 'Erro na autorização OAuth2',
        details: error,
        description: req.query.error_description
      });
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

    // Resposta de sucesso
    res.json({
      success: true,
      message: 'Autenticação OAuth2 realizada com sucesso!',
      data: {
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro no callback de autenticação:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });

    res.status(500).json({
      error: 'Erro ao processar autenticação OAuth2',
      details: error.response?.data || error.message,
      timestamp: new Date().toISOString()
    });
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
  res.json({
    config: {
      clientId: TINY_CONFIG.clientId ? `${TINY_CONFIG.clientId.substring(0, 20)}...` : 'NOT_SET',
      clientSecret: TINY_CONFIG.clientSecret ? 'SET' : 'NOT_SET',
      authUrl: TINY_CONFIG.authUrl,
      baseUrl: TINY_CONFIG.baseUrl,
      redirectUri: TINY_CONFIG.redirectUri
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
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