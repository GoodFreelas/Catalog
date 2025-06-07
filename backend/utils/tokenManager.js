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
      createdAt: Date.now(),
      scope: tokenData.scope || 'openid'
    };

    try {
      await fs.writeFile(this.tokenFile, JSON.stringify(tokens, null, 2));
      this.currentTokens = tokens;

      console.log('✅ Tokens salvos em:', this.tokenFile);
      console.log('📅 Token expira em:', new Date(tokens.expiresAt).toISOString());
      console.log('⏰ Duração do token:', Math.round(tokenData.expiresIn / 3600), 'horas');

    } catch (error) {
      console.error('❌ Erro ao salvar tokens:', error);
      throw new Error('Erro ao salvar tokens de acesso');
    }
  }

  async loadTokens() {
    try {
      const data = await fs.readFile(this.tokenFile, 'utf8');
      this.currentTokens = JSON.parse(data);

      console.log('📂 Tokens carregados do arquivo');
      console.log('📅 Token expira em:', new Date(this.currentTokens.expiresAt).toISOString());

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
    // Conforme documentação: token expira em 4 horas
    const now = Date.now();
    const expiresAt = this.currentTokens.expiresAt;
    const marginMs = 5 * 60 * 1000; // 5 minutos

    if (now >= (expiresAt - marginMs)) {
      console.log('🔄 Token expirando em breve, renovando automaticamente...');
      console.log('⏰ Tempo restante:', Math.round((expiresAt - now) / 1000 / 60), 'minutos');
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
      console.log('📡 Usando refresh token para renovação automática');

      // URL EXATA conforme documentação oficial da Tiny
      const tokenUrl = `${process.env.TINY_AUTH_URL}/token`;

      const response = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.TINY_CLIENT_ID,
          client_secret: process.env.TINY_CLIENT_SECRET,
          refresh_token: this.currentTokens.refreshToken
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

      await this.saveTokens({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || this.currentTokens.refreshToken, // Manter refresh token se não vier novo
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
        scope: tokenData.scope
      });

      console.log('✅ Token renovado com sucesso');
      console.log('📊 Novo token expira em:', new Date(this.currentTokens.expiresAt).toISOString());
      console.log('⏰ Nova duração:', Math.round(tokenData.expires_in / 3600), 'horas');

      return this.currentTokens;

    } catch (error) {
      console.error('❌ Erro ao renovar token:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // Se falhou ao renovar, limpar tokens inválidos
      this.currentTokens = null;
      try {
        await fs.unlink(this.tokenFile);
        console.log('🗑️ Tokens inválidos removidos');
      } catch {
        // Arquivo já não existe
      }

      throw new Error('Erro ao renovar token. Faça login novamente.');
    }
  }

  async clearTokens() {
    this.currentTokens = null;
    try {
      await fs.unlink(this.tokenFile);
      console.log('🗑️ Tokens removidos com sucesso');
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

  // Método para verificar se o token está próximo do vencimento
  isTokenExpiring(minutesThreshold = 30) { // 30 minutos como padrão
    if (!this.currentTokens) {
      return true;
    }

    const now = Date.now();
    const expiresAt = this.currentTokens.expiresAt;
    const thresholdMs = minutesThreshold * 60 * 1000;

    return (expiresAt - now) <= thresholdMs;
  }

  // Método para obter informações detalhadas do token
  getTokenInfo() {
    if (!this.currentTokens) {
      return null;
    }

    const now = Date.now();
    const timeToExpire = Math.max(0, this.currentTokens.expiresAt - now);
    const hoursToExpire = Math.round(timeToExpire / (1000 * 60 * 60) * 100) / 100;
    const minutesToExpire = Math.round(timeToExpire / (1000 * 60));

    return {
      tokenType: this.currentTokens.tokenType,
      expiresAt: this.currentTokens.expiresAt,
      createdAt: this.currentTokens.createdAt,
      scope: this.currentTokens.scope,
      timeToExpire: timeToExpire,
      hoursToExpire: hoursToExpire,
      minutesToExpire: minutesToExpire,
      isExpiring: this.isTokenExpiring(),
      isValid: this.currentTokens.expiresAt > now,
      hasRefreshToken: !!this.currentTokens.refreshToken
    };
  }

  // Método para debug
  async debugTokens() {
    const info = this.getTokenInfo();

    console.log('🔍 Debug dos Tokens (Oficial Tiny):', {
      hasTokens: !!this.currentTokens,
      tokenInfo: info,
      filePath: this.tokenFile,
      timestamp: new Date().toISOString(),
      officialConfig: {
        tokenDuration: '4 horas',
        refreshTokenDuration: '1 dia',
        scope: 'openid',
        renewalThreshold: '30 minutos antes do vencimento'
      }
    });

    return info;
  }

  // Método para verificar se precisa de autenticação
  async needsAuthentication() {
    try {
      await this.getValidToken();
      return false; // Tem token válido
    } catch (error) {
      return true; // Precisa autenticar
    }
  }
}

module.exports = new TokenManager();