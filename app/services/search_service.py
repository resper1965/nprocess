"""
Serviço de busca de regulamentos usando Firestore Vector Search (Lean Architecture).
Substitui o Vertex AI Agent Builder para redução de custos.

IMPORTANTE: Este serviço requer índices compostos no Firestore para funcionar corretamente:
- Índice composto: tenant_id (ASC) + embedding_vector (VECTOR)
  Criar via: gcloud firestore indexes composite create --collection-group=vectors
  Ou via Console: Firestore > Indexes > Create Index
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
    """Serviço para busca vetorial no Firestore usando Vector Search nativo."""

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
        domain: Optional[str] = None,
        tenant_id: Optional[str] = None,
        limit: int = 5,
        client_id: Optional[str] = None,
        allowed_standards: Optional[Dict[str, List[str]]] = None,
        include_private: bool = True
    ) -> List[Dict[str, str]]:
        """
        Busca regulamentos relevantes usando Firestore Vector Search nativo.
        Usa find_nearest() com filtro por tenant_id para isolamento multi-tenant.

        Args:
            query: Texto da consulta.
            domain: Domínio regulatório (ex: LGPD, SOX) - usado para filtrar resultados (opcional).
            tenant_id: ID do tenant para isolamento multi-tenant. Se None, usa "system" (global).
            limit: Número máximo de resultados (KNN).
            client_id: ID do cliente (legado, mantido para compatibilidade).
            allowed_standards: Standards permitidos {"marketplace": [...], "custom": [...]}.
                              None = todos os standards.
            include_private: Se True, inclui documentos privados do tenant. Se False, apenas globais.

        Returns:
            Lista de chunks encontrados com conteúdo e score de similaridade.
        """
        if not self.db or not self.embedding_model:
            logger.warning("Search Client ou Modelo Embedding não inicializado. Retornando lista vazia.")
            return []

        # Determinar tenant_id: usar fornecido, ou "system" para busca global
        resolved_tenant_id = tenant_id or "system"

        try:
            # 1. Gerar Embedding da Query
            query_embedding = self._generate_embedding(query)
            if not query_embedding:
                logger.warning("Falha ao gerar embedding da query. Retornando lista vazia.")
                return []

            # 2. Converter embedding para objeto Vector
            query_vector = Vector(query_embedding)

            # 3. Mapeamento de domínios para source_ids (para filtragem adicional)
            domain_to_source = {
                "LGPD": "lgpd_br",
                "GDPR": "gdpr_eu",
                "SOX": "sox_us",
                "NIST": "nist_csf",
                "CIS": "cis_controls",
                "ISO27001": "iso_27001",
            }
            source_id = domain_to_source.get(domain.upper()) if domain else None

            # 3.1. Verificar se source_id está na lista de allowed_standards (marketplace)
            if allowed_standards is not None:
                marketplace_allowed = allowed_standards.get("marketplace", [])
                if source_id and marketplace_allowed and source_id not in marketplace_allowed:
                    logger.warning(f"Marketplace standard {source_id} não permitido. Allowed: {marketplace_allowed}")
                    return []  # API key não tem acesso a este standard do marketplace

            # 4. Executar Vector Search com filtro por tenant_id
            # IMPORTANTE: Requer índice composto no Firestore:
            # - Collection: vectors
            # - Fields: tenant_id (ASC) + embedding_vector (VECTOR)
            # Criar via: gcloud firestore indexes composite create --collection-group=vectors
            # Ou via Console: Firestore > Indexes > Create Index
            try:
                # Usar coleção unificada "vectors" com filtro por tenant_id
                vectors_collection = self.db.collection("vectors")
                
                # Aplicar filtro por tenant_id ANTES da busca vetorial
                # Isso requer índice composto: tenant_id (ASC) + embedding_vector (VECTOR)
                # TODO: Criar índice composto no GCP Console ou via gcloud:
                #   gcloud firestore indexes composite create \
                #     --collection-group=vectors \
                #     --query-scope=COLLECTION \
                #     --field-config field-path=tenant_id,order=ASCENDING \
                #     --field-config field-path=embedding_vector,vector-config=dimension=768,distance=COSINE
                filtered_query = vectors_collection.where("tenant_id", "==", resolved_tenant_id)
                
                # Se include_private=False, filtrar apenas documentos globais
                if not include_private:
                    filtered_query = filtered_query.where("scope", "==", "global")
                
                # Executar busca vetorial usando find_nearest() nativo do Firestore
                # Isso garante que apenas documentos relevantes sejam retornados,
                # ao contrário da abordagem anterior que fazia limit() e depois
                # calculava cosine similarity em memória
                vector_query = filtered_query.find_nearest(
                    vector_field="embedding_vector",
                    query_vector=query_vector,
                    distance_measure=DistanceMeasure.COSINE,
                    limit=limit
                )
                
                # Executar query e obter resultados
                docs = vector_query.get()
                
            except Exception as vector_error:
                # Tratamento de erro: índice vetorial pode não existir ainda
                error_msg = str(vector_error).lower()
                if "index" in error_msg or "not found" in error_msg or "does not exist" in error_msg:
                    logger.error(
                        f"Índice vetorial não encontrado para coleção 'vectors'. "
                        f"Erro: {vector_error}\n"
                        f"SOLUÇÃO: Criar índice composto no Firestore:\n"
                        f"  - Collection: vectors\n"
                        f"  - Fields: tenant_id (ASC) + embedding_vector (VECTOR)\n"
                        f"  - Comando: gcloud firestore indexes composite create --collection-group=vectors"
                    )
                    # Fallback: retornar lista vazia com log de erro
                    return []
                else:
                    # Re-raise outros erros
                    raise

            # 5. Processar resultados
            results = []
            for doc in docs:
                data = doc.to_dict()
                metadata = data.get("metadata", {})

                # Extrair informações do documento
                source_id_doc = data.get("source_id")
                scope = data.get("scope", "global")  # "global" ou "private"
                
                # Determinar tipo de standard baseado no scope e source_id
                if scope == "global":
                    source_type = "marketplace"
                    doc_source_id = source_id_doc
                elif scope == "private":
                    source_type = "custom"
                    doc_source_id = source_id_doc
                else:
                    # Unknown scope, skip
                    logger.debug(f"Documento com scope desconhecido: {scope}. Pulando.")
                    continue

                # Filtrar por allowed_standards se especificado
                if allowed_standards is not None:
                    if source_type == "marketplace":
                        marketplace_allowed = allowed_standards.get("marketplace", [])
                        if marketplace_allowed and doc_source_id not in marketplace_allowed:
                            logger.debug(f"Filtrando marketplace chunk de {doc_source_id} (não permitido)")
                            continue
                    elif source_type == "custom":
                        custom_allowed = allowed_standards.get("custom", [])
                        if custom_allowed and doc_source_id not in custom_allowed:
                            logger.debug(f"Filtrando custom chunk de {doc_source_id} (não permitido)")
                            continue

                # Filtro adicional por domain nos metadados (pós-busca)
                # Útil quando domain não está mapeado para source_id
                chunk_domain = metadata.get("domain", "").upper()
                if source_id is None and domain and chunk_domain and chunk_domain != domain.upper():
                    logger.debug(f"Filtrando chunk por domain: {chunk_domain} != {domain.upper()}")
                    continue  # Skip se domain não bate

                # Extrair título e conteúdo
                title = data.get("standard_title", metadata.get("name", "Regulamento"))
                content = data.get("content", "")

                # Construir source string para compatibilidade
                if scope == "global":
                    source_path = f"global_standards/{doc_source_id}/chunks/{doc.id}"
                else:
                    source_path = f"client_standards/{resolved_tenant_id}/{doc_source_id}/chunks/{doc.id}"

                results.append({
                    "title": title,
                    "content": content,
                    "source": f"Firestore:{source_path}",
                    "hierarchy": metadata.get("hierarchy", ""),
                    "relevance_score": 0.0  # Firestore retorna ordenado por relevância (cosine distance)
                })

            logger.info(f"Busca concluída: {len(results)} resultados encontrados para tenant_id={resolved_tenant_id}, domain={domain or 'N/A'}")
            return results

        except Exception as e:
            logger.error(f"Erro na busca vetorial Firestore: {e}", exc_info=True)
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
