"""
Backup and restore service for n.process.
"""
import logging
import json
import gzip
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from io import BytesIO

from google.cloud import firestore, storage
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

from app.schemas_backup import (
    BackupRequest,
    Backup,
    RestoreRequest,
    RestoreResponse,
)


logger = logging.getLogger(__name__)


# ============================================================================
# Constants
# ============================================================================

BACKUPS_COLLECTION = "backups"
RESTORES_COLLECTION = "restores"
BACKUP_BUCKET = "nprocess-backups"  # Should be configurable via env var


# ============================================================================
# Backup Service
# ============================================================================

class BackupService:
    """Service for backup and restore operations."""
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize backup service.
        
        Args:
            project_id: GCP project ID
        """
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
                self.storage_client = storage.Client(project=project_id)
            else:
                self.db = firestore.Client()
                self.storage_client = storage.Client()
            
            logger.info("BackupService initialized")
        except Exception as e:
            logger.error(f"Error initializing BackupService: {e}")
            raise
    
    async def create_backup(
        self,
        api_key_id: str,
        request: BackupRequest
    ) -> Backup:
        """
        Create a backup of the database.
        
        Args:
            api_key_id: API key ID of creator
            request: Backup request
            
        Returns:
            Backup
        """
        try:
            now = datetime.utcnow()
            backup_name = request.name or f"backup_{now.strftime('%Y%m%d_%H%M%S')}"
            
            # Initialize backup record
            backup_data = {
                "name": backup_name,
                "description": request.description,
                "created_by": api_key_id,
                "created_at": now,
                "status": "creating",
                "collections": [],
                "record_count": {},
                "size_bytes": 0,
            }
            
            doc_ref = self.db.collection(BACKUPS_COLLECTION).document()
            doc_ref.set(backup_data)
            backup_id = doc_ref.id
            
            logger.info(f"Creating backup: {backup_id}")
            
            # Collect data from collections
            backup_content = {}
            collections = []
            record_count = {}
            
            # Processes
            if request.include_processes:
                processes = self._export_collection("processes")
                backup_content["processes"] = processes
                collections.append("processes")
                record_count["processes"] = len(processes)
            
            # Analyses
            if request.include_analyses:
                analyses = self._export_collection("compliance_analyses")
                backup_content["analyses"] = analyses
                collections.append("compliance_analyses")
                record_count["compliance_analyses"] = len(analyses)
            
            # Templates
            if request.include_templates:
                templates = self._export_collection("process_templates")
                backup_content["templates"] = templates
                collections.append("process_templates")
                record_count["process_templates"] = len(templates)
            
            # Webhooks
            if request.include_webhooks:
                webhooks = self._export_collection("webhooks")
                backup_content["webhooks"] = webhooks
                collections.append("webhooks")
                record_count["webhooks"] = len(webhooks)
            
            # API Keys (hashed only, no secrets)
            if request.include_api_keys:
                api_keys = self._export_collection("api_keys", exclude_secrets=True)
                backup_content["api_keys"] = api_keys
                collections.append("api_keys")
                record_count["api_keys"] = len(api_keys)
            
            # Tags
            if request.include_tags:
                tags = self._export_collection("tags")
                backup_content["tags"] = tags
                collections.append("tags")
                record_count["tags"] = len(tags)
            
            # Approvals
            if request.include_approvals:
                approvals = self._export_collection("approval_workflows")
                backup_content["approval_workflows"] = approvals
                collections.append("approval_workflows")
                record_count["approval_workflows"] = len(approvals)
            
            # Compress and store
            json_data = json.dumps(backup_content, default=str)
            compressed_data = gzip.compress(json_data.encode('utf-8'))
            size_bytes = len(compressed_data)
            
            # Store in Cloud Storage (or local file system for now)
            try:
                bucket = self.storage_client.bucket(BACKUP_BUCKET)
                blob = bucket.blob(f"backups/{backup_id}.json.gz")
                blob.upload_from_string(compressed_data, content_type='application/gzip')
                download_url = blob.generate_signed_url(
                    expiration=timedelta(hours=1),
                    method='GET'
                )
            except Exception as e:
                logger.warning(f"Could not upload to Cloud Storage: {e}. Storing metadata only.")
                download_url = None
            
            # Update backup record
            doc_ref.update({
                "status": "completed",
                "collections": collections,
                "record_count": record_count,
                "size_bytes": size_bytes,
                "download_url": download_url,
            })
            
            logger.info(f"Backup completed: {backup_id} ({size_bytes} bytes)")
            
            return Backup(
                id=backup_id,
                name=backup_name,
                description=request.description,
                created_by=api_key_id,
                created_at=now,
                size_bytes=size_bytes,
                collections=collections,
                record_count=record_count,
                status="completed",
                download_url=download_url,
            )
            
        except Exception as e:
            logger.error(f"Error creating backup: {e}")
            # Update status to failed
            if 'doc_ref' in locals():
                doc_ref.update({"status": "failed"})
            raise
    
    def _export_collection(
        self,
        collection_name: str,
        exclude_secrets: bool = False
    ) -> List[Dict[str, Any]]:
        """Export a Firestore collection to list of dicts."""
        try:
            docs = self.db.collection(collection_name).stream()
            
            records = []
            for doc in docs:
                data = doc.to_dict()
                data["_id"] = doc.id
                
                # Exclude secrets if requested
                if exclude_secrets:
                    data.pop("key_hash", None)
                    data.pop("secret", None)
                
                records.append(data)
            
            return records
            
        except Exception as e:
            logger.error(f"Error exporting collection {collection_name}: {e}")
            return []
    
    async def list_backups(
        self,
        limit: int = 50
    ) -> List[Backup]:
        """
        List all backups.
        
        Args:
            limit: Maximum number of results
            
        Returns:
            List of Backup
        """
        try:
            query = (
                self.db.collection(BACKUPS_COLLECTION)
                .order_by("created_at", direction=firestore.Query.DESCENDING)
                .limit(limit)
            )
            
            docs = query.stream()
            
            backups = []
            for doc in docs:
                data = doc.to_dict()
                
                backup = Backup(
                    id=doc.id,
                    name=data["name"],
                    description=data.get("description"),
                    created_by=data["created_by"],
                    created_at=data["created_at"],
                    size_bytes=data.get("size_bytes", 0),
                    collections=data.get("collections", []),
                    record_count=data.get("record_count", {}),
                    status=data.get("status", "unknown"),
                    download_url=data.get("download_url"),
                )
                backups.append(backup)
            
            return backups
            
        except Exception as e:
            logger.error(f"Error listing backups: {e}")
            raise
    
    async def get_backup(self, backup_id: str) -> Optional[Backup]:
        """
        Get backup by ID.
        
        Args:
            backup_id: Backup ID
            
        Returns:
            Backup or None if not found
        """
        try:
            doc_ref = self.db.collection(BACKUPS_COLLECTION).document(backup_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            data = doc.to_dict()
            
            return Backup(
                id=doc.id,
                name=data["name"],
                description=data.get("description"),
                created_by=data["created_by"],
                created_at=data["created_at"],
                size_bytes=data.get("size_bytes", 0),
                collections=data.get("collections", []),
                record_count=data.get("record_count", {}),
                status=data.get("status", "unknown"),
                download_url=data.get("download_url"),
            )
            
        except Exception as e:
            logger.error(f"Error getting backup: {e}")
            raise
    
    async def restore_backup(
        self,
        api_key_id: str,
        request: RestoreRequest
    ) -> RestoreResponse:
        """
        Restore from a backup.
        
        Args:
            api_key_id: API key ID performing restore
            request: Restore request
            
        Returns:
            RestoreResponse
        """
        try:
            # Get backup
            backup = await self.get_backup(request.backup_id)
            if not backup:
                raise ValueError(f"Backup not found: {request.backup_id}")
            
            # Initialize restore record
            now = datetime.utcnow()
            restore_data = {
                "backup_id": request.backup_id,
                "restored_by": api_key_id,
                "status": "in_progress",
                "collections_restored": [],
                "records_restored": {},
                "errors": [],
                "started_at": now,
                "completed_at": None,
            }
            
            doc_ref = self.db.collection(RESTORES_COLLECTION).document()
            doc_ref.set(restore_data)
            restore_id = doc_ref.id
            
            logger.info(f"Starting restore: {restore_id} from backup {request.backup_id}")
            
            if request.dry_run:
                # Just validate, don't restore
                restore_data["status"] = "completed"
                restore_data["collections_restored"] = backup.collections
                restore_data["records_restored"] = backup.record_count
                restore_data["completed_at"] = datetime.utcnow()
                doc_ref.update(restore_data)
                
                return RestoreResponse(
                    restore_id=restore_id,
                    backup_id=request.backup_id,
                    status="completed",
                    collections_restored=backup.collections,
                    records_restored=backup.record_count,
                    errors=[],
                    started_at=now,
                    completed_at=datetime.utcnow(),
                )
            
            # Download backup from Cloud Storage
            try:
                bucket = self.storage_client.bucket(BACKUP_BUCKET)
                blob = bucket.blob(f"backups/{request.backup_id}.json.gz")
                compressed_data = blob.download_as_bytes()
                
                # Decompress
                json_data = gzip.decompress(compressed_data).decode('utf-8')
                backup_content = json.loads(json_data)
            except Exception as e:
                logger.error(f"Error downloading backup: {e}")
                raise ValueError(f"Could not download backup: {e}")
            
            # Restore collections
            collections_to_restore = request.collections or backup.collections
            records_restored = {}
            errors = []
            
            for collection_name in collections_to_restore:
                if collection_name not in backup_content:
                    errors.append(f"Collection {collection_name} not found in backup")
                    continue
                
                try:
                    records = backup_content[collection_name]
                    count = self._import_collection(
                        collection_name,
                        records,
                        overwrite=request.overwrite_existing
                    )
                    records_restored[collection_name] = count
                    logger.info(f"Restored {count} records to {collection_name}")
                except Exception as e:
                    error_msg = f"Error restoring {collection_name}: {e}"
                    errors.append(error_msg)
                    logger.error(error_msg)
            
            # Update restore record
            restore_data.update({
                "status": "completed",
                "collections_restored": list(records_restored.keys()),
                "records_restored": records_restored,
                "errors": errors,
                "completed_at": datetime.utcnow(),
            })
            doc_ref.update(restore_data)
            
            logger.info(f"Restore completed: {restore_id}")
            
            return RestoreResponse(
                restore_id=restore_id,
                backup_id=request.backup_id,
                status="completed",
                collections_restored=list(records_restored.keys()),
                records_restored=records_restored,
                errors=errors,
                started_at=now,
                completed_at=datetime.utcnow(),
            )
            
        except Exception as e:
            logger.error(f"Error restoring backup: {e}")
            if 'doc_ref' in locals():
                doc_ref.update({
                    "status": "failed",
                    "errors": [str(e)],
                    "completed_at": datetime.utcnow(),
                })
            raise
    
    def _import_collection(
        self,
        collection_name: str,
        records: List[Dict[str, Any]],
        overwrite: bool = False
    ) -> int:
        """Import records into a Firestore collection."""
        count = 0
        
        for record in records:
            try:
                # Extract ID if present
                doc_id = record.pop("_id", None)
                
                # Convert timestamps
                for key, value in record.items():
                    if isinstance(value, str) and "T" in value and "Z" in value:
                        try:
                            record[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                        except:
                            pass
                
                if doc_id:
                    doc_ref = self.db.collection(collection_name).document(doc_id)
                    if overwrite or not doc_ref.get().exists:
                        doc_ref.set(record)
                        count += 1
                else:
                    # Create new document
                    self.db.collection(collection_name).add(record)
                    count += 1
                    
            except Exception as e:
                logger.warning(f"Error importing record to {collection_name}: {e}")
                continue
        
        return count
    
    async def delete_backup(self, backup_id: str) -> bool:
        """
        Delete a backup.
        
        Args:
            backup_id: Backup ID
            
        Returns:
            True if deleted successfully
        """
        try:
            # Delete from Firestore
            doc_ref = self.db.collection(BACKUPS_COLLECTION).document(backup_id)
            doc_ref.delete()
            
            # Delete from Cloud Storage
            try:
                bucket = self.storage_client.bucket(BACKUP_BUCKET)
                blob = bucket.blob(f"backups/{backup_id}.json.gz")
                blob.delete()
            except Exception as e:
                logger.warning(f"Could not delete backup file from storage: {e}")
            
            logger.info(f"Backup deleted: {backup_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting backup: {e}")
            raise


# ============================================================================
# Singleton Instance
# ============================================================================

_backup_service_instance: Optional[BackupService] = None


def get_backup_service() -> BackupService:
    """Return singleton instance of BackupService."""
    global _backup_service_instance
    if _backup_service_instance is None:
        _backup_service_instance = BackupService()
    return _backup_service_instance

