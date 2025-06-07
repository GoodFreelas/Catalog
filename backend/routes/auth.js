const express = require('express');
const axios = require('axios');
const tokenManager = require('../utils/tokenManager');

const router = express.Router();

const TINY_CONFIG = {
  clientId: process.env.TINY_CLIENT_ID,
  clientSecret: process.env.TINY_CLIENT_SECRET,
  authUrl: process.env.TINY_AUTH_URL
};

// Rota para iniciar autenticação (usar apenas uma vez)
router.get('/login', (req, res) => {
  // ✅ CORREÇÃO 1: Forçar HTTPS
  const redirectUri = 'https://catalog-471g.onrender.com/auth/callback';
  const authUrl = `${TINY_CONFIG.authUrl}/auth?client_id=${TINY_CONFIG.clientId}&redirect_uri=${redirectUri}&scope=openid&response_type=code`;

  console.log('Redirecionando para autenticação Tiny:', authUrl);
  res.redirect(authUrl);
});

// Callback de autenticação
router.get('/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.error('Erro na autorização:', error);
      return res.status(400).json({
        error: 'Erro na autorização',
        details: error
      });
    }

    if (!code) {
      return res.status(400).json({
        error: 'Código de autorização não fornecido'
      });
    }

    // ✅ CORREÇÃO 2: Usar a mesma URL HTTPS do login
    const redirectUri = 'https://catalog-471g.onrender.com/auth/callback';

    console.log('Trocando código por token...');

    const response = await axios.post(`${TINY_CONFIG.authUrl}/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: TINY_CONFIG.clientId,
        client_secret: TINY_CONFIG.clientSecret,
        redirect_uri: redirectUri,
        code: code
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const tokenData = response.data;

    // Salvar tokens
    await tokenManager.saveTokens({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type
    });

    console.log('✅ Tokens salvos com sucesso!');

    res.json({
      success: true,
      message: 'Autenticação realizada com sucesso!',
      data: {
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope
      }
    });

  } catch (error) {
    console.error('Erro no callback de autenticação:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erro ao processar autenticação',
      details: error.response?.data || error.message
    });
  }
});

// Verificar status da autenticação
router.get('/status', async (req, res) => {
  try {
    const tokenInfo = await tokenManager.getValidToken();

    res.json({
      authenticated: !!tokenInfo,
      tokenType: tokenInfo?.tokenType,
      expiresAt: tokenInfo?.expiresAt
    });
  } catch (error) {
    res.json({
      authenticated: false,
      error: error.message
    });
  }
});

// Renovar token manualmente
router.post('/refresh', async (req, res) => {
  try {
    const tokenInfo = await tokenManager.refreshToken();

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      expiresAt: tokenInfo.expiresAt
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({
      error: 'Erro ao renovar token',
      details: error.message
    });
  }
});

module.exports = router;