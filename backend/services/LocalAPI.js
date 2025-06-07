// services/LocalAPI.js - Nova API que conecta no seu backend
export const LocalAPI = {
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://seu-backend.herokuapp.com/api'
    : 'http://localhost:3001/api',

  async fetchProducts(page = 1, options = {}) {
    const { search, categoria, situacao, limit = 20 } = options;

    // Construir query params
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (search) params.append('search', search);
    if (categoria) params.append('categoria', categoria);
    if (situacao) params.append('situacao', situacao);

    try {
      console.log('📡 Buscando produtos do backend local - Página:', page);

      const response = await fetch(`${this.baseURL}/produtos?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log('✅ Produtos recebidos do backend:', data.retorno?.produtos?.length || 0);
      return data;

    } catch (error) {
      console.error('❌ Erro ao buscar produtos do backend:', error.message);
      throw error;
    }
  },

  async fetchProductDetails(productId) {
    try {
      console.log('🔍 Buscando detalhes do backend - ID:', productId);

      const response = await fetch(`${this.baseURL}/produtos/${productId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Produto não encontrado');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log('✅ Detalhes recebidos do backend:', data.retorno?.produto?.nome || productId);
      return data;

    } catch (error) {
      console.error('❌ Erro ao buscar detalhes do backend:', error.message);
      throw error;
    }
  },

  async getStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error.message);
      throw error;
    }
  },

  async getSyncStatus() {
    try {
      const response = await fetch(`${this.baseURL}/sync/status`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Erro ao buscar status de sync:', error.message);
      throw error;
    }
  },

  async startSync() {
    try {
      const response = await fetch(`${this.baseURL}/sync/start`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Erro ao iniciar sync:', error.message);
      throw error;
    }
  },

  async getSyncLogs() {
    try {
      const response = await fetch(`${this.baseURL}/sync/logs`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ Erro ao buscar logs de sync:', error.message);
      throw error;
    }
  },

  // Método para testar conectividade
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/stats`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};