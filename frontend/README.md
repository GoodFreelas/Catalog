# 🛍️ Catálogo de Produtos - Frontend

Frontend moderno e responsivo para catálogo de produtos integrado com a API Tiny ERP Sync, construído com React, Vite e Tailwind CSS.

[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4-yellow)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3-cyan)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-4.4-orange)](https://zustand-demo.pmnd.rs/)

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Desenvolvimento](#-desenvolvimento)
- [Build e Deploy](#-build-e-deploy)
- [Estrutura do Projeto](#-estrutura-do-projeto)

## ✨ Funcionalidades

### 🎯 **Core Features**

- ✅ **Catálogo completo** de produtos com busca e filtros
- ✅ **Carrinho de compras** com persistência local
- ✅ **Finalização via WhatsApp** com mensagem formatada
- ✅ **Design responsivo** mobile-first
- ✅ **Interface moderna** com animações suaves

### 🔧 **Funcionalidades Avançadas**

- ✅ **Atomic Design System** para componentes reutilizáveis
- ✅ **Organização por features** para melhor escalabilidade
- ✅ **State management** com Zustand
- ✅ **Cache inteligente** com React Query
- ✅ **Loading states** e feedback visual
- ✅ **Error boundaries** e tratamento de erros
- ✅ **PWA ready** (pode ser expandido)
- ✅ **Performance otimizada** com lazy loading

## 🚀 Tecnologias

### **Frontend Stack**

- **React 18** - Biblioteca principal
- **Vite 4** - Build tool ultra-rápido
- **Tailwind CSS 3** - Framework CSS utilitário
- **React Router Dom 6** - Roteamento SPA
- **Framer Motion** - Animações fluidas

### **State Management & Data**

- **Zustand** - Gerenciamento de estado global
- **React Query** - Cache e sincronização de dados
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários

### **UI & UX**

- **Lucide React** - Ícones modernos
- **React Hot Toast** - Notificações elegantes
- **Clsx** - Utilitário para classes condicionais

## 🏗️ Arquitetura

### **Organização por Features**

```
src/
├── app/                 # Configuração da aplicação
├── core/                # Funcionalidades centrais
│   ├── api/            # Cliente e endpoints
│   ├── stores/         # Estado global (Zustand)
│   ├── hooks/          # Hooks customizados
│   └── utils/          # Utilitários
├── shared/             # Componentes compartilhados (Atomic Design)
│   ├── components/
│   │   ├── atoms/      # Elementos básicos
│   │   ├── molecules/  # Combinações simples
│   │   ├── organisms/  # Seções complexas
│   │   └── templates/  # Layouts
│   └── styles/         # Estilos globais
└── features/           # Funcionalidades por domínio
    ├── catalog/        # Catálogo de produtos
    ├── cart/           # Carrinho de compras
    └── search/         # Busca de produtos
```

### **Atomic Design System**

- **Atoms**: Button, Input, Badge, Icon, Image
- **Molecules**: ProductCard, SearchBar, CartItem
- **Organisms**: Header, ProductGrid, Cart, FilterSidebar
- **Templates**: MainLayout, CatalogLayout

## 📦 Instalação

### **Pré-requisitos**

- Node.js 18+
- npm ou yarn
- API Tiny ERP Sync rodando

### **1. Clone o repositório**

```bash
git clone <seu-repositorio>
cd tiny-products-catalog
```

### **2. Instale as dependências**

```bash
npm install
# ou
yarn install
```

### **3. Configure variáveis de ambiente**

```bash
cp .env.example .env.local
```

Edite o `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WHATSAPP_NUMBER=5551999999999
```

### **4. Inicie o servidor de desenvolvimento**

```bash
npm run dev
# ou
yarn dev
```

Acesse: `http://localhost:5173`

## ⚙️ Configuração

### **Variáveis de Ambiente**

| Variável               | Descrição          | Exemplo                 |
| ---------------------- | ------------------ | ----------------------- |
| `VITE_API_BASE_URL`    | URL da API backend | `http://localhost:3000` |
| `VITE_WHATSAPP_NUMBER` | Número do WhatsApp | `5551999999999`         |
| `VITE_APP_NAME`        | Nome da aplicação  | `Catálogo de Produtos`  |

### **Configuração do WhatsApp**

1. Configure `VITE_WHATSAPP_NUMBER` com seu número
2. Formato: código do país + DDD + número
3. Exemplo: `5551999999999` (Brasil)

### **Configuração da API**

Certifique-se que sua API Tiny ERP Sync está rodando em:

- `http://localhost:3000` (desenvolvimento)
- Configure CORS para permitir requisições do frontend

## 🛠️ Desenvolvimento

### **Scripts Disponíveis**

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
npm run lint       # Verificar código
```

### **Adicionando Novos Componentes**

#### **1. Atomic Components (shared/components)**

```bash
# Exemplo: Novo átomo
src/shared/components/atoms/NewAtom/
├── NewAtom.jsx
├── index.js
└── NewAtom.stories.js (opcional)
```

#### **2. Feature Components**

```bash
# Exemplo: Nova feature
src/features/new-feature/
├── components/
├── hooks/
├── services/
└── pages/
```

### **Padrões de Código**

- **Componentes**: PascalCase (`ProductCard`)
- **Hooks**: camelCase começando com `use` (`useProducts`)
- **Utilitários**: camelCase (`formatCurrency`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### **Estado Global (Zustand)**

```javascript
// Exemplo de store
export const useFeatureStore = create((set, get) => ({
  // Estado
  items: [],

  // Ações
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  // Getters
  getItemCount: () => get().items.length,
}));
```

### **Integração com API**

```javascript
// Service
export class FeatureService {
  static async getData() {
    const response = await apiClient.get("/endpoint");
    return response.data;
  }
}

// Hook
export const useFeatureData = () => {
  return useQuery({
    queryKey: ["feature"],
    queryFn: FeatureService.getData,
  });
};
```

## 🚀 Build e Deploy

### **Build para Produção**

```bash
npm run build
```

Gera pasta `dist/` com arquivos otimizados.

### **Deploy Vercel**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Deploy Netlify**

```bash
# Build
npm run build

# Deploy pasta dist/
netlify deploy --prod --dir=dist
```

### **Deploy Docker**

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **Configuração de CORS**

Para produção, configure CORS na API:

```javascript
// Backend - Express
app.use(
  cors({
    origin: ["https://seu-dominio.com"],
    credentials: true,
  })
);
```

## 📁 Estrutura Detalhada

```
tiny-products-catalog/
├── public/
│   ├── vite.svg
│   └── index.html
├── src/
│   ├── app/                    # Configuração da aplicação
│   │   ├── App.jsx            # Componente principal
│   │   ├── main.jsx           # Entry point
│   │   └── router.jsx         # Configuração de rotas
│   ├── core/                   # Funcionalidades principais
│   │   ├── api/               # Cliente HTTP
│   │   │   ├── client.js      # Axios configurado
│   │   │   └── endpoints.js   # Endpoints da API
│   │   ├── constants/         # Constantes globais
│   │   │   └── api.js        # Configurações da API
│   │   ├── hooks/             # Hooks customizados
│   │   │   ├── useApi.js      # Hook para API
│   │   │   ├── useDebounce.js # Hook de debounce
│   │   │   └── useLocalStorage.js
│   │   ├── stores/            # Estado global (Zustand)
│   │   │   ├── cartStore.js   # Carrinho de compras
│   │   │   └── uiStore.js     # Estado da UI
│   │   └── utils/             # Utilitários
│   │       ├── formatters.js  # Formatação de dados
│   │       └── whatsapp.js    # Integração WhatsApp
│   ├── shared/                # Componentes compartilhados
│   │   ├── components/
│   │   │   ├── atoms/         # Elementos básicos
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Badge/
│   │   │   │   └── index.js
│   │   │   ├── molecules/     # Combinações simples
│   │   │   │   ├── ProductCard/
│   │   │   │   ├── SearchBar/
│   │   │   │   └── index.js
│   │   │   ├── organisms/     # Seções complexas
│   │   │   │   ├── Header/
│   │   │   │   ├── ProductGrid/
│   │   │   │   └── index.js
│   │   │   └── templates/     # Layouts
│   │   │       └── MainLayout/
│   │   └── styles/            # Estilos globais
│   │       └── globals.css
│   ├── features/              # Funcionalidades por domínio
│   │   ├── catalog/           # Catálogo de produtos
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   └── useProducts.js
│   │   │   ├── services/
│   │   │   │   └── productService.js
│   │   │   └── pages/
│   │   │       └── CatalogPage.jsx
│   │   ├── cart/              # Carrinho de compras
│   │   │   ├── components/
│   │   │   │   └── CartDrawer/
│   │   │   └── pages/
│   │   └── search/            # Busca de produtos
│   └── assets/                # Assets estáticos
├── .env.example              # Exemplo de variáveis
├── .gitignore
├── package.json
├── tailwind.config.js        # Configuração Tailwind
├── vite.config.js           # Configuração Vite
└── README.md
```

## 🎨 Personalização

### **Cores e Tema**

Edite `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        // ... sua paleta
        950: '#172554',
      },
    },
  },
}
```

### **Componentes**

- Todos os componentes seguem Atomic Design
- Fácil customização via props
- Estilos consistentes com Tailwind

### **Animações**

- Framer Motion para animações suaves
- Configurações em `tailwind.config.js`
- Classes utilitárias personalizadas

## 🔧 Troubleshooting

### **Problemas Comuns**

#### **Erro de CORS**

```bash
# Solução: Configurar CORS na API backend
Access-Control-Allow-Origin: http://localhost:5173
```

#### **API não encontrada**

```bash
# Verificar se API está rodando em localhost:3000
# Ou ajustar VITE_API_BASE_URL no .env.local
```

#### **Build falha**

```bash
# Limpar cache
rm -rf node_modules/.vite
npm run dev
```

### **Performance**

- Lazy loading automático para páginas
- Chunking otimizado no build
- Cache inteligente com React Query
- Imagens otimizadas automaticamente

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### **Padrões de Commit**

```
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
style: mudanças de estilo/formatação
refactor: refatoração de código
test: adição/correção de testes
chore: mudanças de build/ferramentas
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para uma experiência de compra incrível!**
