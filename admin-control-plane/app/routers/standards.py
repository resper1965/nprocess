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
from app.services.storage_service import get_storage_service, StorageError, FileNotFoundError as StorageFileNotFoundError
from app.services.ingestion_service import get_ingestion_service, IngestionStatus

logger = logging.getLogger(__name__)

router = APIRouter()

# Services
db = FirestoreRepository()
storage_service = get_storage_service()
ingestion_service = get_ingestion_service()


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
    """
    Create a new custom standard for the client

    Note: For file-based standards, use POST /custom/upload instead.
    This endpoint is for URL or TEXT source types.
    """
    try:
        # Generate IDs
        standard_id = f"custom_{secrets.token_hex(8)}"
        client_id = current_user.get("client_id", "client_default")

        # Create standard record
        standard_data = {
            "standard_id": standard_id,
            "client_id": client_id,
            "name": request.name,
            "description": request.description,
            "source_type": request.source_type,
            "source": request.source if hasattr(request, 'source') else None,
            "status": StandardStatus.PENDING,
            "total_chunks": 0,
            "created_at": datetime.utcnow(),
            "created_by": current_user["user_id"],
            "updated_at": datetime.utcnow(),
            "processing_progress": 0.0,
            "error_message": None,
            "metadata": request.metadata or {}
        }

        # Save to Firestore
        doc_ref = db.db.collection("client_standards").document(client_id).collection("standards").document(standard_id)
        doc_ref.set(standard_data)

        logger.info(
            f"Custom standard created",
            extra={
                "standard_id": standard_id,
                "client_id": client_id,
                "source_type": request.source_type
            }
        )

        return StandardCustomInfo(**standard_data)

    except Exception as e:
        logger.error(f"Error creating custom standard: {str(e)}", exc_info=True)
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
    try:
        client_id = current_user.get("client_id", "client_default")

        # Fetch from Firestore
        doc_ref = db.db.collection("client_standards").document(client_id).collection("standards").document(standard_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(
                status_code=404,
                detail=f"Custom standard {standard_id} not found"
            )

        return StandardCustomInfo(**doc.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching custom standard: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/custom/{standard_id}", response_model=StandardCustomInfo)
async def update_custom_standard(
    standard_id: str,
    request: StandardCustomUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a custom standard metadata"""
    try:
        client_id = current_user.get("client_id", "client_default")

        # Fetch from Firestore
        doc_ref = db.db.collection("client_standards").document(client_id).collection("standards").document(standard_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(
                status_code=404,
                detail=f"Custom standard {standard_id} not found"
            )

        # Prepare updates
        updates = {
            "updated_at": datetime.utcnow()
        }

        if request.name:
            updates["name"] = request.name
        if request.description:
            updates["description"] = request.description
        if request.metadata:
            # Merge metadata
            current_metadata = doc.to_dict().get("metadata", {})
            current_metadata.update(request.metadata)
            updates["metadata"] = current_metadata

        # Update in Firestore
        doc_ref.update(updates)

        # Fetch updated document
        updated_doc = doc_ref.get()

        logger.info(
            f"Custom standard updated",
            extra={
                "standard_id": standard_id,
                "client_id": client_id,
                "updates": list(updates.keys())
            }
        )

        return StandardCustomInfo(**updated_doc.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating custom standard: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


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
    """
    Ingest or re-ingest a custom standard (vectorize and index)

    This triggers the full ingestion pipeline:
    1. Download file from GCS
    2. Extract and clean text
    3. Smart chunking (respects paragraphs/headings)
    4. Generate embeddings (Vertex AI)
    5. Index in Discovery Engine
    6. Update status in Firestore
    """
    try:
        client_id = current_user.get("client_id", "client_default")

        # Fetch standard from Firestore
        doc_ref = db.db.collection("client_standards").document(client_id).collection("standards").document(standard_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(
                status_code=404,
                detail=f"Custom standard {standard_id} not found"
            )

        standard_data = doc.to_dict()

        # Check if already processing
        if standard_data.get("status") == StandardStatus.PROCESSING:
            return StandardIngestResponse(
                standard_id=standard_id,
                status=StandardStatus.PROCESSING,
                message="Ingestion already in progress",
                chunks_generated=standard_data.get("total_chunks"),
                processing_progress=standard_data.get("processing_progress", 0.0)
            )

        # Get file from GCS
        logger.info(
            f"Starting ingestion for standard",
            extra={
                "standard_id": standard_id,
                "client_id": client_id,
                "source": standard_data.get("source")
            }
        )

        try:
            # Download file from GCS
            file_content = await storage_service.download_standard_file(
                standard_id=standard_id,
                client_id=client_id
            )

            # Extract text content (simplified - in production use proper parsers)
            # For PDF: use PyPDF2 or pdfplumber
            # For DOCX: use python-docx
            # For now, assume it's text
            try:
                content_text = file_content.decode("utf-8")
            except UnicodeDecodeError:
                # If not UTF-8, try latin-1
                content_text = file_content.decode("latin-1")

            # Trigger ingestion (async processing)
            # In production, this should be queued via Cloud Tasks
            # For now, we process synchronously
            result = await ingestion_service.ingest_standard(
                standard_id=standard_id,
                content=content_text,
                client_id=client_id,
                source_name=standard_data.get("metadata", {}).get("original_filename", "unknown"),
                metadata=standard_data.get("metadata", {})
            )

            logger.info(
                f"Ingestion completed",
                extra={
                    "standard_id": standard_id,
                    "client_id": client_id,
                    "status": result.status.value,
                    "total_chunks": result.total_chunks,
                    "processing_time_seconds": result.processing_time_seconds
                }
            )

            return StandardIngestResponse(
                standard_id=standard_id,
                status=result.status.value,
                message=result.error_message or "Ingestion completed successfully",
                chunks_generated=result.total_chunks,
                processing_progress=100.0 if result.status == IngestionStatus.COMPLETED else 0.0
            )

        except StorageFileNotFoundError:
            logger.error(f"File not found in storage for standard: {standard_id}")
            raise HTTPException(
                status_code=404,
                detail="Standard file not found in storage. Please re-upload."
            )
        except Exception as e:
            logger.error(
                f"Ingestion failed: {e}",
                extra={
                    "standard_id": standard_id,
                    "client_id": client_id
                },
                exc_info=True
            )

            # Update status to FAILED
            doc_ref.update({
                "status": StandardStatus.FAILED,
                "error_message": str(e),
                "updated_at": datetime.utcnow()
            })

            raise HTTPException(
                status_code=500,
                detail=f"Ingestion failed: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in ingest endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/custom/{standard_id}/status", response_model=StandardIngestResponse)
async def get_ingestion_status(
    standard_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get the ingestion/processing status of a custom standard

    Returns real-time progress from Firestore
    """
    try:
        client_id = current_user.get("client_id", "client_default")

        # Fetch from Firestore
        doc_ref = db.db.collection("client_standards").document(client_id).collection("standards").document(standard_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(
                status_code=404,
                detail=f"Custom standard {standard_id} not found"
            )

        standard_data = doc.to_dict()

        return StandardIngestResponse(
            standard_id=standard_id,
            status=standard_data.get("status", StandardStatus.PENDING),
            message=standard_data.get("processing_message") or standard_data.get("error_message") or f"Status: {standard_data.get('status')}",
            chunks_generated=standard_data.get("total_chunks"),
            processing_progress=standard_data.get("processing_progress", 0.0)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching ingestion status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# File Upload for Custom Standards
# ============================================================================

@router.post("/custom/upload")
async def upload_custom_standard_file(
    file: UploadFile = File(...),
    name: str = None,
    description: str = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a file and create custom standard (all-in-one)

    Returns the created standard with storage details.
    Ingestion is triggered automatically in the background.
    """
    try:
        client_id = current_user.get("client_id", "client_default")
        user_id = current_user.get("user_id")

        # Validate file type
        allowed_extensions = [".pdf", ".txt", ".docx", ".md"]
        file_extension = file.filename.split(".")[-1].lower() if "." in file.filename else ""

        if not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
            raise HTTPException(
                status_code=400,
                detail=f"File type not supported. Allowed: {', '.join(allowed_extensions)}"
            )

        # Read file content
        contents = await file.read()

        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file not allowed")

        if len(contents) > 50 * 1024 * 1024:  # 50MB limit
            raise HTTPException(status_code=413, detail="File too large (max 50MB)")

        # Generate standard ID
        standard_id = f"custom_{secrets.token_hex(8)}"

        # Upload to GCS
        logger.info(
            f"Uploading file to GCS",
            extra={
                "standard_id": standard_id,
                "client_id": client_id,
                "filename": file.filename,
                "size_bytes": len(contents)
            }
        )

        upload_result = await storage_service.upload_standard_file(
            file_content=contents,
            standard_id=standard_id,
            client_id=client_id,
            file_extension=file_extension,
            metadata={
                "original_filename": file.filename,
                "uploaded_by": user_id,
                "content_type": file.content_type or "application/octet-stream"
            }
        )

        # Create standard record in Firestore
        standard_data = {
            "standard_id": standard_id,
            "client_id": client_id,
            "name": name or file.filename,
            "description": description or f"Custom standard uploaded from {file.filename}",
            "source_type": StandardSourceType.FILE,
            "source": upload_result["gcs_path"],
            "status": StandardStatus.PENDING,
            "total_chunks": 0,
            "processing_progress": 0.0,
            "created_at": datetime.utcnow(),
            "created_by": user_id,
            "updated_at": datetime.utcnow(),
            "metadata": {
                "original_filename": file.filename,
                "file_size_bytes": len(contents),
                "gcs_path": upload_result["gcs_path"],
                "blob_name": upload_result["blob_name"],
                "md5_hash": upload_result["md5_hash"]
            }
        }

        # Save to Firestore
        doc_ref = db.db.collection("client_standards").document(client_id).collection("standards").document(standard_id)
        doc_ref.set(standard_data)

        logger.info(
            f"Custom standard created and stored in GCS",
            extra={
                "standard_id": standard_id,
                "client_id": client_id,
                "gcs_path": upload_result["gcs_path"]
            }
        )

        # TODO: Trigger async ingestion via Cloud Tasks
        # For now, return success with instructions to call /ingest endpoint

        return {
            "success": True,
            "standard": StandardCustomInfo(**standard_data),
            "storage": {
                "gcs_path": upload_result["gcs_path"],
                "size_bytes": upload_result["size_bytes"]
            },
            "message": f"Standard created. Call POST /custom/{standard_id}/ingest to start processing."
        }

    except StorageError as e:
        logger.error(f"Storage error during upload: {e}")
        raise HTTPException(status_code=500, detail=f"Storage error: {str(e)}")
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
