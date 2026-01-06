# ComplianceEngine API - Manual de Integração

## 🎯 Propósito

O **ComplianceEngine API** é um **microsserviço especializado** projetado para ser **integrado em outras aplicações** que precisam de:

- **Mapeamento de Processos**: Converter descrições textuais de processos de negócio em diagramas BPMN estruturados
- **Análise de Compliance**: Identificar automaticamente gaps de conformidade regulatória (LGPD, SOX, GDPR, etc.) em processos
- **Gestão de Processos**: Armazenar e gerenciar processos validados para auditoria e compliance

### Casos de Uso de Integração

Esta API foi projetada para ser consumida por:

- **Sistemas ERP/CRM**: Adicionar análise de compliance aos processos internos
- **Plataformas de Gestão de Processos**: Enriquecer processos com análise automática de conformidade
- **Ferramentas de Auditoria**: Gerar relatórios de compliance automaticamente
- **Aplicações de Governança**: Monitorar conformidade regulatória em tempo real
- **Sistemas de Documentação**: Gerar diagramas BPMN a partir de documentação textual

---

## 🚀 Início Rápido

### 1. Obter URL da API

A API pode estar rodando em:
- **Local**: `http://localhost:8080`
- **Cloud Run (Produção)**: `https://compliance-engine-xxxxx-uc.a.run.app`

### 2. Verificar Saúde da API

```bash
curl https://sua-api-url.com/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "service": "ComplianceEngine API",
  "version": "1.0.0"
}
```

### 3. Acessar Documentação e Prompts

A API expõe documentação diretamente através de endpoints:

```bash
# Listar documentação disponível
curl https://sua-api-url.com/v1/docs

# Obter exemplos de prompts (Cursor, Claude Code, Antigravity)
curl https://sua-api-url.com/v1/docs/prompts

# Obter manual de integração completo
curl https://sua-api-url.com/v1/docs/integration
```

Os prompts e documentação estão disponíveis diretamente na API, facilitando o acesso durante o desenvolvimento!

### 3. Primeira Integração

```python
import httpx

API_URL = "https://sua-api-url.com"

# Verificar saúde
response = httpx.get(f"{API_URL}/health")
print(response.json())
```

---

## 📚 Guia de Integração por Linguagem

### Python

#### Instalação

```bash
pip install httpx
```

#### Cliente Básico

```python
import httpx
import asyncio

class ComplianceEngineClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.client = httpx.AsyncClient(timeout=120.0)
    
    async def generate_diagram(self, description: str, context: str = None):
        """Gera diagrama BPMN a partir de descrição."""
        response = await self.client.post(
            f"{self.base_url}/v1/diagrams/generate",
            json={
                "description": description,
                "context": context
            }
        )
        response.raise_for_status()
        return response.json()
    
    async def create_process(self, process_data: dict):
        """Cria processo no Firestore."""
        response = await self.client.post(
            f"{self.base_url}/v1/processes",
            json=process_data
        )
        response.raise_for_status()
        return response.json()
    
    async def analyze_compliance(self, process_id: str, domain: str, context: str = None):
        """Analisa compliance de um processo."""
        response = await self.client.post(
            f"{self.base_url}/v1/compliance/analyze",
            json={
                "process_id": process_id,
                "domain": domain,
                "additional_context": context
            }
        )
        response.raise_for_status()
        return response.json()
    
    async def get_process(self, process_id: str):
        """Recupera processo por ID."""
        response = await self.client.get(
            f"{self.base_url}/v1/processes/{process_id}"
        )
        response.raise_for_status()
        return response.json()
    
    async def close(self):
        """Fecha o cliente."""
        await self.client.aclose()

# Exemplo de uso
async def main():
    client = ComplianceEngineClient("https://sua-api-url.com")
    
    # Gerar diagrama
    diagram = await client.generate_diagram(
        description="Processo de aprovação de compras...",
        context="Departamento financeiro"
    )
    
    # Criar processo
    process = await client.create_process({
        "name": "Aprovação de Compras",
        "description": diagram["normalized_text"],
        "domain": "financeiro",
        "mermaid_code": diagram["mermaid_code"],
        "nodes": [],
        "flows": [],
        "metadata": {}
    })
    
    # Analisar compliance
    analysis = await client.analyze_compliance(
        process_id=process["process_id"],
        domain="LGPD"
    )
    
    print(f"Score de Compliance: {analysis['overall_score']}/100")
    
    await client.close()

# Executar
asyncio.run(main())
```

