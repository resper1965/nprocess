"""
Serviço de busca de regulamentos usando Firestore Vector Search (Lean Architecture).
Substitui o Vertex AI Agent Builder para redução de custos.
"""
import logging
import os
from typing import List, Dict, Optional

from google.cloud import firestore
from google.cloud.firestore_v1.vector import Vector
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure

# Importando Vertex AI SÓ para gerar embeddings da query (custo baixo)
import vertexai
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel

logger = logging.getLogger(__name__)

class SearchService:
    """Serviço para busca vetorial no Firestore."""

    def __init__(self, project_id: Optional[str] = None):
        self.project_id = project_id or os.getenv("GCP_PROJECT_ID")
        self.location = "us-central1" # Ajustar conforme região
        
        self.db = None
        self.embedding_model = None

        if not self.project_id:
            logger.warning("GCP_PROJECT_ID não configurado. SearchService não funcionará.")
            return

        try:
            # Inicializa Firestore
            self.db = firestore.Client(project=self.project_id)
            
            # Inicializa Model Vertex para gerar embeddings da query
            vertexai.init(project=self.project_id, location=self.location)
            self.embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
            
            logger.info(f"SearchService (Firestore Vector) inicializado para projeto: {self.project_id}")
        except Exception as e:
            logger.error(f"Erro ao inicializar SearchService: {e}")
            self.db = None

    async def search_regulations(
        self, 
        query: str, 
        tenant_id: str,
        include_private: bool = False,
        limit: int = 5
    ) -> List[Dict[str, str]]:
        """
        Multi-tenant Vector Search using Firestore.
        
        Args:
            query: User question.
            tenant_id: The authenticated user's tenant ID.
            include_private: If True, searches Private + Global. Else Only Global.
            limit: Max results.
        """
        if not self.db or not self.embedding_model:
            return []

        try:
            # 1. Embedding
            query_embedding = self._generate_embedding(query)
            if not query_embedding:
                return []

            # 2. Define Scope (Filter)
            # Firestore Vector Search supports pre-filtering.
            # We must construct a query that targets the 'vectors' collection
            # and filters by the allowed tenant_ids.
            
            base_ref = self.db.collection("vectors")
            
            # Logic:
            # If include_private: tenant_id IN ['system', tenant_id]
            # Else: tenant_id == 'system'
            
            allowed_tenants = ["system"]
            if include_private and tenant_id:
                allowed_tenants.append(tenant_id)
                
            # Note: Firestore 'in' query supports up to 10 values.
            # We filter for documents where tenant_id is in our allowed list.
            vector_query = base_ref.where(field_path="tenant_id", op_string="in", value=allowed_tenants)
            
            # 3. Execute Vector Search on the Filtered Query
            results = vector_query.find_nearest(
                vector_field="embedding_vector",
                query_vector=Vector(query_embedding),
                distance_measure=DistanceMeasure.COSINE,
                limit=limit
            ).get()

            # 4. Parse Results
            parsed_results = []
            for doc in results:
                data = doc.to_dict()
                parsed_results.append({
                    "title": data.get("metadata", {}).get("name", "Unknown"),
                    "content": data.get("content", ""),
                    "source": f"Firestore:{doc.id}",
                    "scope": data.get("scope", "unknown"),
                    "tenant_id": data.get("tenant_id", "unknown"),
                    "score": 0.0 
                })
                
            return parsed_results

        except Exception as e:
            logger.error(f"Vector Search Failed: {e}")
            return []

        except Exception as e:
            logger.error(f"Erro na busca vetorial Firestore: {e}")
            return []

    def _generate_embedding(self, text: str) -> Optional[List[float]]:
        """Gera embedding para o texto usando Vertex AI."""
        try:
            inputs = [TextEmbeddingInput(text=text, task_type="RETRIEVAL_QUERY")]
            embeddings = self.embedding_model.get_embeddings(inputs)
            return embeddings[0].values
        except Exception as e:
            logger.error(f"Erro ao gerar embedding da query: {e}")
            return None

_search_service_instance = None

def get_search_service() -> SearchService:
    global _search_service_instance
    if _search_service_instance is None:
        _search_service_instance = SearchService()
    return _search_service_instance
