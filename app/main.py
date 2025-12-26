"""
n.process API - Microsserviço de análise de compliance de processos (Stateless).
Security Hardening: HSTS, CSP, HTTPS Redirect, Trusted Host.
"""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.schemas import (
    ComplianceAnalyzeRequest,
    ComplianceAnalyzeResponse,
    DiagramGenerateRequest,
    DiagramGenerateResponse,
    ErrorResponse,
    HealthCheckResponse,
)
from app.services.ai_service import get_ai_service
from app.services.db_service import get_db_service
from app.services.compliance_service import get_compliance_service
from app.services.modeling_service import get_modeling_service
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.logging import StructuredLoggingMiddleware
from app.middleware.tracing import TracingMiddleware
from app.middleware.auth import require_admin

# ============================================================================
# Logging Configuration
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# ============================================================================
# Security Middleware (Custom Headers)
# ============================================================================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        # HSTS (Strict-Transport-Security): 1 Year
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # X-Content-Type-Options: nosniff
        response.headers["X-Content-Type-Options"] = "nosniff"
        # X-Frame-Options: DENY (Prevent Clickjacking)
        response.headers["X-Frame-Options"] = "DENY"
        # Content-Security-Policy
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; object-src 'none';"
        # Referrer-Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

# ============================================================================
# Application Lifespan
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia inicialização e shutdown da aplicação."""
    logger.info("🚀 Inicializando n.process API (Stateless Engine)...")

    try:
        # Inicializa serviços essenciais
        db_service = get_db_service() # Para logs de auditoria
        ai_service = get_ai_service()

        if ai_service:
            logger.info("✅ Services: DB (Audit) ✅ | AI ✅")
        else:
            logger.info("✅ Services: DB (Audit) ✅ | AI ⚠️ (disabled)")
            
    except Exception as e:
        logger.error(f"❌ Erro na inicialização: {e}")
        # Não impede o startup, mas loga erro
        
    yield

    logger.info("👋 Encerrando n.process API...")


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="n.process API",
    description="Motor de Compliance e Modelagem de Processos (Stateless)",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Trusted Host Middleware (Prevents Host Header Injection)
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,nprocess.ness.com.br").split(",")
app.add_middleware(TrustedHostMiddleware, allowed_hosts=ALLOWED_HOSTS)

# 2. CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:3000,https://nprocess.ness.com.br"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"], # Explicit allow list, unsafe to use "*"
    allow_headers=["Authorization", "Content-Type", "X-API-Key"],
)

# 3. Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# Middleware Stack
redis_url = os.getenv("REDIS_URL", None)
app.add_middleware(RateLimitMiddleware, redis_url=redis_url)
app.add_middleware(StructuredLoggingMiddleware)
app.add_middleware(TracingMiddleware)


# ============================================================================
# Exception Handlers
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
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
    logger.error(f"Erro não tratado: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="InternalServerError",
            message="Erro interno do servidor",
            details="Ocultado por segurança" # Don't leak stack traces
        ).model_dump()
    )


# ============================================================================
# Health Check
# ============================================================================

@app.get("/", response_model=HealthCheckResponse, tags=["Health"])
async def root():
    return HealthCheckResponse(service="n.process engine", version="2.0.0")


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    return HealthCheckResponse(service="n.process engine", version="2.0.0")


# ============================================================================
# Modeling Endpoints
# ============================================================================

@app.post(
    "/v1/modeling/generate",
    response_model=DiagramGenerateResponse,
    tags=["Modeling"],
    summary="Gera diagrama BPMN a partir de texto"
)
async def generate_diagram(request: DiagramGenerateRequest):
    """Gera diagrama BPMN usando IA."""
    try:
        service = get_modeling_service()
        return await service.generate_diagram(request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao gerar diagrama: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha na geração")


# ============================================================================
# Compliance Endpoints
# ============================================================================

@app.post(
    "/v1/compliance/analyze",
    response_model=ComplianceAnalyzeResponse,
    tags=["Compliance"],
    summary="Analisa compliance de um processo (Stateless)"
)
async def analyze_compliance(request: ComplianceAnalyzeRequest):
    """
    Analisa um processo fornecido no corpo da requisição.
    Não persiste o processo, apenas registra o log da auditoria.
    """
    try:
        service = get_compliance_service()
        return await service.analyze_compliance(request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error(f"Erro na análise: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha na análise")


# ============================================================================
# Knowledge Ingestion Endpoints (Admin Only)
# ============================================================================

from pydantic import BaseModel
from typing import Optional, Dict, Any as TypingAny

class IngestRequest(BaseModel):
    source_type: str  # 'legal' | 'technical' | 'web'
    source: str  # URL, File Path, or Raw Text
    source_id: str  # Unique identifier (e.g., 'lgpd_br')
    metadata: Optional[Dict[str, TypingAny]] = None

class IngestResponse(BaseModel):
    status: str
    source_id: Optional[str] = None
    chunks_generated: Optional[int] = None
    chunks_saved: Optional[int] = None
    reason: Optional[str] = None
    sample_chunk: Optional[str] = None

@app.post(
    "/v1/admin/ingest",
    response_model=IngestResponse,
    tags=["Admin"],
    summary="Ingere conhecimento para o Vector Store (Admin)"
)
async def ingest_knowledge(
    request: IngestRequest,
    current_user: dict = Depends(require_admin)  # Admin auth required
):
    """
    Ingere documentos regulatórios no sistema RAG.
    Requer autenticação de Admin.
    """
    logger.info(f"Ingestion requested by: {current_user.get('uid', 'unknown')}")
    
    try:
        from app.services.ingestion import ingest_command_handler
        
        result = ingest_command_handler({
            "source_type": request.source_type,
            "source": request.source,
            "source_id": request.source_id,
            "metadata": request.metadata or {}
        })
        
        return IngestResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error(f"Erro na ingestão: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha na ingestão")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)
