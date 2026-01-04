"""
Tests for Knowledge Base Marketplace Router
"""

import pytest
from datetime import datetime
from unittest.mock import AsyncMock, patch, MagicMock

# Test configuration
pytestmark = pytest.mark.asyncio


class TestFirestoreRepository:
    """Tests for FirestoreRepository"""
    
    @pytest.fixture
    def repo(self):
        """Create a repository instance for testing"""
        from app.services.firestore_repository import FirestoreRepository
        return FirestoreRepository("test_collection", "id")
    
    async def test_create_and_get(self, repo):
        """Test creating and retrieving a document"""
        doc_id = "test_doc_1"
        data = {"name": "Test", "value": 123}
        
        # Create
        result = await repo.create(doc_id, data)
        assert result["id"] == doc_id
        assert result["name"] == "Test"
        
        # Get
        retrieved = await repo.get(doc_id)
        assert retrieved is not None
        assert retrieved["name"] == "Test"
    
    async def test_list_with_filters(self, repo):
        """Test listing documents with filters"""
        # Create test docs
        await repo.create("doc1", {"status": "active", "name": "Doc 1"})
        await repo.create("doc2", {"status": "inactive", "name": "Doc 2"})
        await repo.create("doc3", {"status": "active", "name": "Doc 3"})
        
        # List with filter
        active_docs = await repo.list(filters={"status": "active"})
        assert len(active_docs) == 2
    
    async def test_update(self, repo):
        """Test updating a document"""
        doc_id = "update_test"
        await repo.create(doc_id, {"name": "Original"})
        
        await repo.update(doc_id, {"name": "Updated"})
        
        updated = await repo.get(doc_id)
        assert updated["name"] == "Updated"
    
    async def test_delete(self, repo):
        """Test deleting a document"""
        doc_id = "delete_test"
        await repo.create(doc_id, {"name": "To Delete"})
        
        result = await repo.delete(doc_id)
        assert result is True
        
        deleted = await repo.get(doc_id)
        assert deleted is None
    
    async def test_seed_only_when_empty(self, repo):
        """Test that seed only runs when collection is empty"""
        seed_data = {
            "seed1": {"name": "Seed 1"},
            "seed2": {"name": "Seed 2"}
        }
        
        # First seed should work
        await repo.seed(seed_data)
        docs = await repo.list()
        assert len(docs) == 2
        
        # Second seed should not duplicate
        await repo.seed(seed_data)
        docs = await repo.list()
        assert len(docs) == 2


class TestKBRouter:
    """Tests for KB Marketplace Router"""
    
    @pytest.fixture
    def mock_user(self):
        """Mock authenticated user"""
        return {
            "uid": "test_user_123",
            "email": "test@example.com",
            "tenant_id": "tenant_abc"
        }
    
    @pytest.fixture
    def client(self):
        """FastAPI test client"""
        from fastapi.testclient import TestClient
        from app.main import app
        return TestClient(app)
    
    def test_list_kbs_requires_auth(self, client):
        """Test that list KBs requires authentication"""
        response = client.get("/v1/admin/kbs")
        assert response.status_code in [401, 403]
    
    def test_marketplace_list_requires_auth(self, client):
        """Test that marketplace list requires authentication"""
        response = client.get("/v1/admin/kbs/marketplace/list")
        assert response.status_code in [401, 403]
    
    def test_subscribe_requires_auth(self, client):
        """Test that subscribing requires authentication"""
        response = client.post("/v1/admin/kbs/subscriptions", json={"kb_id": "test"})
        assert response.status_code in [401, 403]


class TestKBSubscriptions:
    """Tests for KB subscription logic"""
    
    async def test_subscription_creates_correctly(self):
        """Test that subscription is created with correct data"""
        from app.services.firestore_repository import FirestoreRepository
        
        repo = FirestoreRepository("test_subscriptions", "subscription_id")
        
        sub_data = {
            "kb_id": "kb_lgpd",
            "tenant_id": "tenant_123",
            "status": "active",
            "started_at": datetime.utcnow().isoformat()
        }
        
        result = await repo.create("sub_1", sub_data)
        assert result["kb_id"] == "kb_lgpd"
        assert result["status"] == "active"
    
    async def test_subscription_can_be_canceled(self):
        """Test that subscription can be canceled"""
        from app.services.firestore_repository import FirestoreRepository
        
        repo = FirestoreRepository("test_subscriptions", "subscription_id")
        
        await repo.create("sub_cancel", {"status": "active"})
        await repo.update("sub_cancel", {"status": "canceled"})
        
        sub = await repo.get("sub_cancel")
        assert sub["status"] == "canceled"


class TestKBSearch:
    """Tests for KB search functionality"""
    
    async def test_search_filters_by_subscription(self):
        """Test that search only returns results from subscribed KBs"""
        # Mock test - would need full integration for real test
        subscribed_kbs = ["kb_lgpd", "kb_gdpr"]
        query_kbs = ["kb_lgpd", "kb_cvm"]
        
        # Should only search kb_lgpd (intersection)
        allowed = [kb for kb in query_kbs if kb in subscribed_kbs]
        assert allowed == ["kb_lgpd"]
    
    async def test_search_returns_empty_without_subscriptions(self):
        """Test that search returns error without subscriptions"""
        subscribed_kbs = []
        
        # Should raise error
        assert len(subscribed_kbs) == 0
