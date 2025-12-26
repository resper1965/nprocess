
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Testa o endpoint de health check."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["service"] == "n.process engine"

def test_root():
    """Testa o endpoint raiz."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_analyze_compliance_no_ai(sample_process_data):
    """Testa falha graciosa quando IA está desabilitada."""
    payload = {
        "process": sample_process_data,
        "domain": "LGPD",
        "process_id": "proc-123"
    }
    response = client.post("/v1/compliance/analyze", json=payload)
    
    # Com AI desabilitada, deve retornar 422 Unprocessable Entity (devido ao ValueError)
    assert response.status_code == 422
    assert "Serviço de IA não está disponível" in response.json()["message"]

def test_generate_diagram_no_ai():
    """Testa falha graciosa na geração de diagrama sem IA."""
    payload = {
        "description": "Um processo de compras simples."
    }
    response = client.post("/v1/modeling/generate", json=payload)
    
    assert response.status_code == 422
    assert "Serviço de IA não está disponível" in response.json()["message"]
