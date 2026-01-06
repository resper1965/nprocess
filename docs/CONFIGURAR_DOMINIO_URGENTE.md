# 🚨 Configurar Domínio Customizado - URGENTE

**Data**: 06 de Janeiro de 2026  
**Projeto**: `nprocess-8e801`  
**Site**: `nprocess-8e801-4711d`  
**Domínio**: `nprocess.ness.com.br`

---

## ❌ Problema Atual

Ao acessar `https://nprocess.ness.com.br`, você vê:
```
Site Not Found
Why am I seeing this?
- You haven't deployed an app yet.
- You may have deployed an empty directory.
- This is a custom domain, but we haven't finished setting it up yet.
```

**Causa**: O domínio customizado não está configurado no Firebase Hosting.

---

## ✅ Solução: Configurar Domínio no Firebase Console

### Passo 1: Acessar Firebase Hosting

1. **Acesse o Firebase Console:**
   - URL: https://console.firebase.google.com/project/nprocess-8e801/hosting

2. **Verifique o site:**
   - Você deve ver o site `nprocess-8e801-4711d`
   - Status: Deve estar ativo e com deploy recente

---

### Passo 2: Adicionar Domínio Customizado

1. **Clique em "Add custom domain"** ou **"Adicionar domínio personalizado"**
   - Botão geralmente fica no topo da página ou na seção de domínios

2. **Digite o domínio:**
   ```
   nprocess.ness.com.br
   ```
   - **NÃO** inclua `http://` ou `https://`
   - **NÃO** inclua `/` no final
   - Apenas: `nprocess.ness.com.br`

3. **Clique em "Continue"** ou **"Continuar"**

---

### Passo 3: Verificar Propriedade do Domínio

O Firebase oferecerá **duas opções** para verificar que você é o dono do domínio:

#### Opção A: Verificação via TXT Record (Recomendado)

1. **O Firebase fornecerá um registro TXT:**
   - Exemplo:
     ```
     Tipo: TXT
     Nome: nprocess (ou @)
     Valor: firebase=nprocess-8e801-4711d
     TTL: 3600
     ```

2. **Adicione o registro TXT no DNS do domínio `ness.com.br`:**
   - Acesse o painel de DNS do provedor de domínio
   - Adicione o registro TXT conforme fornecido pelo Firebase
   - Aguarde a propagação (pode levar alguns minutos)

3. **Volte ao Firebase Console e clique em "Verify"** ou **"Verificar"**

#### Opção B: Verificação via HTML File (Alternativa)

1. O Firebase fornecerá um arquivo HTML específico
2. Faça upload deste arquivo no servidor web do domínio
3. O Firebase verificará o acesso ao arquivo

---

### Passo 4: Configurar Registros DNS

Após a verificação, o Firebase fornecerá os **registros DNS** que você precisa adicionar:

#### Opção 1: Registros A (IPv4) - Mais Comum

Adicione os seguintes registros A no DNS do domínio `ness.com.br`:

```
Tipo: A
Nome: nprocess
Valor: 151.101.1.195
TTL: 3600

Tipo: A
Nome: nprocess
Valor: 151.101.65.195
TTL: 3600
```

**Nota**: Os IPs podem variar. Use os IPs fornecidos pelo Firebase.

#### Opção 2: Registro CNAME (Alternativa)

Se o Firebase oferecer a opção CNAME:

```
Tipo: CNAME
Nome: nprocess
Valor: nprocess-8e801-4711d.web.app
TTL: 3600
```

---

### Passo 5: Aguardar Propagação e SSL

1. **Propagação DNS:**
   - Pode levar de alguns minutos a 48 horas
   - Normalmente leva 1-2 horas
   - Verifique com: `dig nprocess.ness.com.br` ou `nslookup nprocess.ness.com.br`

2. **SSL/TLS Automático:**
   - O Firebase configura SSL/TLS automaticamente via Let's Encrypt
   - Pode levar até 24 horas para o certificado ser emitido
   - O domínio ficará acessível via HTTP enquanto o SSL está sendo configurado

---

## 🔍 Verificar Configuração

### Verificar DNS

```bash
# Verificar registros DNS
dig nprocess.ness.com.br
nslookup nprocess.ness.com.br

# Verificar se aponta para Firebase
dig nprocess.ness.com.br +short
```

### Verificar no Firebase Console

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/hosting
2. Verifique se o domínio aparece na lista de domínios customizados
3. Status deve ser: **"Connected"** ou **"Conectado"**

---

## ⚠️ Importante: Atualizar OAuth e Firebase Auth

Após configurar o domínio, você **DEVE** autorizá-lo em:

### 1. Firebase Authentication

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
2. Vá em **"Authorized domains"**
3. Adicione: `nprocess.ness.com.br`
4. Clique em **"Add"**

### 2. Google OAuth (Google Cloud Console)

1. Acesse: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
2. Vá em **"OAuth 2.0 Client IDs"**
3. Edite o cliente OAuth
4. Em **"Authorized JavaScript origins"**, adicione:
   - `https://nprocess.ness.com.br`
5. Em **"Authorized redirect URIs"**, adicione:
   - `https://nprocess.ness.com.br/__/auth/handler`
   - `https://nprocess.ness.com.br`
6. Clique em **"Save"**

---

## 📋 Checklist

- [ ] Acessar Firebase Console Hosting
- [ ] Adicionar domínio customizado `nprocess.ness.com.br`
- [ ] Verificar propriedade do domínio (TXT record)
- [ ] Adicionar registros DNS (A ou CNAME)
- [ ] Aguardar propagação DNS
- [ ] Verificar se o domínio está conectado no Firebase
- [ ] Autorizar domínio no Firebase Authentication
- [ ] Atualizar OAuth no Google Cloud Console
- [ ] Testar acesso: https://nprocess.ness.com.br

---

## 🔗 Links Úteis

- **Firebase Hosting**: https://console.firebase.google.com/project/nprocess-8e801/hosting
- **Firebase Auth**: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
- **Google OAuth**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
- **Site Atual**: https://nprocess-8e801-4711d.web.app

---

**Última Atualização**: 06 de Janeiro de 2026
