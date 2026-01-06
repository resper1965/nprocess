"""
Standards Management Router
Handles both Marketplace (global) and Custom (client-specific) standards
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List, Optional
import logging
from datetime import datetime
import secrets

from app.schemas import (
    StandardMarketplaceInfo,
    StandardCustomCreate,
    StandardCustomInfo,
    StandardCustomUpdate,
    StandardIngestRequest,
    StandardIngestResponse,
    StandardStatus,
    StandardSourceType
)
from app.middleware.auth import get_current_user
from app.services.firestore_repository import FirestoreRepository

logger = logging.getLogger(__name__)

router = APIRouter()

# Firestore connection
db = FirestoreRepository()


# ============================================================================
# Marketplace Standards (Global/Public)
# ============================================================================

@router.get("/marketplace")
async def list_marketplace_standards(
    current_user: dict = Depends(get_current_user)
):
    """List all available marketplace standards"""
    try:
        # Fetch from Firestore global_standards collection
        docs = db.db.collection("global_standards").stream()
        standards = []

        for doc in docs:
            data = doc.to_dict()
            standards.append(StandardMarketplaceInfo(
                standard_id=doc.id,
                name=data.get("name", ""),
                description=data.get("description", ""),
                category=data.get("category", ""),
                jurisdiction=data.get("jurisdiction"),
                version=data.get("version"),
                total_chunks=data.get("total_chunks", 0),
                last_updated=data.get("last_updated", datetime.utcnow()),
                official_url=data.get("official_url"),
                is_active=data.get("is_active", True)
            ))

        # Fallback: if empty, return hardcoded marketplace standards
        if not standards:
            standards = [
        StandardMarketplaceInfo(
            standard_id="lgpd_br",
            name="LGPD - Lei Geral de Proteção de Dados",
            description="Lei brasileira de proteção de dados pessoais (Lei nº 13.709/2018)",
            category="legal",
            jurisdiction="BR",
            version="2018",
            total_chunks=12234,
            last_updated=datetime(2024, 1, 15),
            official_url="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
            is_active=True
        ),
        StandardMarketplaceInfo(
            standard_id="iso27001",
            name="ISO/IEC 27001:2013",
            description="Information Security Management System",
            category="security",
            jurisdiction=None,
            version="2013",
            total_chunks=8456,
            last_updated=datetime(2024, 1, 10),
            official_url="https://www.iso.org/standard/54534.html",
            is_active=True
        ),
        StandardMarketplaceInfo(
            standard_id="gdpr_eu",
            name="GDPR - General Data Protection Regulation",
            description="EU regulation on data protection and privacy",
            category="legal",
            jurisdiction="EU",
            version="2016/679",
            total_chunks=15678,
            last_updated=datetime(2024, 1, 5),
            official_url="https://gdpr.eu/",
            is_active=True
        ),
        StandardMarketplaceInfo(
            standard_id="sox_us",
            name="SOX - Sarbanes-Oxley Act",
            description="US federal law for corporate financial reporting",
            category="financial",
            jurisdiction="US",
            version="2002",
            total_chunks=5432,
            last_updated=datetime(2023, 12, 20),
            official_url="https://www.sec.gov/spotlight/sarbanes-oxley.htm",
            is_active=True
        ),
        StandardMarketplaceInfo(
            standard_id="hipaa_us",
            name="HIPAA - Health Insurance Portability",
            description="US law for medical information privacy",
            category="healthcare",
            jurisdiction="US",
            version="1996",
            total_chunks=9876,
            last_updated=datetime(2024, 1, 8),
            official_url="https://www.hhs.gov/hipaa/index.html",
            is_active=True
        ),
        StandardMarketplaceInfo(
            standard_id="nist_csf",
            name="NIST Cybersecurity Framework",
            description="Framework for improving critical infrastructure cybersecurity",
            category="security",
            jurisdiction="US",
            version="1.1",
            total_chunks=6543,
            last_updated=datetime(2024, 1, 12),
            official_url="https://www.nist.gov/cyberframework",
            is_active=True
        ),
        StandardMarketplaceInfo(
            standard_id="pci_dss",
            name="PCI-DSS - Payment Card Industry Data Security Standard",
            description="Security standard for credit card transaction processing",
            category="financial",
            jurisdiction=None,
            version="4.0",
            total_chunks=7654,
            last_updated=datetime(2024, 1, 18),
            official_url="https://www.pcisecuritystandards.org/",
            is_active=True
        )
            ]

        return {"standards": standards}

    except Exception as e:
        logger.error(f"Error fetching marketplace standards: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/marketplace/{standard_id}", response_model=StandardMarketplaceInfo)
async def get_marketplace_standard(
    standard_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get details of a specific marketplace standard"""
    # TODO: Fetch from Firestore
    standards = await list_marketplace_standards(current_user)

    for standard in standards:
        if standard.standard_id == standard_id:
            return standard

    raise HTTPException(status_code=404, detail=f"Standard {standard_id} not found in marketplace")


# ============================================================================
# Custom Standards (Client-Specific/Private)
# ============================================================================

