# 🚀 Configurar Superadmin - Método Simples

**UID**: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`  
**Email**: `resper@ness.com.br`

---

## ✅ ÚNICO MÉTODO QUE FUNCIONA: Google Cloud Shell

**Este método funciona sempre e não depende de interfaces do Firebase Console.**

---

## 📋 Passo a Passo Completo

### 1. Abrir Google Cloud Shell

- **URL**: https://shell.cloud.google.com
- Ou: https://console.cloud.google.com/cloudshell
- Clique em "Open Cloud Shell" ou "Abrir Cloud Shell"

---

### 2. Clonar o Repositório (se necessário)

```bash
# Se já estiver no diretório correto, pule este passo
cd /home/resper/nProcess/nprocess

# OU se precisar clonar:
git clone https://github.com/resper1965/nprocess.git
cd nprocess
```

---

### 3. Executar o Script

```bash
python3 scripts/set-super-admin-prod.py
```

**O que o script faz:**
- ✅ Define custom claim `role: 'super_admin'` no Firebase Auth
- ✅ Atualiza o Firestore (se existir)
- ✅ Verifica se foi aplicado corretamente

**Resultado esperado:**
```
✅ Custom claims definidos para usuário: hp9TADsRoHfJ4GgSIjQejmCDRCt2
   Role: super_admin
   Admin: True
✅ Role atualizado no Firestore
✅ Usuário definido como super_admin com sucesso!
```

---

### 4. Se o Script Der Erro de Dependências

Se aparecer erro `ModuleNotFoundError: No module named 'firebase_admin'`:

```bash
# Instalar dependência
pip3 install firebase-admin --user

# Executar novamente
python3 scripts/set-super-admin-prod.py
```

---

### 5. Se o Script Não Funcionar - Script Alternativo

Se o script principal não funcionar, use este script inline:

```bash
# Copie e cole tudo isso no Cloud Shell:
cat > /tmp/set_super_admin_simple.py << 'EOF'
#!/usr/bin/env python3
import firebase_admin
from firebase_admin import auth, credentials, firestore
import json
from google.cloud import secretmanager

# Configurações
PROJECT_ID = "nprocess-prod"
SECRET_ID = "nprocess-firebase-admin-sdk"
FIREBASE_PROJECT = "nprocess-8e801"
UID = "hp9TADsRoHfJ4GgSIjQejmCDRCt2"

try:
    # Obter credenciais do Secret Manager
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{PROJECT_ID}/secrets/{SECRET_ID}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    service_account_info = json.loads(response.payload.data.decode("UTF-8"))
    
    # Inicializar Firebase
    cred = credentials.Certificate(service_account_info)
    firebase_admin.initialize_app(cred, {'projectId': FIREBASE_PROJECT})
    print("✅ Firebase inicializado")
    
    # Definir custom claim
    auth.set_custom_user_claims(UID, {'role': 'super_admin', 'admin': True})
    print(f"✅ Custom claim definido para {UID}")
    
    # Tentar atualizar Firestore (pode falhar se não existir, mas não é crítico)
    try:
        db = firestore.client()
        db.collection('users').document(UID).set({
            'role': 'super_admin',
            'updated_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
        print("✅ Firestore atualizado")
    except Exception as e:
        print(f"⚠️  Firestore não atualizado (não crítico): {e}")
    
    # Verificar
    user = auth.get_user(UID)
    print(f"\n📋 Verificação:")
    print(f"   Email: {user.email}")
    print(f"   Custom Claims: {user.custom_claims}")
    print(f"\n✅ SUCESSO! Usuário configurado como super_admin")
    print(f"\n⚠️  IMPORTANTE: Faça logout e login novamente na aplicação!")
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
EOF

# Executar
python3 /tmp/set_super_admin_simple.py
```

---

## ⚠️ IMPORTANTE: Após Configurar

**O usuário DEVE fazer logout e login novamente!**

1. **Acessar a aplicação:**
   - URL: https://nprocess-8e801-4711d.web.app/login

2. **Fazer logout** (se já estiver logado)

3. **Limpar cache do navegador:**
   - Ctrl+Shift+Delete (Windows/Linux)
   - Cmd+Shift+Delete (Mac)
   - Marque "Cookies" e "Cached images and files"
   - Clique em "Clear data"

4. **Fechar todas as abas** da aplicação

5. **Abrir nova aba**

6. **Fazer login novamente** com Google

---

## 🧪 Testar se Funcionou

Após fazer logout/login:

1. **Abrir Console do navegador (F12 → Console)**

2. **Verificar logs - você deve ver:**
   ```
   checkRedirectResult: Token claims {
     uid: "hp9TADsRoHfJ4GgSIjQejmCDRCt2",
     email: "resper@ness.com.br",
     customClaims: { role: "super_admin" },
     roleFromClaim: "super_admin"
   }
   
   checkRedirectResult: Using role from custom claim: super_admin
   
   checkRedirectResult: Final role determined {
     finalRole: "super_admin",
     isAdmin: true
   }
   
   ⭐ SUPER ADMIN DETECTED!
   ```

3. **Verificar redirecionamento:**
   - ✅ Deve redirecionar para `/admin/overview`
   - ❌ NÃO deve voltar para `/login` (sem loop)

4. **Verificar interface:**
   - ✅ Sidebar deve mostrar badge "⭐ Super Admin" (roxo)
   - ✅ Página de Settings deve mostrar "Super Admin" e "Full Access"

---

## 🆘 Troubleshooting

### Problema: "Permission denied" no Secret Manager

**Solução:**
- Verificar se você tem acesso ao projeto `nprocess-prod`
- Verificar se o secret `nprocess-firebase-admin-sdk` existe

### Problema: "User not found"

**Solução:**
- Verificar se o UID está correto: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`
- Verificar se o usuário existe no Firebase Auth
- Fazer login pelo menos uma vez na aplicação

### Problema: Custom claim não aparece após logout/login

**Solução:**
1. Aguardar 1-2 minutos para propagação
2. Limpar cache novamente
3. Fechar todas as abas
4. Abrir em modo anônimo e testar
5. Verificar logs do console

---

## 📋 Checklist Final

- [ ] Script executado no Cloud Shell
- [ ] Mensagem de sucesso apareceu
- [ ] Logout/login realizado
- [ ] Cache limpo
- [ ] Login testado
- [ ] Logs mostram `isAdmin: true`
- [ ] Redirecionamento para `/admin/overview` funciona
- [ ] Badge "Super Admin" aparece no sidebar

---

**Última Atualização**: 07 de Janeiro de 2026
