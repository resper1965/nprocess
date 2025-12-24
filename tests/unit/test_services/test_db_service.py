"""Unit tests for DatabaseService."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.db_service import DatabaseService


@pytest.fixture
def mock_firestore():
    """Mock Firestore client."""
    with patch("app.services.db_service.firestore.Client") as mock:
        client = MagicMock()
        mock.return_value = client
        yield client


@pytest.fixture
def db_service(mock_firestore):
    """Create DatabaseService instance with mocked Firestore."""
    with patch("app.services.db_service.firestore.Client", return_value=mock_firestore):
        service = DatabaseService()
        return service


class TestDatabaseService:
    """Test DatabaseService methods."""

    @pytest.mark.asyncio
    async def test_create_process(self, db_service, mock_firestore):
        """Test process creation."""
        # Mock Firestore collection
        mock_collection = MagicMock()
        mock_doc = MagicMock()
        mock_doc.id = "proc123"
        mock_collection.add.return_value = (mock_doc, None)
        mock_firestore.collection.return_value = mock_collection

        # Test
        process_data = {
            "name": "Test Process",
            "description": "Test Description",
            "domain": "test"
        }
        result = await db_service.create_process(process_data)

        assert result == "proc123"
        mock_collection.add.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_process(self, db_service, mock_firestore):
        """Test process retrieval."""
        # Mock Firestore document
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {
            "id": "proc123",
            "name": "Test Process"
        }
        mock_collection = MagicMock()
        mock_collection.document.return_value = mock_doc
        mock_firestore.collection.return_value = mock_collection

        # Test
        result = await db_service.get_process("proc123")

        assert result is not None
        assert result["id"] == "proc123"

    @pytest.mark.asyncio
    async def test_get_process_not_found(self, db_service, mock_firestore):
        """Test process not found."""
        # Mock Firestore document
        mock_doc = MagicMock()
        mock_doc.exists = False
        mock_collection = MagicMock()
        mock_collection.document.return_value = mock_doc
        mock_firestore.collection.return_value = mock_collection

        # Test
        result = await db_service.get_process("nonexistent")

        assert result is None

    @pytest.mark.asyncio
    async def test_list_processes(self, db_service, mock_firestore):
        """Test process listing."""
        # Mock Firestore query
        mock_doc1 = MagicMock()
        mock_doc1.to_dict.return_value = {"id": "proc1", "name": "Process 1"}
        mock_doc2 = MagicMock()
        mock_doc2.to_dict.return_value = {"id": "proc2", "name": "Process 2"}
        mock_collection = MagicMock()
        mock_collection.stream.return_value = [mock_doc1, mock_doc2]
        mock_firestore.collection.return_value = mock_collection

        # Test
        result = await db_service.list_processes(limit=10)

        assert len(result) == 2
        assert result[0]["id"] == "proc1"