### JavaScript/TypeScript (Node.js)

#### Instalação

```bash
npm install axios
# ou
yarn add axios
```

#### Cliente Básico

```javascript
const axios = require('axios');

class ComplianceEngineClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 120000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async generateDiagram(description, context = null) {
        const response = await this.client.post('/v1/diagrams/generate', {
            description,
            context
        });
        return response.data;
    }

    async createProcess(processData) {
        const response = await this.client.post('/v1/processes', processData);
        return response.data;
    }

    async analyzeCompliance(processId, domain, additionalContext = null) {
        const response = await this.client.post('/v1/compliance/analyze', {
            process_id: processId,
            domain,
            additional_context: additionalContext
        });
        return response.data;
    }

    async getProcess(processId) {
        const response = await this.client.get(`/v1/processes/${processId}`);
        return response.data;
    }
}

// Exemplo de uso
async function exemplo() {
    const client = new ComplianceEngineClient('https://sua-api-url.com');
    
    const diagram = await client.generateDiagram(
        'Processo de aprovação de compras...',
        'Departamento financeiro'
    );
    
    console.log('Diagrama gerado:', diagram.mermaid_code);
}

exemplo().catch(console.error);
```

### cURL (Shell Scripts)

```bash
#!/bin/bash

API_URL="https://sua-api-url.com"

# Gerar diagrama
generate_diagram() {
    local description="$1"
    local context="$2"
    
    curl -X POST "${API_URL}/v1/diagrams/generate" \
        -H "Content-Type: application/json" \
        -d "{
            \"description\": \"${description}\",
            \"context\": \"${context}\"
        }"
}

# Criar processo
create_process() {
    local process_data="$1"
    
    curl -X POST "${API_URL}/v1/processes" \
        -H "Content-Type: application/json" \
        -d "${process_data}"
}

# Analisar compliance
analyze_compliance() {
    local process_id="$1"
    local domain="$2"
    
    curl -X POST "${API_URL}/v1/compliance/analyze" \
        -H "Content-Type: application/json" \
        -d "{
            \"process_id\": \"${process_id}\",
            \"domain\": \"${domain}\"
        }"
}

# Exemplo de uso
DIAGRAM=$(generate_diagram "Processo de aprovação..." "Financeiro")
echo "$DIAGRAM"
```

---

## 🔄 Fluxos de Integração Comuns

### Fluxo 1: Mapeamento Rápido de Processo

Use quando você tem apenas uma descrição textual e precisa de um diagrama:

```python
# 1. Enviar descrição
diagram = await client.generate_diagram(
    description="Seu processo aqui...",
    context="Contexto adicional"
)

# 2. Usar o código Mermaid.js
mermaid_code = diagram["mermaid_code"]

# 3. Renderizar no seu frontend
# - Mermaid.js library
# - Mermaid Live Editor
# - Exportar como imagem
```

### Fluxo 2: Análise Completa de Compliance

Use quando você precisa de análise completa com persistência:

```python
# 1. Gerar diagrama
diagram = await client.generate_diagram(description, context)

# 2. Criar processo estruturado
process = await client.create_process({
    "name": "Nome do Processo",
    "description": diagram["normalized_text"],
    "domain": "LGPD",  # ou SOX, GDPR, etc.
    "mermaid_code": diagram["mermaid_code"],
    "nodes": [...],  # Estrutura do processo
    "flows": [...],
    "metadata": {}
})

# 3. Analisar compliance
analysis = await client.analyze_compliance(
    process_id=process["process_id"],
    domain="LGPD",
    additional_context="Contexto adicional"
)

# 4. Usar resultados
score = analysis["overall_score"]
gaps = analysis["gaps"]
suggestions = analysis["suggestions"]

# 5. Gerar relatório na sua aplicação
generate_compliance_report(analysis)
```

### Fluxo 3: Integração com Processo Existente

Use quando você já tem um processo mapeado e só precisa de análise:

```python
# 1. Criar processo com dados existentes
process = await client.create_process(existing_process_data)

# 2. Analisar compliance
analysis = await client.analyze_compliance(
    process_id=process["process_id"],
    domain="LGPD"
)

# 3. Atualizar seu sistema com resultados
update_system_with_compliance(analysis)
```

