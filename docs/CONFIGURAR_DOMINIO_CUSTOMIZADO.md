# 🌐 Configurar Domínio Customizado nprocess.ness.com.br

**Data**: 06 de Janeiro de 2026  
**Projeto Firebase**: `nprocess-8e801`  
**Site**: `nprocess-8e801-4711d`  
**Domínio**: `nprocess.ness.com.br`

---

## 📋 Passo a Passo

### 1. Adicionar Domínio no Firebase Hosting

#### Via Firebase Console (Recomendado)

1. **Acesse o Firebase Console:**
   - URL: https://console.firebase.google.com/project/nprocess-8e801/hosting

2. **Adicione o domínio customizado:**
   - Clique em **"Add custom domain"** ou **"Adicionar domínio personalizado"**
   - Digite: `nprocess.ness.com.br`
   - Clique em **"Continue"**

3. **Verifique o domínio:**
   - O Firebase fornecerá registros DNS que você precisa adicionar no provedor de domínio
   - Anote os registros fornecidos (geralmente um registro TXT ou A)

#### Via Firebase CLI (Alternativa)

```bash
# Adicionar domínio customizado
firebase hosting:channel:create production --project=nprocess-8e801

# Ou usar o comando direto (se disponível)
firebase hosting:domains:add nprocess.ness.com.br --project=nprocess-8e801
```

---

### 2. Configurar DNS no Provedor de Domínio

Após adicionar o domínio no Firebase, você receberá instruções para configurar o DNS.

#### Opção A: Registro A (IPv4)

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

#### Opção B: Registro CNAME (Recomendado)

Adicione o seguinte registro CNAME:

```
Tipo: CNAME
Nome: nprocess
Valor: nprocess-8e801-4711d.web.app
TTL: 3600
```

#### Opção C: Registro TXT (Verificação)

O Firebase pode solicitar um registro TXT para verificação:

```
Tipo: TXT
Nome: nprocess (ou @)
Valor: [valor fornecido pelo Firebase]
TTL: 3600
```

---

### 3. Verificar Configuração DNS

Após adicionar os registros DNS, aguarde a propagação (pode levar de alguns minutos a 48 horas).

Verifique se o DNS está configurado corretamente:

```bash
# Verificar registro A
dig nprocess.ness.com.br A

# Verificar registro CNAME
dig nprocess.ness.com.br CNAME

# Verificar registro TXT
dig nprocess.ness.com.br TXT
```

Ou use ferramentas online:
- https://dnschecker.org
- https://www.whatsmydns.net

---

### 4. Verificar SSL/TLS

O Firebase Hosting automaticamente:
- ✅ Provisiona certificado SSL/TLS gratuito via Let's Encrypt
- ✅ Configura HTTPS automaticamente
- ✅ Renova certificados automaticamente

Aguarde alguns minutos após a verificação do DNS para o SSL ser provisionado.

---

### 5. Atualizar Configurações da Aplicação

Após o domínio estar funcionando, atualize:

#### Firebase Authentication - Authorized Domains

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
2. Vá em **"Authorized domains"**
3. Adicione: `nprocess.ness.com.br`

#### Google OAuth - Authorized JavaScript Origins

1. Acesse: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
2. Abra o OAuth 2.0 Client ID
3. Adicione em **"Authorized JavaScript origins"**:
   - `https://nprocess.ness.com.br`

#### Google OAuth - Authorized Redirect URIs

1. No mesmo OAuth Client ID, adicione em **"Authorized redirect URIs"**:
   - `https://nprocess.ness.com.br/__/auth/handler`

#### OAuth Consent Screen

1. Acesse: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-8e801
2. Atualize:
   - **Application home page**: `https://nprocess.ness.com.br`
   - **Application privacy policy link**: `https://nprocess.ness.com.br/privacy`
   - **Application terms of service link**: `https://nprocess.ness.com.br/terms`
   - **Authorized domains**: Adicione `nprocess.ness.com.br`

---

## 🔍 Verificação Final

Após configurar tudo, verifique:

1. ✅ Domínio acessível: https://nprocess.ness.com.br
2. ✅ SSL funcionando (cadeado verde no navegador)
3. ✅ Homepage carrega corretamente
4. ✅ Login com Google funciona
5. ✅ Privacy Policy acessível: https://nprocess.ness.com.br/privacy
6. ✅ Terms of Service acessível: https://nprocess.ness.com.br/terms

---

## 🛠️ Troubleshooting

### Domínio não resolve

- Verifique se os registros DNS foram adicionados corretamente
- Aguarde a propagação DNS (pode levar até 48 horas)
- Use `dig` ou `nslookup` para verificar

### SSL não funciona

- Aguarde alguns minutos após a verificação do DNS
- O Firebase provisiona SSL automaticamente
- Verifique se o domínio está verificado no Firebase Console

### Erro 404 após configurar domínio

- Verifique se o site está deployado no Firebase Hosting
- Confirme que o domínio está apontando para o site correto (`nprocess-8e801-4711d`)

---

## 📝 Comandos Úteis

```bash
# Listar sites do Firebase Hosting
firebase hosting:sites:list --project=nprocess-8e801

# Verificar domínios configurados
firebase hosting:domains:list --project=nprocess-8e801

# Fazer deploy para o domínio customizado
firebase deploy --only hosting --project=nprocess-8e801
```

---

## 🔗 Links Úteis

- **Firebase Hosting Console**: https://console.firebase.google.com/project/nprocess-8e801/hosting
- **Firebase Authentication Settings**: https://console.firebase.google.com/project/nprocess-8e801/authentication/settings
- **Google OAuth Console**: https://console.cloud.google.com/apis/credentials?project=nprocess-8e801
- **DNS Checker**: https://dnschecker.org

---

**Última Atualização**: 06 de Janeiro de 2026
