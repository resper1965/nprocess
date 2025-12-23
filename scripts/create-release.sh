#!/bin/bash
# Script para criar release no GitHub
# Uso: ./scripts/create-release.sh v1.0.0

set -e

VERSION=${1:-v1.0.0}
REPO="resper1965/nprocess"
RELEASE_NOTES_FILE=".github/RELEASE_NOTES_v1.0.0.md"

echo "🚀 Criando release $VERSION para $REPO"

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado."
    echo "📦 Instale: https://cli.github.com/"
    echo ""
    echo "💡 Alternativa: Crie a release manualmente em:"
    echo "   https://github.com/$REPO/releases/new"
    echo "   Tag: $VERSION"
    echo "   Título: Release $VERSION"
    echo "   Descrição: Veja .github/RELEASE_NOTES_v1.0.0.md"
    exit 1
fi

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo "❌ Não autenticado no GitHub CLI"
    echo "🔐 Execute: gh auth login"
    exit 1
fi

# Ler release notes
if [ -f "$RELEASE_NOTES_FILE" ]; then
    RELEASE_BODY=$(cat "$RELEASE_NOTES_FILE")
else
    RELEASE_BODY="Release $VERSION - ComplianceEngine API"
fi

# Criar release
echo "📝 Criando release..."
gh release create "$VERSION" \
    --title "Release $VERSION - ComplianceEngine API" \
    --notes "$RELEASE_BODY" \
    --repo "$REPO"

echo "✅ Release $VERSION criada com sucesso!"
echo "🔗 Veja em: https://github.com/$REPO/releases/tag/$VERSION"