---

## 🔌 Padrões de Integração

### 1. Integração Síncrona (Request/Response)

Ideal para: Operações rápidas, feedback imediato ao usuário

```python
# Sua aplicação faz requisição e espera resposta
diagram = await client.generate_diagram(description)
# Usa resultado imediatamente
display_diagram(diagram["mermaid_code"])
```

### 2. Integração Assíncrona (Webhook)

Ideal para: Operações longas, não bloquear interface

```python
# Sua aplicação inicia análise
analysis = await client.analyze_compliance(process_id, domain)

# API retorna imediatamente com analysis_id
# Você pode:
# - Polling: Verificar status periodicamente
# - Webhook: Receber callback quando pronto (futuro)
```

### 3. Integração em Lote

Ideal para: Processar múltiplos processos

```python
processes = get_all_processes_from_your_system()

for process in processes:
    try:
        # Criar no ComplianceEngine
        created = await client.create_process(process)
        
        # Analisar
        analysis = await client.analyze_compliance(
            created["process_id"],
            domain="LGPD"
        )
        
        # Salvar resultado no seu sistema
        save_analysis_to_your_db(analysis)
        
    except Exception as e:
        log_error(f"Erro ao processar {process['name']}: {e}")
```

---

## 📊 Estrutura de Dados

### Request: Gerar Diagrama

```json
{
  "description": "string (10-10000 caracteres)",
  "context": "string (opcional, até 5000 caracteres)"
}
```

### Response: Diagrama Gerado

```json
{
  "normalized_text": "string",
  "mermaid_code": "string",
  "metadata": {
    "actors": ["string"],
    "activities_count": 0,
    "decision_points": 0
  }
}
```

### Request: Criar Processo

```json
{
  "name": "string",
  "description": "string",
  "domain": "string",
  "mermaid_code": "string",
  "nodes": [
    {
      "id": "string",
      "type": "task|event|gateway",
      "label": "string",
      "properties": {}
    }
  ],
  "flows": [
    {
      "from_node": "string",
      "to_node": "string",
      "label": "string (opcional)"
    }
  ],
  "metadata": {}
}
```

### Response: Processo Criado

```json
{
  "process_id": "string",
  "created_at": "2025-12-22T10:30:00Z",
  "message": "Processo criado com sucesso"
}
```

### Request: Analisar Compliance

```json
{
  "process_id": "string",
  "domain": "LGPD|SOX|GDPR|...",
  "additional_context": "string (opcional)"
}
```

### Response: Análise de Compliance

```json
{
  "analysis_id": "string",
  "process_id": "string",
  "domain": "string",
  "analyzed_at": "2025-12-22T10:35:00Z",
  "overall_score": 65.5,
  "summary": "string",
  "gaps": [
    {
      "gap_id": "string",
      "severity": "high|medium|low",
      "regulation": "string",
      "article": "string",
      "description": "string",
      "affected_nodes": ["string"],
      "recommendation": "string"
    }
  ],
  "suggestions": [
    {
      "suggestion_id": "string",
      "type": "string",
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "estimated_effort": "string"
    }
  ]
}
```

---

## ⚠️ Tratamento de Erros

### Códigos HTTP

- `200 OK`: Sucesso
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos na requisição
- `404 Not Found`: Recurso não encontrado
- `422 Unprocessable Entity`: Validação falhou
- `500 Internal Server Error`: Erro interno do servidor

### Estrutura de Erro

```json
{
  "error": "ErrorType",
  "message": "Mensagem de erro descritiva",
  "details": {
    "status_code": 422,
    "field": "description",
    "issue": "Campo obrigatório ausente"
  }
}
```

### Exemplo de Tratamento

```python
try:
    diagram = await client.generate_diagram(description)
except httpx.HTTPStatusError as e:
    if e.response.status_code == 422:
        errors = e.response.json()
        print(f"Erro de validação: {errors['message']}")
    elif e.response.status_code == 500:
        print("Erro interno do servidor. Tente novamente.")
    else:
        print(f"Erro: {e}")
except httpx.RequestError as e:
    print(f"Erro de conexão: {e}")
```

---

## 🔒 Autenticação e Segurança

