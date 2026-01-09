# 🚀 Guia Rápido - Próximos Passos

**Data**: 07 de Janeiro de 2026  
**Status**: Pós-merge PR #53 ✅

---

## ✅ O Que Já Foi Feito

1. ✅ Merge do PR #53 concluído
2. ✅ Build do web-portal verificado (passou)
3. ✅ Repositório limpo e atualizado
4. ✅ Código corrigido (diferenciação entre `undefined` e `'user'`)

---

## 🎯 Próximos Passos (Ordem de Execução)

### 1️⃣ Fazer Deploy da Aplicação

**Objetivo**: Colocar as correções em produção.

```bash
cd /home/resper/nProcess/nprocess
firebase deploy --only hosting
```

**O que isso faz:**
- Faz deploy do web-portal com as correções do PR #53
- Atualiza a aplicação em produção
- As melhorias de logs e detecção de role estarão ativas

---

### 2️⃣ Verificar Configuração do Superadmin

**Opção A: Via Firebase Console (Recomendado)**

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/users
2. Busque pelo email: `resper@ness.com.br`
3. Clique no usuário
4. Verifique se há "Custom claims":
   - Deve mostrar: `role: "super_admin"`
   - Se não aparecer, precisa configurar

**Opção B: Via Google Cloud Shell (Para Configurar)**

Se o custom claim não estiver configurado:

```bash
# 1. Abrir Cloud Shell
# https://shell.cloud.google.com

# 2. Clonar ou acessar o repositório
cd /home/resper/nProcess/nprocess

# 3. Executar script (já tem o UID correto: hp9TADsRoHfJ4GgSIjQejmCDRCt2)
python3 scripts/set-super-admin-prod.py
```

**Opção C: Via Firebase Console Manual**

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/users
2. Clique no usuário `resper@ness.com.br`
3. Role até "Custom claims"
4. Clique em "Add custom claim"
5. Key: `role`
6. Value: `super_admin`
7. Clique em "Save"

---

### 3️⃣ Fazer Logout e Login

**CRÍTICO**: Após configurar o superadmin, você DEVE:

1. **Fazer logout** na aplicação
2. **Limpar cache do navegador** (Ctrl+Shift+Delete)
3. **Fechar todas as abas** da aplicação
4. **Abrir nova aba**
5. **Fazer login novamente**

**Por quê?**
- Custom claims são incluídos no token JWT
- O token só é renovado após logout/login
- Até renovar, o token antigo (sem role) continua sendo usado

---

### 4️⃣ Testar a Aplicação

**1. Acessar a aplicação:**
- URL: https://nprocess-8e801-4711d.web.app/login
- Ou: https://nprocess.ness.com.br/login (se custom domain configurado)

**2. Fazer login com Google**

**3. Abrir Console do Navegador (F12 → Console)**

**4. Verificar logs - você deve ver:**

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

**5. Verificar redirecionamento:**
- ✅ Deve redirecionar para `/admin/overview`
- ❌ NÃO deve voltar para `/login` (sem loop)

**6. Verificar interface:**
- ✅ Sidebar deve mostrar badge "⭐ Super Admin" (roxo)
- ✅ Página de Settings deve mostrar "Super Admin" e "Full Access"

---

### 5️⃣ Verificar Custom Domain (Se Aplicável)

**Se você usa `nprocess.ness.com.br`:**

1. **Verificar OAuth no Google Cloud:**
   - URL: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
   - Verificar se `https://nprocess.ness.com.br` está em "Authorized JavaScript origins"
   - Verificar se `https://nprocess.ness.com.br/__/auth/handler` está em "Authorized redirect URIs"

2. **Verificar Firebase Auth:**
   - URL: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
   - Verificar se `nprocess.ness.com.br` está em "Authorized domains"

3. **Testar login no custom domain:**
   - Acessar: https://nprocess.ness.com.br/login
   - Fazer login e verificar se funciona

---

## 🐛 Troubleshooting Rápido

### Problema: Loop continua após deploy

**Solução:**
1. Hard Refresh: Ctrl+Shift+R
2. Limpar cache: Ctrl+Shift+Delete
3. Modo Anônimo: Testar em aba anônima
4. Verificar logs do console para identificar problema específico

### Problema: Role não aparece como super_admin

**Solução:**
1. Verificar custom claim no Firebase Console
2. Se não estiver configurado, configurar (Passo 2)
3. Fazer logout/login (Passo 3)
4. Aguardar até 5 minutos para propagação

### Problema: Logs mostram `isAdmin: false`

**Possíveis Causas:**
1. Custom claim não configurado
2. Token não renovado (precisa logout/login)
3. UID incorreto

**Solução:**
1. Verificar custom claim no Firebase Console
2. Fazer logout/login
3. Verificar logs novamente

---

## 📊 Checklist Final

Após completar todos os passos:

- [ ] Deploy concluído com sucesso
- [ ] Custom claim `role: 'super_admin'` configurado
- [ ] Logout/login realizado
- [ ] Login funciona corretamente
- [ ] Logs mostram `isAdmin: true`
- [ ] Redirecionamento para `/admin/overview` funciona
- [ ] Não há loop de autenticação
- [ ] Badge "Super Admin" aparece no sidebar
- [ ] Custom domain funciona (se aplicável)

---

## 📚 Documentação Relacionada

- `docs/troubleshooting/SUPERADMIN_AUTH_LOOP.md` - Guia completo de troubleshooting
- `docs/VERIFICAR_ROLE_SUPER_ADMIN.md` - Como verificar role
- `docs/DEFINIR_SUPER_ADMIN_PRODUCAO.md` - Como configurar superadmin
- `docs/VERIFICAR_CUSTOM_DOMAIN_OAUTH.md` - Verificar custom domain
- `docs/PROXIMOS_PASSOS_POS_MERGE.md` - Guia detalhado completo

---

**Última Atualização**: 07 de Janeiro de 2026
