# 🌐 Configurar Domínio Customizado: nprocess.ness.com.br

**Data**: 27 de Dezembro de 2024  
**Projeto Firebase**: `nprocess-8e801`  
**Domínio**: `nprocess.ness.com.br`

---

## 📋 Passos para Configurar o Domínio

### 1. Configurar no Firebase Console

1. Acesse: https://console.firebase.google.com/project/nprocess-8e801/hosting
2. Clique em **"Adicionar domínio customizado"** ou **"Add custom domain"**
3. Digite: `nprocess.ness.com.br`
4. Clique em **"Continuar"** ou **"Continue"**

### 2. Verificar Propriedade do Domínio

O Firebase oferecerá duas opções:

#### Opção A: Verificação via TXT Record (Recomendado)
- Adicione um registro TXT no DNS do domínio `ness.com.br`
- O Firebase fornecerá o valor do TXT record
- Aguarde a verificação (pode levar alguns minutos)

#### Opção B: Verificação via HTML File
- Faça upload de um arquivo HTML específico no servidor
- Menos comum, mas também funciona

### 3. Configurar DNS

Após a verificação, o Firebase fornecerá os registros DNS necessários:

#### Registros A/AAAA (IPv4/IPv6)
```
Tipo: A
Nome: nprocess
Valor: [IP fornecido pelo Firebase]
TTL: 3600

Tipo: AAAA (se disponível)
Nome: nprocess
Valor: [IPv6 fornecido pelo Firebase]
TTL: 3600
```

#### OU Registro CNAME (Recomendado)
```
Tipo: CNAME
Nome: nprocess
Valor: [hostname fornecido pelo Firebase, ex: nprocess-8e801.web.app]
TTL: 3600
```

### 4. Aguardar Propagação DNS

- Pode levar de alguns minutos a 48 horas
- Normalmente leva 1-2 horas
- Verifique com: `dig nprocess.ness.com.br` ou `nslookup nprocess.ness.com.br`

### 5. SSL/TLS Automático

- O Firebase configura SSL/TLS automaticamente via Let's Encrypt
- Pode levar até 24 horas para o certificado ser emitido
- O domínio ficará acessível via HTTP enquanto o SSL está sendo configurado

---

## 🔧 Configuração via CLI (Alternativa)

Se preferir usar a CLI do Firebase:

```bash
# Listar sites
firebase hosting:sites:list --project=nprocess-8e801

# Adicionar domínio (requer interação manual no console)
# A CLI não suporta adicionar domínios diretamente
# Use o Firebase Console para adicionar o domínio
```

---

## ✅ Verificação

Após configurar o DNS e o Firebase processar:

1. Acesse: https://nprocess.ness.com.br
2. Verifique se redireciona para o Client Portal
3. Verifique se o SSL está ativo (cadeado verde no navegador)

---

## 📝 Notas Importantes

- **DNS**: Certifique-se de que o DNS do domínio `ness.com.br` está acessível
- **Propagação**: Aguarde a propagação DNS antes de considerar problemas
- **SSL**: O Firebase configura SSL automaticamente, mas pode levar até 24h
- **Backup**: O domínio padrão `nprocess-8e801.web.app` continuará funcionando

---

## 🔗 Links Úteis

- **Firebase Console**: https://console.firebase.google.com/project/nprocess-8e801/hosting
- **Documentação**: https://firebase.google.com/docs/hosting/custom-domain
- **Status DNS**: Use ferramentas como `dig` ou `nslookup`

---

## 🆘 Troubleshooting

### Domínio não resolve
- Verifique se os registros DNS estão corretos
- Aguarde a propagação DNS (pode levar até 48h)
- Verifique com: `dig nprocess.ness.com.br`

### SSL não está ativo
- Aguarde até 24h para o Firebase emitir o certificado
- Verifique no Firebase Console se há erros
- Certifique-se de que o DNS está apontando corretamente

### Erro 404
- Verifique se o domínio está vinculado ao site correto no Firebase
- Verifique se o deploy foi feito corretamente
- Verifique os logs no Firebase Console

---

**Última Atualização**: 27 de Dezembro de 2024

