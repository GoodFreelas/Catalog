export const TinyAPI = {
  token: '6126c965d5c8d23c0da7b7bc33372c40463b9368fce27eeb36c6e0b3a5e13929',
  baseURL: '/api/tiny',

  async fetchProducts(page = 1) {
    const cacheKey = `products_page_${page}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 10 * 60 * 1000) {
        console.log('📦 Usando cache para página:', page);
        return data;
      }
    }

    try {
      console.log('📡 Buscando produtos da API Tiny - Página:', page);

      const response = await fetch(`${this.baseURL}/api2/produtos.pesquisa.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: this.token,
          formato: 'json',
          pagina: page.toString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.retorno?.status === 'Erro') {
        throw new Error(data.retorno.erros?.[0]?.erro || 'Erro na API Tiny');
      }

      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      console.log('✅ Produtos recebidos da API Tiny:', data.retorno?.produtos?.length || 0);
      return data;

    } catch (error) {
      console.error('❌ Erro ao buscar produtos da API Tiny:', error.message);
      throw error;
    }
  },

  async fetchProductDetails(productId) {
    const cacheKey = `product_${productId}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 30 * 60 * 1000) {
        console.log('📦 Usando cache para produto:', productId);
        return data;
      }
    }

    try {
      console.log('🔍 Buscando detalhes da API Tiny - ID:', productId);

      const response = await fetch(`${this.baseURL}/api2/produto.obter.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: this.token,
          formato: 'json',
          id: productId.toString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.retorno?.status === 'Erro') {
        throw new Error(data.retorno.erros?.[0]?.erro || 'Erro na API Tiny');
      }

      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      console.log('✅ Detalhes recebidos da API Tiny:', data.retorno?.produto?.nome || productId);
      return data;

    } catch (error) {
      console.error('❌ Erro ao buscar detalhes da API Tiny:', error.message);
      throw error;
    }
  },

  async testAPI() {
    try {
      console.log('🧪 Testando conexão com API Tiny...');

      const response = await fetch(`${this.baseURL}/api2/produtos.pesquisa.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: this.token,
          formato: 'json',
          pagina: '1'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Tiny funcionando!', data);
        return true;
      } else {
        console.log('❌ API respondeu com erro:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao conectar com API Tiny:', error.message);
      return false;
    }
  },

  clearCache() {
    const keys = Object.keys(sessionStorage);
    const cacheKeys = keys.filter(key =>
      key.startsWith('products_page_') || key.startsWith('product_')
    );

    cacheKeys.forEach(key => sessionStorage.removeItem(key));
    console.log('🗑️ Cache limpo:', cacheKeys.length, 'itens removidos');
  }
};