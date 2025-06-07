set -e

echo "🚀 Iniciando ambiente de desenvolvimento..."

# Verificar se as dependências foram instaladas
if [ ! -d "backend/node_modules" ]; then
    echo "❌ Dependências do backend não instaladas. Execute: npm run setup"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Dependências do frontend não instaladas. Execute: npm run setup"
    exit 1
fi

# Função para cleanup
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar backend
echo "🔧 Iniciando backend na porta 3001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
sleep 3

# Verificar se backend está funcionando
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ Backend falhou ao iniciar"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Backend funcionando"

# Iniciar frontend
echo "🎨 Iniciando frontend na porta 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Ambiente iniciado com sucesso!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo "❤️ Health:   http://localhost:3001/health"
echo ""
echo "Pressione Ctrl+C para parar"

# Aguardar pelos processos
wait $BACKEND_PID $FRONTEND_PID