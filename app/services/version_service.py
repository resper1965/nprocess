"""
Process versioning service for ComplianceEngine.
"""
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any

from google.cloud import firestore

from app.schemas_versions import (
    ProcessVersionCreate,
    ProcessVersion,
    ProcessVersionCompare,
    ProcessVersionRestore,
)


logger = logging.getLogger(__name__)


# ============================================================================
# Constants
# ============================================================================

PROCESSES_COLLECTION = "processes"
PROCESS_VERSIONS_COLLECTION = "process_versions"
VERSION_METADATA_FIELD = "_version_metadata"


# ============================================================================
# Version Service
# ============================================================================

class VersionService:
    """Service for managing process versions."""
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize version service.
        
        Args:
            project_id: GCP project ID
        """
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()
            
            logger.info("VersionService initialized")
        except Exception as e:
            logger.error(f"Error initializing VersionService: {e}")
            raise
    
    async def create_version(
        self,
        process_id: str,
        process_data: Dict[str, Any],
        request: Optional[ProcessVersionCreate] = None
    ) -> ProcessVersion:
        """
        Create a new version of a process.
        
        Args:
            process_id: Process ID
            process_data: Current process data
            request: Version creation request (optional)
            
        Returns:
            ProcessVersion
        """
        try:
            # Get current version number
            current_version = await self.get_current_version_number(process_id)
            new_version = current_version + 1
            
            # Prepare version data
            version_data = {
                "process_id": process_id,
                "version": new_version,
                "version_tag": request.version_tag if request else None,
                "process_data": process_data,  # Complete snapshot
                "changed_by": request.changed_by if request else "system",
                "change_notes": request.change_notes if request else None,
                "created_at": firestore.SERVER_TIMESTAMP,
                "is_current": True,
            }
            
            # Create version document
            version_ref = self.db.collection(PROCESS_VERSIONS_COLLECTION).document()
            version_ref.set(version_data)
            
            # Mark previous versions as not current
            await self._mark_previous_versions_not_current(process_id, new_version)
            
            # Update process document with version metadata
            process_ref = self.db.collection(PROCESSES_COLLECTION).document(process_id)
            process_ref.update({
                f"{VERSION_METADATA_FIELD}.current_version": new_version,
                f"{VERSION_METADATA_FIELD}.last_versioned_at": firestore.SERVER_TIMESTAMP,
            })
            
            version_id = version_ref.id
            
            logger.info(f"Created version {new_version} for process {process_id}")
            
            return ProcessVersion(
                id=version_id,
                process_id=process_id,
                version=new_version,
                version_tag=version_data["version_tag"],
                process_data=process_data,
                changed_by=version_data["changed_by"],
                change_notes=version_data["change_notes"],
                created_at=datetime.utcnow(),
                is_current=True,
            )
            
        except Exception as e:
            logger.error(f"Error creating version: {e}")
            raise
    
    async def get_current_version_number(self, process_id: str) -> int:
        """
        Get current version number for a process.
        
        Args:
            process_id: Process ID
            
        Returns:
            Current version number (0 if no versions exist)
        """
        try:
            # Check process metadata first
            process_ref = self.db.collection(PROCESSES_COLLECTION).document(process_id)
            process_doc = process_ref.get()
            
            if process_doc.exists:
                metadata = process_doc.to_dict().get(VERSION_METADATA_FIELD, {})
                if "current_version" in metadata:
                    return metadata["current_version"]
            
            # Fallback: query versions collection
            query = (
                self.db.collection(PROCESS_VERSIONS_COLLECTION)
                .where("process_id", "==", process_id)
                .where("is_current", "==", True)
                .limit(1)
            )
            
            docs = list(query.stream())
            if docs:
                return docs[0].to_dict().get("version", 0)
            
            return 0
            
        except Exception as e:
            logger.error(f"Error getting current version: {e}")
            return 0
    
    async def list_versions(
        self,
        process_id: str,
        limit: int = 50
    ) -> List[ProcessVersion]:
        """
        List all versions of a process.
        
        Args:
            process_id: Process ID
            limit: Maximum number of results
            
        Returns:
            List of ProcessVersion
        """
        try:
            query = (
                self.db.collection(PROCESS_VERSIONS_COLLECTION)
                .where("process_id", "==", process_id)
                .order_by("version", direction=firestore.Query.DESCENDING)
                .limit(limit)
            )
            
            docs = query.stream()
            
            versions = []
            for doc in docs:
                data = doc.to_dict()
                
                version = ProcessVersion(
                    id=doc.id,
                    process_id=data["process_id"],
                    version=data["version"],
                    version_tag=data.get("version_tag"),
                    process_data=data["process_data"],
                    changed_by=data["changed_by"],
                    change_notes=data.get("change_notes"),
                    created_at=data["created_at"],
                    is_current=data.get("is_current", False),
                )
                versions.append(version)
            
            logger.info(f"Retrieved {len(versions)} versions for process {process_id}")
            return versions
            
        except Exception as e:
            logger.error(f"Error listing versions: {e}")
            raise
    
    async def get_version(
        self,
        process_id: str,
        version: int
    ) -> Optional[ProcessVersion]:
        """
        Get a specific version of a process.
        
        Args:
            process_id: Process ID
            version: Version number
            
        Returns:
            ProcessVersion or None if not found
        """
        try:
            query = (
                self.db.collection(PROCESS_VERSIONS_COLLECTION)
                .where("process_id", "==", process_id)
                .where("version", "==", version)
                .limit(1)
            )
            
            docs = list(query.stream())
            
            if not docs:
                return None
            
            doc = docs[0]
            data = doc.to_dict()
            
            return ProcessVersion(
                id=doc.id,
                process_id=data["process_id"],
                version=data["version"],
                version_tag=data.get("version_tag"),
                process_data=data["process_data"],
                changed_by=data["changed_by"],
                change_notes=data.get("change_notes"),
                created_at=data["created_at"],
                is_current=data.get("is_current", False),
            )
            
        except Exception as e:
            logger.error(f"Error getting version: {e}")
            raise
    
    async def restore_version(
        self,
        process_id: str,
        request: ProcessVersionRestore
    ) -> ProcessVersion:
        """
        Restore a process to a specific version.
        
        Args:
            process_id: Process ID
            request: Restore request
            
        Returns:
            New ProcessVersion (if create_new_version=True) or restored ProcessVersion
        """
        try:
            # Get the version to restore
            version_to_restore = await self.get_version(process_id, request.version)
            
            if not version_to_restore:
                raise ValueError(f"Version {request.version} not found for process {process_id}")
            
            if request.create_new_version:
                # Create a new version with the restored data
                restore_request = ProcessVersionCreate(
                    version_tag=None,
                    change_notes=request.change_notes or f"Restored from version {request.version}",
                    changed_by="system"
                )
                
                new_version = await self.create_version(
                    process_id=process_id,
                    process_data=version_to_restore.process_data,
                    request=restore_request
                )
                
                # Update the actual process document
                process_ref = self.db.collection(PROCESSES_COLLECTION).document(process_id)
                process_ref.set(version_to_restore.process_data, merge=True)
                
                logger.info(f"Restored process {process_id} to version {request.version} (created new version {new_version.version})")
                
                return new_version
            else:
                # Directly restore without creating new version
                process_ref = self.db.collection(PROCESSES_COLLECTION).document(process_id)
                process_ref.set(version_to_restore.process_data, merge=True)
                
                logger.info(f"Restored process {process_id} to version {request.version} (no new version created)")
                
                return version_to_restore
                
        except Exception as e:
            logger.error(f"Error restoring version: {e}")
            raise
    
    async def compare_versions(
        self,
        process_id: str,
        version1: int,
        version2: int
    ) -> ProcessVersionCompare:
        """
        Compare two versions of a process.
        
        Args:
            process_id: Process ID
            version1: First version number
            version2: Second version number
            
        Returns:
            ProcessVersionCompare with differences
        """
        try:
            v1 = await self.get_version(process_id, version1)
            v2 = await self.get_version(process_id, version2)
            
            if not v1:
                raise ValueError(f"Version {version1} not found")
            if not v2:
                raise ValueError(f"Version {version2} not found")
            
            # Compare process_data
            data1 = v1.process_data
            data2 = v2.process_data
            
            differences = {}
            added_fields = []
            removed_fields = []
            modified_fields = []
            
            # Get all keys from both versions
            all_keys = set(data1.keys()) | set(data2.keys())
            
            for key in all_keys:
                val1 = data1.get(key)
                val2 = data2.get(key)
                
                if key not in data1:
                    added_fields.append(key)
                    differences[key] = {"old": None, "new": val2}
                elif key not in data2:
                    removed_fields.append(key)
                    differences[key] = {"old": val1, "new": None}
                elif val1 != val2:
                    modified_fields.append(key)
                    differences[key] = {"old": val1, "new": val2}
            
            return ProcessVersionCompare(
                process_id=process_id,
                version1=version1,
                version2=version2,
                version1_data=data1,
                version2_data=data2,
                differences=differences,
                added_fields=added_fields,
                removed_fields=removed_fields,
                modified_fields=modified_fields,
            )
            
        except Exception as e:
            logger.error(f"Error comparing versions: {e}")
            raise
    
    async def _mark_previous_versions_not_current(
        self,
        process_id: str,
        new_version: int
    ) -> None:
        """
        Mark all previous versions as not current.
        
        Args:
            process_id: Process ID
            new_version: New version number
        """
        try:
            query = (
                self.db.collection(PROCESS_VERSIONS_COLLECTION)
                .where("process_id", "==", process_id)
                .where("is_current", "==", True)
            )
            
            docs = query.stream()
            
            batch = self.db.batch()
            count = 0
            
            for doc in docs:
                if doc.to_dict().get("version") != new_version:
                    batch.update(doc.reference, {"is_current": False})
                    count += 1
                    
                    # Firestore batch limit is 500
                    if count >= 500:
                        batch.commit()
                        batch = self.db.batch()
                        count = 0
            
            if count > 0:
                batch.commit()
                
        except Exception as e:
            logger.error(f"Error marking previous versions: {e}")
            # Don't raise - this is a cleanup operation


# ============================================================================
# Singleton Instance
# ============================================================================

_version_service_instance: Optional[VersionService] = None


def get_version_service() -> VersionService:
    """Return singleton instance of VersionService."""
    global _version_service_instance
    if _version_service_instance is None:
        _version_service_instance = VersionService()
    return _version_service_instance

