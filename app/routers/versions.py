"""
Process versioning endpoints for ComplianceEngine.
"""
import logging
from typing import List

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas_versions import (
    ProcessVersionCreate,
    ProcessVersion,
    ProcessVersionList,
    ProcessVersionCompare,
    ProcessVersionRestore,
)
from app.services.version_service import get_version_service
from app.services.db_service import get_db_service
from app.middleware.auth import validate_api_key


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/processes", tags=["Process Versions"])


# ============================================================================
# Version Endpoints
# ============================================================================

@router.post(
    "/{process_id}/versions",
    response_model=ProcessVersion,
    status_code=status.HTTP_201_CREATED,
    summary="Create new process version",
    description="Create a new version of a process (snapshot current state)"
)
async def create_version(
    process_id: str,
    request: ProcessVersionCreate,
    api_key = Depends(validate_api_key)
):
    """
    Create a new version of a process.
    
    Args:
        process_id: Process ID
        request: Version creation request
        api_key: Validated API key (optional)
        
    Returns:
        ProcessVersion
    """
    try:
        db_service = get_db_service()
        version_service = get_version_service()
        
        # Get current process data
        process_data = await db_service.get_process(process_id)
        if not process_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Process not found: {process_id}"
            )
        
        # Create version
        version = await version_service.create_version(
            process_id=process_id,
            process_data=process_data,
            request=request
        )
        
        return version
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating version: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create version"
        )


@router.get(
    "/{process_id}/versions",
    response_model=ProcessVersionList,
    summary="List process versions",
    description="List all versions of a process"
)
async def list_versions(
    process_id: str,
    limit: int = 50,
    api_key = Depends(validate_api_key)
):
    """
    List all versions of a process.
    
    Args:
        process_id: Process ID
        limit: Maximum number of results
        api_key: Validated API key (optional)
        
    Returns:
        ProcessVersionList
    """
    try:
        version_service = get_version_service()
        
        # Verify process exists
        db_service = get_db_service()
        process_data = await db_service.get_process(process_id)
        if not process_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Process not found: {process_id}"
            )
        
        # List versions
        versions = await version_service.list_versions(process_id, limit)
        
        # Get current version number
        current_version = await version_service.get_current_version_number(process_id)
        
        return ProcessVersionList(
            versions=versions,
            total=len(versions),
            current_version=current_version,
            process_id=process_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing versions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list versions"
        )


@router.get(
    "/{process_id}/versions/{version}",
    response_model=ProcessVersion,
    summary="Get process version",
    description="Get a specific version of a process"
)
async def get_version(
    process_id: str,
    version: int,
    api_key = Depends(validate_api_key)
):
    """
    Get a specific version of a process.
    
    Args:
        process_id: Process ID
        version: Version number
        api_key: Validated API key (optional)
        
    Returns:
        ProcessVersion
    """
    try:
        version_service = get_version_service()
        
        version_data = await version_service.get_version(process_id, version)
        
        if not version_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Version {version} not found for process {process_id}"
            )
        
        return version_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting version: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get version"
        )


@router.post(
    "/{process_id}/versions/{version}/restore",
    response_model=ProcessVersion,
    status_code=status.HTTP_200_OK,
    summary="Restore process version",
    description="Restore a process to a specific version"
)
async def restore_version(
    process_id: str,
    version: int,
    request: ProcessVersionRestore,
    api_key = Depends(validate_api_key)
):
    """
    Restore a process to a specific version.
    
    Args:
        process_id: Process ID
        version: Version number to restore
        request: Restore request
        api_key: Validated API key (optional)
        
    Returns:
        ProcessVersion (new version if create_new_version=True)
    """
    try:
        version_service = get_version_service()
        
        # Override version in request
        request.version = version
        
        restored_version = await version_service.restore_version(
            process_id=process_id,
            request=request
        )
        
        return restored_version
        
    except ValueError as e:
        logger.error(f"Validation error restoring version: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error restoring version: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restore version"
        )


@router.get(
    "/{process_id}/versions/{version1}/compare/{version2}",
    response_model=ProcessVersionCompare,
    summary="Compare process versions",
    description="Compare two versions of a process"
)
async def compare_versions(
    process_id: str,
    version1: int,
    version2: int,
    api_key = Depends(validate_api_key)
):
    """
    Compare two versions of a process.
    
    Args:
        process_id: Process ID
        version1: First version number
        version2: Second version number
        api_key: Validated API key (optional)
        
    Returns:
        ProcessVersionCompare with differences
    """
    try:
        version_service = get_version_service()
        
        comparison = await version_service.compare_versions(
            process_id=process_id,
            version1=version1,
            version2=version2
        )
        
        return comparison
        
    except ValueError as e:
        logger.error(f"Validation error comparing versions: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error comparing versions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compare versions"
        )

