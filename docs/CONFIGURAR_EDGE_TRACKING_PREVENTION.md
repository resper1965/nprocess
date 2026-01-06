# 🔧 Como Configurar Microsoft Edge para Login com Google

## ⚠️ Problema

O Microsoft Edge está bloqueando o acesso ao storage do Google APIs devido à **Prevenção de Rastreamento**, impedindo o login com Google de funcionar.

---

## ✅ Solução Rápida (Recomendada)

### Método 1: Desativar Tracking Prevention para este site específico

**Passo a passo:**

1. **Acesse a página de login:**
   - URL: https://nprocess-8e801-4711d.web.app/login

2. **Clique no ícone de cadeado** (ou informações) ao lado do endereço do site na barra de endereços

3. **No menu que abrir:**
   - Procure por **"Prevenção de rastreamento"**
   - Clique e selecione **"Desativada"** para este site

4. **Recarregue a página** (F5 ou Ctrl+R)

5. **Tente fazer login com Google novamente**

**Vantagem:** Apenas este site terá Tracking Prevention desativado, mantendo a proteção para outros sites.

---

## ✅ Solução Global (Alternativa)

### Método 2: Ajustar o nível de Tracking Prevention globalmente

**Passo a passo:**

1. **Abra o Microsoft Edge**

2. **Clique nos três pontos** (⋯) no canto superior direito

3. **Selecione "Configurações"**

4. **No menu lateral, clique em "Privacidade, pesquisa e serviços"**

5. **Em "Prevenção de rastreamento", escolha:**
   - **"Básico"** (recomendado para funcionar com login Google)
   - Ou **"Equilibrado"** (pode funcionar, mas menos garantido)

6. **Recarregue a página de login** e tente novamente

**Vantagem:** Funciona para todos os sites, mas reduz a proteção global.

---

## 📋 Níveis de Prevenção de Rastreamento

### Básico
- ✅ **Recomendado para login Google**
- Bloqueia apenas rastreadores potencialmente prejudiciais
- Permite a maioria dos rastreadores necessários para autenticação

### Equilibrado (Padrão)
- ⚠️ Pode funcionar, mas não garantido
- Bloqueia rastreadores de sites não visitados
- Pode bloquear alguns recursos do Google Auth

### Estrito
- ❌ **NÃO funciona com login Google**
- Bloqueia a maioria dos rastreadores
- Impede o acesso ao storage do Google APIs

---

## 🔍 Verificação

Após configurar, verifique:

1. **Acesse:** https://nprocess-8e801-4711d.web.app/login
2. **Clique em "Entrar com Google"**
3. **Você deve ser redirecionado para a página de login do Google**
4. **Após autenticar, você será redirecionado de volta para a aplicação**

---

## ❓ Problemas Comuns

### "Ainda não funciona após configurar"

**Soluções:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Feche e reabra o Edge completamente
3. Verifique se não há extensões bloqueando (AdBlock, Privacy Badger, etc.)
4. Tente em uma janela anônima (Ctrl+Shift+N)

### "Não vejo a opção de Prevenção de rastreamento"

**Solução:**
- Atualize o Edge para a versão mais recente
- A opção pode estar em "Configurações → Privacidade → Prevenção de rastreamento"

### "Quero manter a proteção máxima"

**Solução:**
- Use o Método 1 (desativar apenas para este site)
- Isso mantém a proteção para outros sites
- É a solução mais segura e recomendada

---

## 📞 Suporte

Se o problema persistir após seguir estas instruções:

1. Verifique a versão do Edge (Configurações → Sobre o Microsoft Edge)
2. Verifique se há extensões bloqueando
3. Tente em uma janela anônima
4. Entre em contato com o suporte informando:
   - Versão do Edge
   - Mensagens de erro (se houver)
   - Passos já tentados

---

## 🔗 Links Úteis

- [Documentação oficial do Edge sobre Tracking Prevention](https://support.microsoft.com/pt-br/microsoft-edge/saiba-mais-sobre-a-preven%C3%A7%C3%A3o-contra-rastreamento-no-microsoft-edge-5ac125e8-9b90-8d59-fa2c-7f2e9a44d869)
- [Página de login](https://nprocess-8e801-4711d.web.app/login)

---

**Última atualização:** 2025-01-XX
