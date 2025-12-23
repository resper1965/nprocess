"""
Serviço de banco de dados usando Google Cloud Firestore.
"""
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

import google.auth
from google.cloud import firestore
from google.cloud.firestore_v1 import DocumentSnapshot


logger = logging.getLogger(__name__)


# ============================================================================
# Firestore Collections
# ============================================================================

PROCESSES_COLLECTION = "processes"
ANALYSES_COLLECTION = "compliance_analyses"


# ============================================================================
# Database Service Class
# ============================================================================

class DatabaseService:
    """Serviço para interação com Firestore."""

    def __init__(self, project_id: Optional[str] = None):
        """
        Inicializa o serviço de banco de dados.

        Args:
            project_id: ID do projeto GCP. Se None, usa ADC.
        """
        try:
            # Usa Application Default Credentials
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()

            logger.info("DatabaseService inicializado com sucesso")
        except Exception as e:
            logger.error(f"Erro ao inicializar Firestore: {e}")
            raise

    # ========================================================================
    # Process Operations
    # ========================================================================

    async def create_process(self, process_data: Dict[str, Any]) -> str:
        """
        Cria um novo processo no Firestore.

        Args:
            process_data: Dados do processo a serem salvos.

        Returns:
            ID do documento criado.
        """
        try:
            # Adiciona timestamp de criação
            process_data["created_at"] = firestore.SERVER_TIMESTAMP
            process_data["updated_at"] = firestore.SERVER_TIMESTAMP

            # Cria documento na coleção processes
            doc_ref = self.db.collection(PROCESSES_COLLECTION).document()
            doc_ref.set(process_data)

            logger.info(f"Processo criado com ID: {doc_ref.id}")
            return doc_ref.id

        except Exception as e:
            logger.error(f"Erro ao criar processo: {e}")
            raise

    async def get_process(self, process_id: str) -> Optional[Dict[str, Any]]:
        """
        Recupera um processo pelo ID.

        Args:
            process_id: ID do processo.

        Returns:
            Dados do processo ou None se não encontrado.
        """
        try:
            doc_ref = self.db.collection(PROCESSES_COLLECTION).document(process_id)
            doc: DocumentSnapshot = doc_ref.get()

            if not doc.exists:
                logger.warning(f"Processo não encontrado: {process_id}")
                return None

            data = doc.to_dict()
            data["id"] = doc.id

            logger.info(f"Processo recuperado: {process_id}")
            return data

        except Exception as e:
            logger.error(f"Erro ao recuperar processo: {e}")
            raise

    async def update_process(
        self,
        process_id: str,
        updates: Dict[str, Any],
        create_version: bool = True
    ) -> bool:
        """
        Atualiza um processo existente.

        Args:
            process_id: ID do processo.
            updates: Campos a serem atualizados.
            create_version: Whether to create a version snapshot before updating.

        Returns:
            True se atualizado com sucesso, False se não encontrado.
        """
        try:
            doc_ref = self.db.collection(PROCESSES_COLLECTION).document(process_id)

            # Verifica se existe
            if not doc_ref.get().exists:
                logger.warning(f"Processo não encontrado para atualização: {process_id}")
                return False

            # Create version snapshot before updating (if enabled)
            if create_version:
                try:
                    from app.services.version_service import get_version_service
                    version_service = get_version_service()
                    
                    # Get current process data
                    current_data = await self.get_process(process_id)
                    if current_data:
                        # Remove 'id' field (not part of process_data)
                        current_data.pop('id', None)
                        
                        # Create version automatically
                        await version_service.create_version(
                            process_id=process_id,
                            process_data=current_data,
                            request=None  # Auto-version, no user notes
                        )
                        logger.info(f"Auto-created version for process {process_id} before update")
                except Exception as e:
                    # Don't fail the update if versioning fails
                    logger.warning(f"Failed to create version before update: {e}")

            # Adiciona timestamp de atualização
            updates["updated_at"] = firestore.SERVER_TIMESTAMP

            doc_ref.update(updates)
            logger.info(f"Processo atualizado: {process_id}")
            return True

        except Exception as e:
            logger.error(f"Erro ao atualizar processo: {e}")
            raise

    async def delete_process(self, process_id: str) -> bool:
        """
        Deleta um processo.

        Args:
            process_id: ID do processo.

        Returns:
            True se deletado, False se não encontrado.
        """
        try:
            doc_ref = self.db.collection(PROCESSES_COLLECTION).document(process_id)

            if not doc_ref.get().exists:
                logger.warning(f"Processo não encontrado para deleção: {process_id}")
                return False

            doc_ref.delete()
            logger.info(f"Processo deletado: {process_id}")
            return True

        except Exception as e:
            logger.error(f"Erro ao deletar processo: {e}")
            raise

    async def list_processes(
        self,
        limit: int = 100,
        domain: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Lista processos com filtros opcionais.

        Args:
            limit: Número máximo de resultados.
            domain: Filtrar por domínio (opcional).

        Returns:
            Lista de processos.
        """
        try:
            query = self.db.collection(PROCESSES_COLLECTION)

            if domain:
                query = query.where("domain", "==", domain)

            query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
            query = query.limit(limit)

            docs = query.stream()

            processes = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                processes.append(data)

            logger.info(f"Recuperados {len(processes)} processos")
            return processes

        except Exception as e:
            logger.error(f"Erro ao listar processos: {e}")
            raise

    # ========================================================================
    # Compliance Analysis Operations
    # ========================================================================

    async def create_analysis(self, analysis_data: Dict[str, Any]) -> str:
        """
        Cria uma nova análise de compliance.

        Args:
            analysis_data: Dados da análise.

        Returns:
            ID da análise criada.
        """
        try:
            # Adiciona timestamps
            analysis_data["created_at"] = firestore.SERVER_TIMESTAMP
            analysis_data["analyzed_at"] = datetime.utcnow().isoformat()

            # Cria documento
            doc_ref = self.db.collection(ANALYSES_COLLECTION).document()
            doc_ref.set(analysis_data)

            logger.info(f"Análise criada com ID: {doc_ref.id}")
            return doc_ref.id

        except Exception as e:
            logger.error(f"Erro ao criar análise: {e}")
            raise

    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """
        Recupera uma análise pelo ID.

        Args:
            analysis_id: ID da análise.

        Returns:
            Dados da análise ou None se não encontrado.
        """
        try:
            doc_ref = self.db.collection(ANALYSES_COLLECTION).document(analysis_id)
            doc: DocumentSnapshot = doc_ref.get()

            if not doc.exists:
                logger.warning(f"Análise não encontrada: {analysis_id}")
                return None

            data = doc.to_dict()
            data["id"] = doc.id

            logger.info(f"Análise recuperada: {analysis_id}")
            return data

        except Exception as e:
            logger.error(f"Erro ao recuperar análise: {e}")
            raise

    async def list_analyses_by_process(
        self,
        process_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Lista análises de um processo específico.

        Args:
            process_id: ID do processo.
            limit: Número máximo de resultados.

        Returns:
            Lista de análises.
        """
        try:
            query = (
                self.db.collection(ANALYSES_COLLECTION)
                .where("process_id", "==", process_id)
                .order_by("created_at", direction=firestore.Query.DESCENDING)
                .limit(limit)
            )

            docs = query.stream()

            analyses = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                analyses.append(data)

            logger.info(f"Recuperadas {len(analyses)} análises para processo {process_id}")
            return analyses

        except Exception as e:
            logger.error(f"Erro ao listar análises: {e}")
            raise


# ============================================================================
# Singleton Instance
# ============================================================================

_db_service_instance: Optional[DatabaseService] = None


def get_db_service() -> DatabaseService:
    """Retorna instância singleton do DatabaseService."""
    global _db_service_instance
    if _db_service_instance is None:
        _db_service_instance = DatabaseService()
    return _db_service_instance
