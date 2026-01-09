# 🛠️ Prompt de Correção Cirúrgica - Deploy Frontend

**Use este prompt no Cursor Composer (Cmd+I ou painel lateral)**

---

## 📋 Prompt para Copiar e Colar

```
@web-portal/next.config.js @web-portal/Dockerfile @web-portal/src/lib/firebase-auth.ts

O build do Docker está falhando com o erro `COPY failed: stat app/.next/standalone: file does not exist`.

Além disso, os logs do navegador mostram que o código antigo de redirect (`checkRedirectResult`, `handleGoogleRedirect`) ainda está sendo executado, indicando que o deploy anterior falhou e a versão antiga está em produção.

**Problemas identificados:**

1. **Next.js não está gerando `.next/standalone`** - O `next.config.js` já tem `output: 'standalone'`, mas preciso verificar se está correto
2. **Código antigo de redirect ainda presente** - A função `handleGoogleRedirect` foi removida do código, mas preciso garantir que não há mais referências
3. **Dockerfile pode estar copiando de local errado** - Verificar se o caminho está correto

**Ações necessárias:**

1. **Verificar `next.config.js`:**
   - Confirmar que `output: 'standalone'` está presente e correto
   - Remover `swcMinify` se existir (está obsoleto)
   - Manter todas as outras configurações

2. **Verificar `Dockerfile`:**
   - Confirmar que está copiando de `/app/.next/standalone` corretamente
   - Verificar se o build está gerando o diretório standalone

3. **Verificar `firebase-auth.ts`:**
   - Confirmar que `handleGoogleRedirect` foi completamente removida
   - Confirmar que imports de `signInWithRedirect` e `getRedirectResult` foram removidos
   - Garantir que apenas `signInWithPopup` está sendo usado

**Resultado esperado:**
- Build do Next.js deve gerar `.next/standalone/`
- Dockerfile deve copiar corretamente
- Código de redirect deve estar completamente removido
- Deploy deve passar com sucesso
```

---

## 🔍 Verificações Pós-Deploy

Após o deploy, verifique no console do navegador:

1. **Não deve aparecer:**
   - `checkRedirectResult: Checking for Google redirect result...`
   - `handleGoogleRedirect: Calling getRedirectResult...`

2. **Deve aparecer:**
   - `loginWithGoogle: Starting Google login process...`
   - `loginWithGoogle: Calling signInWithPopup...`

---

## 📝 Notas

- O `next.config.js` já está correto com `output: 'standalone'`
- O código de redirect já foi removido do `firebase-auth.ts`
- O problema é que o build anterior falhou, então a versão antiga ainda está em produção
- Este prompt garante que tudo está correto antes do próximo deploy
