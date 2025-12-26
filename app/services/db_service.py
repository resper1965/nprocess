"""
Serviço de banco de dados usando Google Cloud Firestore.
Foco: Persistência de Logs de Auditoria (Stateless Engine).
"""
import logging
from typing import Any, Dict, Optional, List

import google.auth
from google.cloud import firestore
from google.cloud.firestore_v1 import DocumentSnapshot

logger = logging.getLogger(__name__)

# Collection names
ANALYSES_COLLECTION = "compliance_audit_logs" # Renamed from 'compliance_analyses' to be clear it's a log

class DatabaseService:
    """Serviço para interação com Firestore (Audit Logs)."""

    def __init__(self, project_id: Optional[str] = None):
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()
            logger.info("DatabaseService (Audit) inicializado")
        except Exception as e:
            logger.error(f"Erro ao inicializar Firestore: {e}")
            raise

    async def create_analysis(self, analysis_data: Dict[str, Any]) -> str:
        """
        Salva um registro de análise de compliance (Audit Log).
        """
        try:
            # Firestore automatically handles timestamp if we use server_timestamp, 
            # but analysis_data already has 'analyzed_at' from the service.
            # We can just save it.
            
            doc_ref = self.db.collection(ANALYSES_COLLECTION).document()
            doc_ref.set(analysis_data)
            
            return doc_ref.id
        except Exception as e:
            logger.error(f"Erro ao salvar log de auditoria: {e}")
            raise

    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """
        Recupera um log de auditoria pelo ID.
        """
        try:
            doc_ref = self.db.collection(ANALYSES_COLLECTION).document(analysis_id)
            doc = doc_ref.get()
            if not doc.exists:
                return None
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        except Exception as e:
            logger.error(f"Erro ao recuperar log: {e}")
            raise

    async def list_analyses(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Lista os logs de auditoria mais recentes.
        """
        try:
            query = self.db.collection(ANALYSES_COLLECTION).order_by("analyzed_at", direction=firestore.Query.DESCENDING).limit(limit)
            docs = query.stream()
            return [{"id": doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            logger.error(f"Erro ao listar logs: {e}")
            # Retorna lista vazia em caso de erro (ex: collection não existe ainda)
            return []

_db_service_instance = None

def get_db_service() -> DatabaseService:
    global _db_service_instance
    if _db_service_instance is None:
        _db_service_instance = DatabaseService()
    return _db_service_instance
