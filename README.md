# ComplianceEngine API

Microsserviço (API REST) para análise de compliance de processos de negócio usando IA Generativa.

## 🎯 Propósito

O **ComplianceEngine API** é um **serviço especializado** projetado para ser **integrado em outras aplicações** que precisam de:

- **Mapeamento de Processos**: Converter descrições textuais de processos de negócio em diagramas BPMN estruturados
- **Análise de Compliance**: Identificar automaticamente gaps de conformidade regulatória (LGPD, SOX, GDPR, etc.) em processos
- **Gestão de Processos**: Armazenar e gerenciar processos validados para auditoria e compliance

### Para Quem é Esta API?

Esta API foi desenvolvida para ser consumida por:
- **Sistemas ERP/CRM**: Adicionar análise de compliance aos processos internos
- **Plataformas de Gestão de Processos**: Enriquecer processos com análise automática de conformidade
- **Ferramentas de Auditoria**: Gerar relatórios de compliance automaticamente
- **Aplicações de Governança**: Monitorar conformidade regulatória em tempo real
- **Sistemas de Documentação**: Gerar diagramas BPMN a partir de documentação textual

> 📖 **Manual de Integração Completo**: Veja [INTEGRATION.md](INTEGRATION.md) para guias detalhados de integração em Python, JavaScript, cURL e mais.

## Visão Geral

O **ComplianceEngine** oferece três capacidades principais:

1. **Geração de Diagramas BPMN**: Converte descrições textuais de processos em diagramas Mermaid.js
2. **Gestão de Processos**: Armazena e gerencia processos validados no Firestore
3. **Análise de Compliance**: Identifica gaps de conformidade usando IA e RAG

## Stack Tecnológica

- **Linguagem**: Python 3.11+
- **Framework Web**: FastAPI
- **Banco de Dados**: Google Cloud Firestore
- **IA Generativa**: Vertex AI (Gemini 1.5 Pro)
- **Infraestrutura**: Google Cloud Run (Docker)

## Arquitetura

```
ComplianceEngine/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── schemas.py              # Pydantic models
│   └── services/
│       ├── __init__.py
│       ├── ai_service.py       # Vertex AI integration
│       └── db_service.py       # Firestore operations
├── requirements.txt
├── Dockerfile
├── .dockerignore
├── .env.example
└── README.md
```

## Pré-requisitos

### Google Cloud Platform

1. Projeto GCP criado
   - **Project ID**: `nprocess`
   - **Project Number**: `273624403528`
2. APIs habilitadas:
   ```bash
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable firestore.googleapis.com
   gcloud services enable run.googleapis.com
   ```

3. Firestore Database criado (Native mode)

4. Application Default Credentials configuradas:
   ```bash
   gcloud auth application-default login
   ```

### Local Development

- Python 3.11+
- pip ou poetry

## Instalação

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd nprocess
```

### 2. Configure Variáveis de Ambiente

```bash
cp .env.example .env
# Edite .env com suas configurações
```

### 3. Instale Dependências

```bash
pip install -r requirements.txt
```

## Execução Local

### Modo Desenvolvimento

```bash
python -m app.main
```

Ou usando uvicorn diretamente:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

Acesse:
- API: http://localhost:8080
- Documentação Interativa (Swagger): http://localhost:8080/docs
- Documentação Alternativa (ReDoc): http://localhost:8080/redoc

## 📚 Documentação de Integração

Para integrar esta API em outras aplicações, consulte:

- **[INTEGRATION.md](INTEGRATION.md)**: Manual completo de integração com exemplos em Python, JavaScript, cURL
- **[PROMPTS_EXAMPLES.md](PROMPTS_EXAMPLES.md)**: Exemplos de prompts para usar em Cursor, Claude Code, Antigravity e outras ferramentas de IA
- **Exemplos Práticos**: Veja a pasta `examples/` para código de exemplo
- **API Docs**: Acesse `/docs` na API para documentação interativa Swagger

## Endpoints da API

### Health Check

```bash
GET /
GET /health
```

### 1. Geração de Diagramas

**Endpoint**: `POST /v1/diagrams/generate`

Gera diagrama BPMN a partir de descrição textual.

**Request**:
```json
{
  "description": "Processo de aprovação de compras: colaborador faz requisição, gestor aprova, financeiro processa pagamento",
  "context": "Departamento de compras, até R$ 10.000"
}
```

**Response**:
```json
{
  "normalized_text": "Processo normalizado e estruturado...",
  "mermaid_code": "graph TD\n  start([Início])...",
  "metadata": {
    "actors": ["Colaborador", "Gestor", "Financeiro"],
    "activities_count": 5,
    "decision_points": 1
  }
}
```

**Exemplo cURL**:
```bash
curl -X POST http://localhost:8080/v1/diagrams/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Processo de onboarding: RH registra novo funcionário, TI cria contas, gestor atribui tarefas",
    "context": "Processo para novos colaboradores"
  }'
