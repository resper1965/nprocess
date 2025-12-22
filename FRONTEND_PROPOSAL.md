# Proposta de Frontend - ComplianceEngine

## 🎯 Necessidade

Atualmente a aplicação é apenas uma **API REST** sem interface visual. Um frontend facilitaria:
- ✅ Uso por usuários não técnicos
- ✅ Visualização de diagramas Mermaid
- ✅ Interface para criar e gerenciar processos
- ✅ Dashboard de compliance
- ✅ Visualização de análises e gaps

## 🏗️ Proposta de Arquitetura

### Opção 1: Next.js (Recomendado)
- **Framework**: Next.js 14+ (App Router)
- **Design System**: ness (conforme memórias do projeto)
- **Estilização**: Tailwind CSS
- **Tipografia**: Inter (primária) + Montserrat (títulos)
- **Paleta**: Cinzas profundos (slate-950 a slate-100) + azul #00ade8
- **Renderização de Diagramas**: Mermaid.js

### Opção 2: Frontend Simples (HTML + JS)
- **Tecnologia**: HTML/CSS/JavaScript vanilla
- **Vantagem**: Mais simples, sem build
- **Desvantagem**: Menos escalável

## 📋 Funcionalidades do Frontend

### Páginas Principais

1. **Dashboard**
   - Lista de processos
   - Score de compliance geral
   - Gaps críticos em destaque
   - Gráficos de evolução

2. **Gerar Diagrama**
   - Formulário para descrição de processo
   - Preview do diagrama Mermaid
   - Opção de salvar como processo

3. **Processos**
   - Lista de processos salvos
   - Filtros (domínio, data)
   - Visualização de processo individual
   - Edição (futuro)

4. **Análise de Compliance**
   - Seleção de processo
   - Seleção de domínio (LGPD, SOX, GDPR)
   - Resultados com score, gaps e sugestões
   - Visualização de gaps no diagrama

5. **Documentação**
   - Acesso aos prompts
   - Manual de integração
   - Exemplos de uso

## 🎨 Design System ness

Conforme memórias do projeto:
- **Filosofia**: "Invisível quando funciona, Presente quando importa"
- **Cores**: 
  - Backgrounds: slate-950/900
  - Texto: slate-300/400
  - Azul estratégico: #00ade8
- **Tipografia**:
  - Inter (corpo)
  - Montserrat (títulos grandes)
- **Espaçamento**: Múltiplos de 4px
- **Line-height**: 1.25 (títulos), 1.625 (corpo)

## 🔧 Integração com API

O frontend consumirá a API já deployada:
- **Produção**: https://compliance-engine-273624403528.us-central1.run.app
- **Local**: http://localhost:8080

## 📦 Estrutura Proposta

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx           # Dashboard
│   ├── generate/
│   │   └── page.tsx       # Gerar diagrama
│   ├── processes/
│   │   ├── page.tsx       # Lista
│   │   └── [id]/
│   │       └── page.tsx   # Detalhes
│   ├── analyze/
│   │   └── page.tsx       # Análise compliance
│   └── docs/
│       └── page.tsx       # Documentação
├── components/
│   ├── ui/                # Componentes base
│   ├── ProcessCard.tsx
│   ├── DiagramViewer.tsx   # Renderiza Mermaid
│   ├── ComplianceScore.tsx
│   └── GapList.tsx
├── lib/
│   ├── api.ts             # Cliente da API
│   └── types.ts           # TypeScript types
├── styles/
│   └── globals.css        # Tailwind + ness
└── package.json
```

## 🚀 Próximos Passos

1. Criar estrutura Next.js
2. Configurar design system ness
3. Implementar integração com API
4. Criar componentes principais
5. Deploy do frontend (Vercel ou Cloud Run)

---

**Deseja que eu crie o frontend agora?**

