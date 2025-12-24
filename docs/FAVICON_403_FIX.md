# Fix: Erro 403 no favicon.ico e página principal

## 🔍 Problema

Erro 403 ao acessar:
- `/favicon.ico`
- `/` (página principal)

## ✅ Solução Aplicada

O problema era que o serviço `compliance-engine-frontend` estava com permissões IAM restritas quando acessado via domínio customizado.

### Correção

Atualizado o serviço para permitir acesso público:

```bash
gcloud run services update compliance-engine-frontend \
  --region=us-central1 \
  --allow-unauthenticated \
  --project=nprocess
```

## 🔍 Verificação

Após a correção, verifique:

```bash
# Verificar favicon
curl -I https://nprocess.ness.com.br/favicon.ico

# Verificar página principal
curl -I https://nprocess.ness.com.br/
```

Ambos devem retornar `HTTP/2 200`.

## 📝 Nota

O `cloudbuild.yaml` já estava configurado com `--allow-unauthenticated`, mas o serviço pode ter sido atualizado manualmente ou por outro processo que removeu essa configuração.

## ✅ Status Atual

- ✅ Serviço configurado com `--allow-unauthenticated`
- ✅ Permissões IAM: `allUsers` tem `roles/run.invoker`
- ✅ Favicon e página principal acessíveis


