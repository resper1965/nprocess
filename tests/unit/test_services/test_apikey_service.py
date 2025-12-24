"""Unit tests for APIKeyService."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.apikey_service import APIKeyService


@pytest.fixture
def mock_firestore():
    """Mock Firestore client."""
    with patch("app.services.apikey_service.firestore.Client") as mock:
        client = MagicMock()
        mock.return_value = client
        yield client


@pytest.fixture
def apikey_service(mock_firestore):
    """Create APIKeyService instance with mocked Firestore."""
    with patch("app.services.apikey_service.firestore.Client", return_value=mock_firestore):
        service = APIKeyService()
        return service


class TestAPIKeyService:
    """Test APIKeyService methods."""

    @pytest.mark.asyncio
    async def test_create_api_key(self, apikey_service, mock_firestore):
        """Test API key creation."""
        # Mock Firestore collection
        mock_collection = MagicMock()
        mock_doc = MagicMock()
        mock_doc.id = "key123"
        mock_collection.add.return_value = (mock_doc, None)
        mock_firestore.collection.return_value = mock_collection

        # Test
        result = await apikey_service.create_api_key(
            user_id="user123",
            name="Test Key",
            permissions=["read", "write"]
        )

        assert "api_key" in result
        assert "key_id" in result
        assert result["key_id"] == "key123"

    @pytest.mark.asyncio
    async def test_validate_api_key(self, apikey_service, mock_firestore):
        """Test API key validation."""
        # Mock Firestore document
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {
            "id": "key123",
            "hashed_key": "$2b$12$hashed",
            "is_active": True,
            "permissions": ["read", "write"]
        }
        mock_collection = MagicMock()
        mock_collection.document.return_value = mock_doc
        mock_firestore.collection.return_value = mock_collection

        # Mock bcrypt
        with patch("app.services.apikey_service.bcrypt.checkpw", return_value=True):
            result = await apikey_service.validate_api_key("test_key")

            assert result is not None
            assert result["is_active"] is True

    @pytest.mark.asyncio
    async def test_validate_api_key_invalid(self, apikey_service, mock_firestore):
        """Test invalid API key validation."""
        # Mock Firestore document
        mock_doc = MagicMock()
        mock_doc.exists = False
        mock_collection = MagicMock()
        mock_collection.document.return_value = mock_doc
        mock_firestore.collection.return_value = mock_collection

        # Test
        result = await apikey_service.validate_api_key("invalid_key")

        assert result is None

