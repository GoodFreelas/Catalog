set -e

echo "🚀 Configurando Catálogo Tiny..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p backend/data
mkdir -p frontend/public/assets
mkdir -p logs

# Configurar backend
echo "⚙️ Configurando backend..."
cd backend

if [ ! -f package.json ]; then
    echo "❌ package.json não encontrado no backend"
    exit 1
fi

npm install
echo "✅ Dependências do backend instaladas"

# Copiar arquivo de ambiente se não existir
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Arquivo .env criado. Configure suas credenciais!"
fi

cd ..

# Configurar frontend
echo "⚙️ Configurando frontend..."
cd frontend

if [ ! -f package.json ]; then
    echo "❌ package.json não encontrado no frontend"
    exit 1
fi

npm install
echo "✅ Dependências do frontend instaladas"

# Copiar arquivo de ambiente se não existir
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Arquivo .env criado no frontend. Configure suas variáveis!"
fi

cd ..

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as credenciais em backend/.env"
echo "2. Configure as variáveis em frontend/.env"
echo "3. Execute: npm run auth (para autenticar no Tiny)"
echo "4. Execute: npm run dev (para iniciar ambos os serviços)"
echo ""