# 🔍 Como Verificar OAuth Consent Screen

**Data**: 06 de Janeiro de 2026  
**Projeto**: `nprocess-8e801`

---

## 📋 Objetivo

Verificar se o **nome** e **logo** configurados no OAuth Consent Screen são **exatamente os mesmos** da homepage.

---

## 🔧 Passo a Passo

### 1. Verificar Nome e Logo na Homepage

#### Acessar a Homepage

1. Acesse: https://nprocess-8e801-4711d.web.app
   - Ou: https://nprocess.ness.com.br (se o domínio customizado estiver configurado)

2. **Anotar o Nome da Aplicação**:
   - Procure pelo nome na homepage
   - Nome encontrado: `n.process` ou `Process & Compliance Engine`
   - Localização: Header, Hero Section, Footer
   - **Anote exatamente como aparece**: `n.process` ou `Process & Compliance Engine`

3. **Anotar o Logo**:
   - Procure pelo logo na homepage (canto superior esquerdo)
   - Logo usado: Componente `NessLogo` (logo da ness.)
   - **Anote como aparece**: Logo com "n.process" onde o ponto é azul (#00ade8)
   - **Ou tire um screenshot** para comparar depois

---

### 2. Acessar OAuth Consent Screen

1. **Acesse o Google Cloud Console**:
   - URL: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-8e801
   - Ou navegue: **APIs & Services** > **OAuth consent screen**

2. **Verificar o Nome da Aplicação**:
   - Na seção **"App information"**
   - Procure pelo campo **"App name"**
   - **Anote exatamente como está configurado**

3. **Verificar o Logo**:
   - Na mesma seção **"App information"**
   - Procure pelo campo **"App logo"**
   - Se houver um logo, clique para visualizar
   - **Compare com o logo da homepage**

---

### 3. Comparar Nome

#### Nome na Homepage

**Onde encontrar na homepage**:
- Header: Logo com texto "n.process"
- Hero Section: Badge "Process & Compliance Engine"
- Footer: "Process & Compliance Engine by ness."

**Nome principal usado**: `n.process` ou `Process & Compliance Engine`

#### Nome no OAuth Consent Screen

**Onde verificar**:
- Campo **"App name"** na seção **"App information"**

#### Comparação

✅ **Correto se**:
- O nome no OAuth Consent Screen é **exatamente** `n.process` ou `Process & Compliance Engine`
- Não há diferenças de capitalização, espaços ou caracteres

❌ **Incorreto se**:
- Nome diferente (ex: "nProcess", "N.Process", "nprocess")
- Capitalização diferente
- Espaços extras ou faltando

---

### 4. Comparar Logo

#### Logo na Homepage

**Como identificar**:
- Componente: `NessLogo` (arquivo: `web-portal/src/components/ness-logo.tsx`)
- Características:
  - Texto: "n.process"
  - Fonte: Montserrat Medium
  - Cor do texto: Preto ou branco (depende do tema)
  - Cor do ponto: Azul #00ade8 (ness blue)
  - Estilo: "n" + ponto azul + "process"

**Como verificar**:
1. Acesse a homepage
2. Olhe o canto superior esquerdo (header)
3. Veja o logo "n.process" com o ponto azul
4. Tire um screenshot se necessário

#### Logo no OAuth Consent Screen

**Como verificar**:
1. No OAuth Consent Screen, procure pelo campo **"App logo"**
2. Se houver um logo, clique para visualizar
3. Compare com o logo da homepage

#### Comparação

✅ **Correto se**:
- O logo no OAuth Consent Screen é **exatamente o mesmo** da homepage
- Mesmo design, cores e estilo
- Identifica claramente a marca ness.

❌ **Incorreto se**:
- Logo diferente
- Logo genérico ou placeholder
- Logo não identifica a marca ness.

---

## 📝 Checklist de Verificação

### Nome da Aplicação

- [ ] Acessei a homepage: https://nprocess-8e801-4711d.web.app
- [ ] Anotei o nome exato usado na homepage: `_____________`
- [ ] Acessei o OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-8e801
- [ ] Verifiquei o campo "App name" no OAuth Consent Screen: `_____________`
- [ ] Os nomes são **exatamente iguais**? ✅ / ❌

### Logo da Aplicação

- [ ] Visualizei o logo na homepage (canto superior esquerdo)
- [ ] Tirei screenshot do logo da homepage (opcional)
- [ ] Verifiquei o campo "App logo" no OAuth Consent Screen
- [ ] Visualizei o logo no OAuth Consent Screen
- [ ] Os logos são **exatamente iguais**? ✅ / ❌

---

## 🔧 Como Corrigir se Estiver Diferente

### Corrigir Nome

1. No OAuth Consent Screen, clique em **"Edit App"** ou **"Edit"**
2. Na seção **"App information"**, encontre o campo **"App name"**
3. Altere para corresponder **exatamente** ao nome da homepage:
   - `n.process` ou
   - `Process & Compliance Engine`
4. Clique em **"Save"**

### Corrigir Logo

1. No OAuth Consent Screen, clique em **"Edit App"** ou **"Edit"**
2. Na seção **"App information"**, encontre o campo **"App logo"**
3. Clique em **"Upload"** ou **"Change"**
4. Faça upload do logo da ness. (mesmo usado na homepage)
5. Clique em **"Save"**

**Nota**: O logo deve ser um arquivo de imagem (PNG, JPG, etc.) que identifique claramente a marca ness.

---

## 📸 Screenshots de Referência

### Homepage - Nome e Logo

**Localização do nome**:
- Header: Logo "n.process"
- Hero Section: Badge "Process & Compliance Engine"
- Footer: "Process & Compliance Engine by ness."

**Localização do logo**:
- Canto superior esquerdo do header
- Logo "n.process" com ponto azul (#00ade8)

### OAuth Consent Screen - Onde Verificar

**Seção "App information"**:
- Campo **"App name"**: Nome da aplicação
- Campo **"App logo"**: Logo da aplicação (se configurado)

---

## 🔗 Links Úteis

- **Homepage**: https://nprocess-8e801-4711d.web.app
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=nprocess-8e801
- **Código do Logo**: `web-portal/src/components/ness-logo.tsx`

---

## ⚠️ Importante

1. **Nome deve ser EXATAMENTE igual**: Mesma capitalização, espaços e caracteres
2. **Logo deve ser EXATAMENTE igual**: Mesmo design, cores e estilo
3. **Diferenças mínimas podem causar rejeição**: O Google verifica rigorosamente
4. **Após corrigir, aguarde alguns minutos**: Mudanças podem levar tempo para propagar

---

## 📋 Resumo Rápido

### Nome na Homepage
- **Principal**: `n.process` ou `Process & Compliance Engine`
- **Onde ver**: Header, Hero Section, Footer

### Nome no OAuth Consent Screen
- **Onde ver**: Campo "App name" na seção "App information"
- **Deve ser**: Exatamente igual ao da homepage

### Logo na Homepage
- **Componente**: `NessLogo`
- **Características**: "n.process" com ponto azul (#00ade8)

### Logo no OAuth Consent Screen
- **Onde ver**: Campo "App logo" na seção "App information"
- **Deve ser**: Exatamente igual ao da homepage

---

**Última Atualização**: 06 de Janeiro de 2026
