# 🚨 Configurar Superadmin - URGENTE

**UID**: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`  
**Email**: `resper@ness.com.br`  
**Status**: Custom claim não configurado ❌

---

## ✅ Método 1: Via Google Cloud Shell (RECOMENDADO)

**Este é o método mais confiável e já tem todas as dependências instaladas.**

### Passo a Passo:

1. **Abrir Google Cloud Shell:**
   - Acesse: https://shell.cloud.google.com
   - Ou: https://console.cloud.google.com/cloudshell

2. **Clonar ou acessar o repositório:**
   ```bash
   cd /home/resper/nProcess/nprocess
   # Ou clonar se necessário:
   # git clone https://github.com/resper1965/nprocess.git
   # cd nprocess
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

---

## ✅ Método 2: Via Admin Control Plane API

**Se você já tem acesso admin, pode usar a API diretamente.**

### Passo a Passo:

1. **Obter token de autenticação:**
   - Faça login na aplicação (mesmo sem ser admin)
   - Abra o Console do navegador (F12)
   - Execute:
   ```javascript
   import { auth } from '@/lib/firebase-config'
   import { getIdToken } from 'firebase/auth'
   
   const user = auth.currentUser
   if (user) {
     const token = await getIdToken(user)
     console.log('Token:', token)
     // Copie o token
   }
   ```

2. **Fazer requisição à API:**
   ```bash
   curl -X POST \
     "https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app/v1/admin/set-super-admin/hp9TADsRoHfJ4GgSIjQejmCDRCt2" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     -H "Content-Type: application/json"
   ```

   **Nota**: Este método requer que você já seja admin, então pode não funcionar se você não tiver acesso.

---

## ✅ Método 3: Via Firebase Console (Manual)

**Se o Cloud Shell não estiver disponível, você pode configurar manualmente.**

### Passo a Passo:

1. **Acessar Firebase Console:**
   - URL: https://console.firebase.google.com/project/nprocess-8e801/authentication/users

2. **Buscar o usuário:**
   - Busque por: `resper@ness.com.br`
   - Ou pelo UID: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`

3. **Configurar Custom Claim:**
   - Clique no usuário
   - Role até a seção "Custom claims"
   - Clique em "Add custom claim" ou "Edit"
   - Adicione:
     - **Key**: `role`
     - **Value**: `super_admin`
   - Clique em "Save"

4. **Atualizar Firestore:**
   - Acesse: https://console.firebase.google.com/project/nprocess-8e801/firestore
   - Navegue até: `users/hp9TADsRoHfJ4GgSIjQejmCDRCt2`
   - Adicione/Edite o campo:
     - **Campo**: `role`
     - **Valor**: `super_admin`
   - Salve

---

## ✅ Método 4: Via Script Local (Se tiver credenciais)

**Se você tem `GOOGLE_APPLICATION_CREDENTIALS` configurado localmente:**

```bash
cd /home/resper/nProcess/nprocess

# Verificar se tem credenciais
echo $GOOGLE_APPLICATION_CREDENTIALS

# Se tiver, executar:
python3 scripts/set-super-admin-prod.py
```

---

## 🔍 Verificar Configuração

Após configurar, verifique:

1. **Firebase Console:**
   - Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/users
   - Clique no usuário `resper@ness.com.br`
   - Verifique se "Custom claims" mostra: `role: "super_admin"`

2. **Firestore:**
   - Acesse: https://console.firebase.google.com/project/nprocess-8e801/firestore
   - Navegue até: `users/hp9TADsRoHfJ4GgSIjQejmCDRCt2`
   - Verifique se o campo `role` existe e tem valor `super_admin`

---

## ⚠️ IMPORTANTE: Após Configurar

**O usuário DEVE fazer logout e login novamente!**

1. **Fazer logout** na aplicação
2. **Limpar cache** do navegador (Ctrl+Shift+Delete)
3. **Fechar todas as abas** da aplicação
4. **Abrir nova aba**
5. **Fazer login novamente**

**Por quê?**
- Custom claims são incluídos no token JWT
- O token só é renovado após logout/login
- Até renovar, o token antigo (sem role) continua sendo usado

---

## 🧪 Testar Após Configurar

1. **Acessar a aplicação:**
   - URL: https://nprocess-8e801-4711d.web.app/login

2. **Fazer login com Google**

3. **Abrir Console do navegador (F12 → Console)**

4. **Verificar logs - você deve ver:**
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

5. **Verificar redirecionamento:**
   - ✅ Deve redirecionar para `/admin/overview`
   - ❌ NÃO deve voltar para `/login` (sem loop)

6. **Verificar interface:**
   - ✅ Sidebar deve mostrar badge "⭐ Super Admin" (roxo)
   - ✅ Página de Settings deve mostrar "Super Admin" e "Full Access"

---

## 🆘 Troubleshooting

### Problema: Script não executa no Cloud Shell

**Solução:**
```bash
# Instalar dependências
pip3 install firebase-admin --user

# Executar novamente
python3 scripts/set-super-admin-prod.py
```

### Problema: "Permission denied" ou "User not found"

**Verificar:**
1. UID está correto: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`
2. Usuário existe no Firebase Auth
3. Credenciais têm permissão para modificar usuários

### Problema: Custom claim não aparece após configurar

**Solução:**
1. Aguardar 1-2 minutos para propagação
2. Fazer logout/login
3. Limpar cache do navegador
4. Verificar novamente no Firebase Console

---

## 📋 Checklist

- [ ] Custom claim `role: 'super_admin'` configurado no Firebase Auth
- [ ] Campo `role: 'super_admin'` no Firestore (`users/hp9TADsRoHfJ4GgSIjQejmCDRCt2`)
- [ ] Logout/login realizado
- [ ] Cache do navegador limpo
- [ ] Login testado
- [ ] Logs mostram `isAdmin: true`
- [ ] Redirecionamento para `/admin/overview` funciona
- [ ] Badge "Super Admin" aparece no sidebar

---

**Última Atualização**: 07 de Janeiro de 2026
