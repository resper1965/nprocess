"""
Tests for new V2 Endpoints (Constitution).
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_v2():
    response = client.get("/health")
    assert response.status_code == 200

def test_ingest_private_unauthorized():
    # Missing API Key
    response = client.post("/ingestion/private")
    assert response.status_code == 401

def test_ingest_private_authorized_mock():
    # Mocking would happen here, but for integration we need real services.
    # Just testing auth logic for now.
    headers = {"X-API-Key": "client-a-key"}
    # Send non-PDF
    response = client.post(
        "/ingestion/private",
        headers=headers,
        files={"file": ("test.txt", b"content", "text/plain")}
    )
    assert response.status_code == 400
    data = response.json()
    assert "message" in data
    assert "Only PDF" in data["message"]

def test_compliance_analyze_unauthorized():
    response = client.post("/compliance/analyze", json={"query": "test"})
    assert response.status_code == 401
