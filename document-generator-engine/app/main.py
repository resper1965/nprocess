"""
Document Generator Engine API
Gera documentação de compliance em Markdown com diagramas Mermaid
a partir de processos BPMN validados
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from typing import List
import logging
import io
import zipfile
from datetime import datetime

from app.services.document_generator import DocumentGenerator
from app.schemas import (
    GenerateDocumentsRequest,
    GeneratedDocument,
    ExportFormat,
    DocumentType
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


app = FastAPI(
    title="Document Generator Engine",
    description="Geração automática de documentação de compliance em Markdown com Mermaid diagrams",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
document_generator = DocumentGenerator()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "document-generator-engine",
        "version": "1.0.0"
    }


@app.post("/v1/documents/generate", response_model=List[GeneratedDocument])
async def generate_documents(request: GenerateDocumentsRequest):
    """
    Generate compliance documents from BPMN process

    Args:
        request: Document generation request with process data

    Returns:
        List of generated documents with download URLs
    """
    try:
        logger.info(f"Generating documents for process {request.process_id}")

        documents = await document_generator.generate_from_process(
            process_id=request.process_id,
            process_name=request.process_name,
            bpmn_xml=request.bpmn_xml,
            controls_addressed=request.controls_addressed,
            evidences_configured=request.evidences_configured,
            company_context=request.company_context,
            document_types=request.document_types,
            export_format=request.export_format
        )

        logger.info(f"Generated {len(documents)} documents")
        return documents

    except Exception as e:
        logger.error(f"Error generating documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/documents/{document_id}/download")
async def download_document(document_id: str):
    """Download generated document"""
    try:
        file_path = await document_generator.get_document_path(document_id)

        if not file_path:
            raise HTTPException(status_code=404, detail="Document not found")

        return FileResponse(
            path=file_path,
            filename=file_path.split('/')[-1],
            media_type='text/markdown'
        )

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document not found")
    except Exception as e:
        logger.error(f"Error downloading document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/documents/export-package")
async def export_audit_package(
    process_id: str,
    control_id: str,
    format: str = "zip"
):
    """
    Export complete audit package (all documents + evidences)

    Args:
        process_id: Process identifier
        control_id: Control identifier (e.g., ISO27001:A.8.7)
        format: Export format (zip, tar.gz)

    Returns:
        Downloadable package
    """
    try:
        logger.info(f"Exporting audit package for {process_id} - {control_id}")

        # Generate package
        package_path = await document_generator.generate_audit_package(
            process_id=process_id,
            control_id=control_id
        )

        if not package_path:
            raise HTTPException(status_code=404, detail="Package generation failed")

        return FileResponse(
            path=package_path,
            filename=f"audit_package_{control_id.replace(':', '_')}_{datetime.now().strftime('%Y%m%d')}.zip",
            media_type='application/zip'
        )

    except Exception as e:
        logger.error(f"Error exporting audit package: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/templates")
async def list_templates():
    """List available document templates"""
    return {
        "procedures": [
            "iso27001_control_procedure",
            "soc2_control_procedure",
            "pci_dss_requirement_procedure",
            "generic_procedure"
        ],
        "work_instructions": [
            "technical_instruction",
            "operational_instruction",
            "administrative_instruction"
        ],
        "checklists": [
            "audit_checklist",
            "compliance_checklist",
            "verification_checklist"
        ]
    }


@app.post("/v1/convert/bpmn-to-mermaid")
async def convert_bpmn_to_mermaid(bpmn_xml: str):
    """
    Convert BPMN XML to Mermaid flowchart

    Args:
        bpmn_xml: BPMN 2.0 XML string

    Returns:
        Mermaid flowchart syntax
    """
    try:
        from app.converters.bpmn_to_mermaid import convert_bpmn_to_mermaid

        mermaid = convert_bpmn_to_mermaid(bpmn_xml)

        return {
            "mermaid": mermaid,
            "preview_url": None  # TODO: Generate preview image
        }

    except Exception as e:
        logger.error(f"Error converting BPMN to Mermaid: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
