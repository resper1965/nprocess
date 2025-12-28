# 🔐 Definir Super Admin em Produção

**UID**: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`  
**Data**: 27 de Dezembro de 2024

---

## 📋 Métodos Disponíveis

### Método 1: Via Google Cloud Shell (Recomendado) ✅

O Cloud Shell já tem todas as dependências instaladas:

```bash
# 1. Abrir Cloud Shell: https://shell.cloud.google.com
# 2. Executar:
cd /home/resper/nProcess/nprocess
bash scripts/set-super-admin-cloudshell.sh
```

**Vantagens:**
- ✅ Todas as dependências já instaladas
- ✅ Acesso direto ao Secret Manager
- ✅ Não requer configuração local

---

### Método 2: Via Admin Control Plane API

Se você já é admin, pode usar a API:

```bash
# Obter token
TOKEN=$(gcloud auth print-access-token)

# Definir super_admin
curl -X POST \
  "https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app/v1/admin/set-super-admin/hp9TADsRoHfJ4GgSIjQejmCDRCt2" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"
```

Ou usar o script:
```bash
bash scripts/set-super-admin-via-api.sh
```

**Requisitos:**
- Você precisa já ser admin para usar este endpoint

---

### Método 3: Via Script Local (Python)

Se você tem `firebase-admin` instalado localmente:

```bash
cd /home/resper/nProcess/nprocess
python3 scripts/set-super-admin-prod.py
```

**Requisitos:**
- `pip install firebase-admin`
- Acesso ao Secret Manager
- Credenciais do GCP configuradas

---

## 🔧 O que o Script Faz

1. **Inicializa Firebase Admin SDK** usando credenciais do Secret Manager
2. **Define Custom Claims**:
   ```json
   {
     "role": "super_admin",
     "admin": true
   }
   ```
3. **Atualiza Firestore** (backup):
   ```json
   {
     "role": "super_admin",
     "updated_at": "timestamp"
   }
   ```
4. **Verifica** se foi aplicado corretamente

---

## ✅ Verificação

Após executar o script, o usuário precisa:

1. **Fazer logout** no Client Portal
2. **Fazer login novamente** para obter novo token com custom claims
3. **Verificar role** na página de Settings

---

## 📝 Notas Importantes

- ⚠️ **Custom claims propagam no próximo login**: O usuário precisa fazer logout/login
- ✅ **Firestore é atualizado imediatamente**: Mas o token JWT só atualiza no próximo login
- 🔐 **Custom claims são incluídos no token JWT**: Não requer leitura no Firestore

---

## 🆘 Troubleshooting

### Erro: "User not found"
- Verifique se o UID está correto
- Verifique se o usuário existe no Firebase Authentication

### Erro: "Firebase Admin SDK not initialized"
- Verifique se as credenciais do Secret Manager estão corretas
- Verifique se o projeto Firebase está correto (`nprocess-8e801`)

### Custom claims não aparecem
- O usuário precisa fazer logout e login novamente
- Aguarde alguns minutos para propagar

---

## 🔗 Links Úteis

- **Cloud Shell**: https://shell.cloud.google.com
- **Firebase Console**: https://console.firebase.google.com/project/nprocess-8e801/authentication
- **Admin API**: https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app/docs

---

**Última Atualização**: 27 de Dezembro de 2024

