#!/bin/bash
# Script para conectar repositório local ao GitHub

cd /home/resper/nProcess

echo "=== Configurando Git Remote ==="
git remote add origin https://github.com/resper1965/n.process.git 2>/dev/null || echo "Remote já existe ou erro ao adicionar"

echo ""
echo "=== Verificando Remote ==="
git remote -v

echo ""
echo "=== Status do Repositório ==="
git status

echo ""
echo "=== Para fazer o primeiro commit e push: ==="
echo "git add -A"
echo "git commit -m 'Initial commit: n.process'"
echo "git push -u origin main"
