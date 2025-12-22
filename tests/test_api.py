"""
Testes de integração para os endpoints da API.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock

from app.main import app
from app.schemas import DiagramGenerateResponse


@pytest.fixture
def client():
    """Fixture que retorna o TestClient."""
    return TestClient(app)


@pytest.fixture
def mock_ai_service():
    """Fixture que mocka o AIService."""
    with patch("app.main.get_ai_service") as mock:
        service = MagicMock()
        mock.return_value = service
        yield service


@pytest.fixture
def mock_db_service():
    """Fixture que mocka o DatabaseService."""
    with patch("app.main.get_db_service") as mock:
        service = MagicMock()
        mock.return_value = service
        yield service


class TestHealthEndpoints:
    """Testes para endpoints de health check."""

    def test_root_endpoint(self, client):
        """Testa endpoint raiz."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "ComplianceEngine"
        assert "timestamp" in data

    def test_health_check_endpoint(self, client):
        """Testa endpoint de health check."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestDiagramEndpoints:
    """Testes para endpoints de geração de diagramas."""

    def test_generate_diagram_success(self, client, mock_ai_service):
        """Testa geração de diagrama com sucesso."""
        # Mock do retorno do AI service
        mock_response = DiagramGenerateResponse(
            normalized_text="Processo normalizado de teste",
            mermaid_code="graph TD\n  start([Início]) --> end([Fim])",
            metadata={"actors": ["User"], "activities_count": 2}
        )
        mock_ai_service.generate_diagram = AsyncMock(return_value=mock_response)

        # Request
        response = client.post(
            "/v1/diagrams/generate",
            json={
                "description": "Processo de teste: início e fim",
                "context": "Contexto de teste"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "normalized_text" in data
        assert "mermaid_code" in data
        assert "graph TD" in data["mermaid_code"]

    def test_generate_diagram_invalid_short_description(self, client):
        """Testa validação de descrição muito curta."""
        response = client.post(
            "/v1/diagrams/generate",
            json={
                "description": "abc"  # Muito curto (< 10 chars)
            }
        )
        assert response.status_code == 422

    def test_generate_diagram_empty_description(self, client):
        """Testa validação de descrição vazia."""
        response = client.post(
            "/v1/diagrams/generate",
            json={
                "description": "   "  # Vazia
            }
        )
        assert response.status_code == 422


class TestProcessEndpoints:
    """Testes para endpoints de gestão de processos."""

    def test_create_process_success(self, client, mock_db_service):
        """Testa criação de processo com sucesso."""
        # Mock do retorno do DB service
        mock_db_service.create_process = AsyncMock(return_value="proc123")

        # Request
        response = client.post(
            "/v1/processes",
            json={
                "name": "Processo Teste",
                "description": "Descrição do processo de teste",
                "domain": "financeiro",
                "mermaid_code": "graph TD\n  start([Início])",
                "nodes": [
                    {
                        "id": "start",
                        "type": "event",
                        "label": "Início",
                        "properties": {}
                    }
                ],
                "flows": []
            }
        )

        assert response.status_code == 201
        data = response.json()
        assert data["process_id"] == "proc123"
        assert "created_at" in data
        assert data["message"] == "Processo criado com sucesso"

    def test_create_process_invalid_short_name(self, client):
        """Testa validação de nome muito curto."""
        response = client.post(
            "/v1/processes",
            json={
                "name": "AB",  # Muito curto (< 3 chars)
                "description": "Descrição válida do processo",
                "domain": "financeiro",
                "mermaid_code": "graph TD"
            }
        )
        assert response.status_code == 422

    def test_get_process_success(self, client, mock_db_service):
        """Testa recuperação de processo com sucesso."""
        # Mock do retorno do DB service
        mock_process = {
            "id": "proc123",
            "name": "Processo Teste",
            "description": "Descrição",
            "domain": "financeiro"
        }
        mock_db_service.get_process = AsyncMock(return_value=mock_process)

        response = client.get("/v1/processes/proc123")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "proc123"
        assert data["name"] == "Processo Teste"

    def test_get_process_not_found(self, client, mock_db_service):
        """Testa recuperação de processo não encontrado."""
        mock_db_service.get_process = AsyncMock(return_value=None)

        response = client.get("/v1/processes/inexistente")
        assert response.status_code == 404

    def test_list_processes_success(self, client, mock_db_service):
        """Testa listagem de processos."""
        # Mock do retorno
        mock_processes = [
            {"id": "proc1", "name": "Processo 1"},
            {"id": "proc2", "name": "Processo 2"}
        ]
        mock_db_service.list_processes = AsyncMock(return_value=mock_processes)

        response = client.get("/v1/processes?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["id"] == "proc1"


class TestComplianceEndpoints:
    """Testes para endpoints de análise de compliance."""

    def test_analyze_compliance_success(self, client, mock_db_service, mock_ai_service):
        """Testa análise de compliance com sucesso."""
        # Mock do processo no DB
        mock_process = {
            "id": "proc123",
            "name": "Processo Teste",
            "description": "Descrição",
            "mermaid_code": "graph TD",
            "nodes": [],
            "flows": []
        }
        mock_db_service.get_process = AsyncMock(return_value=mock_process)

        # Mock da análise de IA
        from app.schemas import ComplianceGap, ComplianceSuggestion
        mock_gaps = [
            ComplianceGap(
                gap_id="GAP001",
                severity="high",
                regulation="LGPD",
                description="Gap teste",
                recommendation="Recomendação"
            )
        ]
        mock_suggestions = [
            ComplianceSuggestion(
                suggestion_id="SUG001",
                type="control_addition",
                title="Sugestão teste",
                description="Descrição"
            )
        ]
        mock_ai_service.analyze_compliance = AsyncMock(
            return_value=(85.5, "Resumo da análise", mock_gaps, mock_suggestions)
        )

        # Mock para salvar análise
        mock_db_service.create_analysis = AsyncMock(return_value="analysis123")

        # Request
        response = client.post(
            "/v1/compliance/analyze",
            json={
                "process_id": "proc123",
                "domain": "LGPD",
                "additional_context": "Contexto adicional"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["analysis_id"] == "analysis123"
        assert data["process_id"] == "proc123"
        assert data["domain"] == "LGPD"
        assert data["overall_score"] == 85.5
        assert len(data["gaps"]) == 1
        assert len(data["suggestions"]) == 1

    def test_analyze_compliance_process_not_found(self, client, mock_db_service):
        """Testa análise de processo não encontrado."""
        mock_db_service.get_process = AsyncMock(return_value=None)

        response = client.post(
            "/v1/compliance/analyze",
            json={
                "process_id": "inexistente",
                "domain": "LGPD"
            }
        )
        assert response.status_code == 404

    def test_get_analysis_success(self, client, mock_db_service):
        """Testa recuperação de análise com sucesso."""
        # Mock do retorno
        mock_analysis = {
            "id": "analysis123",
            "process_id": "proc123",
            "domain": "LGPD",
            "overall_score": 80.0
        }
        mock_db_service.get_analysis = AsyncMock(return_value=mock_analysis)

        response = client.get("/v1/compliance/analyses/analysis123")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "analysis123"
        assert data["overall_score"] == 80.0

    def test_get_analysis_not_found(self, client, mock_db_service):
        """Testa recuperação de análise não encontrada."""
        mock_db_service.get_analysis = AsyncMock(return_value=None)

        response = client.get("/v1/compliance/analyses/inexistente")
        assert response.status_code == 404
