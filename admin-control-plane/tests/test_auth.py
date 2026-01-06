"""
Tests for Firebase Authentication
"""

import pytest
from unittest.mock import patch, MagicMock

pytestmark = pytest.mark.asyncio


class TestFirebaseService:
    """Tests for Firebase service"""
    
    def test_verify_token_returns_none_when_not_initialized(self):
        """Test that verify returns None when Firebase is not initialized"""
        with patch('app.services.firebase_service._initialize_firebase', return_value=False):
            from app.services.firebase_service import verify_firebase_token
            result = verify_firebase_token("fake_token")
            assert result is None
    
    def test_get_user_role_defaults_to_user(self):
        """Test that role defaults to 'user' when not set"""
        from app.services.firebase_service import get_user_role
        
        decoded_token = {"uid": "test_123", "email": "test@test.com"}
        role = get_user_role(decoded_token)
        assert role == "user"
    
    def test_get_user_role_from_custom_claim(self):
        """Test that role is extracted from custom claim"""
        from app.services.firebase_service import get_user_role
        
        decoded_token = {"uid": "admin_123", "role": "admin"}
        role = get_user_role(decoded_token)
        assert role == "admin"
    
    def test_is_admin_returns_true_for_admin(self):
        """Test is_admin for admin role"""
        from app.services.firebase_service import is_admin
        
        admin_token = {"uid": "admin_123", "role": "admin"}
        assert is_admin(admin_token) is True
    
    def test_is_admin_returns_true_for_super_admin(self):
        """Test is_admin for super_admin role"""
        from app.services.firebase_service import is_admin
        
        super_admin_token = {"uid": "super_123", "role": "super_admin"}
        assert is_admin(super_admin_token) is True
    
    def test_is_admin_returns_false_for_user(self):
        """Test is_admin for regular user"""
        from app.services.firebase_service import is_admin
        
        user_token = {"uid": "user_123", "role": "user"}
        assert is_admin(user_token) is False


class TestAuthMiddleware:
    """Tests for authentication middleware"""
    
    @pytest.fixture
    def client(self):
        """FastAPI test client"""
        from fastapi.testclient import TestClient
        from app.main import app
        return TestClient(app)
    
    def test_health_endpoint_is_public(self, client):
        """Test that health check doesn't require auth"""
        response = client.get("/health")
        assert response.status_code == 200
    
    def test_root_endpoint_is_public(self, client):
        """Test that root endpoint doesn't require auth"""
        response = client.get("/")
        assert response.status_code == 200
    
    def test_protected_endpoint_requires_auth(self, client):
        """Test that admin endpoints require auth"""
        response = client.get("/v1/admin/users")
        assert response.status_code in [401, 403]
    
    def test_invalid_token_is_rejected(self, client):
        """Test that invalid tokens are rejected"""
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = client.get("/v1/admin/users", headers=headers)
        assert response.status_code in [401, 403]
