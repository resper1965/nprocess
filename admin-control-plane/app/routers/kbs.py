"""
Knowledge Base Marketplace Router
Handles KB management and subscriptions for the marketplace
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Request
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from app.schemas import (
    KBCreate, KBUpdate, KBResponse, KBMarketplaceItem,
    KBSubscriptionCreate, KBSubscriptionResponse, KBSubscriptionList,
    KBSubscriptionStatus, KBStatus, KBIngestRequest, KBIngestResponse,
    KBSearchRequest, KBSearchResponse, KBSearchResult,
    SuccessResponse
)
# Corrected import path
from app.middleware.auth import get_current_user

router = APIRouter()


# ============================================================================
# Firestore Repository (persisted) with seed data
# ============================================================================

from datetime import datetime as dt
from app.services.firestore_repository import get_kb_repository, get_subscription_repository

# Seed data for initial KBs
SEED_KBS = {
    "kb_lgpd_2026": {
        "kb_id": "kb_lgpd_2026",
        "name": "LGPD Completa 2026",
        "description": "Lei Geral de Proteção de Dados completa e atualizada. Inclui a lei original, regulamentações da ANPD, e orientações práticas para compliance.",
        "category": "lgpd",
        "status": "active",
        "price_monthly_cents": 9900,
        "update_frequency": "weekly",
        "document_count": 847,
        "chunk_count": 4235,
        "last_updated_at": dt.utcnow().isoformat(),
        "created_at": dt(2026, 1, 1).isoformat(),
        "created_by": "system",
        "tags": ["lgpd", "privacidade", "dados pessoais", "anpd", "brasil"],
        "metadata": {"version": "2026.1", "language": "pt-BR"}
    },
    "kb_gdpr_europa": {
        "kb_id": "kb_gdpr_europa",
        "name": "GDPR Europa",
        "description": "General Data Protection Regulation completo. Regulamento da União Europeia para proteção de dados pessoais com todas as orientações e casos práticos.",
        "category": "gdpr",
        "status": "active",
        "price_monthly_cents": 14900,
        "update_frequency": "weekly",
        "document_count": 1234,
        "chunk_count": 6170,
        "last_updated_at": dt.utcnow().isoformat(),
        "created_at": dt(2026, 1, 1).isoformat(),
        "created_by": "system",
        "tags": ["gdpr", "europa", "privacidade", "união europeia", "dpo"],
        "metadata": {"version": "2026.1", "language": "en"}
    },
    "kb_cvm_resolucoes": {
        "kb_id": "kb_cvm_resolucoes",
        "name": "CVM Resoluções",
        "description": "Todas as resoluções da Comissão de Valores Mobiliários. Inclui instruções normativas, pareceres e orientações para mercado de capitais.",
        "category": "cvm",
        "status": "active",
        "price_monthly_cents": 12900,
        "update_frequency": "monthly",
        "document_count": 567,
        "chunk_count": 2835,
        "last_updated_at": dt.utcnow().isoformat(),
        "created_at": dt(2026, 1, 1).isoformat(),
        "created_by": "system",
        "tags": ["cvm", "mercado de capitais", "valores mobiliários", "bovespa", "brasil"],
        "metadata": {"version": "2026.1", "language": "pt-BR"}
    },
    "kb_bpmn_2_0": {
        "kb_id": "kb_bpmn_2_0",
        "name": "BPMN 2.0 Especificação",
        "description": "Especificação completa BPMN 2.0 da OMG. Inclui notação, semântica, padrões de modelagem, boas práticas e exemplos de diagramas para processos de negócio.",
        "category": "custom",
        "status": "active",
        "price_monthly_cents": 7900,
        "update_frequency": "on_demand",
        "document_count": 234,
        "chunk_count": 1170,
        "last_updated_at": dt.utcnow().isoformat(),
        "created_at": dt(2026, 1, 1).isoformat(),
        "created_by": "system",
        "tags": ["bpmn", "bpmn 2.0", "processos", "modelagem", "omg", "workflow"],
        "metadata": {"version": "2.0.2", "language": "en"}
    }
}

# Initialize repositories with seed on startup
_initialized = False

async def ensure_initialized():
    """Ensure repositories are initialized with seed data"""
    global _initialized
    if not _initialized:
        kb_repo = get_kb_repository()
        await kb_repo.seed(SEED_KBS)
        _initialized = True


# ============================================================================
# Admin Endpoints (Manage KBs)
# ============================================================================

@router.get("", response_model=List[KBResponse])
async def list_knowledge_bases(
    status: Optional[KBStatus] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all Knowledge Bases (admin only)"""
    await ensure_initialized()
    repo = get_kb_repository()
    
    filters = {"status": status.value} if status else None
    kbs = await repo.list(filters=filters)
    return kbs


