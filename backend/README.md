# 🔄 Tiny ERP Sync API

API moderna e robusta para sincronização de produtos do Tiny ERP com MongoDB, incluindo rate limiting inteligente, logs detalhados e arquitetura modular.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6%2B-green)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18-blue)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Instalação Rápida](#-instalação-rápida)
- [Configuração](#-configuração)
- [Documentação da API](#-documentação-da-api)
- [Arquitetura](#-arquitetura)
- [Rate Limiter](#-rate-limiter)
- [Logs e Monitoramento](#-logs-e-monitoramento)
- [Deploy](#-deploy)
- [Troubleshooting](#-troubleshooting)

## ✨ Funcionalidades

### 🎯 **Core Features**

- ✅ **Sincronização completa** de produtos do Tiny ERP
- ✅ **Rate Limiter inteligente** (25 req/min) - Respeita limites da API
- ✅ **Armazenamento MongoDB** com schema otimizado
- ✅ **Sincronização automática** diária configurável
- ✅ **API REST completa** para consulta dos produtos

### 🔧 **Funcionalidades Avançadas**

- ✅ **Arquitetura modular** para fácil manutenção
- ✅ **Sistema de logs** coloridos e estruturados
- ✅ **Monitoramento em tempo real** do rate limiter
- ✅ **Health checks** e diagnósticos
- ✅ **Tratamento robusto de erros**
- ✅ **Filtros e busca avançada** de produtos
- ✅ **Estatísticas detalhadas** de sincronização
- ✅ **Docker support** para deploy fácil

## 🚀 Instalação Rápida

### **Pré-requisitos**

- Node.js 18+
- MongoDB (local ou Atlas)
- Token da API Tiny ERP

### **1. Clone e instale**

```bash
git clone <seu-repositorio>
cd tiny-erp-sync-api
npm install
```

### **2. Configure variáveis de ambiente**

```bash
cp .env.example .env
# Edite o .env com suas configurações
```

### **3. Execute o debug para testar**

```bash
npm run debug
```

### **4. Inicie o servidor**

```bash
npm start
# ou para desenvolvimento
npm run dev
```

## ⚙️ Configuração

### **Variáveis de Ambiente (.env)**

```env
# Servidor
PORT=3000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tiny_products

# API Tiny ERP
TINY_TOKEN=seu_token_aqui

# Rate Limiter (Opcional)
TINY_RATE_LIMIT_REQUESTS=25     # Max requisições por minuto
TINY_RATE_LIMIT_WINDOW=60000    # Janela em milissegundos

# Sincronização (Opcional)
SYNC_ON_START=false             # Sincronizar ao iniciar

# Logs (Opcional)
LOG_LEVEL=INFO                  # DEBUG, INFO, WARN, ERROR
LOG_COLORS=true                 # Cores nos logs
```

### **MongoDB Atlas Setup**

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie cluster gratuito
3. Configure IP whitelist
4. Crie usuário de banco
5. Copie string de conexão para `MONGODB_URI`

## 📚 Documentação da API

### **🏠 Base URL**

```
http://localhost:3000
```

---

## 📦 **Produtos**

### **GET /products**

Lista produtos com paginação e filtros avançados.

**Query Parameters:**

- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10, máx: 100)
- `search` (string): Busca em nome, código e descrição
- `situacao` (string): Filtro por situação (A=Ativo, I=Inativo)
- `categoria` (string): Filtro por categoria
- `preco_min` (number): Preço mínimo
- `preco_max` (number): Preço máximo
- `sort` (string): Campo para ordenação
- `order` (string): Direção (asc/desc)

**Exemplo:**

```bash
GET /products?page=1&limit=20&search=notebook&situacao=A&sort=preco&order=desc
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 50,
      "total_products": 1000,
      "per_page": 20,
      "has_next": true,
      "has_prev": false
    },
    "filters_applied": {...},
    "stats": {
      "total_products": 1000,
      "active_products": 850,
      "products_with_images": 750
    }
  }
}
```

### **GET /products/:id**

Busca produto específico por ID.

**Exemplo:**

```bash
GET /products/704435766
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "704435766",
      "nome": "Aplicador De Pneu Pretinho",
      "preco": 10,
      "anexos": [
        {"anexo": "https://s3.amazonaws.com/..."}
      ],
      ...
    },
    "metadata": {
      "is_active": true,
      "has_images": true,
      "main_image": "https://s3.amazonaws.com/...",
      "days_since_sync": 2
    }
  }
}
```

### **GET /products/search/text**

Busca textual avançada em produtos.

**Query Parameters:**

- `q` (string, obrigatório): Termo de busca
- `limit` (number): Limite de resultados (padrão: 10)

### **GET /products/stats/general**

Estatísticas gerais dos produtos.

### **GET /products/categories**

Lista todas as categorias disponíveis.

### **GET /products/category/:category**

Lista produtos de uma categoria específica.

---

## 🔄 **Sincronização**

### **POST /sync**

Executa sincronização manual.

**Resposta:**

```json
{
  "success": true,
  "message": "Sincronização iniciada",
  "status": "processing",
  "timestamp": "2025-06-08T10:30:00.000Z"
}
```

### **GET /sync/status**

Status completo do sistema e sincronização.

**Resposta:**

```json
{
  "success": true,
  "data": {
    "system_status": {
      "mongodb_connected": true,
      "total_products_in_db": 1000,
      "active_products": 850,
      "uptime_seconds": 3600
    },
    "sync_status": {
      "is_running": false,
      "current_stats": {...},
      "last_sync": {...}
    },
    "sync_statistics": {
      "total_syncs": 25,
      "successful_syncs": 23,
      "avg_duration": 120.5
    },
    "environment": {
      "sync_on_start": "false",
      "node_env": "production"
    }
  }
}
```

### **GET /sync/logs**

Histórico de logs de sincronização.

**Query Parameters:**

- `page`, `limit`: Paginação
- `status`: Filtro por status (success/error/partial)
- `sync_type`: Filtro por tipo (manual/automatic/startup)
- `date_from`, `date_to`: Filtro por período
- `include_details`: Incluir detalhes completos (true/false)

### **GET /sync/logs/errors**

Logs apenas de sincronizações com erro.

### **GET /sync/stats**

Estatísticas detalhadas de sincronização.

### **GET /sync/progress**

Progresso da sincronização atual em tempo real.

### **POST /sync/cancel**

Tentar cancelar sincronização em execução.

---

## 🛠️ **Debug & Monitoramento**

### **GET /debug/health**

Health check completo do sistema.

**Resposta:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 3600,
    "memory": {...},
    "mongodb": {
      "status": "connected",
      "host": "cluster0.mongodb.net"
    },
    "tiny_api": {
      "status": "ok"
    }
  }
}
```

### **GET /debug/env**

Verificar configurações (sem expor dados sensíveis).

### **GET /debug/test-tiny**

Testar conexão com API do Tiny.

### **GET /debug/rate-limiter**

Status detalhado do rate limiter.

**Resposta:**

```json
{
  "success": true,
  "data": {
    "current_stats": {
      "total_requests": 150,
      "requests_in_current_window": 12,
      "max_requests_per_window": 25,
      "available_slots": 13,
      "is_rate_limited": false
    },
    "timeline": [...],
    "next_window_reset": {
      "in_seconds": 45,
      "timestamp": "2025-06-08T10:31:00.000Z"
    }
  }
}
```

### **POST /debug/rate-limiter/reset**

Reset manual do rate limiter.

### **GET /debug/logs/level**

Verificar nível de log atual.

### **POST /debug/logs/level**

Alterar nível de log dinamicamente.

### **GET /debug/memory**

Informações detalhadas de uso de memória.

---

## 🏗️ Arquitetura

### **📁 Estrutura do Projeto**

```
tiny-erp-sync-api/
├── src/
│   ├── config/          # Configurações
│   │   ├── database.js  # MongoDB
│   │   └── tiny.js      # API Tiny
│   ├── models/          # Schemas MongoDB
│   │   ├── Product.js
│   │   └── SyncLog.js
│   ├── services/        # Lógica de negócio
│   │   ├── tinyService.js
│   │   ├── syncService.js
│   │   └── rateLimiter.js
│   ├── routes/          # Rotas da API
│   │   ├── products.js
│   │   ├── sync.js
│   │   └── debug.js
│   ├── middlewares/     # Middlewares
│   │   └── errorHandler.js
│   └── utils/           # Utilitários
│       └── logger.js
├── scripts/             # Scripts utilitários
│   └── debug.js
├── server.js           # Servidor principal
└── package.json
```

### **🔄 Fluxo de Sincronização**

1. **Teste de Conectividade**: Verifica API Tiny e MongoDB
2. **Busca Paginada**: Lista todos os produtos (respeitando rate limit)
3. **Detalhes por Produto**: Busca informações completas de cada item
4. **Persistência**: Salva/atualiza no MongoDB
5. **Logs**: Registra estatísticas e erros
6. **Rate Limiting**: Controla requisições automaticamente

---

## 🚦 Rate Limiter

### **Configuração Inteligente**

- **Limite padrão**: 25 requisições por minuto
- **Janela deslizante**: 60 segundos
- **Buffer de segurança**: +1 segundo extra
- **Recuperação automática**: de erros HTTP 429

### **Monitoramento em Tempo Real**

```bash
# Ver status atual
GET /debug/rate-limiter

# Timeline das últimas requisições
# Tempo para reset da janela
# Slots disponíveis
```

### **Logs Durante Sincronização**

```
🌐 Requisição 15 - (15/25 na janela atual)
⏱️ Rate limit atingido. Aguardando 45s...
📊 Rate Limiter: 20/25 requisições na janela atual
```

### **Estimativa de Tempo**

- **100 produtos**: ~8 minutos
- **500 produtos**: ~40 minutos
- **1000 produtos**: ~80 minutos

_Cada produto = 2 requisições (lista + detalhes)_

---

## 📊 Logs e Monitoramento

### **Sistema de Logs Avançado**

```javascript
// Níveis disponíveis
DEBUG; // Muito verboso - desenvolvimento
INFO; // Informações gerais - padrão
WARN; // Avisos e problemas menores
ERROR; // Apenas erros críticos
```

### **Logs Coloridos**

- 🟦 **INFO**: Informações gerais
- 🟨 **WARN**: Avisos importantes
- 🟥 **ERROR**: Erros críticos
- 🟦 **DEBUG**: Detalhes técnicos

### **Alterar Nível Dinamicamente**

```bash
# Via API
POST /debug/logs/level
{
  "level": "DEBUG"
}

# Via variável de ambiente
LOG_LEVEL=DEBUG npm start
```

### **Monitoramento de Performance**

- Memory usage tracking
- Request timing
- Rate limiter metrics
- Sync performance stats
- Error rate monitoring

---

## 🚀 Deploy

### **Heroku**

```bash
# 1. Instalar Heroku CLI
# 2. Login e criar app
heroku create sua-app-name

# 3. Configurar variáveis
heroku config:set MONGODB_URI=sua_uri
heroku config:set TINY_TOKEN=seu_token
heroku config:set NODE_ENV=production

# 4. Deploy
git push heroku main
```

### **Railway**

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login e deploy
railway login
railway new
railway add
railway deploy
```

### **Docker**

```bash
# Build
docker build -t tiny-sync-api .

# Run
docker run -p 3000:3000 \
  -e MONGODB_URI=sua_uri \
  -e TINY_TOKEN=seu_token \
  tiny-sync-api
```

### **Docker Compose**

```bash
# Com MongoDB local
docker-compose up -d
```

### **DigitalOcean App Platform**

1. Conecte repositório GitHub
2. Configure variáveis de ambiente
3. Deploy automático

---

## 🔧 Troubleshooting

### **Problemas Comuns**

#### **🔴 Erro: "TINY_TOKEN não definido"**

```bash
# Solução: Configure o token no .env
TINY_TOKEN=seu_token_aqui
```

#### **🔴 Erro: "MongoDB connection failed"**

```bash
# Verifique a string de conexão
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Teste conexão
npm run debug
```

#### **🔴 Rate limit atingido muito rápido**

```bash
# Ajuste configurações
TINY_RATE_LIMIT_REQUESTS=20  # Reduzir para 20 req/min
TINY_RATE_LIMIT_WINDOW=60000
```

#### **🔴 Sincronização não inicia**

```bash
# Verifique logs
npm run debug

# Force sincronização
curl -X POST http://localhost:3000/sync
```

#### **🔴 Produtos não aparecem**

```bash
# Verifique status
GET /sync/status

# Veja logs de erro
GET /sync/logs/errors
```

### **Debug Detalhado**

```bash
# Script completo de diagnóstico
npm run debug

# Testa:
# ✅ Variáveis de ambiente
# ✅ Conexão MongoDB
# ✅ API Tiny
# ✅ Rate limiter
# ✅ Performance
```

### **Logs Úteis**

```bash
# Alterar para debug
POST /debug/logs/level {"level": "DEBUG"}

# Ver health check
GET /debug/health

# Monitorar rate limiter
GET /debug/rate-limiter
```

### **Performance Issues**

- Reduzir `TINY_RATE_LIMIT_REQUESTS` se API retorna 429
- Aumentar timeout do MongoDB se conexão lenta
- Usar índices MongoDB para consultas otimizadas
- Monitorar memória com `GET /debug/memory`

---

## 📝 Scripts Disponíveis

```bash
npm start        # Produção
npm run dev      # Desenvolvimento (nodemon)
npm run debug    # Script diagnóstico completo
npm test         # Testes (se configurado)
```

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit changes (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Abra Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🆘 Suporte

- 📧 **Email**: seu-email@exemplo.com
- 💬 **Issues**: [GitHub Issues](https://github.com/usuario/repo/issues)
- 📖 **Docs**: Esta documentação
- 🐛 **Bugs**: Use `npm run debug` primeiro

---

## 🎯 Roadmap

- [ ] **Webhook support** para sincronização em tempo real
- [ ] **Dashboard web** para monitoramento
- [ ] **Sync incremental** apenas produtos alterados
- [ ] **Multi-tenant** support
- [ ] **API rate limiting** por cliente
- [ ] **Backup automático** dos dados
- [ ] **Notificações** via email/Slack
- [ ] **Métricas avançadas** com Prometheus

---

**Desenvolvido com ❤️ para integração com Tiny ERP**
