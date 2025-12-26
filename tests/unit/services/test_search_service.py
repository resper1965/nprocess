import pytest
from unittest.mock import MagicMock, patch
from app.services.search_service import SearchService

@pytest.fixture
def mock_firestore():
    with patch("app.services.search_service.firestore.Client") as mock:
        yield mock

@pytest.fixture
def mock_vertex():
    with patch("app.services.search_service.vertexai.init") as mock_init, \
         patch("app.services.search_service.TextEmbeddingModel") as mock_model:
        yield mock_model

@pytest.mark.asyncio
async def test_search_regulations_domain_filter(mock_firestore, mock_vertex, mock_env_vars):
    # Setup
    service = SearchService(project_id="test")
    
    # Mock embedding generation
    mock_model_instance = mock_vertex.from_pretrained.return_value
    mock_model_instance.get_embeddings.return_value = [MagicMock(values=[0.1, 0.2])]
    
    # Mock Firestore query
    mock_collection = mock_firestore.return_value.collection.return_value
    mock_doc = mock_collection.document.return_value
    mock_subcollection = mock_doc.collection.return_value
    
    # Mock vector search results
    mock_result_doc = MagicMock()
    mock_result_doc.to_dict.return_value = {
        "standard_title": "LGPD",
        "content": "Dados pessoais",
        "metadata": {"domain": "LGPD"}
    }
    mock_subcollection.find_nearest.return_value.get.return_value = [mock_result_doc]
    
    # Execute
    results = await service.search_regulations("dados", domain="LGPD")
    
    # Assert
    assert len(results) == 1
    assert results[0]["title"] == "LGPD"
    # Verification of correct collection path logic
    mock_firestore.return_value.collection.assert_called_with("global_standards") 
    mock_doc.collection.assert_called_with("chunks")
