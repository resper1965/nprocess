# Rodando ComplianceEngine API Sem IA

## 🎯 Quando Usar

A aplicação pode rodar **sem IA** se você precisar apenas de:
- ✅ **Gestão de Processos** (CRUD): Criar, ler, listar processos no Firestore
- ✅ **Armazenamento**: Salvar e recuperar processos estruturados
- ❌ **Sem geração de diagramas** (requer IA)
- ❌ **Sem análise de compliance** (requer IA)

## 🚀 Como Configurar

### Opção 1: Variável de Ambiente

```bash
# No arquivo .env
ENABLE_AI=false
```

### Opção 2: Variável de Ambiente no Sistema

```bash
export ENABLE_AI=false
```

### Opção 3: Cloud Run (Deploy)

```bash
gcloud run deploy compliance-engine \
    --set-env-vars "GOOGLE_CLOUD_PROJECT=nprocess,ENABLE_AI=false" \
    --project=nprocess
```

## 📋 Endpoints Disponíveis SEM IA

Quando `ENABLE_AI=false`, os seguintes endpoints funcionam normalmente:

### ✅ Funcionam (sem IA)

- `GET /` - Health check
- `GET /health` - Health check
- `POST /v1/processes` - Criar processo
- `GET /v1/processes/{id}` - Recuperar processo
- `GET /v1/processes` - Listar processos
- `GET /v1/docs` - Documentação
- `GET /v1/docs/prompts` - Prompts
- `GET /v1/docs/integration` - Manual de integração

### ❌ Não Funcionam (requerem IA)

- `POST /v1/diagrams/generate` - Retorna 503 (Service Unavailable)
- `POST /v1/compliance/analyze` - Retorna 503 (Service Unavailable)

## 🔧 Configuração Mínima

Para rodar **apenas com gestão de processos**, você precisa:

### 1. Firestore (Obrigatório)

```bash
# Firestore já está criado no projeto nprocess
# Apenas precisa de credenciais GCP configuradas
gcloud auth application-default login
```

### 2. Variáveis de Ambiente

```bash
# .env mínimo
GOOGLE_CLOUD_PROJECT=nprocess
GCP_PROJECT_ID=nprocess
ENABLE_AI=false
```

### 3. Dependências

Ainda precisa instalar todas as dependências (incluindo vertexai), mas não será usada:

```bash
pip install -r requirements.txt
```

## 📝 Exemplo de Uso

### Criar Processo (sem IA)

```python
import httpx

API_URL = "https://compliance-engine-273624403528.us-central1.run.app"

# Criar processo diretamente (sem gerar diagrama)
process_data = {
    "name": "Processo de Aprovação",
    "description": "Processo manual de aprovação",
    "domain": "financeiro",
    "mermaid_code": "graph TD\n  A[Início] --> B[Processo] --> C[Fim]",
    "nodes": [
        {"id": "A", "type": "event", "label": "Início"},
        {"id": "B", "type": "task", "label": "Processo"},
        {"id": "C", "type": "event", "label": "Fim"}
    ],
    "flows": [
        {"from_node": "A", "to_node": "B"},
        {"from_node": "B", "to_node": "C"}
    ],
    "metadata": {}
}

response = httpx.post(f"{API_URL}/v1/processes", json=process_data)
print(response.json())
```

### Listar Processos

```python
response = httpx.get(f"{API_URL}/v1/processes?limit=10")
processes = response.json()
print(f"Total de processos: {len(processes)}")
```

## ⚠️ Erros Esperados

Se tentar usar endpoints de IA com `ENABLE_AI=false`:

```json
{
  "detail": "Serviço de IA não está disponível. Configure ENABLE_AI=true e Vertex AI para usar este endpoint."
}
```

Status: `503 Service Unavailable`

## 🔄 Habilitar IA Novamente

Para reativar IA:

```bash
# No .env
ENABLE_AI=true

# Reiniciar aplicação
# Ou fazer novo deploy no Cloud Run
```

## 💰 Custos

### Sem IA
- ✅ **Firestore**: Gratuito até 1GB (Free Tier)
- ✅ **Cloud Run**: Cobrado apenas por uso (muito baixo para CRUD)
- ❌ **Vertex AI**: $0 (não usado)

### Com IA
- ✅ **Firestore**: Gratuito até 1GB
- ✅ **Cloud Run**: Cobrado por uso
- ⚠️ **Vertex AI**: Cobrado por requisição (Gemini 1.5 Pro)

## 📊 Comparação

| Funcionalidade | Sem IA | Com IA |
|---------------|--------|--------|
| Criar Processo | ✅ | ✅ |
| Listar Processos | ✅ | ✅ |
| Recuperar Processo | ✅ | ✅ |
| Gerar Diagrama | ❌ | ✅ |
| Analisar Compliance | ❌ | ✅ |

## 🎯 Casos de Uso

### Ideal para rodar SEM IA:
- Sistema de armazenamento de processos já mapeados
- API de consulta de processos existentes
- Integração com sistemas que já têm diagramas
- Redução de custos (sem Vertex AI)

### Precisa de IA:
- Geração automática de diagramas a partir de texto
- Análise automática de compliance
- Processamento inteligente de processos

---

**Última atualização**: 2025-12-22


