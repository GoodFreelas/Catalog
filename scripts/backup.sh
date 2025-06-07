set -e

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

echo "💾 Criando backup..."
mkdir -p "$BACKUP_DIR"

# Backup dos tokens
if [ -f "backend/data/tokens.json" ]; then
    cp backend/data/tokens.json "$BACKUP_DIR/"
    echo "✅ Tokens salvos"
fi

# Backup dos logs
if [ -d "logs" ]; then
    cp -r logs "$BACKUP_DIR/"
    echo "✅ Logs salvos"
fi

# Backup das configurações
cp backend/.env "$BACKUP_DIR/backend.env" 2>/dev/null || true
cp frontend/.env "$BACKUP_DIR/frontend.env" 2>/dev/null || true
echo "✅ Configurações salvas"

# Compactar backup
tar -czf "${BACKUP_DIR}.tar.gz" -C backups "$(basename "$BACKUP_DIR")"
rm -rf "$BACKUP_DIR"

echo "🎉 Backup criado: ${BACKUP_DIR}.tar.gz"