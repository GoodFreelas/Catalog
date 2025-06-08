# E-commerce Fullstack - Integração Tiny API

Um e-commerce completo desenvolvido com Node.js, Express, React, Vite e Tailwind CSS, integrado com a API da Tiny ERP.

## 🚀 Características

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Vite + Tailwind CSS
- **Arquitetura**: Atomic Design (Atoms, Molecules, Organisms)
- **Cache inteligente**: SessionStorage para otimizar requisições
- **Sincronização automática**: Produtos atualizados automaticamente
- **Carrinho de compras**: Integração com WhatsApp
- **Responsivo**: Design adaptado para mobile e desktop

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- MongoDB (local ou MongoDB Atlas)
- NPM ou Yarn

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd ecommerce-fullstack
```

### 2. Configuração do Backend

```bash
# Acesse a pasta do backend
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3001
TINY_TOKEN=6126c965d5c8d23c0da7b7bc33372c40463b9368fce27eeb36c6e0b3a5e13929
MONGODB_URI=mongodb://localhost:27017/ecommerce
NODE_ENV=development
```

### 3. Configuração do Frontend

```bash
# Acesse a pasta do frontend
cd ../frontend

# Instale as dependências
npm install
```

### 4. Inicialização

#### Backend (Terminal 1)

```bash
cd backend
npm run dev
```

#### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

### 5. Sincronização Inicial de Produtos

```bash
# Execute a sincronização manual inicial
cd backend
npm run sync
```

## 📊 API Endpoints

### Produtos

- `GET /api/products` - Listar produtos com filtros
- `GET /api/products/:id` - Buscar produto específico
- `GET /api/products/categories` - Listar categorias
- `GET /api/products/stats/summary` - Estatísticas gerais
- `POST /api/products/sync` - Sincronização manual

### Parâmetros de Filtros

```javascript
{
  page: 1,           // Página atual
  limit: 20,         // Itens por página
  search: '',        // Busca por texto
  categoria: '',     // Filtrar por categoria
  minPrice: 0,       // Preço mínimo
  maxPrice: null,    // Preço máximo
  sortBy: 'nome',    // Campo de ordenação
  sortOrder: 'asc'   // Direção da ordenação
}
```

## 🎨 Estrutura do Frontend

```
src/
├── components/
│   ├── atoms/           # Componentes básicos
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   └── Loading.jsx
│   ├── molecules/       # Componentes compostos
│   │   ├── ProductCard.jsx
│   │   └── SearchFilters.jsx
│   └── organisms/       # Componentes complexos
│       ├── Header.jsx
│       └── Footer.jsx
├── contexts/
│   └── CartContext.jsx  # Estado global do carrinho
├── pages/
│   ├── HomePage.jsx
│   ├── ProductPage.jsx
│   └── CartPage.jsx
├── services/
│   └── api.js          # Serviços de API e cache
└── App.jsx
```

## 💾 Sistema de Cache

O sistema utiliza sessionStorage para otimizar requisições:

```javascript
// Cache automático por 30 minutos para produtos
// Cache automático por 60 minutos para produto individual
// Cache automático por 1 hora para estatísticas

// Limpar cache manualmente
cacheService.clearProductsCache();
```

## 🛒 Funcionalidades do Carrinho

- Adicionar/remover produtos
- Atualizar quantidades
- Cálculo automático de totais
- Persistência no localStorage
- Integração com WhatsApp

### Personalizar WhatsApp

Altere o número padrão em `CartContext.jsx`:

```javascript
const sendToWhatsApp = (phoneNumber = "5551999999999") => {
  // Seu código aqui
};
```

## ⏰ Sincronização Automática

A sincronização é executada automaticamente a cada 6 horas, mas você pode customizar:

```javascript
// Em server.js - alterar frequência
cron.schedule("0 */6 * * *", async () => {
  // A cada 6 horas
});

// Outras opções:
// '0 */1 * * *'    - A cada hora
// '0 0 * * *'      - Diariamente à meia-noite
// '0 0 */3 * *'    - A cada 3 dias
```

### Sincronização Manual

```bash
# Via script
npm run sync

# Via API
curl -X POST http://localhost:3001/api/products/sync
```

## 🎨 Customização do Design

### Cores (tailwind.config.js)

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',  // Cor principal
    600: '#2563eb',  // Hover
    700: '#1d4ed8',  // Active
  }
}
```

### Componentes Atoms

Todos os componentes seguem o padrão Atomic Design para fácil customização:

```jsx
// Button.jsx - Variantes disponíveis
<Button variant="primary" size="large">
<Button variant="secondary" size="medium">
<Button variant="outline" size="small">
<Button variant="danger">
<Button variant="success">
<Button variant="ghost">
```

## 📱 Responsividade

O design é mobile-first com breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🔧 Configurações Avançadas

### Limites de API

A Tiny API tem limite de requisições. O sistema implementa:

```javascript
// Delay de 1.2s entre requisições
this.delay = 1200;

// Retry automático em caso de erro
// Cache inteligente para reduzir chamadas
```

### Performance

```javascript
// Lazy loading de imagens
// Paginação inteligente
// Cache em múltiplas camadas
// Debounce em filtros de busca (500ms)
```

## 🚀 Deploy

### Backend (Heroku/Railway/Render)

1. Configure as variáveis de ambiente
2. Configure MongoDB Atlas
3. Deploy do backend

### Frontend (Vercel/Netlify)

1. Configure a URL da API de produção
2. Build e deploy

```bash
# Build do frontend
npm run build

# Preview local
npm run preview
```

### Variáveis de Ambiente - Produção

```env
# Backend
PORT=3001
TINY_TOKEN=seu_token_aqui
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
NODE_ENV=production

# Frontend (se necessário)
VITE_API_URL=https://sua-api.herokuapp.com
```

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📦 Scripts Disponíveis

### Backend

```bash
npm start          # Produção
npm run dev        # Desenvolvimento
npm run sync       # Sincronização manual
```

### Frontend

```bash
npm run dev        # Desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
npm run lint       # Verificar código
```

## 🐛 Troubleshooting

### Problema: Produtos não carregam

1. Verifique se o MongoDB está rodando
2. Verifique o token da Tiny API
3. Execute sincronização manual: `npm run sync`

### Problema: Erro de CORS

Configure CORS no backend:

```javascript
app.use(
  cors({
    origin: ["http://localhost:3000", "https://seu-dominio.com"],
  })
);
```

### Problema: Cache travado

```javascript
// Limpar cache no console do navegador
cacheService.clearProductsCache();
localStorage.clear();
sessionStorage.clear();
```

## 📄 Estrutura de Arquivos Completa

```
projeto/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Product.js
│   ├── routes/
│   │   └── products.js
│   ├── services/
│   │   └── tinyService.js
│   ├── scripts/
│   │   └── syncProducts.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   └── organisms/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte e dúvidas:

- 📧 Email: contato@ecommerce.com
- 💬 WhatsApp: (51) 99999-9999
- 🐛 Issues: [GitHub Issues](link-do-repositorio/issues)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

⭐ **Desenvolvido com ❤️ para facilitar vendas online!**