### Estado Atual

A API atualmente aceita requisições sem autenticação (desenvolvimento).

### Futuro (Planejado)

```python
# Autenticação via Bearer Token
headers = {
    "Authorization": "Bearer seu-token-aqui"
}

response = await client.post(
    f"{API_URL}/v1/diagrams/generate",
    json=payload,
    headers=headers
)
```

### Recomendações para Produção

1. **Use HTTPS**: Sempre use URLs `https://` em produção
2. **Rate Limiting**: Implemente rate limiting no seu cliente
3. **Retry Logic**: Implemente retry com backoff exponencial
4. **Timeout**: Configure timeouts apropriados (120s para análise)

---

## 🎨 Renderizando Diagramas Mermaid

### Frontend (JavaScript)

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
</head>
<body>
    <div class="mermaid" id="diagram">
        <!-- Código Mermaid será inserido aqui -->
    </div>
    
    <script>
        mermaid.initialize({ startOnLoad: true });
        
        // Após receber resposta da API
        const mermaidCode = "graph TD\n  A[Início] --> B[Processo]";
        document.getElementById('diagram').innerHTML = mermaidCode;
        mermaid.init(undefined, document.getElementById('diagram'));
    </script>
</body>
</html>
```

### React

```jsx
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

function MermaidDiagram({ code }) {
    const ref = useRef(null);
    
    useEffect(() => {
        if (ref.current && code) {
            mermaid.initialize({ startOnLoad: true });
            mermaid.contentLoaded();
            ref.current.innerHTML = code;
        }
    }, [code]);
    
    return <div ref={ref} className="mermaid" />;
}
```

### Exportar como Imagem

```python
# Usar Mermaid CLI ou API de renderização
# Exemplo com mermaid.ink
import requests

mermaid_code = diagram["mermaid_code"]
encoded = base64.b64encode(mermaid_code.encode()).decode()
image_url = f"https://mermaid.ink/img/{encoded}"

# Baixar imagem
response = requests.get(image_url)
with open("diagram.png", "wb") as f:
    f.write(response.content)
```

---

## 📈 Performance e Limites

### Timeouts Recomendados

- **Geração de Diagrama**: 30-60 segundos
- **Criação de Processo**: 5-10 segundos
- **Análise de Compliance**: 60-120 segundos

### Rate Limiting

Atualmente não há rate limiting, mas recomenda-se:
- Máximo 10 requisições/segundo por cliente
- Implementar retry com backoff exponencial

### Tamanhos Máximos

- **Description**: 10.000 caracteres
- **Context**: 5.000 caracteres
- **Process Nodes**: Sem limite prático (mas recomendado < 100)

---

## 🧪 Testes de Integração

### Exemplo de Teste

```python
import pytest
from your_app.integration import ComplianceEngineClient

@pytest.mark.asyncio
async def test_integration():
    client = ComplianceEngineClient("http://localhost:8080")
    
    # Teste de geração
    diagram = await client.generate_diagram(
        "Processo simples: A -> B -> C"
    )
    assert "mermaid_code" in diagram
    assert len(diagram["mermaid_code"]) > 0
    
    # Teste de criação
    process = await client.create_process({
        "name": "Test Process",
        "description": "Test",
        "domain": "test",
        "mermaid_code": "graph TD\n  A --> B",
        "nodes": [],
        "flows": [],
        "metadata": {}
    })
    assert "process_id" in process
    
    await client.close()
```

---

## 📞 Suporte e Recursos

### Documentação Interativa

Acesse a documentação Swagger da API:
- **Local**: `http://localhost:8080/docs`
- **Produção**: `https://sua-api-url.com/docs`

### Exemplos Completos

Veja exemplos práticos em:
- `examples/01_generate_diagram.py`
- `examples/02_create_and_analyze_process.py`

### Contato

Para dúvidas sobre integração, consulte:
- README.md principal
- Documentação da API em `/docs`
- Issues no repositório

---

## 🚀 Próximos Passos

1. **Implementar autenticação** (JWT/OAuth2)
2. **Webhooks** para notificações assíncronas
3. **SDK oficial** em múltiplas linguagens
4. **Rate limiting** configurável
5. **Cache** de resultados para melhor performance

---

**Última atualização**: 2025-12-22  
**Versão da API**: 1.0.0

