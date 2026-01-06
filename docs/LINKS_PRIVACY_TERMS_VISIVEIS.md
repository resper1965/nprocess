# 🔗 Links Privacy Policy e Terms of Service - Visibilidade

**Data**: 06 de Janeiro de 2026  
**Projeto**: `nprocess-8e801`

---

## 📋 Objetivo

Garantir que os links para **Privacy Policy** e **Terms of Service** sejam facilmente encontrados e detectados pelo Google na homepage.

---

## ✅ Links Adicionados na Homepage

### 1. Header (Sempre Visível)
- ✅ Link "Privacy Policy" no header
- ✅ Visível em todas as resoluções
- ✅ Com underline e font-medium para destacar

### 2. Hero Section (2 Locais)
- ✅ Texto explicativo: "By using this service, you agree to our Privacy Policy and Terms of Service."
- ✅ Links separados: "Privacy Policy • Terms of Service"
- ✅ Ambos com underline e font-medium

### 3. Footer
- ✅ Links "Privacy Policy | Terms of Service"
- ✅ Com underline e font-medium
- ✅ Sempre visível no final da página

---

## 🔧 Alterações Técnicas

### Uso de `<a>` em vez de `<Link>`

Para garantir que o Google detecte os links (mesmo sem JavaScript), os links principais foram alterados de `<Link>` (Next.js) para `<a>` (HTML nativo):

**Antes**:
```tsx
<Link href="/privacy" className="...">Privacy Policy</Link>
```

**Depois**:
```tsx
<a href="/privacy" className="... underline font-medium">Privacy Policy</a>
```

### Estilização

Todos os links têm:
- ✅ `underline` - Sublinhado para destacar
- ✅ `font-medium` - Peso de fonte médio para destacar
- ✅ `text-primary` - Cor primária (#00ade8) para destacar
- ✅ `hover:text-primary` - Efeito hover

---

## 📍 Localizações dos Links

### Header
```
[Logo n.process]                    [Privacy Policy] [Sign In] [Get Started]
```

### Hero Section (2 locais)
```
1. Texto explicativo:
   "By using this service, you agree to our Privacy Policy and Terms of Service."

2. Links separados:
   Privacy Policy • Terms of Service
```

### Footer
```
© 2025 ness. n.process. All rights reserved.
Privacy Policy | Terms of Service
```

---

## 🔍 Verificação

Após fazer deploy, verifique:

1. **Acesse**: https://nprocess.ness.com.br
2. **Verifique se os links aparecem**:
   - ✅ Header: Link "Privacy Policy" visível
   - ✅ Hero Section: Texto com links visível
   - ✅ Hero Section: Links separados visíveis
   - ✅ Footer: Links visíveis

3. **Teste os links**:
   - ✅ Clique em "Privacy Policy" → Deve ir para `/privacy`
   - ✅ Clique em "Terms of Service" → Deve ir para `/terms`

4. **Verifique no código-fonte** (View Page Source):
   - ✅ Links aparecem como `<a href="/privacy">` no HTML
   - ✅ Links aparecem como `<a href="/terms">` no HTML

---

## 📋 Checklist

- [x] Link Privacy Policy no header
- [x] Link Privacy Policy no hero section (texto explicativo)
- [x] Link Privacy Policy no hero section (links separados)
- [x] Link Privacy Policy no footer
- [x] Link Terms of Service no hero section (texto explicativo)
- [x] Link Terms of Service no hero section (links separados)
- [x] Link Terms of Service no footer
- [x] Todos os links usam `<a>` (HTML nativo)
- [x] Todos os links têm underline e font-medium
- [x] Todos os links funcionam corretamente

---

## 🔗 URLs dos Documentos

- **Privacy Policy**: https://nprocess.ness.com.br/privacy
- **Terms of Service**: https://nprocess.ness.com.br/terms

---

**Última Atualização**: 06 de Janeiro de 2026
