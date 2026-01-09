# 🔧 Configurar Superadmin - Métodos Alternativos

**UID**: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`  
**Email**: `resper@ness.com.br`  
**Problema**: Firebase Console não mostra opções de Custom Claims

---

## ✅ Método 1: Google Cloud Shell (RECOMENDADO - ÚNICO CONFIÁVEL)

**Este é o método mais confiável e funciona sempre.**

### Passo a Passo:

1. **Abrir Google Cloud Shell:**
   - Acesse: https://shell.cloud.google.com
   - Ou: https://console.cloud.google.com/cloudshell

2. **Clonar o repositório (se necessário):**
   ```bash
   git clone https://github.com/resper1965/nprocess.git
   cd nprocess
   ```

3. **Executar o script:**
   ```bash
   python3 scripts/set-super-admin-prod.py
   ```

4. **Verificar resultado:**
   O script deve mostrar:
   ```
   ✅ Custom claims definidos para usuário: hp9TADsRoHfJ4GgSIjQejmCDRCt2
   ✅ Role atualizado no Firestore
   ✅ Usuário definido como super_admin com sucesso!
   ```

**Por que este método funciona:**
- Cloud Shell já tem todas as dependências instaladas
- Tem acesso direto ao Secret Manager
- Usa Firebase Admin SDK diretamente
- Não depende da interface do Firebase Console

---

## ✅ Método 2: Via Admin Control Plane API (Se você já é admin)

**Se você já tem acesso admin, pode usar a API diretamente.**

### Passo a Passo:

1. **Obter token de autenticação:**
   - Faça login na aplicação: https://nprocess-8e801-4711d.web.app/login
   - Abra o Console do navegador (F12)
   - Execute no console:
   ```javascript
   // Copie e cole no console do navegador
   import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js').then(firebase => {
     // Se já estiver logado, pegue o token
     firebase.auth().currentUser?.getIdToken().then(token => {
       console.log('Token:', token);
       // Copie o token que aparecer
     });
   });
   ```

   **OU** use o método mais simples:
   ```javascript
   // No console do navegador, após fazer login:
   const user = firebase.auth().currentUser;
   if (user) {
     user.getIdToken().then(token => {
       console.log('Token:', token);
       navigator.clipboard.writeText(token).then(() => {
         console.log('Token copiado para área de transferência!');
       });
     });
   }
   ```

2. **Fazer requisição à API:**
   ```bash
   # Substitua SEU_TOKEN_AQUI pelo token copiado
   curl -X POST \
     "https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app/v1/admin/set-super-admin/hp9TADsRoHfJ4GgSIjQejmCDRCt2" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json"
   ```

   **Nota**: Este método requer que você já seja admin. Se não for, use o Método 1.

---

## ✅ Método 3: Via gcloud CLI (Se tiver acesso)

**Se você tem `gcloud` configurado localmente:**

```bash
# 1. Autenticar
gcloud auth login

# 2. Executar script Python usando credenciais do gcloud
export GOOGLE_APPLICATION_CREDENTIALS=$(gcloud auth application-default print-access-token)
cd /home/resper/nProcess/nprocess
python3 scripts/set-super-admin-prod.py
```

---

## ✅ Método 4: Criar Script Simples no Cloud Shell

**Se o script não funcionar, crie um script simples:**

1. **Abrir Cloud Shell:**
   - https://shell.cloud.google.com

2. **Criar script:**
   ```bash
   cat > /tmp/set_super_admin.py << 'EOF'
   import firebase_admin
   from firebase_admin import auth, credentials, firestore
   import json
   from google.cloud import secretmanager
   
   # Inicializar Firebase
   project_id = "nprocess-prod"
   secret_id = "nprocess-firebase-admin-sdk"
   
   client = secretmanager.SecretManagerServiceClient()
   name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
   response = client.access_secret_version(request={"name": name})
   service_account_info = json.loads(response.payload.data.decode("UTF-8"))
   
   cred = credentials.Certificate(service_account_info)
   firebase_admin.initialize_app(cred, {'projectId': 'nprocess-8e801'})
   
   # Definir custom claim
   uid = "hp9TADsRoHfJ4GgSIjQejmCDRCt2"
   auth.set_custom_user_claims(uid, {'role': 'super_admin', 'admin': True})
   print(f"✅ Custom claim definido para {uid}")
   
   # Atualizar Firestore
   db = firestore.client()
   db.collection('users').document(uid).set({
       'role': 'super_admin',
       'updated_at': firestore.SERVER_TIMESTAMP
   }, merge=True)
   print(f"✅ Firestore atualizado")
   
   # Verificar
   user = auth.get_user(uid)
   print(f"✅ Usuário: {user.email}")
   print(f"✅ Custom claims: {user.custom_claims}")
   EOF
   
   # Executar
   python3 /tmp/set_super_admin.py
   ```

---

## 🔍 Verificar se Funcionou

Após executar qualquer método:

1. **Verificar no código (via API):**
   ```bash
   # No Cloud Shell ou localmente
   python3 -c "
   import firebase_admin
   from firebase_admin import auth, credentials
   from google.cloud import secretmanager
   import json
   
   client = secretmanager.SecretManagerServiceClient()
   name = 'projects/nprocess-prod/secrets/nprocess-firebase-admin-sdk/versions/latest'
   response = client.access_secret_version(request={'name': name})
   service_account_info = json.loads(response.payload.data.decode('UTF-8'))
   
   cred = credentials.Certificate(service_account_info)
   firebase_admin.initialize_app(cred, {'projectId': 'nprocess-8e801'})
   
   user = auth.get_user('hp9TADsRoHfJ4GgSIjQejmCDRCt2')
   print('Custom claims:', user.custom_claims)
   "
   ```

2. **Testar na aplicação:**
   - Fazer logout/login
   - Verificar logs no console do navegador
   - Deve mostrar `role: "super_admin"` nos logs

---

## ⚠️ IMPORTANTE: Após Configurar

**O usuário DEVE fazer logout e login novamente!**

1. **Fazer logout** na aplicação
2. **Limpar cache** do navegador (Ctrl+Shift+Delete)
3. **Fechar todas as abas** da aplicação
4. **Abrir nova aba**
5. **Fazer login novamente**

---

## 🆘 Troubleshooting

### Problema: "ModuleNotFoundError: No module named 'firebase_admin'"

**Solução no Cloud Shell:**
```bash
pip3 install firebase-admin --user
python3 scripts/set-super-admin-prod.py
```

### Problema: "Permission denied" ou "User not found"

**Verificar:**
1. UID está correto: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`
2. Usuário existe no Firebase Auth
3. Credenciais têm permissão para modificar usuários

### Problema: Script não encontra Secret Manager

**Solução:**
- Verificar se o projeto está correto: `nprocess-prod`
- Verificar se o secret existe: `nprocess-firebase-admin-sdk`
- Usar método alternativo (Método 4)

---

## 📋 Checklist

- [ ] Custom claim `role: 'super_admin'` configurado
- [ ] Logout/login realizado
- [ ] Cache do navegador limpo
- [ ] Login testado
- [ ] Logs mostram `isAdmin: true`
- [ ] Redirecionamento para `/admin/overview` funciona
- [ ] Badge "Super Admin" aparece no sidebar

---

**Última Atualização**: 07 de Janeiro de 2026
