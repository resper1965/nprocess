import logging
import re
from typing import List, Dict, Any
from .strategies import IngestionStrategy
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

class LegalTextStrategy(IngestionStrategy):
    """
    Strategy for Law and Regulations (e.g., GDPR, LGPD).
    Splits by logical structure: Artigo > Parágrafo > Inciso using Regex.
    """

    def __init__(self):
        # Max chunk size before sub-chunking
        self.max_article_size = 2000
        # Paragraph pattern for sub-chunking
        self.paragraph_pattern = re.compile(r'(?i)(§\s*\d+[º°]?|Parágrafo\s+\w+)')
        self.inciso_pattern = re.compile(r'(?m)^\s*(I{1,3}|IV|V|VI{0,3}|IX|X{0,3})\s*[-–]')

    def ingest(self, source: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Ingests legal text.
        Source can be raw text or path to a file (txt/md).
        """
        text_content = source
        # Simple heuristic to detect if it's a file path
        if len(source) < 255 and (source.endswith('.txt') or source.endswith('.md')):
            try:
                with open(source, 'r', encoding='utf-8') as f:
                    text_content = f.read()
            except IOError:
                pass

        return self._split_by_article(text_content, kwargs.get('metadata', {}))

    def _split_by_article(self, text: str, base_metadata: Dict) -> List[Dict[str, Any]]:
        """
        Custom splitter for Brazilian/Portuguese legal texts.
        Patterns: "Art. 1º", "Artigo 5", "CAPÍTULO I".
        """
        article_pattern = re.compile(r'(?i)(^|\n)(Art\.?\s*\d+\.?[º°]?|Artigo\s+\d+)')
        
        chunks = []
        matches = list(article_pattern.finditer(text))
        
        if not matches:
            # Fallback to standard chunking if no articles found
            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            raw_chunks = splitter.split_text(text)
            return [{"content": c, "metadata": base_metadata} for c in raw_chunks]

        # Preamble
        if matches[0].start() > 0:
            preamble = text[:matches[0].start()].strip()
            if preamble:
                chunks.append({
                    "content": preamble,
                    "metadata": {**base_metadata, "hierarchy": "Preamble"}
                })
        
        for i, match in enumerate(matches):
            start = match.start()
            end = matches[i+1].start() if i + 1 < len(matches) else len(text)
            
            full_article = text[start:end].strip()
            article_header = match.group().strip()
            
            # Sub-chunking: If article is too long, split by Paragraph (§)
            if len(full_article) > self.max_article_size:
                sub_chunks = self._split_article_by_paragraph(full_article, article_header, base_metadata)
                chunks.extend(sub_chunks)
            else:
                chunks.append({
                    "content": full_article,
                    "metadata": {
                        **base_metadata,
                        "hierarchy": article_header,
                        "source_id": base_metadata.get('source_id', 'unknown')
                    }
                })
            
        return chunks

    def _split_article_by_paragraph(
        self, 
        article_text: str, 
        article_header: str, 
        base_metadata: Dict
    ) -> List[Dict[str, Any]]:
        """
        Sub-splits a large article by paragraphs (§) or incisos (I, II, III).
        """
        chunks = []
        
        # Try splitting by paragraphs first
        para_matches = list(self.paragraph_pattern.finditer(article_text))
        
        if para_matches:
            # Has paragraphs, split by them
            last_end = 0
            
            for i, match in enumerate(para_matches):
                # Content before first paragraph (article header + caput)
                if i == 0 and match.start() > 0:
                    caput = article_text[:match.start()].strip()
                    if caput:
                        chunks.append({
                            "content": caput,
                            "metadata": {
                                **base_metadata,
                                "hierarchy": f"{article_header} > Caput",
                                "source_id": base_metadata.get('source_id', 'unknown')
                            }
                        })
                
                start = match.start()
                end = para_matches[i+1].start() if i + 1 < len(para_matches) else len(article_text)
                paragraph_text = article_text[start:end].strip()
                paragraph_header = match.group().strip()
                
                chunks.append({
                    "content": paragraph_text,
                    "metadata": {
                        **base_metadata,
                        "hierarchy": f"{article_header} > {paragraph_header}",
                        "source_id": base_metadata.get('source_id', 'unknown')
                    }
                })
        else:
            # No paragraph markers, use recursive splitter as fallback
            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            sub_texts = splitter.split_text(article_text)
            
            for idx, sub_text in enumerate(sub_texts):
                chunks.append({
                    "content": sub_text,
                    "metadata": {
                        **base_metadata,
                        "hierarchy": f"{article_header} > Part {idx + 1}",
                        "source_id": base_metadata.get('source_id', 'unknown')
                    }
                })
        
        return chunks
