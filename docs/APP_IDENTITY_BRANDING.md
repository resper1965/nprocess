# 🎨 App Identity & Branding - Conformidade Google Cloud

**Referência**: [Google Cloud - App Identity & Branding](https://support.google.com/cloud/answer/13804963?hl=pt-BR)  
**Data**: 06 de Janeiro de 2026  
**Projeto**: `nprocess-8e801`

---

## 📋 Requisitos do Google Cloud

Conforme a [documentação oficial do Google Cloud](https://support.google.com/cloud/answer/13804963?hl=pt-BR), todos os apps que acessam APIs do Google devem:

1. ✅ **Verificar identidade e intenção** conforme Google's API Terms of Service
2. ✅ **Nome da aplicação** deve ser consistente em todos os lugares
3. ✅ **Logo** deve corresponder em todos os lugares
4. ✅ **Identidade única** - não usar nomes/ícones/logos do Google
5. ✅ **Seguir Google APIs Branding Guidelines**

---

## ✅ Checklist de Conformidade

### 1. Nome da Aplicação

**Requisito**: O nome da aplicação deve ser **o mesmo** em:
- Homepage (`nprocess.ness.com.br`)
- OAuth Consent Screen
- Verificação de submissão

**Nome Configurado**:
- **Homepage**: `n.process` ou `Process & Compliance Engine`
- **OAuth Consent Screen**: Deve corresponder exatamente
- **Branding**: Identifica unicamente a marca **ness.**

**Status**: ✅ Conforme - Nome identifica unicamente a marca (ness.) e não usa produtos Google

---

### 2. Logo da Aplicação

**Requisito**: O logo deve ser **o mesmo** em:
- Homepage
- OAuth Consent Screen
- Verificação de submissão

**Logo Configurado**:
- **Homepage**: Logo da ness. (componente `NessLogo`)
- **OAuth Consent Screen**: Deve usar o mesmo logo da ness.
- **Identificação**: Logo identifica unicamente a marca ness.

**Status**: ✅ Conforme - Logo identifica unicamente a marca e não usa logos do Google

---

### 3. Identidade Única

**Requisito**: 
- ✅ Nome não deve incluir nomes de produtos Google
- ✅ Logo não deve incluir ícones/logos/marcas do Google
- ✅ Deve identificar unicamente a marca/organização

**Verificação**:
- ✅ Nome: `n.process` - não usa produtos Google
- ✅ Logo: Logo da ness. - não usa logos do Google
- ✅ Identificação: Identifica unicamente a marca ness.

**Status**: ✅ Conforme

---

## 🔧 Configuração no OAuth Consent Screen

### App Information

1. **Acesse**: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-8e801

2. **Configure**:
   - **App name**: `n.process` ou `Process & Compliance Engine`
     - ⚠️ **IMPORTANTE**: Deve ser **exatamente o mesmo** nome usado na homepage
   - **App logo**: Upload do logo da ness.
     - ⚠️ **IMPORTANTE**: Deve ser **exatamente o mesmo** logo usado na homepage
   - **User support email**: `resper@ness.com.br`
   - **Application home page**: `https://nprocess.ness.com.br`
   - **Application privacy policy link**: `https://nprocess.ness.com.br/privacy`
   - **Application terms of service link**: `https://nprocess.ness.com.br/terms`

---

## ⚠️ Problemas Comuns a Evitar

### 1. Nome Diferente entre Homepage e OAuth Consent Screen

**Erro**: "My application name on the homepage is not the same as the one on the OAuth consent screen"

**Solução**:
- ✅ Garantir que o nome seja **exatamente o mesmo** em ambos os lugares
- ✅ Verificar na homepage: `nprocess.ness.com.br`
- ✅ Verificar no OAuth Consent Screen
- ✅ Atualizar se necessário

### 2. Logo Diferente entre Homepage e OAuth Consent Screen

**Erro**: "The logo shown on your OAuth consent screen does not match the information you provided"

**Solução**:
- ✅ Garantir que o logo seja **exatamente o mesmo** em ambos os lugares
- ✅ Verificar na homepage: Logo da ness.
- ✅ Verificar no OAuth Consent Screen
- ✅ Fazer upload do mesmo logo

### 3. Logo Não Identifica a Marca

**Erro**: "Your logo does not uniquely identify your brand and identity"

**Solução**:
- ✅ Usar logo que identifique claramente a marca ness.
- ✅ Não usar logos genéricos ou do Google
- ✅ Garantir que o logo seja único e reconhecível

### 4. Nome Não Identifica a Marca

**Erro**: "Your application name does not uniquely identify your brand and identity"

**Solução**:
- ✅ Usar nome que identifique claramente a marca ness.
- ✅ Não usar nomes genéricos ou de produtos Google
- ✅ Garantir que o nome seja único e reconhecível

---

## 📝 Verificação Final

Antes de submeter para verificação, confirme:

- [ ] Nome da aplicação é **exatamente o mesmo** na homepage e OAuth Consent Screen
- [ ] Logo é **exatamente o mesmo** na homepage e OAuth Consent Screen
- [ ] Nome identifica unicamente a marca ness. (não usa produtos Google)
- [ ] Logo identifica unicamente a marca ness. (não usa logos do Google)
- [ ] Homepage está acessível e mostra o nome e logo corretos
- [ ] OAuth Consent Screen está configurado com o mesmo nome e logo

---

## 🔗 Links Úteis

- **Google Cloud - App Identity & Branding**: https://support.google.com/cloud/answer/13804963?hl=pt-BR
- **Google APIs Branding Guidelines**: [Referência na documentação do Google]
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-8e801
- **Homepage**: https://nprocess.ness.com.br

---

## 📋 Resumo

### Nome da Aplicação
- **Homepage**: `n.process` ou `Process & Compliance Engine`
- **OAuth Consent Screen**: Deve corresponder exatamente
- **Status**: ✅ Conforme - Identifica unicamente a marca ness.

### Logo da Aplicação
- **Homepage**: Logo da ness. (componente `NessLogo`)
- **OAuth Consent Screen**: Deve corresponder exatamente
- **Status**: ✅ Conforme - Identifica unicamente a marca ness.

### Identidade Única
- ✅ Não usa nomes de produtos Google
- ✅ Não usa logos do Google
- ✅ Identifica unicamente a marca ness.
- **Status**: ✅ Conforme

---

**Última Atualização**: 06 de Janeiro de 2026