```

### 2. Criar Processo

**Endpoint**: `POST /v1/processes`

Salva um processo validado no Firestore.

**Request**:
```json
{
  "name": "Processo de Aprovação de Compras",
  "description": "Fluxo completo de requisição e aprovação de compras",
  "domain": "financeiro",
  "mermaid_code": "graph TD\n  start([Início])...",
  "nodes": [
    {
      "id": "task1",
      "type": "task",
      "label": "Criar Requisição",
      "properties": {}
    }
  ],
  "flows": [
    {
      "from_node": "start",
      "to_node": "task1"
    }
  ],
  "metadata": {}
}
```

**Response**:
```json
{
  "process_id": "abc123xyz",
  "created_at": "2025-12-22T10:30:00Z",
  "message": "Processo criado com sucesso"
}
```

### 3. Recuperar Processo

**Endpoint**: `GET /v1/processes/{process_id}`

**Response**: Dados completos do processo

### 4. Listar Processos

**Endpoint**: `GET /v1/processes?limit=50&domain=financeiro`

**Response**: Array de processos

### 5. Analisar Compliance

**Endpoint**: `POST /v1/compliance/analyze`

Analisa um processo contra regulamentações.

**Request**:
```json
{
  "process_id": "abc123xyz",
  "domain": "LGPD",
  "additional_context": "Processo lida com dados pessoais de clientes"
}
```

**Response**:
```json
{
  "analysis_id": "analysis_xyz",
  "process_id": "abc123xyz",
  "domain": "LGPD",
  "analyzed_at": "2025-12-22T10:35:00Z",
  "overall_score": 65.5,
  "summary": "O processo apresenta conformidade parcial...",
  "gaps": [
    {
      "gap_id": "GAP001",
      "severity": "high",
      "regulation": "LGPD",
      "article": "Art. 46",
      "description": "Falta implementação de controles de segurança...",
      "affected_nodes": ["task3"],
      "recommendation": "Implementar criptografia e controle de acesso..."
    }
  ],
  "suggestions": [
    {
      "suggestion_id": "SUG001",
      "type": "control_addition",
      "title": "Adicionar Log de Auditoria",
      "description": "Implementar registro de todas as ações...",
      "priority": "high",
      "estimated_effort": "2-3 dias"
    }
  ]
}
```

### 6. Recuperar Análise

**Endpoint**: `GET /v1/compliance/analyses/{analysis_id}`

## Deploy no Google Cloud Run

### 1. Build e Push da Imagem

```bash
# Configure o projeto
export PROJECT_ID=nprocess
export REGION=us-central1
export SERVICE_NAME=compliance-engine

# Build com Cloud Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Ou usando Artifact Registry
gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/$SERVICE_NAME
```

### 2. Deploy no Cloud Run

```bash
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 80 \
  --max-instances 10
```

### 3. Deploy com CI/CD (Cloud Build)

Crie `cloudbuild.yaml`:

```yaml
steps:
  # Build
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/compliance-engine', '.']

  # Push
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/compliance-engine']

  # Deploy
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'compliance-engine'
      - '--image=gcr.io/$PROJECT_ID/compliance-engine'
      - '--region=us-central1'
      - '--platform=managed'

images:
  - 'gcr.io/$PROJECT_ID/compliance-engine'
```

Executar:
```bash
gcloud builds submit --config cloudbuild.yaml
```

## Desenvolvimento

### Testes

```bash
# Instalar dependências de desenvolvimento
pip install pytest pytest-asyncio httpx

# Executar testes
pytest
```

### Linting

```bash
pip install black flake8 mypy
black app/
flake8 app/
mypy app/
```

## Próximos Passos (TODOs)

### Implementação de RAG Real

Atualmente, a recuperação de regulamentos está mockada. Para implementar RAG real:

1. **Criar Corpus no Vertex AI Search**:
   ```bash
   # Upload de documentos de regulamentos para Cloud Storage
   gsutil -m cp -r ./regulations gs://$BUCKET_NAME/regulations/

   # Criar datastore no Vertex AI Search
   gcloud alpha discovery-engine data-stores create compliance-regulations \
     --location=global \
     --collection=default_collection \
     --content-config=CONTENT_REQUIRED
   ```

2. **Integrar no Código**:

   No arquivo `app/services/ai_service.py`, substitua a função `_mock_retrieve_regulations`:

   ```python
   from google.cloud import discoveryengine_v1 as discoveryengine

   def retrieve_regulations(domain: str, query: str):
       client = discoveryengine.SearchServiceClient()
       serving_config = f"projects/nprocess/locations/global/..."

       request = discoveryengine.SearchRequest(
           serving_config=serving_config,
           query=query,
           page_size=5
       )

       response = client.search(request)
       return [result.document for result in response.results]
   ```

### Autenticação e Segurança

Adicionar autenticação JWT/OAuth2:

```python
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.post("/v1/processes", dependencies=[Depends(security)])
async def create_process(...):
    ...
```

### Observabilidade

Integrar Cloud Logging e Cloud Trace:

```python
from google.cloud import logging
from opentelemetry import trace

logging_client = logging.Client()
logging_client.setup_logging()
```

## Licença

[Adicione sua licença aqui]

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
