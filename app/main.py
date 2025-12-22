"""
ComplianceEngine API - Microsserviço de análise de compliance de processos.
"""
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, List

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas import (
    ComplianceAnalyzeRequest,
    ComplianceAnalyzeResponse,
    DiagramGenerateRequest,
    DiagramGenerateResponse,
    ErrorResponse,
    HealthCheckResponse,
    ProcessCreateRequest,
    ProcessCreateResponse,
)
from app.services.ai_service import get_ai_service
from app.services.db_service import get_db_service


# ============================================================================
# Logging Configuration
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# ============================================================================
# Application Lifespan
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia inicialização e shutdown da aplicação."""
    # Startup
    logger.info("🚀 Inicializando ComplianceEngine API...")

    # Inicializa serviços
    try:
        ai_service = get_ai_service()
        db_service = get_db_service()
        logger.info("✅ Serviços inicializados com sucesso")
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar serviços: {e}")
        raise

    yield

    # Shutdown
    logger.info("👋 Encerrando ComplianceEngine API...")


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="ComplianceEngine API",
    description="API REST para análise de compliance de processos de negócio",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure adequadamente em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Handler para HTTPException."""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.__class__.__name__,
            message=exc.detail,
            details={"status_code": exc.status_code}
        ).model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """Handler para exceções gerais."""
    logger.error(f"Erro não tratado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="InternalServerError",
            message="Erro interno do servidor",
            details={"type": exc.__class__.__name__}
        ).model_dump()
    )


# ============================================================================
# Health Check Endpoints
# ============================================================================

@app.get("/", response_model=HealthCheckResponse, tags=["Health"])
async def root():
    """Endpoint raiz com informações básicas do serviço."""
    return HealthCheckResponse()


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return HealthCheckResponse()


# ============================================================================
# Diagram Generation Endpoints
# ============================================================================

@app.post(
    "/v1/diagrams/generate",
    response_model=DiagramGenerateResponse,
    status_code=status.HTTP_200_OK,
    tags=["Diagrams"],
    summary="Gera diagrama BPMN a partir de descrição textual",
    description="""
    Recebe uma descrição textual de um processo de negócio e retorna:
    - Texto normalizado e estruturado do processo
    - Código Mermaid.js para visualização BPMN
    """
)
async def generate_diagram(request: DiagramGenerateRequest):
    """
    Gera diagrama BPMN usando Vertex AI Gemini.

    Args:
        request: Requisição com descrição do processo.

    Returns:
        DiagramGenerateResponse com processo normalizado e código Mermaid.
    """
    try:
        logger.info("Recebida requisição para geração de diagrama")

        ai_service = get_ai_service()
        result = await ai_service.generate_diagram(
            description=request.description,
            context=request.context
        )

        logger.info("Diagrama gerado com sucesso")
        return result

    except ValueError as e:
        logger.error(f"Erro de validação: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erro ao gerar diagrama: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar requisição de geração de diagrama"
        )


# ============================================================================
# Process Management Endpoints
# ============================================================================

@app.post(
    "/v1/processes",
    response_model=ProcessCreateResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Processes"],
    summary="Cria um novo processo validado",
    description="""
    Salva um processo de negócio completo no Firestore.
    O processo deve incluir:
    - Nome e descrição
    - Código Mermaid.js
    - Nós e fluxos estruturados
    """
)
async def create_process(request: ProcessCreateRequest):
    """
    Cria um novo processo no banco de dados.

    Args:
        request: Dados completos do processo.

    Returns:
        ProcessCreateResponse com ID do processo criado.
    """
    try:
        logger.info(f"Recebida requisição para criar processo: {request.name}")

        db_service = get_db_service()

        # Converte request para dict e salva
        process_data = request.model_dump()
        process_id = await db_service.create_process(process_data)

        logger.info(f"Processo criado com sucesso: {process_id}")

        return ProcessCreateResponse(
            process_id=process_id,
            created_at=datetime.utcnow(),
            message="Processo criado com sucesso"
        )

    except Exception as e:
        logger.error(f"Erro ao criar processo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao salvar processo no banco de dados"
        )


@app.get(
    "/v1/processes/{process_id}",
    response_model=Dict,
    tags=["Processes"],
    summary="Recupera um processo pelo ID"
)
async def get_process(process_id: str):
    """
    Recupera os dados de um processo.

    Args:
        process_id: ID do processo.

    Returns:
        Dados completos do processo.
    """
    try:
        db_service = get_db_service()
        process_data = await db_service.get_process(process_id)

        if not process_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Processo não encontrado: {process_id}"
            )

        return process_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao recuperar processo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao recuperar processo"
        )


@app.get(
    "/v1/processes",
    response_model=List[Dict],
    tags=["Processes"],
    summary="Lista processos"
)
async def list_processes(
    limit: int = 100,
    domain: str = None
):
    """
    Lista processos com filtros opcionais.

    Args:
        limit: Número máximo de resultados (padrão: 100).
        domain: Filtrar por domínio (opcional).

    Returns:
        Lista de processos.
    """
    try:
        db_service = get_db_service()
        processes = await db_service.list_processes(limit=limit, domain=domain)
        return processes

    except Exception as e:
        logger.error(f"Erro ao listar processos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao listar processos"
        )


# ============================================================================
# Compliance Analysis Endpoints
# ============================================================================

