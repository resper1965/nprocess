"""Unit tests for AIService."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.ai_service import AIService


@pytest.fixture
def mock_vertex_ai():
    """Mock Vertex AI client."""
    with patch("app.services.ai_service.GenerativeModel") as mock:
        model = MagicMock()
        mock.return_value = model
        yield model


@pytest.fixture
def ai_service(mock_vertex_ai):
    """Create AIService instance with mocked Vertex AI."""
    with patch("app.services.ai_service.GenerativeModel", return_value=mock_vertex_ai):
        with patch.dict("os.environ", {"ENABLE_AI": "true"}):
            service = AIService()
            return service


class TestAIService:
    """Test AIService methods."""

    @pytest.mark.asyncio
    async def test_generate_diagram(self, ai_service, mock_vertex_ai):
        """Test diagram generation."""
        # Mock Vertex AI response
        mock_response = MagicMock()
        mock_response.text = """
        {
            "normalized_text": "Processo normalizado",
            "mermaid_code": "graph TD\\n  start([Início]) --> end([Fim])",
            "metadata": {"actors": ["User"]}
        }
        """
        mock_vertex_ai.generate_content = AsyncMock(return_value=mock_response)

        # Test
        result = await ai_service.generate_diagram("Processo de teste")

        assert result is not None
        assert "mermaid_code" in result.dict()

    @pytest.mark.asyncio
    async def test_analyze_compliance(self, ai_service, mock_vertex_ai):
        """Test compliance analysis."""
        # Mock Vertex AI response
        mock_response = MagicMock()
        mock_response.text = """
        {
            "score": 85.5,
            "summary": "Análise completa",
            "gaps": [{"gap_id": "GAP001", "severity": "high"}],
            "suggestions": [{"suggestion_id": "SUG001", "type": "control_addition"}]
        }
        """
        mock_vertex_ai.generate_content = AsyncMock(return_value=mock_response)

        # Test
        process_data = {
            "name": "Test Process",
            "mermaid_code": "graph TD"
        }
        score, summary, gaps, suggestions = await ai_service.analyze_compliance(
            process_data, "LGPD"
        )

        assert score > 0
        assert summary is not None
        assert isinstance(gaps, list)
        assert isinstance(suggestions, list)

    @pytest.mark.asyncio
    async def test_is_ai_enabled(self):
        """Test AI enabled check."""
        with patch.dict("os.environ", {"ENABLE_AI": "true"}):
            from app.services.ai_service import is_ai_enabled
            assert is_ai_enabled() is True

        with patch.dict("os.environ", {"ENABLE_AI": "false"}):
            from app.services.ai_service import is_ai_enabled
            assert is_ai_enabled() is False

