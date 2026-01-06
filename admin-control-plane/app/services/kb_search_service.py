"""
Knowledge Base Search Service
Integrates with Vertex AI Search for vector-based document search.
"""

import os
import logging
import time
import json
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib

logger = logging.getLogger(__name__)

# Environment config
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "nprocess-8e801")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
DATASTORE_ID = os.getenv("VERTEX_DATASTORE_ID", "nprocess-kb-central")


class KBSearchService:
    """
    Service for ingesting and searching documents in Knowledge Bases.
    Uses a central Vertex AI Search datastore with kb_id metadata for filtering.
    """
    
    def __init__(self):
        self._search_client = None
        self._doc_client = None
        self._embedding_client = None
    
    def _get_search_client(self):
        """Lazy initialization of Search Service Client"""
        if self._search_client is None:
            try:
                from google.cloud import discoveryengine_v1 as discoveryengine
                self._search_client = discoveryengine.SearchServiceClient()
            except ImportError:
                logger.warning("google-cloud-discoveryengine not installed, using mock")
                self._search_client = "mock"
        return self._search_client

    def _get_document_client(self):
        """Lazy initialization of Document Service Client"""
        if self._doc_client is None:
            try:
                from google.cloud import discoveryengine_v1 as discoveryengine
                self._doc_client = discoveryengine.DocumentServiceClient()
            except ImportError:
                logger.warning("google-cloud-discoveryengine not installed, using mock")
                self._doc_client = "mock"
        return self._doc_client
    
    def _get_embedding_client(self):
        """Lazy initialization of Embedding Client (Gemini)"""
        if self._embedding_client is None:
            try:
                import google.generativeai as genai
                api_key = os.getenv("GEMINI_API_KEY")
                if api_key:
                    genai.configure(api_key=api_key)
                    self._embedding_client = genai
                else:
                    self._embedding_client = "mock"
            except ImportError:
                self._embedding_client = "mock"
        return self._embedding_client
    
    async def ingest_documents(
        self,
        kb_id: str,
        documents: List[Dict[str, Any]],
        replace_existing: bool = False
    ) -> Dict[str, Any]:
        """
        Ingest documents into a Knowledge Base.
        Splits content into chunks and imports them into Vertex AI Search.
        """
        start_time = time.time()
        errors = []
        chunks_created = 0
        
        # 1. Optionally purge existing documents
        if replace_existing:
            await self.delete_kb_documents(kb_id)
        
        # 2. Process documents and create chunks
        batch_docs = []
        
        try:
            for doc in documents:
                content = doc.get("content", "")
                source = doc.get("source", "unknown")
                metadata = doc.get("metadata", {})
                
                chunks = self._split_into_chunks(content)
                
                for i, chunk in enumerate(chunks):
                    doc_id = self._generate_doc_id(kb_id, source, i)
                    
                    # Prepare document dictionary for batch import
                    # We store content/metadata in 'struct_data' for flexibility
                    doc_payload = {
                        "id": doc_id,
                        "struct_data": {
                            "content": chunk,
                            "source": source,
                            "kb_id": kb_id,
                            "chunk_index": i,
                            "metadata": metadata,
                            "ingested_at": datetime.utcnow().isoformat()
                        },
                        "content_bytes": chunk.encode("utf-8")
                    }
                    
                    batch_docs.append(doc_payload)
                    chunks_created += 1
            
            # 3. Import batch to Vertex AI
            if batch_docs:
                await self._import_documents_batch(batch_docs)
                    
        except Exception as e:
            logger.error(f"Error ingesting documents: {e}")
            errors.append(str(e))
        
        elapsed = (time.time() - start_time) * 1000
        
        return {
            "documents_ingested": len(documents),
            "chunks_created": chunks_created,
            "processing_time_ms": elapsed,
            "errors": errors
        }
    
    async def _import_documents_batch(self, documents: List[Dict[str, Any]]):
        """
        Import a batch of documents using Discovery Engine ImportDocuments API.
        """
        client = self._get_document_client()
        
        if client == "mock":
            logger.info(f"[MOCK] Imported {len(documents)} chunks to Vertex AI")
            return

        try:
            from google.cloud import discoveryengine_v1 as discoveryengine
            
            parent = f"projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{DATASTORE_ID}/branches/0"
            
            # Convert dicts to DiscoveryEngine Document objects
            entries = []
            for d in documents:
                doc = discoveryengine.Document(
                    id=d["id"],
                    struct_data=d["struct_data"],
                    content=discoveryengine.Document.Content(
                        mime_type="text/plain",
                        raw_bytes=d["content_bytes"]
                    )
                )
                entries.append(doc)
            
            # Create Import Request
            # Note: For larger batches, GCS source is recommended, but inline is fine for <1000 docs
            request = discoveryengine.ImportDocumentsRequest(
                parent=parent,
                inline_source=discoveryengine.ImportDocumentsRequest.InlineSource(
                    documents=entries
                ),
                reconciliation_mode=discoveryengine.ImportDocumentsRequest.ReconciliationMode.INCREMENTAL
            )
            
            # Execute Long Running Operation
            # We wait for result to ensure errors are caught immediately during sync ingestion
            operation = client.import_documents(request=request)
            operation.result()  # Blocks until completion
            
            logger.info(f"Successfully imported {len(entries)} documents.")
            
        except Exception as e:
            logger.error(f"Batch import failed: {e}")
            raise e

    async def delete_kb_documents(self, kb_id: str) -> bool:
        """
        Delete all documents for a specific KB using PurgeDocuments API.
        """
        logger.info(f"Deleting all documents for KB: {kb_id}")
        
        client = self._get_document_client()
        if client == "mock":
            logger.info(f"[MOCK] Purged documents for KB {kb_id}")
            return True
            
        try:
            from google.cloud import discoveryengine_v1 as discoveryengine
            
            parent = f"projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{DATASTORE_ID}/branches/0"
            
            request = discoveryengine.PurgeDocumentsRequest(
                parent=parent,
                filter=f'kb_id: "{kb_id}"',
                force=True
            )
            
            operation = client.purge_documents(request=request)
            operation.result() # Wait for purge to complete
            
            logger.info(f"Purge complete for KB {kb_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error purging documents: {e}")
            return False

    async def search(
        self,
        query: str,
        kb_ids: List[str],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search across specified Knowledge Bases using Vertex AI Search.
        """
        client = self._get_search_client()
        
        if client == "mock":
            logger.info(f"[MOCK] Searching '{query}' in KBs: {kb_ids}")
            return [
                {
                    "content": f"Mock result for '{query}'",
                    "source": "mock_source.txt",
                    "kb_id": kb_ids[0] if kb_ids else "unknown",
                    "score": 0.95,
                    "metadata": {"page": 1}
                }
            ]
        
        try:
            from google.cloud import discoveryengine_v1 as discoveryengine
            
            # Build filter string: (kb_id: "id1" OR kb_id: "id2")
            kb_filter = " OR ".join([f'kb_id: "{kb_id}"' for kb_id in kb_ids])
            if len(kb_ids) > 1:
                kb_filter = f"({kb_filter})"
            
            serving_config = (
                f"projects/{PROJECT_ID}/locations/{LOCATION}"
                f"/collections/default_collection/dataStores/{DATASTORE_ID}"
                f"/servingConfigs/default_search"
            )
            
            request = discoveryengine.SearchRequest(
                serving_config=serving_config,
                query=query,
                page_size=top_k,
                filter=kb_filter,
                content_search_spec=discoveryengine.SearchRequest.ContentSearchSpec(
                    snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
                        return_snippet=True
                    ),
                    summary_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec(
                         summary_result_count=3,
                         include_citations=True
                    )
                )
            )
            
            response = client.search(request=request)
            
            results = []
            for result in response.results:
                doc = result.document
                
                # Check where data resides (struct_data or derived_struct_data)
                data = doc.struct_data or doc.derived_struct_data
                
                content = data.get("content", "")
                
                # If snippets are available, use them as they are more relevant
                if doc.derived_struct_data.get("snippets"):
                    snippets = doc.derived_struct_data.get("snippets")
                    if snippets:
                        content = snippets[0].get("snippet", content)

                results.append({
                    "content": content,
                    "source": data.get("source", ""),
                    "kb_id": data.get("kb_id", ""),
                    "score": result.model_scores.get("relevance_score", 0.0) if result.model_scores else 0.0,
                    "metadata": data.get("metadata", {})
                })
            
            return results[:top_k]
            
        except Exception as e:
            logger.error(f"Error searching: {e}")
            return []
    
    def _split_into_chunks(self, content: str, chunk_size: int = 2000, overlap: int = 200) -> List[str]:
        """Split content into overlapping chunks"""
        if len(content) <= chunk_size:
            return [content]
        
        chunks = []
        start = 0
        while start < len(content):
            end = min(start + chunk_size, len(content))
            chunks.append(content[start:end])
            start += chunk_size - overlap
        
        return chunks
    
    def _generate_doc_id(self, kb_id: str, source: str, chunk_index: int) -> str:
        """Generate deterministic document ID"""
        # Create a hash of the source to keep ID short and safe
        source_hash = hashlib.md5(source.encode()).hexdigest()[:8]
        return f"{kb_id}_{source_hash}_{chunk_index}"
