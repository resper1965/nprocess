import pytest
import os
import sys
from unittest.mock import MagicMock

# Add app to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.fixture
def mock_env_vars(monkeypatch):
    monkeypatch.setenv("GCP_PROJECT_ID", "test-project")
    monkeypatch.setenv("NPROCESS_API_KEY", "test-key-123")
    monkeypatch.setenv("GOOGLE_CLOUD_PROJECT", "test-project")
    monkeypatch.setenv("ALLOWED_HOSTS", "testserver,localhost,127.0.0.1")

@pytest.fixture(autouse=True)
def mock_cloud_logging(monkeypatch):
    """Mock Cloud Logging to prevent 403 errors during tests."""
    mock_client_cls = MagicMock()
    mock_client_instance = MagicMock()
    mock_logger = MagicMock()
    
    # Configure the mock chain: Client() -> client.logger() -> logger.log_struct()
    mock_client_cls.return_value = mock_client_instance
    mock_client_instance.logger.return_value = mock_logger
    
    # Apply the patch to google.cloud.logging.Client
    try:
        monkeypatch.setattr("google.cloud.logging.Client", mock_client_cls)
    except (ImportError, AttributeError):
        pass

@pytest.fixture(autouse=True)
def mock_vertex_ai(monkeypatch):
    """Mock Vertex AI to prevent real API calls."""
    mock_model = MagicMock()
    mock_model.generate_content.return_value.text = "Mocked AI Response"
    
    mock_generative_model = MagicMock(return_value=mock_model)
    
    try:
        # Patch the source class to ensure future imports are mocked
        monkeypatch.setattr("vertexai.generative_models.GenerativeModel", mock_generative_model)
        monkeypatch.setattr("vertexai.init", MagicMock())
        
        # ALSO patch the reference where it's already imported
        monkeypatch.setattr("app.services.ai_service.GenerativeModel", mock_generative_model)
        monkeypatch.setattr("app.services.ai_service.vertexai", MagicMock())
    except (ImportError, AttributeError):
        pass


@pytest.fixture
def sample_process_data():
    """Sample process definition for testing."""
    return {
        "process": {
            "name": "Test Process",
            "description": "A sample process for testing compliance analysis.",
            "mermaid_code": "graph TD; A[Start] --> B[Task]; B --> C[End];",
            "nodes": [
                {"id": "A", "type": "event", "label": "Start"},
                {"id": "B", "type": "task", "label": "Task"},
                {"id": "C", "type": "event", "label": "End"}
            ],
            "flows": [
                {"from_node": "A", "to_node": "B"},
                {"from_node": "B", "to_node": "C"}
            ]
        },
        "domain": "LGPD"
    }
