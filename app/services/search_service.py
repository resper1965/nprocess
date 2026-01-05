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
        domain: str,
        limit: int = 5,
        allowed_standards: Optional[List[str]] = None
    ) -> List[Dict[str, str]]:
        """
        Busca regulamentos relevantes usando Firestore Vector Search.

        Args:
            query: Texto da consulta.
            domain: Domínio regulatório (ex: LGPD, SOX) - usado para filtrar resultados.
            limit: Número máximo de resultados (KNN).
            allowed_standards: Lista de standard IDs permitidos para esta API key (None = todos).

        Returns:
            Lista de chunks encontrados com conteúdo e score de similaridade.
        """
        if not self.db or not self.embedding_model:
            logger.warning("Search Client ou Modelo Embedding não inicializado. Retornando lista vazia.")
            return []

        try:
            # 1. Gerar Embedding da Query
            query_embedding = self._generate_embedding(query)
            if not query_embedding:
                return []

            # 2. Buscar no source_id específico se domain for conhecido
            # Mapeamento de domínios para source_ids
            domain_to_source = {
                "LGPD": "lgpd_br",
                "GDPR": "gdpr_eu",
                "SOX": "sox_us",
                "NIST": "nist_csf",
                "CIS": "cis_controls",
                "ISO27001": "iso_27001",
            }

            source_id = domain_to_source.get(domain.upper())

            # 2.1. Verificar se source_id está na lista de allowed_standards
            if allowed_standards is not None:
                if source_id and source_id not in allowed_standards:
                    logger.warning(f"Standard {source_id} não permitido para esta API key. Allowed: {allowed_standards}")
                    return []  # API key não tem acesso a este standard

            if source_id:
                # Busca específica na coleção do source
                chunks_ref = self.db.collection("global_standards").document(source_id).collection("chunks")
                logger.info(f"Buscando em source específico: {source_id}")
            else:
                # Fallback: Busca em todos os chunks via Collection Group
                chunks_ref = self.db.collection_group("chunks")
                logger.info(f"Buscando em todos os sources (domain '{domain}' não mapeado)")
            
            # 3. Executar Vector Search
            vector_query = chunks_ref.find_nearest(
                vector_field="embedding_vector",
                query_vector=Vector(query_embedding),
                distance_measure=DistanceMeasure.COSINE,
                limit=limit
            )
            
            docs = vector_query.get()

            results = []
            for doc in docs:
                data = doc.to_dict()
                metadata = data.get("metadata", {})

                # Extrair source_id do path (ex: global_standards/lgpd_br/chunks/xxx)
                path_parts = doc.reference.path.split('/')
                doc_source_id = path_parts[1] if len(path_parts) > 1 else None

                # Filtrar por allowed_standards se especificado
                if allowed_standards is not None:
                    if doc_source_id not in allowed_standards:
                        logger.debug(f"Filtrando chunk de {doc_source_id} (não permitido)")
                        continue  # Skip este resultado

                # Filtro adicional por domain nos metadados (pós-busca)
                # Útil quando usando collection_group
                chunk_domain = metadata.get("domain", "").upper()
                if source_id is None and domain and chunk_domain and chunk_domain != domain.upper():
                    continue  # Skip se domain não bate

                title = data.get("standard_title", metadata.get("name", "Regulamento"))
                content = data.get("content", "")

                results.append({
                    "title": title,
                    "content": content,
                    "source": f"Firestore:{doc.reference.path}",
                    "hierarchy": metadata.get("hierarchy", ""),
                    "relevance_score": 0.0  # Firestore retorna ordenado por relevância
                })

            return results

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
