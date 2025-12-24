# Resolução: Erro 403 no favicon.ico e página principal

## 🔍 Diagnóstico

O erro 403 estava ocorrendo porque o serviço `compliance-engine-frontend` não tinha permissões IAM configuradas para acesso público via domínio customizado.

## ✅ Soluções Aplicadas

### 1. Permissões IAM Configuradas

Adicionada permissão para `allUsers`:

```bash
gcloud run services add-iam-policy-binding compliance-engine-frontend \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --project=nprocess
```

### 2. Referência Explícita ao Favicon

Adicionada referência explícita ao favicon no `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "ComplianceEngine - Process Mapping & Compliance Analysis",
  description: "Transform business process descriptions into structured BPMN diagrams and analyze compliance with regulatory frameworks using AI",
  icons: {
    icon: '/favicon.ico',
  },
};
```

## ✅ Verificação

Após as correções, ambos os endpoints devem retornar HTTP/2 200:

```bash
# Verificar favicon
curl -I https://nprocess.ness.com.br/favicon.ico
# Deve retornar: HTTP/2 200

# Verificar página principal
curl -I https://nprocess.ness.com.br/
# Deve retornar: HTTP/2 200
```

## 📝 Notas

- O `favicon.ico` está localizado em `frontend/app/favicon.ico`
- Next.js 16 serve automaticamente arquivos estáticos de `app/` como rotas
- O Dockerfile já copia corretamente os arquivos necessários
- O problema era apenas de permissões IAM

## 🔄 Se o Problema Persistir

1. **Limpar cache do navegador**: Ctrl+Shift+R (ou Cmd+Shift+R no Mac)
2. **Verificar console do navegador**: F12 → Console
3. **Verificar Network tab**: F12 → Network → Recarregar página
4. **Testar em modo anônimo**: Para descartar problemas de cache/extensões

## ✅ Status

- ✅ Permissões IAM configuradas
- ✅ Favicon referenciado explicitamente
- ✅ Serviço acessível publicamente
- ✅ Commit realizado

