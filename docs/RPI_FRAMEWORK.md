# RPI Framework: Research, Plan, Implement

**Framework**: Research → Plan → Implement  
**Contexto**: Desenvolvimento Assistido por IA  
**Status**: ✅ Documentado para uso no projeto n.process

---

## 🎯 O Que é RPI?

**RPI** (Research, Plan, Implement) é uma metodologia de desenvolvimento assistido por IA que estrutura o processo de criação de software em três fases sequenciais:

1. **Research** (Pesquisar) - Investigar e entender o problema
2. **Plan** (Planejar) - Definir a solução e arquitetura
3. **Implement** (Implementar) - Executar e construir

---

## 📋 As 3 Fases do RPI

### 1. Research (Pesquisar) 🔍

**Objetivo**: Entender profundamente o problema, contexto e requisitos.

**Atividades**:
- Pesquisar tecnologias e ferramentas disponíveis
- Estudar documentação e exemplos
- Analisar casos de uso similares
- Identificar requisitos funcionais e não-funcionais
- Mapear dependências e integrações necessárias
- Verificar limitações e constraints

**Outputs**:
- Especificações do problema
- Lista de tecnologias candidatas
- Requisitos documentados
- Casos de uso identificados

**Exemplo para n.process**:
```
Research: Investigar como implementar RAG Legal com Strategy Pattern
- Estudar documentação do Vertex AI Search
- Pesquisar estratégias de chunking para documentos jurídicos
- Analisar estrutura de leis (Artigos, Parágrafos, Incisos)
- Verificar limites e custos do Firestore Vector Search
```

---

### 2. Plan (Planejar) 📐

**Objetivo**: Definir a solução, arquitetura e estratégia de implementação.

**Atividades**:
- Escolher tecnologias baseado no Research
- Definir arquitetura e estrutura do projeto
- Criar plano de implementação dividido em tarefas
- Definir padrões e convenções
- Estabelecer métricas de sucesso
- Planejar testes e validação

**Outputs**:
- Arquitetura definida
- Stack tecnológico escolhido
- Plano de implementação (tarefas priorizadas)
- Decisões técnicas documentadas

**Exemplo para n.process**:
```
Plan: Arquitetura RAG Legal com Strategy Pattern
- Backend: FastAPI com Strategy Pattern para Chunking
- Estratégia Padrão: Janela deslizante (Tokens)
- Estratégia Legal: Parser que respeita estrutura jurídica
- Database: Firestore com Vector Search integrado
- Tarefas:
  1. Criar interface ChunkingStrategy
  2. Implementar StandardChunkingStrategy
  3. Implementar LegalChunkingStrategy
  4. Criar factory para selecionar estratégia
```

---

### 3. Implement (Implementar) ⚙️

**Objetivo**: Executar o plano e construir a solução.

**Atividades**:
- Escrever código seguindo o plano
- Implementar testes unitários e de integração
- Validar com requisitos do Research
- Refatorar conforme necessário
- Documentar código e decisões
- Deploy e validação em ambiente

**Outputs**:
- Código implementado e testado
- Documentação técnica
- Testes validados
- Deploy realizado

**Exemplo para n.process**:
```
Implement: Código RAG Legal
- Criar app/services/ingestion/chunking_strategies.py
- Implementar LegalChunkingStrategy com parser jurídico
- Criar testes unitários para validação
- Integrar com pipeline de ingestão
- Validar com documentos LGPD reais
```

---

## 🔄 RPI e Spec Kit

O **GitHub Spec Kit** segue uma abordagem similar ao RPI:

| RPI | Spec Kit | Descrição |
|-----|----------|-----------|
| **Research** | `/speckit.specify` | Definir o que construir (requisitos) |
| **Plan** | `/speckit.plan` | Definir como construir (arquitetura) |
| **Implement** | `/speckit.implement` | Construir (executar tarefas) |

**Diferença**:
- **RPI**: Framework conceitual geral de desenvolvimento
- **Spec Kit**: Ferramenta específica que automatiza RPI com IA

