---
description: Como iniciar uma nova sessão de desenvolvimento no n.process
---

# Boot Session - n.process

## Passo 1: Carregar Contexto

Leia os arquivos de contexto na seguinte ordem:

1. `.agent/context.md` - Estado atual do projeto e convenções
2. `docs/essential/BOOT_PROMPT.md` - Prompt de inicialização completo

## Passo 2: Verificar Estado do Código

```bash
cd /home/resper/nProcess
git status
git log -n 3 --oneline
```

## Passo 3: Verificar Serviços

```bash
# Backend
cd /home/resper/nProcess/backend
uv run python -c "from app.main import app; print('✅ Backend OK')"

# Frontend
cd /home/resper/nProcess/frontend
npm run build 2>&1 | tail -5
```

## Passo 4: Perguntar ao Usuário

"O que você gostaria de desenvolver hoje?"

Opções típicas:

- Continuar implementação dos 4 Motores
- Adicionar nova feature
- Corrigir bug
- Deploy para Cloud Run
