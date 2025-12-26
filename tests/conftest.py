"""
Configurações e fixtures compartilhadas para os testes.
"""
import os
import pytest


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Configura variáveis de ambiente para testes."""
    os.environ["GOOGLE_CLOUD_PROJECT"] = "test-project"
    os.environ["GCP_PROJECT_ID"] = "test-project"
    os.environ["APP_ENV"] = "test"
    os.environ["ENABLE_AI"] = "false"  # Disable AI for tests
    yield


@pytest.fixture
def sample_process_data():
    """Retorna dados de exemplo de um processo."""
    return {
        "name": "Processo de Teste",
        "description": "Processo usado em testes unitários",
        "mermaid_code": """
graph TD
    start([Início])
    task1[Tarefa 1]
    decision{Decisão?}
    task2[Tarefa 2]
    end_node([Fim])

    start --> task1
    task1 --> decision
    decision -->|Sim| task2
    decision -->|Não| end_node
    task2 --> end_node
        """,
        "nodes": [
            {
                "id": "start",
                "type": "event",
                "label": "Início",
                "properties": {}
            },
            {
                "id": "task1",
                "type": "task",
                "label": "Tarefa 1",
                "properties": {"actor": "User"}
            },
            {
                "id": "decision",
                "type": "gateway",
                "label": "Decisão?",
                "properties": {}
            },
            {
                "id": "task2",
                "type": "task",
                "label": "Tarefa 2",
                "properties": {"actor": "System"}
            },
            {
                "id": "end_node",
                "type": "event",
                "label": "Fim",
                "properties": {}
            }
        ],
        "flows": [
            {"from_node": "start", "to_node": "task1"},
            {"from_node": "task1", "to_node": "decision"},
            {"from_node": "decision", "to_node": "task2", "label": "Sim"},
            {"from_node": "decision", "to_node": "end_node", "label": "Não"},
            {"from_node": "task2", "to_node": "end_node"}
        ],
        "metadata": {
            "created_by": "test",
            "version": "1.0"
        }
    }


@pytest.fixture
def sample_regulations():
    """Retorna dados de exemplo de regulamentos."""
    return [
        {
            "title": "LGPD - Lei Geral de Proteção de Dados",
            "article": "Art. 6º",
            "content": "Princípios de tratamento de dados pessoais"
        },
        {
            "title": "LGPD - Lei Geral de Proteção de Dados",
            "article": "Art. 46",
            "content": "Medidas de segurança técnicas e administrativas"
        }
    ]
