import pytest
from app.services.ingestion.legal_strategy import LegalTextStrategy

def test_article_splitting():
    strategy = LegalTextStrategy()
    source_text = "Preamble\nArt. 1º Estaf lei dispõe sobre...\nArt. 2º A disciplina da proteção..."
    chunks = strategy.ingest(source_text, metadata={"test": True})
    
    assert len(chunks) == 3
    assert chunks[0]["metadata"]["hierarchy"] == "Preamble"
    assert chunks[1]["metadata"]["hierarchy"] == "Art. 1º"
    assert chunks[2]["metadata"]["hierarchy"] == "Art. 2º"

def test_sub_chunking():
    strategy = LegalTextStrategy()
    strategy.max_article_size = 50 # Force sub-chunking
    
    long_text = "Art. 10. " + "A" * 60 + " § 1º Paragraph 1 " + "§ 2º Paragraph 2"
    
    chunks = strategy.ingest(long_text, metadata={})
    
    # Should split into Caput (if any) and Paragraphs
    # "Art. 10. AAAAA..." is one part, then paragraphs
    
    # Based on our implementation:
    # It tries to find regex matches for paragraphs.
    assert len(chunks) >= 2 
    # Check if hierarchy contains paragraph info
    assert any("§ 1º" in c["metadata"]["hierarchy"] for c in chunks)