---

## 🎯 Fluxo RPI para n.process

### Exemplo: Implementar Compliance Guard

#### 1. Research 🔍

```
Pesquisar:
- Como funcionam frameworks regulatórios (LGPD, GDPR, SOX)
- Quais são os requisitos de compliance
- Como estruturar análises de conformidade
- Quais métricas são importantes
- Como integrar com RAG (Knowledge Store)
```

#### 2. Plan 📐

```
Planejar:
- Endpoint: POST /v1/compliance/analyze
- Input: process_id, domain (LGPD|GDPR|SOX)
- Pipeline:
  1. Buscar processo no Firestore
  2. Buscar Knowledge Base do domínio (RAG)
  3. Chamar Gemini 1.5 Pro para análise
  4. Salvar resultado como Job assíncrono
  5. Retornar Job ID
- Tecnologias: FastAPI, Vertex AI, Firestore, Cloud Tasks
```

#### 3. Implement ⚙️

```
Implementar:
- Criar router /v1/compliance/analyze
- Implementar service compliance_service.py
- Criar worker para Cloud Tasks
- Implementar lógica de análise com Gemini
- Criar testes unitários e de integração
- Validar com casos reais
```

---

## 📊 RPI Iterativo

RPI não é linear, é **iterativo**:

```
Research → Plan → Implement
   ↑         ↓         ↓
   └─────────┴─────────┘
      Refine & Iterate
```

**Ciclos iterativos**:
1. Implementar pode revelar novos requisitos → Voltar ao Research
2. Plan pode precisar ajustes → Revisar Plan
3. Research pode descobrir melhores tecnologias → Atualizar Plan

---

## 🛠️ Como Usar RPI no Projeto

### 1. Para Nova Feature

```bash
# 1. Research
# Pesquisar e entender a feature
# Documentar requisitos e tecnologias

# 2. Plan
# Usar Spec Kit: /speckit.specify e /speckit.plan
# Gerar tarefas: /speckit.tasks

# 3. Implement
# Executar: /speckit.implement
# Ou implementar manualmente seguindo o plano
```

### 2. Para Correção de Bug

```bash
# 1. Research
# Reproduzir o bug
# Identificar causa raiz
# Estudar código relacionado

# 2. Plan
# Definir estratégia de correção
# Identificar testes necessários
# Verificar impactos

# 3. Implement
# Aplicar correção
# Adicionar testes
# Validar solução
```

### 3. Para Refatoração

```bash
# 1. Research
# Analisar código atual
# Identificar problemas e oportunidades
# Estudar melhores práticas

# 2. Plan
# Definir nova estrutura
# Criar plano de migração
# Estabelecer testes de regressão

# 3. Implement
# Refatorar incrementalmente
# Validar em cada passo
# Garantir compatibilidade
```

---

## ✅ Benefícios do RPI

1. **Clareza**: Entender antes de construir
2. **Eficiência**: Menos retrabalho com planejamento adequado
3. **Qualidade**: Soluções mais bem fundamentadas
4. **Documentação**: Processo natural de documentação
5. **Colaboração**: Compartilhamento de conhecimento estruturado

---

## 📚 Recursos Adicionais

- **Spec Kit**: [docs/tools/SPEC_KIT.md](docs/tools/SPEC_KIT.md)
- **Boot Prompt**: [docs/essential/BOOT_PROMPT.md](docs/essential/BOOT_PROMPT.md)
- **Documentos Essenciais**: [docs/essential/](docs/essential/)

---

## 🎯 Conclusão

**RPI (Research, Plan, Implement)** é uma metodologia poderosa que:
- Estrutura o desenvolvimento assistido por IA
- Alinha com o GitHub Spec Kit
- Promove qualidade e eficiência
- É iterativa e adaptável

Use RPI como framework mental, e Spec Kit como ferramenta de automação.

---

**Última Atualização**: 10 de Janeiro de 2026
