# Guia de Manutenção do Repositório

Este documento contém instruções para tarefas de manutenção do repositório.

## Remover Branches Antigas

### Branch: `claude/create-compliance-engine-api-WDUVn`

Esta branch foi mergeada na `main` e pode ser removida.

**Remover branch remota**:
```bash
git push origin --delete claude/create-compliance-engine-api-WDUVn
```

**Remover branch local** (se existir):
```bash
git branch -d claude/create-compliance-engine-api-WDUVn
```

## Criar Nova Release

1. Atualize o CHANGELOG.md (se existir)
2. Crie a tag:
   ```bash
   git tag -a v1.1.0 -m "Release v1.1.0 - Descrição das mudanças"
   git push origin v1.1.0
   ```

3. Crie a release no GitHub:
   - Vá para: https://github.com/resper1965/nprocess/releases/new
   - Selecione a tag criada
   - Adicione descrição da release
   - Publique

## Atualizar Documentação

Após mudanças significativas:

1. Atualize `README.md` se necessário
2. Atualize `docs/README.md` (índice)
3. Atualize exemplos em `docs/INTEGRATION.md`
4. Commit e push:
   ```bash
   git add docs/ README.md
   git commit -m "docs: Atualizar documentação"
   git push origin main
   ```

## Limpeza de Branches

Execute periodicamente para manter o repositório limpo:

```bash
# Listar branches remotas
git branch -r

# Remover branches remotas já mergeadas
git remote prune origin

# Remover branches locais que já foram mergeadas
git branch --merged main | grep -v "main\|master" | xargs git branch -d
```

