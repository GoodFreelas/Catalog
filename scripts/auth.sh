set -e

echo "🔐 Iniciando autenticação com Tiny ERP..."

# Verificar se backend está rodando
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ Backend não está rodando. Execute: npm run dev"
    exit 1
fi

# Verificar arquivo de configuração
if [ ! -f "backend/.env" ]; then
    echo "❌ Arquivo backend/.env não encontrado"
    exit 1
fi

# Verificar se credenciais estão configuradas
source backend/.env

if [ -z "$TINY_CLIENT_ID" ] || [ -z "$TINY_CLIENT_SECRET" ]; then
    echo "❌ Credenciais do Tiny não configuradas em backend/.env"
    echo "Configure TINY_CLIENT_ID e TINY_CLIENT_SECRET"
    exit 1
fi

echo "✅ Credenciais encontradas"
echo ""
echo "🌐 Abrindo URL de autenticação..."
echo "http://localhost:3001/auth/login"
echo ""
echo "📋 Instruções:"
echo "1. Uma aba do navegador será aberta"
echo "2. Faça login com sua conta do Tiny"
echo "3. Autorize o aplicativo"
echo "4. Aguarde a confirmação"
echo ""

# Abrir URL no navegador
if command -v xdg-open > /dev/null; then
    xdg-open "http://localhost:3001/auth/login"
elif command -v open > /dev/null; then
    open "http://localhost:3001/auth/login"
else
    echo "⚠️ Abra manualmente: http://localhost:3001/auth/login"
fi

# Aguardar confirmação
echo "⏳ Aguardando autenticação..."
for i in {1..60}; do
    if curl -s http://localhost:3001/auth/status | grep -q '"authenticated":true'; then
        echo ""
        echo "🎉 Autenticação realizada com sucesso!"
        echo "✅ Tokens salvos. O catálogo está pronto para uso!"
        exit 0
    fi
    echo -n "."
    sleep 2
done

echo ""
echo "⏰ Timeout na autenticação"
echo "Tente novamente ou verifique se completou o processo no navegador"
exit 1