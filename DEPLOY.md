# 🚀 Deployment Guide

Este projeto inclui validação local antes do deploy para evitar erros no Cloud Build.

## 📋 Pré-requisitos

- Node.js 20+ instalado
- Python 3.11+ instalado
- Google Cloud SDK (`gcloud`) configurado
- Acesso ao projeto `nprocess-8e801`

## 🔄 Processo de Deploy

### Opção 1: Script Automatizado (Recomendado)

```bash
# Na raiz do projeto nprocess/
./deploy.sh
```

Ou usando npm:

```bash
npm run deploy
```

**O que o script faz:**
1. ✅ Valida o build do frontend localmente (TypeScript, compilação)
2. ✅ Executa testes Python (opcional, não bloqueia se falhar)
3. ✅ Envia para Cloud Build apenas se tudo passar

### Opção 2: Validação Manual

Se quiser apenas validar sem fazer deploy:

```bash
# Validar frontend
npm run deploy:validate

# Ou manualmente
cd web-portal && npm run build
```

### Opção 3: Deploy Direto (Não Recomendado)

⚠️ **Atenção:** Pode falhar no Cloud Build se houver erros de TypeScript.

```bash
gcloud builds submit --config=cloudbuild.yaml --async
```

## 🐛 Troubleshooting

### Erro: "TypeScript compilation failed"

**Solução:** Corrija os erros de TypeScript antes de fazer deploy:
```bash
cd web-portal
npm run build  # Verá os erros aqui
```

### Erro: "Permission denied" ao executar deploy.sh

**Solução:** Torne o script executável:
```bash
chmod +x deploy.sh
```

### Build local passa mas Cloud Build falha

**Possíveis causas:**
- Diferenças de versão do Node.js
- Variáveis de ambiente não configuradas
- Dependências não commitadas

## 📝 Checklist Antes de Deploy

- [ ] Build local do frontend passa (`npm run build` em `web-portal/`)
- [ ] Sem erros de TypeScript
- [ ] Testes Python passam (opcional)
- [ ] Mudanças commitadas no Git
- [ ] Variáveis de ambiente configuradas no Cloud Build

## 🔍 Monitoramento

Após iniciar o deploy, monitore o progresso:

1. **Console do Google Cloud:**
   ```
   https://console.cloud.google.com/cloud-build/builds
   ```

2. **Via CLI:**
   ```bash
   gcloud builds list --limit=1
   ```

## 📚 Arquivos Relacionados

- `deploy.sh` - Script de deploy com validação
- `cloudbuild.yaml` - Configuração do Cloud Build
- `web-portal/package.json` - Scripts do frontend
