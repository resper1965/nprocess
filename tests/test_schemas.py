"""
Testes unitários para os schemas Pydantic.
"""
import pytest
from datetime import datetime
from pydantic import ValidationError

from app.schemas import (
    DiagramGenerateRequest,
    DiagramGenerateResponse,
    ProcessCreateRequest,
    ProcessNode,
    ProcessFlow,
    ComplianceAnalyzeRequest,
    ComplianceGap,
    ComplianceSuggestion,
    ComplianceAnalyzeResponse,
)


class TestDiagramSchemas:
    """Testes para schemas de diagrama."""

    def test_diagram_generate_request_valid(self):
        """Testa criação válida de DiagramGenerateRequest."""
        request = DiagramGenerateRequest(
            description="Processo de aprovação de compras",
            context="Departamento financeiro"
        )
        assert request.description == "Processo de aprovação de compras"
        assert request.context == "Departamento financeiro"

    def test_diagram_generate_request_without_context(self):
        """Testa DiagramGenerateRequest sem contexto (opcional)."""
        request = DiagramGenerateRequest(
            description="Processo simples"
        )
        assert request.description == "Processo simples"
        assert request.context is None

    def test_diagram_generate_request_invalid_empty_description(self):
        """Testa validação de descrição vazia."""
        with pytest.raises(ValidationError) as exc_info:
            DiagramGenerateRequest(description="   ")
        assert "Descrição não pode estar vazia" in str(exc_info.value)

    def test_diagram_generate_request_invalid_short_description(self):
        """Testa validação de descrição muito curta."""
        with pytest.raises(ValidationError):
            DiagramGenerateRequest(description="abc")

    def test_diagram_generate_response_valid(self):
        """Testa criação válida de DiagramGenerateResponse."""
        response = DiagramGenerateResponse(
            normalized_text="Processo normalizado",
            mermaid_code="graph TD\n  start([Início])",
            metadata={"actors": ["User"], "activities_count": 3}
        )
        assert response.normalized_text == "Processo normalizado"
        assert "graph TD" in response.mermaid_code
        assert response.metadata["actors"] == ["User"]


class TestProcessSchemas:
    """Testes para schemas de processo."""

    def test_process_node_valid(self):
        """Testa criação válida de ProcessNode."""
        node = ProcessNode(
            id="task1",
            type="task",
            label="Executar tarefa",
            properties={"actor": "User"}
        )
        assert node.id == "task1"
        assert node.type == "task"
        assert node.properties["actor"] == "User"

    def test_process_flow_valid(self):
        """Testa criação válida de ProcessFlow."""
        flow = ProcessFlow(
            from_node="task1",
            to_node="task2",
            label="Próximo",
            condition="status == 'approved'"
        )
        assert flow.from_node == "task1"
        assert flow.to_node == "task2"

    def test_process_create_request_valid(self):
        """Testa criação válida de ProcessCreateRequest."""
        request = ProcessCreateRequest(
            name="Processo Teste",
            description="Descrição do processo de teste",
            domain="financeiro",
            mermaid_code="graph TD\n  start([Início])",
            nodes=[
                ProcessNode(id="start", type="event", label="Início")
            ],
            flows=[
                ProcessFlow(from_node="start", to_node="task1")
            ]
        )
        assert request.name == "Processo Teste"
        assert request.domain == "financeiro"
        assert len(request.nodes) == 1
        assert len(request.flows) == 1

    def test_process_create_request_invalid_short_name(self):
        """Testa validação de nome muito curto."""
        with pytest.raises(ValidationError):
            ProcessCreateRequest(
                name="AB",
                description="Descrição válida",
                domain="financeiro",
                mermaid_code="graph TD"
            )


class TestComplianceSchemas:
    """Testes para schemas de compliance."""

    def test_compliance_analyze_request_valid(self):
        """Testa criação válida de ComplianceAnalyzeRequest."""
        request = ComplianceAnalyzeRequest(
            process_id="proc123",
            domain="LGPD",
            additional_context="Contexto adicional"
        )
        assert request.process_id == "proc123"
        assert request.domain == "LGPD"

    def test_compliance_gap_valid(self):
        """Testa criação válida de ComplianceGap."""
        gap = ComplianceGap(
            gap_id="GAP001",
            severity="high",
            regulation="LGPD",
            article="Art. 46",
            description="Falta controle de acesso",
            affected_nodes=["task1", "task2"],
            recommendation="Implementar autenticação"
        )
        assert gap.gap_id == "GAP001"
        assert gap.severity == "high"
        assert len(gap.affected_nodes) == 2

    def test_compliance_gap_invalid_severity(self):
        """Testa validação de severidade inválida."""
        with pytest.raises(ValidationError) as exc_info:
            ComplianceGap(
                gap_id="GAP001",
                severity="super_critical",  # Inválido
                regulation="LGPD",
                description="Teste",
                recommendation="Teste"
            )
        assert "Severity deve ser um de" in str(exc_info.value)

    def test_compliance_gap_severity_case_insensitive(self):
        """Testa que severity aceita diferentes cases."""
        gap = ComplianceGap(
            gap_id="GAP001",
            severity="HIGH",  # Uppercase
            regulation="LGPD",
            description="Teste",
            recommendation="Teste"
        )
        assert gap.severity == "high"  # Normalizado para lowercase

    def test_compliance_suggestion_valid(self):
        """Testa criação válida de ComplianceSuggestion."""
        suggestion = ComplianceSuggestion(
            suggestion_id="SUG001",
            type="process_improvement",
            title="Melhorar controles",
            description="Adicionar validação extra",
            priority="high",
            estimated_effort="2 dias"
        )
        assert suggestion.suggestion_id == "SUG001"
        assert suggestion.type == "process_improvement"

    def test_compliance_analyze_response_valid(self):
        """Testa criação válida de ComplianceAnalyzeResponse."""
        response = ComplianceAnalyzeResponse(
            analysis_id="analysis123",
            process_id="proc123",
            domain="LGPD",
            analyzed_at=datetime.utcnow(),
            overall_score=75.5,
            gaps=[
                ComplianceGap(
                    gap_id="GAP001",
                    severity="medium",
                    regulation="LGPD",
                    description="Teste",
                    recommendation="Teste"
                )
            ],
            suggestions=[
                ComplianceSuggestion(
                    suggestion_id="SUG001",
                    type="control_addition",
                    title="Teste",
                    description="Teste"
                )
            ],
            summary="Análise concluída"
        )
        assert response.analysis_id == "analysis123"
        assert response.overall_score == 75.5
        assert len(response.gaps) == 1
        assert len(response.suggestions) == 1

    def test_compliance_analyze_response_score_validation(self):
        """Testa validação do score (0-100)."""
        # Score válido
        response = ComplianceAnalyzeResponse(
            analysis_id="analysis123",
            process_id="proc123",
            domain="LGPD",
            analyzed_at=datetime.utcnow(),
            overall_score=100.0
        )
        assert response.overall_score == 100.0

        # Score inválido (> 100)
        with pytest.raises(ValidationError):
            ComplianceAnalyzeResponse(
                analysis_id="analysis123",
                process_id="proc123",
                domain="LGPD",
                analyzed_at=datetime.utcnow(),
                overall_score=150.0
            )

        # Score inválido (< 0)
        with pytest.raises(ValidationError):
            ComplianceAnalyzeResponse(
                analysis_id="analysis123",
                process_id="proc123",
                domain="LGPD",
                analyzed_at=datetime.utcnow(),
                overall_score=-10.0
            )
