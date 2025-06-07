set -e

echo "🏗️ Gerando build de produção..."

# Verificar dependências
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "❌ Dependências não instaladas. Execute: npm run setup"
    exit 1
fi

# Build do frontend
echo "🎨 Gerando build do frontend..."
cd frontend

# Verificar variáveis de ambiente
if [ ! -f .env ]; then
    echo "⚠️ Arquivo .env não encontrado no frontend"
    echo "Usando variáveis padrão..."
fi

npm run build
echo "✅ Build do frontend concluído"
cd ..

# Preparar backend para produção
echo "🔧 Preparando backend para produção..."
cd backend

# Instalar apenas dependências de produção
npm ci --only=production
echo "✅ Backend preparado"
cd ..

# Criar pacote de deploy
echo "📦 Criando pacote de deploy..."
mkdir -p dist
cp -r backend dist/
cp -r frontend/dist dist/frontend
cp docker-compose.yml dist/
cp README.md dist/

echo "✅ Build concluído em ./dist"
echo ""
echo "📋 Arquivos prontos para deploy:"
echo "- Backend: ./dist/backend"
echo "- Frontend: ./dist/frontend"
echo "- Docker: ./dist/docker-compose.yml"
