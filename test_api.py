"""
Script de exemplo para testar os endpoints da ComplianceEngine API.
"""
import asyncio
import json
from typing import Dict

import httpx


# Configuração
BASE_URL = "http://localhost:8080"


async def test_health_check():
    """Testa o endpoint de health check."""
    print("\n=== Testing Health Check ===")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200


async def test_generate_diagram():
    """Testa a geração de diagrama."""
    print("\n=== Testing Diagram Generation ===")

    request_data = {
        "description": """
        Processo de Aprovação de Férias:
        1. Colaborador solicita férias no sistema
        2. Sistema verifica saldo de dias disponíveis
        3. Se não houver saldo suficiente, processo é encerrado
        4. Se houver saldo, requisição é enviada para o gestor
        5. Gestor analisa e pode aprovar ou rejeitar
        6. Se aprovado, RH é notificado e atualiza o calendário
        7. Colaborador recebe notificação do resultado
        """,
        "context": "Departamento de Recursos Humanos - Empresa de médio porte"
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{BASE_URL}/v1/diagrams/generate",
            json=request_data
        )
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"\nNormalized Text:\n{result['normalized_text']}\n")
            print(f"Mermaid Code:\n{result['mermaid_code']}\n")
            print(f"Metadata: {json.dumps(result.get('metadata', {}), indent=2)}")
            return result
        else:
            print(f"Error: {response.text}")
            return None


async def test_create_process(diagram_data: Dict = None):
    """Testa a criação de processo."""
    print("\n=== Testing Process Creation ===")

    # Usa dados do diagrama se fornecido, caso contrário usa dados mock
    if diagram_data:
        mermaid_code = diagram_data["mermaid_code"]
        description = diagram_data["normalized_text"]
    else:
        mermaid_code = "graph TD\n  start([Início]) --> task1[Criar Requisição]"
        description = "Processo de exemplo"

    request_data = {
        "name": "Processo de Aprovação de Férias",
        "description": description,
        "domain": "RH",
        "mermaid_code": mermaid_code,
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
                "label": "Colaborador solicita férias",
                "properties": {"actor": "Colaborador"}
            },
            {
                "id": "task2",
                "type": "task",
                "label": "Sistema verifica saldo",
                "properties": {"actor": "Sistema"}
            },
            {
                "id": "gateway1",
                "type": "gateway",
                "label": "Saldo suficiente?",
                "properties": {}
            }
        ],
        "flows": [
            {"from_node": "start", "to_node": "task1"},
            {"from_node": "task1", "to_node": "task2"},
            {"from_node": "task2", "to_node": "gateway1"}
        ],
        "metadata": {
            "department": "RH",
            "created_by": "test_script"
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/v1/processes",
            json=request_data
        )
        print(f"Status: {response.status_code}")

        if response.status_code == 201:
            result = response.json()
            print(f"Process Created: {json.dumps(result, indent=2, default=str)}")
            return result["process_id"]
        else:
            print(f"Error: {response.text}")
            return None


async def test_get_process(process_id: str):
    """Testa a recuperação de processo."""
    print(f"\n=== Testing Get Process: {process_id} ===")

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/v1/processes/{process_id}")
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"Process: {json.dumps(result, indent=2, default=str)[:500]}...")
            return result
        else:
            print(f"Error: {response.text}")
            return None


async def test_analyze_compliance(process_id: str):
    """Testa a análise de compliance."""
    print(f"\n=== Testing Compliance Analysis: {process_id} ===")

    request_data = {
        "process_id": process_id,
        "domain": "LGPD",
        "additional_context": "Processo lida com dados pessoais de colaboradores"
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{BASE_URL}/v1/compliance/analyze",
            json=request_data
        )
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"\nAnalysis ID: {result['analysis_id']}")
            print(f"Overall Score: {result.get('overall_score', 'N/A')}")
            print(f"\nSummary:\n{result.get('summary', 'N/A')}\n")
            print(f"Gaps Found: {len(result.get('gaps', []))}")
            print(f"Suggestions: {len(result.get('suggestions', []))}")

            # Mostra primeiro gap se existir
            if result.get('gaps'):
                print(f"\nFirst Gap:")
                print(json.dumps(result['gaps'][0], indent=2))

            return result
        else:
            print(f"Error: {response.text}")
            return None


async def run_all_tests():
    """Executa todos os testes em sequência."""
    print("=" * 80)
    print("ComplianceEngine API - Test Suite")
    print("=" * 80)

    try:
        # 1. Health Check
        if not await test_health_check():
            print("\n❌ Health check failed! Is the server running?")
            return

        # 2. Generate Diagram
        diagram_data = await test_generate_diagram()

        # 3. Create Process
        process_id = await test_create_process(diagram_data)

        if not process_id:
            print("\n❌ Failed to create process")
            return

        # 4. Get Process
        process_data = await test_get_process(process_id)

        # 5. Analyze Compliance
        if process_data:
            await test_analyze_compliance(process_id)

        print("\n" + "=" * 80)
        print("✅ All tests completed!")
        print("=" * 80)

    except Exception as e:
        print(f"\n❌ Error during tests: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(run_all_tests())