@app.post(
    "/v1/compliance/analyze",
    response_model=ComplianceAnalyzeResponse,
    status_code=status.HTTP_200_OK,
    tags=["Compliance"],
    summary="Analisa compliance de um processo",
    description="""
    Analisa um processo contra regulamentações do domínio especificado.

    Fluxo:
    1. Recupera o processo do Firestore
    2. Busca regulamentos aplicáveis (RAG - mock implementado)
    3. Analisa com Vertex AI Gemini
    4. Retorna gaps e sugestões de compliance
    5. Salva análise no Firestore
    """
)
async def analyze_compliance(request: ComplianceAnalyzeRequest):
    """
    Analisa compliance de um processo.

    Args:
        request: Requisição com process_id e domain.

    Returns:
        ComplianceAnalyzeResponse com gaps e sugestões.
    """
    try:
        logger.info(
            f"Recebida requisição de análise: process_id={request.process_id}, "
            f"domain={request.domain}"
        )

        db_service = get_db_service()
        ai_service = get_ai_service()

        # 1. Buscar processo no Firestore
        process_data = await db_service.get_process(request.process_id)
        if not process_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Processo não encontrado: {request.process_id}"
            )

        logger.info(f"Processo recuperado: {process_data.get('name')}")

        # 2. Buscar regulamentos aplicáveis (Mock/Stub - RAG)
        # TODO: Implement Vertex AI Search Retrieval here
        retrieved_regulations = _mock_retrieve_regulations(request.domain)
        logger.info(f"Recuperados {len(retrieved_regulations)} regulamentos (mock)")

        # 3. Analisar com Gemini
        overall_score, summary, gaps, suggestions = await ai_service.analyze_compliance(
            process_data=process_data,
            retrieved_regulations=retrieved_regulations,
            domain=request.domain,
            additional_context=request.additional_context
        )

        # 4. Criar objeto de resposta
        analysis_response = ComplianceAnalyzeResponse(
            analysis_id="",  # Será preenchido após salvar
            process_id=request.process_id,
            domain=request.domain,
            analyzed_at=datetime.utcnow(),
            overall_score=overall_score,
            gaps=gaps,
            suggestions=suggestions,
            summary=summary
        )

        # 5. Salvar análise no Firestore
        analysis_data = analysis_response.model_dump()
        analysis_data.pop("analysis_id")  # Remove temporário
        analysis_id = await db_service.create_analysis(analysis_data)

        # Atualiza o ID na resposta
        analysis_response.analysis_id = analysis_id

        logger.info(f"Análise concluída: {analysis_id}")

        return analysis_response

    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Erro de validação: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erro ao analisar compliance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar análise de compliance"
        )


@app.get(
    "/v1/compliance/analyses/{analysis_id}",
    response_model=Dict,
    tags=["Compliance"],
    summary="Recupera uma análise pelo ID"
)
async def get_analysis(analysis_id: str):
    """
    Recupera os dados de uma análise de compliance.

    Args:
        analysis_id: ID da análise.

    Returns:
        Dados completos da análise.
    """
    try:
        db_service = get_db_service()
        analysis_data = await db_service.get_analysis(analysis_id)

        if not analysis_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Análise não encontrada: {analysis_id}"
            )

        return analysis_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao recuperar análise: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao recuperar análise"
        )


# ============================================================================
# Mock/Stub Functions
# ============================================================================

def _mock_retrieve_regulations(domain: str) -> List[Dict]:
    """
    Mock para recuperação de regulamentos via RAG.

    TODO: Implement Vertex AI Search Retrieval here

    Esta função deve ser substituída por integração real com:
    - Vertex AI Search (para RAG sobre base de regulamentos)
    - Ou outro sistema de busca vetorial/semântica

    Args:
        domain: Domínio regulatório (LGPD, SOX, GDPR, etc.)

    Returns:
        Lista de regulamentos recuperados.
    """
    # Dados mock baseados no domínio
    mock_regulations = {
        "LGPD": [
            {
                "title": "LGPD - Lei Geral de Proteção de Dados",
                "article": "Art. 6º",
                "content": (
                    "As atividades de tratamento de dados pessoais deverão observar "
                    "a boa-fé e os seguintes princípios: I - finalidade; II - adequação; "
                    "III - necessidade; IV - livre acesso; V - qualidade dos dados; "
                    "VI - transparência; VII - segurança; VIII - prevenção; "
                    "IX - não discriminação; X - responsabilização e prestação de contas."
                )
            },
            {
                "title": "LGPD - Lei Geral de Proteção de Dados",
                "article": "Art. 46",
                "content": (
                    "Os agentes de tratamento devem adotar medidas de segurança, "
                    "técnicas e administrativas aptas a proteger os dados pessoais "
                    "de acessos não autorizados e de situações acidentais ou ilícitas."
                )
            }
        ],
        "SOX": [
            {
                "title": "Sarbanes-Oxley Act - Section 404",
                "article": "Section 404",
                "content": (
                    "Management must assess the effectiveness of internal controls "
                    "over financial reporting. This includes establishing procedures "
                    "for the preparation of financial statements, maintaining records, "
                    "and ensuring proper authorization of transactions."
                )
            }
        ],
        "GDPR": [
            {
                "title": "GDPR - General Data Protection Regulation",
                "article": "Article 32",
                "content": (
                    "Taking into account the state of the art, the controller and "
                    "processor shall implement appropriate technical and organizational "
                    "measures to ensure a level of security appropriate to the risk."
                )
            }
        ]
    }

    # Retorna regulamentos do domínio ou lista vazia
    return mock_regulations.get(domain.upper(), [
        {
            "title": f"Regulamento Genérico - {domain}",
            "article": "Artigo Geral",
            "content": (
                f"Este é um regulamento mock para o domínio {domain}. "
                "Implementar busca real via RAG/Vertex AI Search."
            )
        }
    ])


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="info"
    )