@router.post("", response_model=KBResponse)
async def create_knowledge_base(
    kb: KBCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new Knowledge Base"""
    await ensure_initialized()
    repo = get_kb_repository()

    kb_id = f"kb_{uuid.uuid4().hex[:12]}"
    now = datetime.utcnow()
    
    kb_data = {
        "kb_id": kb_id,
        "name": kb.name,
        "description": kb.description,
        "category": kb.category,
        "status": KBStatus.DRAFT,
        "price_monthly_cents": kb.price_monthly_cents,
        "update_frequency": kb.update_frequency,
        "document_count": 0,
        "chunk_count": 0,
        "last_updated_at": None,
        "created_at": now,
        "created_by": current_user.get("uid", "system"),
        "tags": kb.tags,
        "metadata": kb.metadata or {}
    }
    
    await repo.create(kb_id, kb_data)
    return kb_data


@router.get("/{kb_id}", response_model=KBResponse)
async def get_knowledge_base(
    kb_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific Knowledge Base"""
    await ensure_initialized()
    repo = get_kb_repository()

    kb = await repo.get(kb_id)
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge Base not found")
    return kb


@router.put("/{kb_id}", response_model=KBResponse)
async def update_knowledge_base(
    kb_id: str,
    update: KBUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a Knowledge Base"""
    await ensure_initialized()
    repo = get_kb_repository()

    kb = await repo.get(kb_id)
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge Base not found")
    
    update_data = update.model_dump(exclude_unset=True)
    if update_data:
        update_data["last_updated_at"] = datetime.utcnow()
        kb = await repo.update(kb_id, update_data)
        
    return kb


@router.delete("/{kb_id}", response_model=SuccessResponse)
async def delete_knowledge_base(
    kb_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete (archive) a Knowledge Base"""
    await ensure_initialized()
    repo = get_kb_repository()

    kb = await repo.get(kb_id)
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge Base not found")
    
    await repo.update(kb_id, {"status": KBStatus.ARCHIVED})
    return SuccessResponse(success=True, message=f"KB {kb_id} archived")


@router.post("/{kb_id}/ingest", response_model=KBIngestResponse)
async def ingest_documents(
    kb_id: str,
    request: KBIngestRequest,
    current_user: dict = Depends(get_current_user)
):
    """Ingest documents into a Knowledge Base"""
    await ensure_initialized()
    repo = get_kb_repository()

    kb = await repo.get(kb_id)
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge Base not found")
    
    # Use the real search service for ingestion
    from app.services.kb_search_service import KBSearchService
    service = KBSearchService()
    
    result = await service.ingest_documents(
        kb_id=kb_id,
        documents=request.documents,
        replace_existing=request.replace_existing
    )
    
    # Update KB stats
    updates = {
        "document_count": kb.get("document_count", 0) + result["documents_ingested"],
        "chunk_count": kb.get("chunk_count", 0) + result["chunks_created"],
        "last_updated_at": datetime.utcnow()
    }
    await repo.update(kb_id, updates)
    
    return KBIngestResponse(
        kb_id=kb_id,
        documents_ingested=result["documents_ingested"],
        chunks_created=result["chunks_created"],
        processing_time_ms=result["processing_time_ms"],
        errors=result["errors"]
    )


@router.post("/{kb_id}/publish", response_model=KBResponse)
async def publish_knowledge_base(
    kb_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Publish a KB to the marketplace"""
    await ensure_initialized()
    repo = get_kb_repository()

    kb = await repo.get(kb_id)
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge Base not found")
    
    if kb.get("document_count", 0) == 0:
        raise HTTPException(status_code=400, detail="Cannot publish empty KB")
    
    updated_kb = await repo.update(kb_id, {"status": KBStatus.ACTIVE})
    return updated_kb


# ============================================================================
# Marketplace Endpoints (Public)
# ============================================================================

@router.get("/marketplace/list", response_model=List[KBMarketplaceItem])
async def list_marketplace_kbs(
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all KBs available in the marketplace"""
    await ensure_initialized()
    kb_repo = get_kb_repository()
    sub_repo = get_subscription_repository()
    
    tenant_id = current_user.get("tenant_id", "default")
    
    # Get active KBs
    filters = {"status": KBStatus.ACTIVE.value}
    if category:
        filters["category"] = category
    
    active_kbs = await kb_repo.list(filters=filters)
    
    # Get user subscriptions
    sub_filters = {
        "tenant_id": tenant_id,
        "status": KBSubscriptionStatus.ACTIVE.value
    }
    user_subs = await sub_repo.list(filters=sub_filters)
    user_sub_kb_ids = [s["kb_id"] for s in user_subs]
    
    return [
        KBMarketplaceItem(
            kb_id=kb["kb_id"],
            name=kb["name"],
            description=kb["description"],
            category=kb["category"],
            price_monthly_cents=kb["price_monthly_cents"],
            update_frequency=kb["update_frequency"],
            document_count=kb["document_count"],
            last_updated_at=kb["last_updated_at"],
            tags=kb["tags"],
            is_subscribed=kb["kb_id"] in user_sub_kb_ids
        )
        for kb in active_kbs
    ]


# ============================================================================
# Subscription Endpoints
# ============================================================================

@router.post("/subscriptions", response_model=KBSubscriptionResponse)
async def subscribe_to_kb(
    subscription: KBSubscriptionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Subscribe to a Knowledge Base"""
    await ensure_initialized()
    kb_repo = get_kb_repository()
    sub_repo = get_subscription_repository()

    kb_id = subscription.kb_id
    tenant_id = current_user.get("tenant_id", "default")
    
    kb = await kb_repo.get(kb_id)
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge Base not found")
    
    if kb["status"] != KBStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="KB not available for subscription")
    
    # Check if already subscribed
    existing_subs = await sub_repo.list(filters={
        "kb_id": kb_id,
        "tenant_id": tenant_id,
        "status": KBSubscriptionStatus.ACTIVE.value
    })
    
    if existing_subs:
        raise HTTPException(status_code=400, detail="Already subscribed to this KB")
    
    sub_id = f"kbsub_{uuid.uuid4().hex[:12]}"
    now = datetime.utcnow()
    
    sub_data = {
        "subscription_id": sub_id,
        "kb_id": kb_id,
        "kb_name": kb["name"],
        "tenant_id": tenant_id,
        "status": KBSubscriptionStatus.ACTIVE,
        "price_monthly_cents": kb["price_monthly_cents"],
        "started_at": now,
        "expires_at": now + timedelta(days=30),
        "canceled_at": None
    }
    
    await sub_repo.create(sub_id, sub_data)
    return sub_data


@router.get("/subscriptions", response_model=KBSubscriptionList)
async def list_my_subscriptions(
    current_user: dict = Depends(get_current_user)
):
    """List current user's KB subscriptions"""
    await ensure_initialized()
    sub_repo = get_subscription_repository()

    tenant_id = current_user.get("tenant_id", "default")
    
    filters = {
        "tenant_id": tenant_id,
        "status": KBSubscriptionStatus.ACTIVE.value
    }
    
    subs = await sub_repo.list(filters=filters)
    total_cost = sum(s["price_monthly_cents"] for s in subs)
    
    return KBSubscriptionList(
        subscriptions=subs,
        total_monthly_cost_cents=total_cost
    )


@router.delete("/subscriptions/{subscription_id}", response_model=SuccessResponse)
async def cancel_subscription(
    subscription_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel a KB subscription"""
    await ensure_initialized()
    sub_repo = get_subscription_repository()

    sub = await sub_repo.get(subscription_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    tenant_id = current_user.get("tenant_id", "default")
    
    if sub["tenant_id"] != tenant_id:
        raise HTTPException(status_code=403, detail="Not your subscription")
    
    updates = {
        "status": KBSubscriptionStatus.CANCELED,
        "canceled_at": datetime.utcnow()
    }
    await sub_repo.update(subscription_id, updates)
    
    return SuccessResponse(success=True, message="Subscription canceled")


# ============================================================================
# Search Endpoint (Filtered by subscriptions)
# ============================================================================

@router.post("/search", response_model=KBSearchResponse)
async def search_knowledge_bases(
    request: KBSearchRequest,
    http_request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Search across subscribed Knowledge Bases

    Security: Filters results by API key's allowed_standards if authenticated via X-API-Key
    """
    import time
    start = time.time()

    await ensure_initialized()
    kb_repo = get_kb_repository()
    sub_repo = get_subscription_repository()

    tenant_id = current_user.get("tenant_id", "default")

    # Get allowed_standards from API key auth (if present)
    from app.middleware.api_key_auth import get_allowed_standards
    allowed_standards = get_allowed_standards(http_request)

    # Get subscribed KB IDs
    sub_filters = {
        "tenant_id": tenant_id,
        "status": KBSubscriptionStatus.ACTIVE.value
    }
    subs = await sub_repo.list(filters=sub_filters)
    subscribed_kb_ids = [s["kb_id"] for s in subs]

    if not subscribed_kb_ids:
        raise HTTPException(status_code=400, detail="No active KB subscriptions")

    # Filter by requested KBs if specified
    kb_ids_to_search = request.kb_ids or subscribed_kb_ids
    kb_ids_to_search = [kb_id for kb_id in kb_ids_to_search if kb_id in subscribed_kb_ids]

    if not kb_ids_to_search:
        raise HTTPException(status_code=403, detail="Not subscribed to requested KBs")

    # SECURITY: Filter by allowed_standards (API key restriction)
    if allowed_standards:
        logger.info(
            f"Applying allowed_standards filter",
            extra={
                "tenant_id": tenant_id,
                "allowed_standards": allowed_standards,
                "requested_kb_ids": kb_ids_to_search
            }
        )

        # Filter marketplace standards (KBs)
        allowed_marketplace = allowed_standards.get("marketplace", [])

        if allowed_marketplace:
            # Only allow KBs that are in allowed list
            kb_ids_to_search = [
                kb_id for kb_id in kb_ids_to_search
                if kb_id in allowed_marketplace
            ]

            if not kb_ids_to_search:
                logger.warning(
                    f"No allowed KBs after standards filter",
                    extra={
                        "tenant_id": tenant_id,
                        "allowed_marketplace": allowed_marketplace,
                        "subscribed_kb_ids": subscribed_kb_ids
                    }
                )
                raise HTTPException(
                    status_code=403,
                    detail="API key does not have access to requested knowledge bases"
                )

    # Use the real search service
    from app.services.kb_search_service import KBSearchService
    service = KBSearchService()

    search_results = await service.search(
        query=request.query,
        kb_ids=kb_ids_to_search,
        top_k=request.top_k
    )

    # Get KB details for mapping (names)
    all_kbs = await kb_repo.list(filters={"status": KBStatus.ACTIVE.value})
    kb_map = {kb["kb_id"]: kb for kb in all_kbs}

    # Map results to response format with KB names
    results = []
    for r in search_results:
        kb_id = r["kb_id"]
        kb_name = kb_map.get(kb_id, {}).get("name", kb_id)

        results.append(KBSearchResult(
            content=r["content"],
            source=r["source"],
            kb_id=kb_id,
            kb_name=kb_name,
            score=r["score"],
            metadata=r.get("metadata")
        ))

    elapsed = (time.time() - start) * 1000

    logger.info(
        f"Search completed",
        extra={
            "tenant_id": tenant_id,
            "query_length": len(request.query),
            "kb_searched": kb_ids_to_search,
            "results_count": len(results),
            "processing_time_ms": elapsed,
            "api_key_filtered": bool(allowed_standards)
        }
    )

    return KBSearchResponse(
        query=request.query,
        results=results[:request.top_k],
        kb_searched=kb_ids_to_search,
        processing_time_ms=elapsed
    )
