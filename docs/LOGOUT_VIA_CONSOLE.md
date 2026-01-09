# 🚪 Fazer Logout Via Console do Navegador

**Problema**: Botão de logout não está visível na interface

**Solução**: Fazer logout diretamente via console do navegador

---

## ✅ Método 1: Via Console do Navegador (Mais Rápido)

1. **Abrir Console do Navegador:**
   - Pressione `F12` ou `Ctrl+Shift+I` (Windows/Linux)
   - Ou `Cmd+Option+I` (Mac)
   - Vá para a aba "Console"

2. **Copiar e colar este código:**
   ```javascript
   // Forçar logout
   import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js').then(({ getAuth, signOut }) => {
     const auth = getAuth();
     signOut(auth).then(() => {
       console.log('✅ Logout realizado com sucesso!');
       // Limpar localStorage
       localStorage.clear();
       sessionStorage.clear();
       // Redirecionar para login
       window.location.href = '/login';
     }).catch((error) => {
       console.error('❌ Erro ao fazer logout:', error);
     });
   });
   ```

**OU** use este método mais simples (se já estiver usando Firebase):

```javascript
// Método simples - copie e cole no console
(async () => {
  try {
    // Limpar localStorage e sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Se estiver usando Firebase Auth
    if (window.firebase && window.firebase.auth) {
      await window.firebase.auth().signOut();
    }
    
    console.log('✅ Logout realizado! Redirecionando...');
    
    // Redirecionar para login
    window.location.href = '/login';
  } catch (error) {
    console.error('❌ Erro:', error);
    // Mesmo com erro, limpar storage e redirecionar
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  }
})();
```

---

## ✅ Método 2: Limpar Storage Manualmente

Se o método acima não funcionar:

1. **Abrir Console (F12)**

2. **Executar:**
   ```javascript
   // Limpar tudo
   localStorage.clear();
   sessionStorage.clear();
   
   // Limpar cookies relacionados ao Firebase
   document.cookie.split(";").forEach(function(c) { 
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
   });
   
   console.log('✅ Storage limpo! Redirecionando...');
   window.location.href = '/login';
   ```

---

## ✅ Método 3: Via Application Tab (DevTools)

1. **Abrir DevTools (F12)**

2. **Ir para aba "Application" (ou "Aplicação")**

3. **No menu lateral, expandir "Storage":**
   - Clique em "Local Storage"
   - Clique com botão direito → "Clear" (ou "Limpar")
   - Clique em "Session Storage"
   - Clique com botão direito → "Clear" (ou "Limpar")
   - Clique em "Cookies"
   - Selecione o domínio da aplicação
   - Clique com botão direito → "Clear" (ou "Limpar")

4. **Recarregar a página:**
   - Pressione `Ctrl+Shift+R` (Windows/Linux)
   - Ou `Cmd+Shift+R` (Mac)
   - Ou feche todas as abas e abra nova

---

## ✅ Método 4: Limpar Cache e Cookies (Navegador)

1. **Pressionar:**
   - `Ctrl+Shift+Delete` (Windows/Linux)
   - `Cmd+Shift+Delete` (Mac)

2. **Selecionar:**
   - ✅ Cookies e outros dados do site
   - ✅ Imagens e arquivos em cache
   - Período: "Última hora" ou "Todo o período"

3. **Clicar em "Limpar dados"**

4. **Fechar todas as abas da aplicação**

5. **Abrir nova aba e acessar:**
   - https://nprocess-8e801-4711d.web.app/login

---

## 🧪 Verificar se Logout Funcionou

Após fazer logout, verifique:

1. **Acessar a aplicação:**
   - https://nprocess-8e801-4711d.web.app/login

2. **Verificar se está na página de login** (não deve estar logado)

3. **Fazer login novamente**

4. **Abrir Console (F12) e verificar logs:**
   ```
   checkRedirectResult: Token claims {
     customClaims: { role: "super_admin", admin: true },
     roleFromClaim: "super_admin"
   }
   
   ⭐ SUPER ADMIN DETECTED!
   ```

---

## 🔍 Verificar se Botão de Logout Existe

Se quiser verificar se o botão está no código:

1. **Abrir DevTools (F12)**

2. **Ir para aba "Elements" (ou "Elementos")**

3. **Procurar por:**
   - Texto: "Sair" ou "Sign Out" ou "Logout"
   - Ou ícone de logout (seta para fora)

4. **Se encontrar, clicar nele**

5. **Se não encontrar, usar um dos métodos acima**

---

## 📋 Checklist de Logout

- [ ] Logout realizado (via console ou botão)
- [ ] localStorage limpo
- [ ] sessionStorage limpo
- [ ] Cookies limpos (opcional, mas recomendado)
- [ ] Todas as abas fechadas
- [ ] Nova aba aberta
- [ ] Acessar aplicação novamente
- [ ] Fazer login
- [ ] Verificar logs no console
- [ ] Verificar se role aparece como `super_admin`

---

**Última Atualização**: 07 de Janeiro de 2026
