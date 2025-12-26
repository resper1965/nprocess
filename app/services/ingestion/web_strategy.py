import logging
import requests
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup
from .strategies import IngestionStrategy
from google.cloud import firestore

logger = logging.getLogger(__name__)

class WebWatchStrategy(IngestionStrategy):
    """
    Strategy for Web Scraping (CVM, ANEEL).
    Includes Hash Check (FinOps) to prevent redundant processing.
    """

    def __init__(self, db_client: Optional[firestore.Client] = None):
        self.db = db_client or firestore.Client()
        self.collection_name = "ingestion_state"

    def ingest(self, source: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Ingests content from a URL.
        Args:
            source: The Target URL.
        """
        url = source
        base_metadata = kwargs.get('metadata', {})
        
        # 1. Download
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            html_content = response.text
        except Exception as e:
            logger.error(f"Failed to fetch content from {url}: {e}")
            raise

        # 2. Extract Main Content (Soup)
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Cleaning: Remove nav, footer, script, style
        for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
            element.decompose()
            
        # Try to find main content div
        main_content = soup.find('main') or soup.find('div', class_='content') or soup.find('body')
        
        text_content = main_content.get_text(separator=' ', strip=True) if main_content else ""
        
        # 3. Hash Check (FinOps)
        current_hash = self.calculate_hash(text_content)
        if self._is_redundant(url, current_hash):
            logger.info(f"Skipping {url}: Content unchanged (FinOps).")
            return [] # Empty list = No processing needed
        
        # 4. Chunking (Simple recursive for Web)
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        raw_chunks = splitter.split_text(text_content)
        
        # 5. Save new state
        self._update_state(url, current_hash)
        
        return [{
            "content": c,
            "metadata": {**base_metadata, "url": url, "source_type": "web"}
        } for c in raw_chunks]

    def _is_redundant(self, url: str, content_hash: str) -> bool:
        """Checks Firestore for last digest."""
        # Using URL as ID (encoded)
        doc_id = self.calculate_hash(url) 
        doc_ref = self.db.collection(self.collection_name).document(doc_id)
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            return data.get('last_hash') == content_hash
        return False

    def _update_state(self, url: str, content_hash: str):
        """Updates Firestore with new digest."""
        doc_id = self.calculate_hash(url)
        self.db.collection(self.collection_name).document(doc_id).set({
            "url": url,
            "last_hash": content_hash,
            "last_updated": firestore.SERVER_TIMESTAMP
        })
