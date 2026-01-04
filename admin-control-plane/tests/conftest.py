"""
Test fixtures and configuration
"""
import pytest
import sys
import os

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def mock_firebase():
    """Mock Firebase initialization"""
    import app.services.firebase_service as fb
    fb._firebase_initialized = True
    fb._firebase_app = "mock_app"
    yield
    fb._firebase_initialized = False
    fb._firebase_app = None


@pytest.fixture
def clean_repos():
    """Clean repository singletons between tests"""
    import app.services.firestore_repository as fr
    fr._kb_repo = None
    fr._subscription_repo = None
    fr._user_repo = None
    yield
