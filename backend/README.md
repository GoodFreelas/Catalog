# API de Sincronização Tiny ERP

Este projeto é uma API Express.js que sincroniza produtos da API do Tiny ERP com um banco de dados MongoDB, incluindo anexos e imagens dos produtos.

## Funcionalidades

- ✅ Sincronização completa de produtos do Tiny ERP
- ✅ **Rate Limiter inteligente (25 req/min)** - Respeita limites da API
- ✅ Armazenamento em MongoDB online
- ✅ Sincronização automática diária (configurável)
- ✅ API REST para consulta dos produtos
- ✅ Sistema de logs de sincronização
- ✅ Paginação para listagem de produtos
- ✅ Busca por produto específico
- ✅ Download e armazenamento de anexos/imagens
- ✅ Monitoramento em tempo real do rate limiter

## Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd tiny-erp-sync-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
MONGODB_URI=sua_string_de_conexao_mongodb
TINY_TOKEN=seu_token_da_api_tiny
SYNC_ON_START=false
```

### 4. Execute o projeto

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Configuração do MongoDB

### MongoDB Atlas (Recomendado)

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita
3. Crie um cluster
4. Configure o acesso de rede (IP whitelist)
5. Crie um usuário de banco de dados
6. Copie a string de conexão e coloque no `.env`

Exemplo de string de conexão:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tiny_products?retryWrites=true&w=majority
```

## API Endpoints

### Produtos

- `GET /` - Informações da API
- `GET /products` - Listar produtos (com paginação)
- `GET /products/:id` - Buscar produto específico

### Sincronização

- `POST /sync` - Executar sincronização manual
- `GET /sync/logs` - Ver logs de sincronização
- `GET /sync/status` - Status da última sincronização

### Debug e Monitoramento

- `GET /debug/env` - Verificar variáveis de ambiente
- `GET /debug/test-tiny` - Testar conexão com API do Tiny
- `GET /debug/rate-limiter` - Status do rate limiter em tempo real

### Exemplos de Uso

#### Listar produtos com paginação

```bash
GET /products?page=1&limit=10
```

Resposta:

```json
{
  "products": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 50,
    "total_products": 500,
    "per_page": 10
  }
}
```

#### Buscar produto específico

```bash
GET /products/704435766
```

#### Monitorar rate limiter

```bash
GET /debug/rate-limiter
```

Resposta:

```json
{
  "total_requests": 45,
  "requests_in_current_window": 12,
  "max_requests_per_window": 25,
  "available_slots": 13,
  "next_window_reset_in_seconds": 35,
  "is_rate_limited": false,
  "recent_requests_timeline": [...]
}
```

## Sincronização Automática

Por padrão, a sincronização está configurada para executar **todos os dias às 02:00**.

Para alterar o horário, modifique a linha no arquivo `server.js`:

```javascript
// Executar todos os dias às 02:00
cron.schedule("0 2 * * *", () => {
  // código da sincronização
});
```

### Formatos de Cron

- `0 2 * * *` - Todo dia às 02:00
- `0 */6 * * *` - A cada 6 horas
- `0 8 * * 1` - Toda segunda-feira às 08:00
- `0 0 1 * *` - Todo dia 1º do mês à meia-noite

### ⏱️ **Tempo de Sincronização**

Com rate limiter de 25 req/min:

- **100 produtos**: ~8 minutos
- **500 produtos**: ~40 minutos
- **1000 produtos**: ~80 minutos

_Nota: Cada produto requer 2 requisições (lista + detalhes)_

## Estrutura do Banco de Dados

### Collection: products

```javascript
{
  id: String,           // ID único do Tiny
  nome: String,         // Nome do produto
  codigo: String,       // Código do produto
  preco: Number,        // Preço
  descricao_complementar: String,
  anexos: [{            // URLs dos anexos/imagens
    anexo: String
  }],
  // ... outros campos do Tiny ERP
  sync_date: Date,      // Data da última sincronização
  last_updated: Date    // Data da última atualização
}
```

### Collection: synclogs

```javascript
{
  date: Date,           // Data da sincronização
  products_processed: Number,  // Quantidade de produtos processados
  duration_seconds: Number,    // Duração em segundos
  status: String,       // 'success' ou 'error'
  error_message: String // Mensagem de erro (se houver)
}
```

## Monitoramento e Logs

### Ver status da sincronização

```bash
GET /sync/status
```

### Ver histórico de sincronizações

```bash
GET /sync/logs
```

### Logs no console

O sistema registra logs detalhados no console, incluindo:

- Início e fim de sincronização
- Progresso da sincronização
- Produtos processados
- Erros encontrados

## Tratamento de Erros

O sistema inclui tratamento robusto de erros:

- Rate limiting entre requisições
- Retry automático em caso de falha
- Logs detalhados de erros
- Continuidade da sincronização mesmo com falhas pontuais

## Considerações de Performance

- **Rate Limiting**: Delay de 500ms-1000ms entre requisições para evitar sobrecarga da API do Tiny
- **Paginação**: Busca produtos em páginas para otimizar memória
- **Background Processing**: Sincronização executada em background
- **Indexação**: Campos importantes indexados no MongoDB

## Deploy

### Heroku

1. Instale o Heroku CLI
2. Configure as variáveis de ambiente no Heroku
3. Faça o deploy

```bash
heroku create sua-app
heroku config:set MONGODB_URI=sua_string_conexao
heroku config:set TINY_TOKEN=seu_token
git push heroku main
```

### Outras Plataformas

O projeto é compatível com:

- Vercel
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk

## Segurança

- ✅ Token da API armazenado em variáveis de ambiente
- ✅ Validação de dados de entrada
- ✅ CORS configurado
- ✅ Rate limiting implementado
- ⚠️ Para produção, considere adicionar autenticação JWT

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

MIT License - veja o arquivo LICENSE para detalhes.

## Suporte

Para dúvidas ou problemas:

1. Verifique os logs da aplicação
2. Consulte a documentação da API do Tiny ERP
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ para integração com Tiny ERP**
