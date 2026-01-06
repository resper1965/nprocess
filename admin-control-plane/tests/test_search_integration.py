
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import sys
from datetime import datetime

# Setup Mocks properly before importing the service
mock_discovery = MagicMock()
mock_discovery.SearchServiceClient = MagicMock()
mock_discovery.DocumentServiceClient = MagicMock()
mock_discovery.ImportDocumentsRequest = MagicMock()
mock_discovery.PurgeDocumentsRequest = MagicMock()
mock_discovery.SearchRequest = MagicMock()
mock_discovery.Document = MagicMock()

# We need to ensure that 'from google.cloud import discoveryengine_v1' works.
# This requires google.cloud to be a package that has discoveryengine_v1 as an attribute
# OR sys.modules has 'google.cloud.discoveryengine_v1'.

mock_google = MagicMock()
mock_cloud = MagicMock()
mock_cloud.discoveryengine_v1 = mock_discovery # This allows attribute access

# We patch sys.modules to handle the imports
module_patcher = patch.dict(sys.modules, {
    "google": mock_google,
    "google.cloud": mock_cloud,
    "google.cloud.discoveryengine_v1": mock_discovery
})

module_patcher.start()

# Now import the service which will see the mocked modules
from app.services.kb_search_service import KBSearchService

@pytest.mark.asyncio
async def test_ingest_documents_calls_import_api():
    """Test that ingest_documents batches chunks and calls import_documents"""
    
    # Setup Service
    service = KBSearchService()
    # Inject our mock client directly into the service instance
    # The service's _get_document_client will try to import again, which should return our mocked module's client
    
    # To be safe, we can mock the internal client directly if lazily loaded
    mock_doc_client = MagicMock()
    # We configure the class's returned client to be our specific mock to check calls
    mock_discovery.DocumentServiceClient.return_value = mock_doc_client
    
    # Configure calling import_documents to return a mock operation that has a result() method
    mock_op = MagicMock()
    mock_doc_client.import_documents.return_value = mock_op
    
    # Input data
    documents = [
        {"content": "Doc 1 content", "source": "file1.pdf", "metadata": {"author": "A"}},
        {"content": "Doc 2 content", "source": "file2.pdf", "metadata": {"author": "B"}}
    ]
    
    # Execute
    result = await service.ingest_documents("kb_test", documents)
    
    # Assertions
    assert result["documents_ingested"] == 2
    # Verify import_documents was called
    assert mock_doc_client.import_documents.call_count == 1
    
    # Inspect arguments
    args, kwargs = mock_doc_client.import_documents.call_args
    request = kwargs.get('request')
    
    # The request should be an instance of ImportDocumentsRequest (which is a mock)
    # We can inspect properties if we set them up on the mock, but call_count is good enough for structure check

@pytest.mark.asyncio
async def test_delete_kb_documents_calls_purge_api():
    """Test that delete_kb_documents calls purge_documents"""
    
    service = KBSearchService()
    # Mock client
    mock_doc_client = MagicMock()
    mock_discovery.DocumentServiceClient.return_value = mock_doc_client
    
    mock_op = MagicMock()
    mock_doc_client.purge_documents.return_value = mock_op
    
    # Force re-initialization or set directly
    service._doc_client = mock_doc_client
    
    await service.delete_kb_documents("kb_test")
    
    assert mock_doc_client.purge_documents.call_count == 1

@pytest.mark.asyncio
async def test_search_calls_search_api_with_filter():
    """Test that search builds correct filter"""
    
    service = KBSearchService()
    mock_search_client = MagicMock()
    service._search_client = mock_search_client
    
    # Mock response
    mock_response = MagicMock()
    mock_result = MagicMock()
    # Setup nested attributes for result.document.struct_data.get(...)
    mock_doc = MagicMock()
    mock_doc.struct_data = {"content": "Found it", "kb_id": "kb1", "source": "s1"}
    # Need to handle .get() on struct_data
    # Actually struct_data isn't a dict in protobuf, but we use it as property in python.
    # The code does: data = doc.struct_data or doc.derived_struct_data
    # then data.get(...)
    
    # Let's make struct_data a dict for the test
    mock_result.document = mock_doc
    # IMPORTANT: derived_struct_data calls check for truthiness, mock is truthy.
    # Set it to empty dict to avoid snippet logic unless we test snippets
    mock_doc.derived_struct_data = {}
    
    mock_result.model_scores = {"relevance_score": 0.9}
    mock_response.results = [mock_result]
    mock_search_client.search.return_value = mock_response
    
    results = await service.search("query", ["kb1", "kb2"])
    
    assert len(results) == 1
    assert results[0]["content"] == "Found it"
    
    # Verify filter construction
    assert mock_search_client.search.call_count == 1
    _, kwargs = mock_search_client.search.call_args
    
    # Check if filter was passed in kwargs (it might be in request object or kwargs depending on call)
    # The code does: request = SearchRequest(..., filter=...)
    # then client.search(request=request)
    
    request = kwargs.get('request')
    if request:
        # Check constructor call of SearchRequest
        # mock_discovery.SearchRequest(..., filter=...)
        call_kwargs = mock_discovery.SearchRequest.call_args[1]
        assert 'filter' in call_kwargs
        assert 'kb_id: "kb1"' in call_kwargs['filter']

