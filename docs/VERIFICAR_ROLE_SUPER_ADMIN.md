# 🔍 Como Verificar Se Você É Super Admin

**UID do Super Admin**: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`  
**Data**: 06 de Janeiro de 2026

---

## ✅ Verificação Visual na Interface

### 1. No Sidebar (Barra Lateral)

Quando você está logado, você verá seu role exibido abaixo do seu email no sidebar:

- **⭐ Super Admin** - Badge roxo com estrela (se você é super_admin)
- **👑 Admin** - Badge azul (se você é admin)
- **👤 User** - Badge cinza (se você é user)

### 2. Na Página de Settings

1. Acesse: `/dashboard/settings`
2. Na seção "Profile", você verá:
   - **Role**: Mostra seu role atual
   - **Admin Access**: Badge verde (se você é admin ou super_admin)
   - **Full Access**: Badge roxo (se você é super_admin)
3. Clique em "Debug Info" para ver detalhes técnicos

---

## 🔍 Verificação no Console do Navegador

### Método 1: Via Console Logs

1. Abra o console do navegador (F12 → Console)
2. Faça login na aplicação
3. Procure por logs que começam com:
   ```
   onAuthStateChanged: User role determined
   ```
4. Se você for super_admin, verá:
   ```
   ⭐ SUPER ADMIN DETECTED! { uid: "...", email: "...", role: "super_admin", ... }
   ```

### Método 2: Verificar Token Manualmente

1. Abra o console do navegador (F12 → Console)
2. Execute:
   ```javascript
   import { auth } from '@/lib/firebase-config'
   import { getIdTokenResult } from 'firebase/auth'
   
   const user = auth.currentUser
   if (user) {
     const tokenResult = await getIdTokenResult(user)
     console.log('Role from token:', tokenResult.claims.role)
     console.log('All claims:', tokenResult.claims)
   }
   ```

### Método 3: Verificar Auth Context

1. Abra o console do navegador (F12 → Console)
2. Execute:
   ```javascript
   // No React DevTools, você pode inspecionar o AuthContext
   // Ou adicione temporariamente no código:
   const { role, isAdmin, user } = useAuth()
   console.log('Current role:', role)
   console.log('Is admin:', isAdmin)
   console.log('User:', user)
   ```

---

## 🔐 Verificar no Firebase Console

### 1. Verificar Custom Claims

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/users
2. Procure pelo usuário com UID: `hp9TADsRoHfJ4GgSIjQejmCDRCt2`
3. Clique no usuário
4. Role até "Custom claims"
5. Você deve ver:
   ```json
   {
     "role": "super_admin"
   }
   ```

### 2. Verificar Firestore

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/firestore
2. Navegue para: `users/hp9TADsRoHfJ4GgSIjQejmCDRCt2`
3. Verifique o campo `role`:
   - Deve ser: `super_admin`

---

## ⚠️ Problemas Comuns

### Role não aparece como super_admin

**Causa**: Custom claims não foram propagados para o token JWT.

**Solução**:
1. Faça **logout** da aplicação
2. Faça **login** novamente
3. O novo token JWT conterá o custom claim `role: 'super_admin'`

### Role aparece como "user" mesmo após logout/login

**Causa**: Custom claims não foram definidos corretamente.

**Solução**:
1. Verifique no Firebase Console se o custom claim está definido
2. Se não estiver, defina usando um dos métodos em `DEFINIR_SUPER_ADMIN_PRODUCAO.md`
3. Após definir, faça logout/login novamente

### Não consigo acessar o Admin Console

**Causa**: O role não está sendo detectado corretamente.

**Verificação**:
1. Verifique se o role é `admin` ou `super_admin`
2. Verifique os logs no console do navegador
3. Verifique se o token contém o custom claim `role`

---

## 📋 Checklist de Verificação

- [ ] Role aparece como "⭐ Super Admin" no sidebar
- [ ] Role aparece como "Super Admin" na página de Settings
- [ ] Badge "Full Access" aparece na página de Settings
- [ ] Console mostra "⭐ SUPER ADMIN DETECTED!"
- [ ] Firebase Console mostra custom claim `role: "super_admin"`
- [ ] Firestore mostra `role: "super_admin"` no documento do usuário
- [ ] Consigo acessar `/admin/overview`
- [ ] Menu Admin aparece no sidebar (se aplicável)

---

## 🔗 Links Úteis

- **Firebase Auth Users**: https://console.firebase.google.com/project/nprocess-8e801/authentication/users
- **Firestore Users**: https://console.firebase.google.com/project/nprocess-8e801/firestore/data/~2Fusers
- **Definir Super Admin**: `docs/DEFINIR_SUPER_ADMIN_PRODUCAO.md`
- **Settings Page**: `/dashboard/settings`

---

**Última Atualização**: 06 de Janeiro de 2026
