const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class TokenManager {
  constructor() {
    this.tokenFile = path.join(__dirname, '../data/tokens.json');
    this.currentTokens = null;
    this.ensureDataDir();
  }

  async ensureDataDir() {
    const dataDir = path.dirname(this.tokenFile);
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      // Diretório já existe
    }
  }

  async saveTokens(tokenData) {
    const tokens = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      tokenType: tokenData.tokenType || 'Bearer',
      expiresAt: Date.now() + (tokenData.expiresIn * 1000),
      createdAt: Date.now()
    };

    try {
      await fs.writeFile(this.tokenFile, JSON.stringify(tokens, null, 2));
      this.currentTokens = tokens;
      console.log('✅ Tokens salvos em:', this.tokenFile);
    } catch (error) {
      console.error('❌ Erro ao salvar tokens:', error);
      throw new Error('Erro ao salvar tokens de acesso');
    }
  }

  async loadTokens() {
    try {
      const data = await fs.readFile(this.tokenFile, 'utf8');
      this.currentTokens = JSON.parse(data);
      return this.currentTokens;
    } catch (error) {
      console.log('ℹ️ Arquivo de tokens não encontrado');
      return null;
    }
  }

  async getValidToken() {
    if (!this.currentTokens) {
      await this.loadTokens();
    }

    if (!this.currentTokens) {
      throw new Error('Token não disponível. Execute a autenticação primeiro.');
    }

    // Verificar se o token ainda é válido (com margem de 5 minutos)
    const now = Date.now();
    const expiresAt = this.currentTokens.expiresAt;
    const marginMs = 5 * 60 * 1000; // 5 minutos

    if (now >= (expiresAt - marginMs)) {
      console.log('🔄 Token expirando, renovando...');
      await this.refreshToken();
    }

    return this.currentTokens;
  }

  async refreshToken() {
    if (!this.currentTokens?.refreshToken) {
      throw new Error('Refresh token não disponível. Faça login novamente.');
    }

    try {
      console.log('🔄 Renovando token de acesso...');

      const response = await axios.post(
        `${process.env.TINY_AUTH_URL}/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.TINY_CLIENT_ID,
          client_secret: process.env.TINY_CLIENT_SECRET,
          refresh_token: this.currentTokens.refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      await this.saveTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      });

      console.log('✅ Token renovado com sucesso');
      return this.currentTokens;

    } catch (error) {
      console.error('❌ Erro ao renovar token:', error.response?.data || error.message);

      // Se falhou ao renovar, limpar tokens inválidos
      this.currentTokens = null;
      try {
        await fs.unlink(this.tokenFile);
      } catch { }

      throw new Error('Erro ao renovar token. Faça login novamente.');
    }
  }

  async clearTokens() {
    this.currentTokens = null;
    try {
      await fs.unlink(this.tokenFile);
      console.log('🗑️ Tokens removidos');
    } catch (error) {
      // Arquivo já não existe
    }
  }

  getAuthHeader() {
    if (!this.currentTokens) {
      throw new Error('Token não disponível');
    }
    return `${this.currentTokens.tokenType} ${this.currentTokens.accessToken}`;
  }
}

module.exports = new TokenManager();