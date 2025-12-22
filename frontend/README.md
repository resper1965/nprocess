# ComplianceEngine Frontend

Interface web para a ComplianceEngine API construída com Next.js e design system ness.

## 🎨 Design System

Este frontend segue o design system **ness**:
- **Cores**: Paleta de cinzas profundos (slate-950 a slate-100) + azul primário #00ade8
- **Tipografia**: Inter (corpo) + Montserrat (títulos)
- **Filosofia**: "Invisível quando funciona, Presente quando importa"

## 🚀 Início Rápido

### Instalar Dependências

```bash
npm install
```

### Configurar Variáveis de Ambiente

Crie um arquivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://compliance-engine-273624403528.us-central1.run.app
```

Para desenvolvimento local:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Rodar em Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### Build para Produção

```bash
npm run build
npm start
```

## 📦 Estrutura

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Dashboard
│   ├── generate/           # Gerar diagrama
│   ├── processes/          # Lista de processos
│   ├── analyze/            # Análise de compliance
│   └── docs/               # Documentação
├── components/
│   └── DiagramViewer.tsx   # Renderiza diagramas Mermaid
├── lib/
│   └── api.ts              # Cliente da API
└── app/globals.css         # Estilos globais (design system ness)
```

## 🎯 Funcionalidades

- ✅ **Dashboard**: Visão geral e status da API
- ✅ **Gerar Diagrama**: Converte texto em diagrama BPMN
- ✅ **Processos**: Lista e gerencia processos
- ✅ **Análise de Compliance**: Analisa processos contra regulamentações
- ✅ **Documentação**: Acesso a prompts e manual de integração

## 🔧 Tecnologias

- **Next.js 16**: Framework React
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Mermaid.js**: Renderização de diagramas
- **Axios**: Cliente HTTP

## 📝 Próximos Passos

- [ ] Página de detalhes do processo
- [ ] Edição de processos
- [ ] Exportação de relatórios
- [ ] Autenticação (quando implementada na API)
- [ ] Deploy no Vercel ou Cloud Run
