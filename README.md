# 🛍️ Catálogo de Produtos - Tiny ERP

Um catálogo público de produtos integrado ao Tiny ERP, com carrinho de compras e integração WhatsApp para finalização de pedidos.

## 📋 Funcionalidades

### 🎯 **Para Clientes**

- ✅ Navegação pública sem necessidade de login
- ✅ Busca avançada por nome, código e categoria
- ✅ Filtros por preço, categoria e disponibilidade
- ✅ Visualização detalhada dos produtos
- ✅ Carrinho de compras persistente
- ✅ Finalização via WhatsApp com mensagem formatada
- ✅ Sistema de favoritos
- ✅ Interface responsiva (mobile/desktop)

### ⚙️ **Para Administradores**

- ✅ Integração completa com API v3 do Tiny
- ✅ Sincronização automática de produtos e estoque
- ✅ Controle de tokens de acesso OAuth2
- ✅ Cache inteligente para performance
- ✅ Logs detalhados para monitoramento

## 🚀 Tecnologias

### **Frontend**

- React 18 + Vite
- Tailwind CSS
- Lucide Icons
- LocalStorage para persistência

### **Backend**

- Node.js + Express
- Axios para API calls
- CORS e Helmet para segurança
- Rate limiting

### **Integração**

- API v3 do Tiny ERP
- OAuth2 para autenticação
- WhatsApp Business API

## 📦 Instalação

### **1. Clone o repositório**

```bash
git clone <url-do-repositorio>
cd tiny-catalog
```

### **2. Configurar Backend**

```bash
cd backend
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar as variáveis de ambiente
nano .env
```

**Configurar `.env`:**

```env
PORT=3001
TINY_CLIENT_ID=tiny-api-fc122c057e6aa6d149852831fb427919d2d578c5-1749246867
TINY_CLIENT_SECRET=PsRzcPUtY7rH6TskiC926y2uOQq52rXU
FRONTEND_URL=http://localhost:5173
```

### **3. Configurar Frontend**

```bash
cd ../frontend
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar as variáveis
nano .env
```

**Configurar `.env`:**

```env
VITE_API_URL=http://localhost:3001/api
VITE_WHATSAPP_NUMBER=5551999999999
VITE_STORE_NAME=Minha Loja
```

### **4. Autenticar no Tiny (Uma vez apenas)**

```bash
# Iniciar o backend
cd backend
npm run dev

# Acessar no navegador:
http://localhost:3001/auth/login
```

### **5. Iniciar aplicação**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Acesse: `http://localhost:5173`

## 📝 Como Usar

### **Para Clientes**

1. **Navegar**: Acesse o catálogo e explore os produtos
2. **Buscar**: Use a barra de busca ou filtros
3. **Adicionar**: Clique em "Comprar" ou "Adicionar ao Carrinho"
4. **Finalizar**: Abra o carrinho e clique em "Finalizar Pedido no WhatsApp"
5. **WhatsApp**: Será redirecionado com mensagem formatada

### **Para Administradores**

1. **Autenticar**: Execute `/auth/login` uma vez
2. **Monitorar**: Verifique logs no console do backend
3. **Atualizar**: Produtos são sincronizados automaticamente
4. **Cache**: Limpe o cache se necessário via API

## 🔧 Endpoints da API

### **Autenticação**

- `GET /auth/login` - Iniciar autenticação
- `GET /auth/callback` - Callback OAuth2
- `GET /auth/status` - Status da autenticação

### **Produtos**

- `GET /api/produtos` - Listar produtos
- `GET /api/produtos/:id` - Produto específico
- `GET /api/produtos/:id/custos` - Custos do produto
- `PUT /api/produtos/:id/preco` - Atualizar preço

### **Categorias**

- `GET /api/categorias` - Listar categorias
- `GET /api/categorias/tree` - Árvore de categorias
- `GET /api/categorias/:id/produtos` - Produtos da categoria

### **Estoque**

- `GET /api/estoque/:id` - Estoque do produto
- `POST /api/estoque/:id` - Atualizar estoque
- `GET /api/estoque/relatorio/baixo` - Relatório estoque baixo

## 🔒 Segurança

- ✅ **Rate Limiting**: 100 req/15min por IP
- ✅ **CORS**: Configurado para domínios específicos
- ✅ **Helmet**: Headers de segurança
- ✅ **Tokens**: Renovação automática OAuth2
- ✅ **Validação**: Sanitização de inputs
- ✅ **Logs**: Sem exposição de dados sensíveis

## 🚀 Deploy

### **Frontend (Vercel)**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### **Backend (Heroku)**

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

cd backend
heroku create sua-api-tiny
heroku config:set TINY_CLIENT_ID=seu-client-id
heroku config:set TINY_CLIENT_SECRET=seu-client-secret
heroku config:set FRONTEND_URL=https://seu-site.vercel.app
git push heroku main
```

### **Backend (Railway)**

```bash
# Alternativa mais simples
# 1. Conecte seu repo no Railway.app
# 2. Configure as variáveis de ambiente
# 3. Deploy automático
```

## 📊 Monitoramento

### **Health Check**

```bash
curl http://localhost:3001/health
```

### **Status da API**

```bash
curl http://localhost:3001/api/status
```

### **Logs em Produção**

```bash
# Heroku
heroku logs --tail -a sua-api-tiny

# Railway
railway logs
```

## 🔧 Personalização

### **Cores e Tema**

Edite `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6', // Cor principal
        600: '#2563eb',
        700: '#1d4ed8',
      }
    }
  }
}
```

### **Logo e Nome da Loja**

Configure no `.env`:

```env
VITE_STORE_NAME=Sua Loja
VITE_STORE_LOGO=/assets/logo.png
```

### **WhatsApp**

Configure seu número:

```env
VITE_WHATSAPP_NUMBER=5551999999999
```

## 🐛 Solução de Problemas

### **Erro de Token**

```bash
# Re-autenticar
curl http://localhost:3001/auth/login
```

### **Produtos não carregam**

1. Verificar autenticação: `/auth/status`
2. Verificar logs do backend
3. Testar API: `/api/produtos`

### **WhatsApp não abre**

1. Verificar número no formato correto
2. Testar em dispositivo mobile
3. Verificar se WhatsApp está instalado

## 📞 Suporte

- **Documentação Tiny**: [API v3](https://tiny.com.br/api)
- **Issues**: Reporte bugs no repositório
- **Email**: contato@empresa.com

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para facilitar vendas online**
