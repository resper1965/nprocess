# 🚀 nprocess - Guia de Integração API/MCP

**Versão:** 2.0.0
**Data:** 2026-01-05
**Objetivo:** Backend de processamento de rotinas BPMN com análise de compliance

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Setup Inicial](#setup-inicial)
3. [Autenticação](#autenticação)
4. [ROTINA 1: Regularização BPMN](#rotina-1-regularização-bpmn)
5. [ROTINA 2: Análise de Compliance](#rotina-2-análise-de-compliance)
6. [ROTINA 3: Geração de Documentação](#rotina-3-geração-de-documentação)
7. [Integração via MCP](#integração-via-mcp)
8. [Exemplos Práticos](#exemplos-práticos)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **nprocess** é um backend especializado em 3 rotinas principais:

| Rotina | Entrada | Saída | Uso |
|--------|---------|-------|-----|
| **1. Regularização BPMN** | Texto plano descrevendo processo | BPMN 2.0 + Diagrama Mermaid | Modelagem de processos |
| **2. Análise de Compliance** | Processo + Standard | Gaps + Riscos + Score | Auditoria de conformidade |
| **3. Geração de Documentação** | Gaps + Contexto | Documentos Markdown | Documentação compliance |

**Tecnologias:**
- API REST (FastAPI)
- MCP (Model Context Protocol)
- IA: Google Gemini 1.5 Pro
- RAG: 20+ standards vetorizados (LGPD, ISO27001, HIPAA, etc)

---

## 🔧 Setup Inicial

### URLs Base

| Ambiente | API Core | Admin API |
|----------|----------|-----------|
| **Produção** | `https://nprocess-api-dev-XXXXX.run.app` | `https://nprocess-admin-api-dev-XXXXX.run.app` |
| **Local** | `http://localhost:8080` | `http://localhost:8008` |

### Requisitos

- **API REST:** Qualquer linguagem com HTTP client
- **MCP:** Cliente MCP compatível (Claude Desktop, Cursor, etc)

---

## 🔐 Autenticação

### 1. Obter API Key

**Via API Admin:**

```bash
curl -X POST https://nprocess-admin-api-dev-XXXXX.run.app/v1/admin/apikeys \
  -H "Authorization: Bearer YOUR_FIREBASE_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha Aplicacao - Producao",
    "environment": "production",
    "permissions": ["modeling:read", "modeling:write", "compliance:read", "compliance:write", "documents:read"],
    "quotas": {
      "requests_per_minute": 60,
      "requests_per_day": 10000
    },
    "expires_at": "2027-12-31T23:59:59Z"
  }'
```

**Resposta:**
```json
{
  "key_id": "key_abc123",
  "api_key": "nprc_live_Xk9p2Qs8vF3mN7hR4tY6wZ1cB5dE0aG8",
  "warning": "Esta chave será exibida apenas uma vez!"
}
```

⚠️ **IMPORTANTE:** Armazene a API key em local seguro (ex: `.env`)

### 2. Usar API Key nas Requisições

**Header obrigatório:**
```
X-API-Key: nprc_live_Xk9p2Qs8vF3mN7hR4tY6wZ1cB5dE0aG8
```

---

## 📝 ROTINA 1: Regularização BPMN

### Fluxo Completo

```
Usuário escreve texto plano
        ↓
Aplicação origem → nprocess API
        ↓
Agente IA analisa → BPMN 2.0 + Mermaid
        ↓
Aplicação origem ← Processo regularizado
        ↓
Usuário analisa e aprova/reprocessa
        ↓
(Iterativo até aprovação)
        ↓
Aplicação armazena processo final
```

### API REST

**Endpoint:** `POST /v1/modeling/generate`

#### Exemplo: Python

```python
import requests
import os

API_URL = "https://nprocess-api-dev-XXXXX.run.app"
API_KEY = os.getenv("NPROCESS_API_KEY")

def regularizar_processo(descricao: str, contexto: dict = None):
    """
    Envia texto plano e recebe processo regularizado em BPMN.
    """
    response = requests.post(
        f"{API_URL}/v1/modeling/generate",
        headers={
            "X-API-Key": API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "description": descricao,
            "context": contexto or {}
        }
    )

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Erro: {response.status_code} - {response.text}")

# USO:
texto_usuario = """
Para comprar material de escritório:
1. Funcionário preenche requisição
2. Gestor aprova se valor < R$ 1000
3. Se valor >= R$ 1000, vai para diretoria
4. Após aprovação, compras emite pedido
5. Fornecedor entrega
6. Recebimento confere e aceita
"""

resultado = regularizar_processo(
    descricao=texto_usuario,
    contexto={
        "domain": "procurement",
        "company": "Acme Corp"
    }
)

print("✅ Processo regularizado:")
print(f"📊 Diagrama Mermaid:\n{resultado['mermaid_diagram']}")
print(f"📄 BPMN XML: {len(resultado['bpmn_xml'])} caracteres")
print(f"📝 Resumo: {resultado['summary']}")
print(f"🎯 Atividades: {resultado['metadata']['activities']}")
print(f"👥 Atores: {resultado['metadata']['actors']}")
```

#### Exemplo: Node.js

```javascript
const axios = require('axios');

const API_URL = "https://nprocess-api-dev-XXXXX.run.app";
const API_KEY = process.env.NPROCESS_API_KEY;

async function regularizarProcesso(descricao, contexto = {}) {
    try {
        const response = await axios.post(
            `${API_URL}/v1/modeling/generate`,
            {
                description: descricao,
                context: contexto
            },
            {
                headers: {
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        throw new Error(`Erro: ${error.response?.status} - ${error.response?.data}`);
    }
}

// USO:
const textoUsuario = `
Para comprar material de escritório:
1. Funcionário preenche requisição
2. Gestor aprova se valor < R$ 1000
...
`;

regularizarProcesso(textoUsuario, { domain: 'procurement' })
    .then(resultado => {
        console.log('✅ Processo regularizado:');
        console.log(`📊 Diagrama Mermaid:\n${resultado.mermaid_diagram}`);
        console.log(`📝 Resumo: ${resultado.summary}`);
    })
    .catch(err => console.error(err));
```

#### Exemplo: cURL

```bash
curl -X POST https://nprocess-api-dev-XXXXX.run.app/v1/modeling/generate \
  -H "X-API-Key: nprc_live_Xk9p2Qs8vF3mN7hR4tY6wZ1cB5dE0aG8" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Para comprar material: funcionário requisita, gestor aprova, compras emite pedido",
    "context": {
      "domain": "procurement",
      "company": "Acme Corp"
    }
  }'
```

### Resposta Completa

```json
{
  "mermaid_diagram": "graph TD\n    Start[Início] --> A[Funcionário preenche requisição]\n    A --> B{Valor < R$ 1000?}\n    B -->|Sim| C[Gestor aprova]\n    B -->|Não| D[Diretoria aprova]\n    C --> E[Compras emite pedido]\n    D --> E\n    E --> F[Fornecedor entrega]\n    F --> G[Recebimento confere]\n    G --> End[Fim]",
  "bpmn_xml": "<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" ...>...</definitions>",
  "summary": "Processo de aquisição de material de escritório com aprovação em 2 níveis baseada em valor. Envolve 5 atores e 7 atividades principais.",
  "metadata": {
    "activities": [
      "Preencher requisição",
      "Aprovar (Gestor)",
      "Aprovar (Diretoria)",
      "Emitir pedido",
      "Entregar",
      "Conferir recebimento"
    ],
    "actors": [
      "Funcionário",
      "Gestor",
      "Diretoria",
      "Compras",
      "Fornecedor",
      "Recebimento"
    ],
    "gateways": 1,
    "estimated_duration": "3-5 dias úteis"
  }
}
```

### Implementação: Fluxo Iterativo

```python
def fluxo_iterativo_bpmn(descricao_inicial: str):
    """
    Implementa o ciclo iterativo de aprovação.
    """
    descricao = descricao_inicial
    versao = 1

    while True:
        print(f"\n📋 Versão {versao} - Processando...")

        # 1. Enviar para nprocess
        resultado = regularizar_processo(descricao)

        # 2. Exibir para usuário
        print(f"📊 Diagrama:\n{resultado['mermaid_diagram']}")
        print(f"📝 Resumo: {resultado['summary']}")

        # 3. Usuário aprova?
        acao = input("\n✅ Aprovar (a) | ✏️ Reprocessar (r) | ❌ Cancelar (c): ").lower()

        if acao == 'a':
            # 4. Armazenar processo aprovado
            salvar_processo_final(resultado)
            print("✅ Processo aprovado e armazenado!")
            return resultado

        elif acao == 'r':
            # 5. Solicitar ajustes
            feedback = input("📝 Descreva os ajustes necessários: ")
            descricao = f"{descricao}\n\nAJUSTES: {feedback}"
            versao += 1

        else:
            print("❌ Processo cancelado")
            return None

def salvar_processo_final(processo):
    """
    Salva processo aprovado no seu banco de dados.
    """
    # Exemplo: salvar em PostgreSQL, MongoDB, etc
    db.processos.insert_one({
        "mermaid": processo['mermaid_diagram'],
        "bpmn_xml": processo['bpmn_xml'],
        "summary": processo['summary'],
        "approved_at": datetime.now(),
        "status": "approved"
    })
```

---

## 🔍 ROTINA 2: Análise de Compliance

### Fluxo Completo

```
Processo aprovado (ROTINA 1)
        ↓
Aplicação origem → nprocess API (+ standard)
        ↓
RAG busca regulamentos vetorizados
        ↓
Agente IA analisa → Gaps + Riscos + Score
        ↓
Aplicação origem ← Análise completa
        ↓
Usuário analisa e aprova/reprocessa
        ↓
(Iterativo até conformidade)
        ↓
Aplicação armazena processo adequado
```

### API REST

**Endpoint:** `POST /v1/compliance/analyze`

#### Exemplo: Python

```python
def analisar_compliance(processo_aprovado: dict, standard: str, soa: list = None):
    """
    Analisa processo contra standard (LGPD, ISO27001, etc).

    Args:
        processo_aprovado: Resultado da ROTINA 1
        standard: Standard desejado (ex: "ISO27001", "LGPD", "HIPAA")
        soa: Statement of Applicability (controles aplicáveis)
    """
    response = requests.post(
        f"{API_URL}/v1/compliance/analyze",
        headers={
            "X-API-Key": API_KEY,
            "Content-Type": "application/json"
        },
        json={
            "process_id": "proc_12345",  # Seu ID interno
            "process": {
                "name": "Processo de Aquisição de Material",
                "description": processo_aprovado['summary'],
                "activities": processo_aprovado['metadata']['activities'],
                "actors": processo_aprovado['metadata']['actors'],
                "metadata": {
                    "bpmn_xml": processo_aprovado['bpmn_xml'],
                    "mermaid": processo_aprovado['mermaid_diagram']
                }
            },
            "domain": standard,
            "additional_context": f"SOA aplicável: {soa}" if soa else None
        }
    )

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Erro: {response.status_code} - {response.text}")

# USO:
processo = regularizar_processo("...")  # ROTINA 1
analise = analisar_compliance(
    processo_aprovado=processo,
    standard="ISO27001",
    soa=["A.15.1.1", "A.15.1.2", "A.15.2.1"]  # Opcional
)

print(f"📊 Score de Compliance: {analise['overall_score']}%")
print(f"📝 Resumo: {analise['summary']}")
print(f"\n🔴 Gaps Críticos ({len(analise['gaps'])}):")
for gap in analise['gaps']:
    if gap['severity'] == 'critical':
        print(f"  • {gap['title']}")
        print(f"    {gap['description']}")
        print(f"    Ref: {gap['reference']}\n")

print(f"\n💡 Sugestões ({len(analise['suggestions'])}):")
for sug in analise['suggestions']:
    print(f"  • [{sug['priority']}] {sug['title']}")
    print(f"    {sug['description']}\n")
```

#### Exemplo: Node.js

```javascript
async function analisarCompliance(processoAprovado, standard, soa = null) {
    const response = await axios.post(
        `${API_URL}/v1/compliance/analyze`,
        {
            process_id: "proc_12345",
            process: {
                name: "Processo de Aquisição",
                description: processoAprovado.summary,
                activities: processoAprovado.metadata.activities,
                actors: processoAprovado.metadata.actors,
                metadata: {
                    bpmn_xml: processoAprovado.bpmn_xml,
                    mermaid: processoAprovado.mermaid_diagram
                }
            },
            domain: standard,
            additional_context: soa ? `SOA: ${soa.join(', ')}` : null
        },
        {
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data;
}

// USO:
const processo = await regularizarProcesso("...");
const analise = await analisarCompliance(processo, "ISO27001");

console.log(`📊 Score: ${analise.overall_score}%`);
console.log(`🔴 Gaps: ${analise.gaps.length}`);
console.log(`💡 Sugestões: ${analise.suggestions.length}`);
```

### Resposta Completa

```json
{
  "analysis_id": "ana_xyz789",
  "process_id": "proc_12345",
  "domain": "ISO27001",
  "analyzed_at": "2026-01-05T14:30:00Z",
  "overall_score": 65.5,
  "summary": "O processo atende 65.5% dos requisitos da ISO27001. Identificados 4 gaps (2 críticos, 2 altos) relacionados à gestão de fornecedores e segurança da informação.",
  "gaps": [
    {
      "id": "gap_001",
      "title": "Ausência de Avaliação de Risco de Fornecedor",
      "description": "A ISO27001 (A.15.1.1) exige avaliação formal de riscos de segurança antes de contratar fornecedores. O processo atual não contempla esta etapa.",
      "severity": "critical",
      "reference": "ISO27001:2013 - A.15.1.1 - Information security policy for supplier relationships",
      "affected_activities": ["Aprovação (Gestor)", "Aprovação (Diretoria)"]
    },
    {
      "id": "gap_002",
      "title": "Falta de Due Diligence de Segurança",
      "description": "Não há verificação de conformidade do fornecedor com padrões de segurança da informação.",
      "severity": "critical",
      "reference": "ISO27001:2013 - A.15.1.2 - Addressing security within supplier agreements"
    },
    {
      "id": "gap_003",
      "title": "Ausência de Monitoramento de Fornecedor",
      "description": "Não existe processo de revisão e monitoramento contínuo dos fornecedores.",
      "severity": "high",
      "reference": "ISO27001:2013 - A.15.2.1 - Monitoring and review of supplier services"
    },
    {
      "id": "gap_004",
      "title": "Falta de Controle de Mudanças",
      "description": "Não há registro formal de mudanças nos serviços fornecidos.",
      "severity": "medium",
      "reference": "ISO27001:2013 - A.15.2.2 - Managing changes to supplier services"
    }
  ],
  "suggestions": [
    {
      "id": "sug_001",
      "title": "Adicionar Etapa de Security Assessment",
      "description": "Inserir atividade 'Avaliação de Risco de Segurança' após aprovação do gestor e antes da emissão do pedido.",
      "priority": "high",
      "estimated_effort": "medium",
      "implementation_guide": "1. Criar formulário de avaliação de risco\n2. Definir critérios mínimos de segurança\n3. Treinar equipe de compras\n4. Integrar com sistema de aprovação"
    },
    {
      "id": "sug_002",
      "title": "Implementar Due Diligence de Fornecedores",
      "description": "Criar processo de verificação de certificações e conformidade do fornecedor.",
      "priority": "high",
      "estimated_effort": "high",
      "implementation_guide": "1. Solicitar documentação (ISO27001, SOC2, etc)\n2. Verificar certificações\n3. Avaliar políticas de segurança\n4. Documentar resultados"
    },
    {
      "id": "sug_003",
      "title": "Estabelecer Processo de Monitoramento",
      "description": "Criar rotina periódica de revisão de fornecedores ativos.",
      "priority": "medium",
      "estimated_effort": "medium",
      "implementation_guide": "1. Definir periodicidade (ex: semestral)\n2. Criar checklist de revisão\n3. Automatizar alertas\n4. Documentar não-conformidades"
    }
  ]
}
```

### Standards Disponíveis

| Standard | Código | Descrição |
|----------|--------|-----------|
| LGPD | `LGPD` | Lei Geral de Proteção de Dados (Brasil) |
| GDPR | `GDPR` | General Data Protection Regulation (EU) |
| ISO27001 | `ISO27001` | Segurança da Informação |
| ISO20000 | `ISO20000` | Gestão de Serviços de TI |
| ISO9001 | `ISO9001` | Gestão da Qualidade |
| SOX | `SOX` | Sarbanes-Oxley (Finanças) |
| PCI-DSS | `PCI_DSS` | Payment Card Industry |
| HIPAA | `HIPAA` | Health Insurance Portability |
| NIST | `NIST_CSF` | NIST Cybersecurity Framework |
| CIS | `CIS_CONTROLS` | CIS Controls v8 |
| COBIT | `COBIT` | COBIT 2019 |
| ITIL | `ITIL` | ITIL v4 |
| ANEEL | `ANEEL` | Agência Nacional de Energia Elétrica |
| ONS | `ONS` | Operador Nacional do Sistema Elétrico |
| CVM | `CVM` | Comissão de Valores Mobiliários |

---

## 📄 ROTINA 3: Geração de Documentação

### Fluxo Completo

```
Análise de Compliance (ROTINA 2)
        ↓
Aplicação origem → nprocess API (solicita sugestão de docs)
        ↓
Agente IA analisa gaps → Sugere documentos necessários
        ↓
Usuário aprova documentos
        ↓
Aplicação origem → nprocess API (gera templates)
        ↓
Agente IA gera → Documentos Markdown
        ↓
Aplicação armazena em repositório
```

### API REST

**Endpoints:**
1. `POST /v1/admin/documents/analyze-gaps` - Sugerir documentos
2. `POST /v1/admin/documents/generate-template` - Gerar template

#### Exemplo: Python (Fluxo Completo)

```python
def gerar_documentacao_compliance(analise_compliance: dict):
    """
    Gera documentação completa baseada nos gaps encontrados.
    """
    # 1. SUGERIR DOCUMENTOS NECESSÁRIOS
    print("📋 Analisando gaps e sugerindo documentos...")

    response_gaps = requests.post(
        f"{ADMIN_URL}/v1/admin/documents/analyze-gaps",
        headers={
            "Authorization": f"Bearer {FIREBASE_JWT}",  # Requer auth admin
            "Content-Type": "application/json"
        },
        json={
            "process_description": analise_compliance['summary'],
            "audit_findings": "\n".join([
                f"- {gap['title']}: {gap['description']}"
                for gap in analise_compliance['gaps']
            ])
        }
    )

    sugestoes = response_gaps.json()

    print(f"\n📑 Documentos sugeridos ({len(sugestoes['missing_documents'])}):")
    for doc in sugestoes['missing_documents']:
        print(f"  • {doc['name']} ({doc['type']})")
        print(f"    Razão: {doc['reason']}\n")

    # 2. USUÁRIO APROVA QUAIS DOCUMENTOS GERAR
    docs_aprovados = input("✅ Digite os números dos docs a gerar (ex: 1,2,3) ou 'todos': ")

    if docs_aprovados.lower() == 'todos':
        docs_para_gerar = sugestoes['missing_documents']
    else:
        indices = [int(i.strip())-1 for i in docs_aprovados.split(',')]
        docs_para_gerar = [sugestoes['missing_documents'][i] for i in indices]

    # 3. GERAR TEMPLATES MARKDOWN
    documentos_gerados = []

    for doc in docs_para_gerar:
        print(f"\n📝 Gerando: {doc['name']}...")

        response_gen = requests.post(
            f"{ADMIN_URL}/v1/admin/documents/generate-template",
            headers={
                "Authorization": f"Bearer {FIREBASE_JWT}",
                "Content-Type": "application/json"
            },
            json={
                "document_type": doc['name'],
                "context": f"Processo: {analise_compliance['summary']}\nStandard: {analise_compliance['domain']}\nGaps: {doc['reason']}"
            }
        )

        markdown_content = response_gen.json()['content']

        # 4. SALVAR EM REPOSITÓRIO
        filename = doc['name'].lower().replace(' ', '_') + '.md'
        filepath = f"./compliance_docs/{filename}"

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(markdown_content)

        documentos_gerados.append({
            'name': doc['name'],
            'path': filepath,
            'content': markdown_content
        })

        print(f"  ✅ Salvo em: {filepath}")

    return documentos_gerados

# USO COMPLETO (3 ROTINAS):
# 1. Regularizar processo
processo = regularizar_processo("Para comprar material...")

# 2. Analisar compliance
analise = analisar_compliance(processo, "ISO27001")

# 3. Gerar documentação
docs = gerar_documentacao_compliance(analise)

print(f"\n✅ Documentação gerada: {len(docs)} arquivos")
```

#### Exemplo: Node.js

```javascript
async function gerarDocumentacao(analiseCompliance) {
    // 1. Sugerir documentos
    const responseSugestoes = await axios.post(
        `${ADMIN_URL}/v1/admin/documents/analyze-gaps`,
        {
            process_description: analiseCompliance.summary,
            audit_findings: analiseCompliance.gaps.map(g =>
                `- ${g.title}: ${g.description}`
            ).join('\n')
        },
        {
            headers: {
                'Authorization': `Bearer ${FIREBASE_JWT}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const sugestoes = responseSugestoes.data;

    // 2. Gerar templates
    const documentos = [];

    for (const doc of sugestoes.missing_documents) {
        const responseTemplate = await axios.post(
            `${ADMIN_URL}/v1/admin/documents/generate-template`,
            {
                document_type: doc.name,
                context: `Processo: ${analiseCompliance.summary}\nGaps: ${doc.reason}`
            },
            {
                headers: {
                    'Authorization': `Bearer ${FIREBASE_JWT}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const markdown = responseTemplate.data.content;
        const filename = `${doc.name.toLowerCase().replace(/\s+/g, '_')}.md`;

        // Salvar arquivo
        fs.writeFileSync(`./compliance_docs/${filename}`, markdown);

        documentos.push({ name: doc.name, path: filename });
    }

    return documentos;
}
```

### Resposta: Análise de Gaps

```json
{
  "missing_documents": [
    {
      "name": "Vendor Risk Assessment Form",
      "type": "Form",
      "reason": "Required by ISO27001 A.15.1.1 - Formal risk assessment before engaging suppliers"
    },
    {
      "name": "Vendor Security Questionnaire",
      "type": "Questionnaire",
      "reason": "ISO27001 A.15.1.2 - Assess supplier's information security controls"
    },
    {
      "name": "Third-Party Risk Management Policy",
      "type": "Policy",
      "reason": "ISO27001 A.15 - Governance document for supplier risk management"
    },
    {
      "name": "Supplier Monitoring Checklist",
      "type": "Checklist",
      "reason": "ISO27001 A.15.2.1 - Periodic review and monitoring of suppliers"
    }
  ],
  "existing_documents_suggestions": [
    "Vendor Contract Template",
    "Purchase Order Form"
  ]
}
```

### Resposta: Template Gerado (Markdown)

```markdown
# Vendor Risk Assessment Form

**Document Version:** 1.0
**Effective Date:** 2026-01-05
**Standard:** ISO27001:2013
**Control:** A.15.1.1 - Information security policy for supplier relationships

---

## 1. Vendor Information

| Field | Value |
|-------|-------|
| **Vendor Name** | [VENDOR_NAME] |
| **Contact Person** | [CONTACT_NAME] |
| **Email** | [EMAIL] |
| **Phone** | [PHONE] |
| **Service/Product** | [DESCRIPTION] |
| **Contract Value** | R$ [VALUE] |
| **Contract Duration** | [START_DATE] to [END_DATE] |

---

## 2. Information Security Assessment

### 2.1 Certifications

Does the vendor hold any of the following certifications?

- [ ] ISO27001 (Information Security)
- [ ] SOC2 Type II
- [ ] PCI-DSS (if handling payment data)
- [ ] LGPD Compliance Program
- [ ] Other: [SPECIFY]

**Upload certificates:** [ATTACHMENT]

### 2.2 Data Protection

| Question | Response |
|----------|----------|
| Will the vendor process personal data? | [ ] Yes [ ] No |
| Data classification (Public/Internal/Confidential/Restricted): | [CLASSIFICATION] |
| Data storage location: | [LOCATION] |
| Data encryption in transit? | [ ] Yes [ ] No |
| Data encryption at rest? | [ ] Yes [ ] No |
| LGPD/GDPR compliance status: | [ ] Compliant [ ] Partial [ ] Non-compliant |

### 2.3 Security Controls

Rate the following controls (1=Poor, 5=Excellent):

- Access Control: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
- Incident Response: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
- Business Continuity: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
- Vulnerability Management: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]
- Security Awareness Training: [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]

---

## 3. Risk Analysis

### 3.1 Identified Risks

| Risk ID | Description | Likelihood | Impact | Severity |
|---------|-------------|------------|--------|----------|
| R-001 | [DESCRIPTION] | [L/M/H] | [L/M/H] | [L/M/H/C] |
| R-002 | [DESCRIPTION] | [L/M/H] | [L/M/H] | [L/M/H/C] |

### 3.2 Mitigation Measures

| Risk ID | Mitigation | Owner | Due Date |
|---------|------------|-------|----------|
| R-001 | [ACTION] | [NAME] | [DATE] |

---

## 4. Overall Risk Rating

**Risk Score:** [LOW / MEDIUM / HIGH / CRITICAL]

**Justification:** [DETAILED_REASONING]

**Recommendation:**
- [ ] Approve - Low risk
- [ ] Approve with conditions - Medium risk (mitigation plan required)
- [ ] Reject - High/Critical risk
- [ ] Request additional information

---

## 5. Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Assessed by** | [SECURITY_ANALYST] | ____________ | [DATE] |
| **Reviewed by** | [SECURITY_MANAGER] | ____________ | [DATE] |
| **Approved by** | [CISO/DIRECTOR] | ____________ | [DATE] |

---

**Generated by:** n.process v2.0
**Compliance Framework:** ISO27001:2013
**Document ID:** VRA-[VENDOR_ID]-[YYYY-MM-DD]
```

---

## 🔌 Integração via MCP

### O que é MCP?

**MCP (Model Context Protocol)** é um protocolo que permite que agentes de IA (como Claude, Cursor) consumam APIs de forma nativa.

### MCP Tools Disponíveis

| Tool | Equivalente API | Descrição |
|------|-----------------|-----------|
| `normalize_process_workflow` | `POST /v1/modeling/generate` | ROTINA 1 - Regularização BPMN |
| `audit_workflow_compliance` | `POST /v1/compliance/analyze` | ROTINA 2 - Análise de compliance |
| `suggest_compliance_documents` | `POST /v1/admin/documents/analyze-gaps` | ROTINA 3 - Sugerir docs |
| `generate_document_template` | `POST /v1/admin/documents/generate-template` | ROTINA 3 - Gerar template |

### Setup: Claude Desktop

**Arquivo:** `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) ou `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "nprocess": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-http-gateway",
        "http://localhost:8008/mcp"
      ],
      "env": {
        "NPROCESS_API_KEY": "nprc_live_Xk9p2Qs8vF3mN7hR4tY6wZ1cB5dE0aG8"
      }
    }
  }
}
```

### Setup: Cursor / Vibe Code

**Arquivo:** `.mcp/config.json` (raiz do projeto)

```json
{
  "servers": {
    "nprocess": {
      "url": "http://localhost:8008/mcp",
      "apiKey": "nprc_live_Xk9p2Qs8vF3mN7hR4tY6wZ1cB5dE0aG8"
    }
  }
}
```

### Uso no Cursor / Vibe Code

**Exemplo de conversa:**

```
Você (no Cursor): @nprocess Regularize este processo:
"Para aprovar uma despesa: funcionário solicita, gestor analisa,
se > R$5k vai para diretoria, após aprovado vai para financeiro emitir pagamento"

Claude (via MCP):
Vou processar esse fluxo usando a ferramenta normalize_process_workflow...

[Usa o tool normalize_process_workflow internamente]

✅ Processo regularizado:

📊 Diagrama Mermaid:
graph TD
    Start[Início] --> A[Funcionário solicita despesa]
    A --> B[Gestor analisa]
    B --> C{Valor > R$ 5.000?}
    C -->|Sim| D[Diretoria aprova]
    C -->|Não| E[Aprovado]
    D --> E
    E --> F[Financeiro emite pagamento]
    F --> End[Fim]

📝 Resumo: Processo de aprovação de despesas com 2 níveis (gestor + diretoria
para valores > R$5k). 3 atores envolvidos: Funcionário, Gestor, Diretoria e Financeiro.

---

Você: Agora analise este processo contra ISO27001

Claude (via MCP):
Vou analisar usando audit_workflow_compliance...

[Usa o tool audit_workflow_compliance internamente]

📊 Score de Compliance: 68%

🔴 Gaps críticos encontrados:
1. Ausência de controle de segregação de funções (A.6.1.2)
2. Falta de registro de auditoria (A.12.4.1)
...
```

### Exemplo: Script Python Usando MCP Client

```python
from mcp import Client

async def usar_nprocess_via_mcp():
    # Conectar ao MCP server
    client = Client("http://localhost:8008/mcp")

    # ROTINA 1: Regularizar processo
    resultado = await client.call_tool(
        "normalize_process_workflow",
        description="Para aprovar despesa: funcionário solicita, gestor aprova..."
    )

    processo = json.loads(resultado)
    print(f"✅ Processo regularizado: {processo['summary']}")

    # ROTINA 2: Analisar compliance
    analise = await client.call_tool(
        "audit_workflow_compliance",
        process_text=processo['summary'],
        regulation="ISO27001"
    )

    analise_data = json.loads(analise)
    print(f"📊 Score: {analise_data['overall_score']}%")

    # ROTINA 3: Sugerir documentos
    docs = await client.call_tool(
        "suggest_compliance_documents",
        process_description=processo['summary'],
        audit_findings=json.dumps(analise_data['gaps'])
    )

    docs_data = json.loads(docs)
    print(f"📑 Documentos sugeridos: {len(docs_data['missing_documents'])}")

# Executar
import asyncio
asyncio.run(usar_nprocess_via_mcp())
```

---

## 💻 Exemplos Práticos

### Exemplo 1: Integração Completa em Python

```python
"""
Exemplo completo: Regularização + Compliance + Documentação
"""
import requests
import json
import os
from datetime import datetime

class NProcessClient:
    def __init__(self, api_key: str):
        self.api_url = "https://nprocess-api-dev-XXXXX.run.app"
        self.admin_url = "https://nprocess-admin-api-dev-XXXXX.run.app"
        self.api_key = api_key
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }

    def regularizar_processo(self, descricao: str, contexto: dict = None):
        """ROTINA 1"""
        response = requests.post(
            f"{self.api_url}/v1/modeling/generate",
            headers=self.headers,
            json={"description": descricao, "context": contexto or {}}
        )
        response.raise_for_status()
        return response.json()

    def analisar_compliance(self, processo: dict, standard: str, soa: list = None):
        """ROTINA 2"""
        payload = {
            "process_id": f"proc_{datetime.now().timestamp()}",
            "process": {
                "name": "Processo automatizado",
                "description": processo['summary'],
                "activities": processo['metadata']['activities'],
                "actors": processo['metadata']['actors'],
                "metadata": {
                    "bpmn_xml": processo['bpmn_xml'],
                    "mermaid": processo['mermaid_diagram']
                }
            },
            "domain": standard,
            "additional_context": f"SOA: {soa}" if soa else None
        }

        response = requests.post(
            f"{self.api_url}/v1/compliance/analyze",
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()

    def sugerir_documentos(self, analise: dict, jwt_token: str):
        """ROTINA 3 - Parte 1"""
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Content-Type": "application/json"
        }

        payload = {
            "process_description": analise['summary'],
            "audit_findings": "\n".join([
                f"- {gap['title']}: {gap['description']}"
                for gap in analise['gaps']
            ])
        }

        response = requests.post(
            f"{self.admin_url}/v1/admin/documents/analyze-gaps",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()

    def gerar_template(self, doc_name: str, contexto: str, jwt_token: str):
        """ROTINA 3 - Parte 2"""
        headers = {
            "Authorization": f"Bearer {jwt_token}",
            "Content-Type": "application/json"
        }

        response = requests.post(
            f"{self.admin_url}/v1/admin/documents/generate-template",
            headers=headers,
            json={"document_type": doc_name, "context": contexto}
        )
        response.raise_for_status()
        return response.json()['content']

# USO:
if __name__ == "__main__":
    client = NProcessClient(api_key=os.getenv("NPROCESS_API_KEY"))

    # 1. Regularizar processo
    print("1️⃣ Regularizando processo...")
    processo = client.regularizar_processo(
        descricao="""
        Para onboarding de fornecedor:
        1. Fornecedor preenche cadastro
        2. Compras valida documentação
        3. Jurídico aprova contrato
        4. Financeiro analisa crédito
        5. Diretoria aprova se valor > R$ 100k
        6. TI cadastra no ERP
        """,
        contexto={"domain": "procurement", "company": "Acme Corp"}
    )
    print(f"✅ {processo['summary']}")

    # 2. Analisar compliance
    print("\n2️⃣ Analisando compliance ISO27001...")
    analise = client.analisar_compliance(processo, "ISO27001")
    print(f"📊 Score: {analise['overall_score']}%")
    print(f"🔴 Gaps: {len(analise['gaps'])}")

    # 3. Gerar documentação
    print("\n3️⃣ Gerando documentação...")
    jwt = os.getenv("FIREBASE_JWT")
    docs_sugeridos = client.sugerir_documentos(analise, jwt)

    for i, doc in enumerate(docs_sugeridos['missing_documents'][:2], 1):  # Primeiros 2
        print(f"\n📝 Gerando: {doc['name']}...")
        markdown = client.gerar_template(
            doc_name=doc['name'],
            contexto=f"Processo: Onboarding de fornecedor\nStandard: ISO27001\nGaps: {doc['reason']}",
            jwt_token=jwt
        )

        filename = f"./docs/{doc['name'].replace(' ', '_').lower()}.md"
        with open(filename, 'w') as f:
            f.write(markdown)
        print(f"✅ Salvo: {filename}")

    print("\n✅ Processo completo finalizado!")
```

### Exemplo 2: Integração em Node.js/TypeScript

```typescript
// nprocess-client.ts
import axios, { AxiosInstance } from 'axios';

interface ProcessResult {
    mermaid_diagram: string;
    bpmn_xml: string;
    summary: string;
    metadata: {
        activities: string[];
        actors: string[];
        gateways: number;
    };
}

interface ComplianceAnalysis {
    analysis_id: string;
    overall_score: number;
    summary: string;
    gaps: Array<{
        id: string;
        title: string;
        description: string;
        severity: string;
        reference: string;
    }>;
    suggestions: Array<any>;
}

class NProcessClient {
    private apiClient: AxiosInstance;
    private adminClient: AxiosInstance;

    constructor(apiKey: string, jwtToken?: string) {
        this.apiClient = axios.create({
            baseURL: 'https://nprocess-api-dev-XXXXX.run.app',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        this.adminClient = axios.create({
            baseURL: 'https://nprocess-admin-api-dev-XXXXX.run.app',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async regularizarProcesso(descricao: string, contexto?: any): Promise<ProcessResult> {
        const response = await this.apiClient.post('/v1/modeling/generate', {
            description: descricao,
            context: contexto || {}
        });
        return response.data;
    }

    async analisarCompliance(processo: ProcessResult, standard: string): Promise<ComplianceAnalysis> {
        const response = await this.apiClient.post('/v1/compliance/analyze', {
            process_id: `proc_${Date.now()}`,
            process: {
                name: 'Processo automatizado',
                description: processo.summary,
                activities: processo.metadata.activities,
                actors: processo.metadata.actors,
                metadata: {
                    bpmn_xml: processo.bpmn_xml,
                    mermaid: processo.mermaid_diagram
                }
            },
            domain: standard
        });
        return response.data;
    }

    async gerarDocumentacao(analise: ComplianceAnalysis) {
        const { data: sugestoes } = await this.adminClient.post('/v1/admin/documents/analyze-gaps', {
            process_description: analise.summary,
            audit_findings: analise.gaps.map(g => `- ${g.title}: ${g.description}`).join('\n')
        });

        const documentos = [];

        for (const doc of sugestoes.missing_documents.slice(0, 3)) {
            const { data } = await this.adminClient.post('/v1/admin/documents/generate-template', {
                document_type: doc.name,
                context: `Processo: ${analise.summary}\nGaps: ${doc.reason}`
            });

            documentos.push({
                name: doc.name,
                content: data.content
            });
        }

        return documentos;
    }
}

// USO:
async function main() {
    const client = new NProcessClient(
        process.env.NPROCESS_API_KEY!,
        process.env.FIREBASE_JWT
    );

    // Fluxo completo
    const processo = await client.regularizarProcesso(
        "Para onboarding: fornecedor cadastra, compras valida, jurídico aprova..."
    );
    console.log(`✅ Processo: ${processo.summary}`);

    const analise = await client.analisarCompliance(processo, 'ISO27001');
    console.log(`📊 Score: ${analise.overall_score}%`);

    const docs = await client.gerarDocumentacao(analise);
    console.log(`📄 Documentos: ${docs.length}`);
}

main().catch(console.error);
```

### Exemplo 3: Webhook para Processar em Background

```python
"""
Exemplo: Processar via webhook assíncrono
"""
from flask import Flask, request, jsonify
from celery import Celery
import requests

app = Flask(__name__)
celery = Celery('tasks', broker='redis://localhost:6379')

@celery.task
def processar_completo(descricao, standard, callback_url):
    """
    Task assíncrona: Executa 3 rotinas e retorna via callback
    """
    client = NProcessClient(api_key=os.getenv("NPROCESS_API_KEY"))

    try:
        # ROTINA 1
        processo = client.regularizar_processo(descricao)

        # ROTINA 2
        analise = client.analisar_compliance(processo, standard)

        # ROTINA 3
        jwt = os.getenv("FIREBASE_JWT")
        docs = client.sugerir_documentos(analise, jwt)

        # Retornar via callback
        requests.post(callback_url, json={
            "status": "success",
            "processo": processo,
            "analise": analise,
            "documentos_sugeridos": docs
        })

    except Exception as e:
        requests.post(callback_url, json={
            "status": "error",
            "message": str(e)
        })

@app.route('/api/processar-async', methods=['POST'])
def processar_async():
    """
    Endpoint que recebe requisição e processa em background
    """
    data = request.json

    # Disparar task assíncrona
    task = processar_completo.delay(
        descricao=data['descricao'],
        standard=data['standard'],
        callback_url=data['callback_url']
    )

    return jsonify({
        "task_id": task.id,
        "status": "processing"
    })

if __name__ == '__main__':
    app.run(debug=True)
```

---

## 🔧 Troubleshooting

### Erro: 401 Unauthorized

```json
{"error": "Unauthorized", "message": "Invalid API Key"}
```

**Solução:**
- Verifique se o header `X-API-Key` está presente
- Confirme que a chave não expirou: `GET /v1/admin/apikeys/{key_id}`
- Regenere a chave se necessário

### Erro: 422 Unprocessable Entity

```json
{"error": "ValidationError", "message": "description field is required"}
```

**Solução:**
- Verifique o schema da requisição
- Campos obrigatórios:
  - ROTINA 1: `description`
  - ROTINA 2: `process`, `domain`
  - ROTINA 3: `process_description`, `document_type`

### Erro: 429 Too Many Requests

```json
{"error": "RateLimitExceeded", "message": "Quota exceeded"}
```

**Solução:**
- Aguarde 1 minuto (quota por minuto)
- Ou aumente quotas via `PATCH /v1/admin/apikeys/{key_id}`

### Erro: 500 Internal Server Error

```json
{"error": "InternalServerError", "message": "AI service unavailable"}
```

**Solução:**
- Verifique status do serviço: `GET /health`
- Retry com backoff exponencial (2s, 4s, 8s)
- Contate suporte se persistir

### MCP: Connection Refused

**Solução:**
1. Verifique se o servidor MCP está rodando: `curl http://localhost:8008/health`
2. Confirme a configuração do `claude_desktop_config.json`
3. Reinicie o Claude Desktop / Cursor

---

## 📞 Suporte

**Documentação completa:** `/docs` (Swagger UI)
**Health check:** `GET /health`
**Versão:** `GET /` → `{"service": "n.process engine", "version": "2.0.0"}`

---

**Última atualização:** 2026-01-05
**Versão do guia:** 1.0
