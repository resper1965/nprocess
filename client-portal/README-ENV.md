# 🔧 Variáveis de Ambiente - Client Portal

## 📋 Arquivos de Configuração

### `.env.example`
Arquivo de exemplo com todas as variáveis necessárias. Copie para `.env.local` para desenvolvimento local.

### `.env.production`
Arquivo usado durante o build de produção. **NÃO deve ser commitado** (já está no `.gitignore`).

## 🔥 Variáveis do Firebase (Obrigatórias)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBmA2rJyawq83redy2d2BGjlgTog1_NXmM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nprocess-8e801.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nprocess-8e801
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nprocess-8e801.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=43006907338
NEXT_PUBLIC_FIREBASE_APP_ID=1:43006907338:web:f8666ae921f4a584fff533
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-34RLW0TPXS
```

## 🌐 URLs das APIs

```bash
NEXT_PUBLIC_API_URL=https://nprocess-api-prod-fur76izi3a-uc.a.run.app
NEXT_PUBLIC_ADMIN_API_URL=https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app
NEXT_PUBLIC_RAG_API_URL=
```

## ☁️ GCP Configuration

```bash
NEXT_PUBLIC_GCP_PROJECT_ID=nprocess-prod
```

## 📱 FCM (Opcional)

```bash
NEXT_PUBLIC_FCM_VAPID_KEY=
```

## ⚠️ Nota Importante

O `next.config.js` já contém valores padrão para todas essas variáveis. Se as variáveis de ambiente não estiverem definidas, os valores padrão serão usados.

**Para desenvolvimento local:**
1. Copie `.env.example` para `.env.local`
2. Ajuste os valores se necessário
3. Execute `npm run dev`

**Para produção:**
- O script `fase3-deploy-client-portal.sh` cria automaticamente o `.env.production` durante o deploy
- Ou você pode criar manualmente antes do build

## 🔍 Verificação

Para verificar se todas as variáveis estão configuradas:

```bash
npm run build
```

Se houver avisos sobre variáveis faltando, elas serão usadas dos valores padrão no `next.config.js`.