@router.post("/custom", response_model=StandardCustomInfo)
async def create_custom_standard(
    request: StandardCustomCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new custom standard for the client"""
    try:
        # Generate IDs
        standard_id = f"custom_{secrets.token_hex(8)}"
        client_id = current_user.get("client_id", "client_default")

        # Create standard record
        standard = {
            "standard_id": standard_id,
            "client_id": client_id,
            "name": request.name,
            "description": request.description,
            "source_type": request.source_type,
            "status": StandardStatus.PENDING,
            "total_chunks": None,
            "created_at": datetime.utcnow(),
            "created_by": current_user["user_id"],
            "updated_at": datetime.utcnow(),
            "processing_progress": 0.0,
            "error_message": None,
            "metadata": request.metadata or {}
        }

        # Store in database
        if client_id not in custom_standards_db:
            custom_standards_db[client_id] = {}

        custom_standards_db[client_id][standard_id] = standard

        logger.info(f"Custom standard created: {standard_id} by client {client_id}")

        # Trigger ingestion (async in production)
        # TODO: Call ingestion service

        return StandardCustomInfo(**standard)

    except Exception as e:
        logger.error(f"Error creating custom standard: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/custom")
async def list_custom_standards(
    current_user: dict = Depends(get_current_user)
):
    """List all custom standards for the current client"""
    try:
        client_id = current_user.get("client_id", "client_default")

        # Fetch from Firestore
        docs = db.db.collection("client_standards").document(client_id).collection("standards").stream()

        standards = []
        for doc in docs:
            data = doc.to_dict()
            standards.append(StandardCustomInfo(**data))

        return {"standards": standards}

    except Exception as e:
        logger.error(f"Error fetching custom standards: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/custom/{standard_id}", response_model=StandardCustomInfo)
async def get_custom_standard(
    standard_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get details of a specific custom standard"""
    client_id = current_user.get("client_id", "client_default")

    if client_id not in custom_standards_db or standard_id not in custom_standards_db[client_id]:
        raise HTTPException(status_code=404, detail=f"Custom standard {standard_id} not found")

    return StandardCustomInfo(**custom_standards_db[client_id][standard_id])


@router.put("/custom/{standard_id}", response_model=StandardCustomInfo)
async def update_custom_standard(
    standard_id: str,
    request: StandardCustomUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a custom standard metadata"""
    client_id = current_user.get("client_id", "client_default")

    if client_id not in custom_standards_db or standard_id not in custom_standards_db[client_id]:
        raise HTTPException(status_code=404, detail=f"Custom standard {standard_id} not found")

    standard = custom_standards_db[client_id][standard_id]

    # Update fields
    if request.name:
        standard["name"] = request.name
    if request.description:
        standard["description"] = request.description
    if request.metadata:
        standard["metadata"].update(request.metadata)

    standard["updated_at"] = datetime.utcnow()

    logger.info(f"Custom standard updated: {standard_id} by client {client_id}")

    return StandardCustomInfo(**standard)


@router.delete("/custom/{standard_id}")
async def delete_custom_standard(
    standard_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a custom standard"""
    try:
        client_id = current_user.get("client_id", "client_default")

        # Delete from Firestore
        doc_ref = db.db.collection("client_standards").document(client_id).collection("standards").document(standard_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail=f"Custom standard {standard_id} not found")

        doc_ref.delete()

        # Delete associated chunks
        chunks_ref = db.db.collection("client_standards").document(client_id).collection(standard_id).collection("chunks")
        for chunk_doc in chunks_ref.stream():
            chunk_doc.reference.delete()

        logger.info(f"Custom standard deleted: {standard_id} by client {client_id}")

        return {"success": True, "message": f"Custom standard {standard_id} deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting custom standard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/custom/{standard_id}/ingest", response_model=StandardIngestResponse)
async def ingest_custom_standard(
    standard_id: str,
    request: StandardIngestRequest,
    current_user: dict = Depends(get_current_user)
):
    """Ingest or re-ingest a custom standard (vectorize)"""
    client_id = current_user.get("client_id", "client_default")

    if client_id not in custom_standards_db or standard_id not in custom_standards_db[client_id]:
        raise HTTPException(status_code=404, detail=f"Custom standard {standard_id} not found")

    standard = custom_standards_db[client_id][standard_id]

    # Update status to processing
    standard["status"] = StandardStatus.PROCESSING
    standard["processing_progress"] = 0.0
    standard["updated_at"] = datetime.utcnow()

    # TODO: Call actual ingestion service (async)
    # from app.services.ingestion import ingest_command_handler
    # result = await ingest_command_handler({
    #     "source_type": request.source_type.value,
    #     "source": request.source,
    #     "source_id": standard_id,
    #     "client_id": client_id,
    #     "metadata": request.metadata
    # })

    logger.info(f"Ingestion started for custom standard: {standard_id}")

    return StandardIngestResponse(
        standard_id=standard_id,
        status=StandardStatus.PROCESSING,
        message="Ingestion started. Processing in background.",
        chunks_generated=None,
        processing_progress=0.0
    )


@router.get("/custom/{standard_id}/status", response_model=StandardIngestResponse)
async def get_ingestion_status(
    standard_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get the ingestion/processing status of a custom standard"""
    client_id = current_user.get("client_id", "client_default")

    if client_id not in custom_standards_db or standard_id not in custom_standards_db[client_id]:
        raise HTTPException(status_code=404, detail=f"Custom standard {standard_id} not found")

    standard = custom_standards_db[client_id][standard_id]

    return StandardIngestResponse(
        standard_id=standard_id,
        status=standard["status"],
        message=f"Status: {standard['status']}",
        chunks_generated=standard.get("total_chunks"),
        processing_progress=standard.get("processing_progress")
    )


# ============================================================================
# File Upload for Custom Standards
# ============================================================================

@router.post("/custom/upload")
async def upload_custom_standard_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a file for custom standard creation"""
    try:
        # TODO: Save file to cloud storage (GCS)
        # For now, just return file info

        contents = await file.read()

        logger.info(f"File uploaded: {file.filename} ({len(contents)} bytes) by {current_user['user_id']}")

        return {
            "success": True,
            "filename": file.filename,
            "size": len(contents),
            "content_type": file.content_type,
            "message": "File uploaded successfully. Use the file path in create_custom_standard."
        }

    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
