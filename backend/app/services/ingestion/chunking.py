"""
Chunking strategies for document ingestion.

Implements Strategy Pattern for different chunking approaches:
- SlidingWindowStrategy: Default token-based sliding window
- LegalDocumentStrategy: Preserves legal document structure (Artigos, Parágrafos, Incisos)
"""

import re
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class Chunk:
    """Represents a chunk of text with metadata."""
    
    content: str
    index: int
    metadata: dict


class ChunkingStrategy(ABC):
    """Abstract base class for chunking strategies."""
    
    @abstractmethod
    def chunk(self, text: str, metadata: dict | None = None) -> list[Chunk]:
        """
        Split text into chunks.
        
        Args:
            text: The text to chunk
            metadata: Optional metadata to include with each chunk
            
        Returns:
            List of Chunk objects
        """
        pass
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Strategy name for logging/debugging."""
        pass


class SlidingWindowStrategy(ChunkingStrategy):
    """
    Default chunking strategy using sliding window with overlap.
    
    Splits text by tokens (words) with configurable window size and overlap.
    """
    
    def __init__(
        self,
        chunk_size: int = 500,
        overlap: int = 50,
    ):
        """
        Initialize sliding window strategy.
        
        Args:
            chunk_size: Number of tokens per chunk
            overlap: Number of overlapping tokens between chunks
        """
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    @property
    def name(self) -> str:
        return "sliding_window"
    
    def chunk(self, text: str, metadata: dict | None = None) -> list[Chunk]:
        """Split text using sliding window approach."""
        if not text.strip():
            return []
        
        # Tokenize by words
        tokens = text.split()
        chunks = []
        
        start = 0
        index = 0
        
        while start < len(tokens):
            end = min(start + self.chunk_size, len(tokens))
            chunk_tokens = tokens[start:end]
            chunk_text = " ".join(chunk_tokens)
            
            chunk_metadata = {
                "strategy": self.name,
                "chunk_index": index,
                "token_start": start,
                "token_end": end,
                **(metadata or {}),
            }
            
            chunks.append(Chunk(
                content=chunk_text,
                index=index,
                metadata=chunk_metadata,
            ))
            
            # Move window with overlap
            start += self.chunk_size - self.overlap
            index += 1
            
            # Avoid infinite loop on very small texts
            if end >= len(tokens):
                break
        
        return chunks


class LegalDocumentStrategy(ChunkingStrategy):
    """
    Chunking strategy for legal documents.
    
    Preserves the structure of legal texts:
    - Artigos (Articles)
    - Parágrafos (Paragraphs) 
    - Incisos (Items)
    - Alíneas (Sub-items)
    
    Never breaks in the middle of a legal unit.
    """
    
    # Regex patterns for Brazilian legal documents
    ARTICLE_PATTERN = re.compile(
        r"(?:^|\n)(Art(?:igo)?\.?\s*\d+[º°]?\.?\s*[-–]?\s*)",
        re.IGNORECASE | re.MULTILINE
    )
    PARAGRAPH_PATTERN = re.compile(
        r"(?:^|\n)(§\s*\d+[º°]?\.?\s*[-–]?\s*|Parágrafo\s+único\.?\s*)",
        re.IGNORECASE | re.MULTILINE
    )
    INCISO_PATTERN = re.compile(
        r"(?:^|\n)([IVXLCDM]+\s*[-–]\s*|\d+\s*[-–]\s*)",
        re.MULTILINE
    )
    
    def __init__(self, max_chunk_size: int = 1000):
        """
        Initialize legal document strategy.
        
        Args:
            max_chunk_size: Maximum tokens per chunk (will split large articles)
        """
        self.max_chunk_size = max_chunk_size
    
    @property
    def name(self) -> str:
        return "legal_document"
    
    def chunk(self, text: str, metadata: dict | None = None) -> list[Chunk]:
        """Split legal text preserving article structure."""
        if not text.strip():
            return []
        
        chunks = []
        
        # Split by articles first
        articles = self._split_by_articles(text)
        
        for article_idx, article_text in enumerate(articles):
            article_text = article_text.strip()
            if not article_text:
                continue
            
            # Extract article number if present
            article_match = self.ARTICLE_PATTERN.search(article_text)
            article_num = None
            if article_match:
                num_match = re.search(r"\d+", article_match.group(1))
                if num_match:
                    article_num = num_match.group()
            
            # Check if article is too large
            tokens = article_text.split()
            if len(tokens) > self.max_chunk_size:
                # Split by paragraphs
                sub_chunks = self._split_large_article(article_text, article_num, metadata)
                for sub_idx, sub_chunk in enumerate(sub_chunks):
                    chunks.append(Chunk(
                        content=sub_chunk["content"],
                        index=len(chunks),
                        metadata={
                            "strategy": self.name,
                            "article": article_num,
                            "sub_chunk": sub_idx,
                            **(metadata or {}),
                            **sub_chunk.get("metadata", {}),
                        },
                    ))
            else:
                chunks.append(Chunk(
                    content=article_text,
                    index=len(chunks),
                    metadata={
                        "strategy": self.name,
                        "article": article_num,
                        **(metadata or {}),
                    },
                ))
        
        return chunks
    
    def _split_by_articles(self, text: str) -> list[str]:
        """Split text by article markers."""
        # Find all article positions
        matches = list(self.ARTICLE_PATTERN.finditer(text))
        
        if not matches:
            # No articles found, return as single chunk
            return [text]
        
        articles = []
        for i, match in enumerate(matches):
            start = match.start()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            articles.append(text[start:end])
        
        # Include any text before first article
        if matches[0].start() > 0:
            preamble = text[:matches[0].start()].strip()
            if preamble:
                articles.insert(0, preamble)
        
        return articles
    
    def _split_large_article(
        self,
        article_text: str,
        article_num: str | None,
        base_metadata: dict | None,
    ) -> list[dict]:
        """Split a large article by paragraphs."""
        # Try splitting by paragraphs
        para_matches = list(self.PARAGRAPH_PATTERN.finditer(article_text))
        
        if para_matches:
            sub_chunks = []
            for i, match in enumerate(para_matches):
                start = match.start()
                end = para_matches[i + 1].start() if i + 1 < len(para_matches) else len(article_text)
                para_text = article_text[start:end].strip()
                
                if para_text:
                    sub_chunks.append({
                        "content": para_text,
                        "metadata": {"paragraph": i + 1},
                    })
            
            # Include caput (text before first paragraph)
            if para_matches[0].start() > 0:
                caput = article_text[:para_matches[0].start()].strip()
                if caput:
                    sub_chunks.insert(0, {
                        "content": caput,
                        "metadata": {"paragraph": "caput"},
                    })
            
            return sub_chunks
        
        # Fallback: use sliding window on large article
        fallback = SlidingWindowStrategy(
            chunk_size=self.max_chunk_size // 2,
            overlap=50,
        )
        fallback_chunks = fallback.chunk(article_text, base_metadata)
        
        return [
            {"content": c.content, "metadata": c.metadata}
            for c in fallback_chunks
        ]


def get_chunking_strategy(strategy_name: str = "default") -> ChunkingStrategy:
    """
    Factory function to get a chunking strategy by name.
    
    Args:
        strategy_name: Name of the strategy ("default", "legal")
        
    Returns:
        Configured ChunkingStrategy instance
    """
    strategies = {
        "default": SlidingWindowStrategy,
        "sliding_window": SlidingWindowStrategy,
        "legal": LegalDocumentStrategy,
        "legal_document": LegalDocumentStrategy,
    }
    
    strategy_class = strategies.get(strategy_name.lower(), SlidingWindowStrategy)
    return strategy_class()
