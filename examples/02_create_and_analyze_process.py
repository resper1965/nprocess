"""
Exemplo 2: Fluxo Completo - Gerar, Criar e Analisar Processo.

Este exemplo demonstra o fluxo completo:
1. Gerar diagrama a partir de descrição
2. Criar processo no Firestore
3. Analisar compliance do processo
"""
import asyncio
import json
import httpx


API_BASE_URL = "http://localhost:8080"


async def complete_workflow_example():
    """Executa fluxo completo de geração e análise."""

    print("=" * 80)
    print("Exemplo 2: Fluxo Completo - Gerar, Criar e Analisar")
    print("=" * 80)

    async with httpx.AsyncClient(timeout=120.0) as client:

        # ========================================================================
        # PASSO 1: Gerar Diagrama
        # ========================================================================
        print("\n📝 PASSO 1: Gerando diagrama...")
        print("-" * 80)

        diagram_payload = {
            "description": """
            Processo de Tratamento de Dados Pessoais de Clientes:

            1. Cliente preenche formulário de cadastro online com dados pessoais
            2. Sistema valida os dados e solicita consentimento LGPD
            3. Cliente aceita ou rejeita os termos
            4. Se rejeitado, cadastro não é concluído
            5. Se aceito, dados são armazenados no banco de dados
            6. Sistema envia e-mail de confirmação
            7. Dados são utilizados para processamento de pedidos
            8. Cliente pode solicitar exclusão de dados a qualquer momento
            """,
            "context": "E-commerce - Tratamento de dados pessoais"
        }

        response = await client.post(
            f"{API_BASE_URL}/v1/diagrams/generate",
            json=diagram_payload
        )

        if response.status_code != 200:
            print(f"❌ Erro ao gerar diagrama: {response.text}")
            return

        diagram_result = response.json()
        print("✅ Diagrama gerado com sucesso!")
        print(f"   Atividades identificadas: {diagram_result.get('metadata', {}).get('activities_count', 'N/A')}")

        # ========================================================================
        # PASSO 2: Criar Processo
        # ========================================================================
        print("\n📦 PASSO 2: Criando processo no Firestore...")
        print("-" * 80)

        process_payload = {
            "name": "Processo de Tratamento de Dados Pessoais",
            "description": diagram_result["normalized_text"],
            "domain": "LGPD",
            "mermaid_code": diagram_result["mermaid_code"],
            "nodes": [
                {
                    "id": "start",
                    "type": "event",
                    "label": "Cliente acessa formulário",
                    "properties": {"actor": "Cliente"}
                },
                {
                    "id": "task1",
                    "type": "task",
                    "label": "Preencher dados pessoais",
                    "properties": {
                        "actor": "Cliente",
                        "data_processing": True,
                        "personal_data": True
                    }
                },
                {
                    "id": "task2",
                    "type": "task",
                    "label": "Validar dados",
                    "properties": {"actor": "Sistema"}
                },
                {
                    "id": "gateway1",
                    "type": "gateway",
                    "label": "Consentimento LGPD?",
                    "properties": {"compliance_checkpoint": True}
                },
                {
                    "id": "task3",
                    "type": "task",
                    "label": "Armazenar dados",
                    "properties": {
                        "actor": "Sistema",
                        "data_storage": True,
                        "personal_data": True
                    }
                },
                {
                    "id": "task4",
                    "type": "task",
                    "label": "Enviar confirmação",
                    "properties": {"actor": "Sistema"}
                },
                {
                    "id": "end",
                    "type": "event",
                    "label": "Processo concluído",
                    "properties": {}
                }
            ],
            "flows": [
                {"from_node": "start", "to_node": "task1"},
                {"from_node": "task1", "to_node": "task2"},
                {"from_node": "task2", "to_node": "gateway1"},
                {"from_node": "gateway1", "to_node": "task3", "label": "Aceito"},
                {"from_node": "gateway1", "to_node": "end", "label": "Rejeitado"},
                {"from_node": "task3", "to_node": "task4"},
                {"from_node": "task4", "to_node": "end"}
            ],
            "metadata": {
                "industry": "e-commerce",
                "data_classification": "personal",
                "compliance_domain": "LGPD"
            }
        }

        response = await client.post(
            f"{API_BASE_URL}/v1/processes",
            json=process_payload
        )

        if response.status_code != 201:
            print(f"❌ Erro ao criar processo: {response.text}")
            return

        process_result = response.json()
        process_id = process_result["process_id"]
        print(f"✅ Processo criado com sucesso!")
        print(f"   ID: {process_id}")

        # ========================================================================
        # PASSO 3: Analisar Compliance
        # ========================================================================
        print("\n🔍 PASSO 3: Analisando compliance (LGPD)...")
        print("-" * 80)

        analysis_payload = {
            "process_id": process_id,
            "domain": "LGPD",
            "additional_context": "Processo de e-commerce que coleta e armazena dados pessoais de clientes"
        }

        response = await client.post(
            f"{API_BASE_URL}/v1/compliance/analyze",
            json=analysis_payload
        )

        if response.status_code != 200:
            print(f"❌ Erro ao analisar compliance: {response.text}")
            return

        analysis_result = response.json()
        print("✅ Análise de compliance concluída!")

        # ========================================================================
        # RESULTADOS DA ANÁLISE
        # ========================================================================
        print("\n" + "=" * 80)
        print("📊 RESULTADOS DA ANÁLISE DE COMPLIANCE")
        print("=" * 80)

        print(f"\n🎯 Score Geral: {analysis_result.get('overall_score', 'N/A')}/100")
        print(f"🆔 ID da Análise: {analysis_result['analysis_id']}")

        print("\n📝 Resumo Executivo:")
        print("-" * 80)
        print(analysis_result.get('summary', 'N/A'))

        print(f"\n⚠️  Gaps Identificados: {len(analysis_result.get('gaps', []))}")
        print("-" * 80)
        for i, gap in enumerate(analysis_result.get('gaps', []), 1):
            print(f"\n{i}. [{gap['severity'].upper()}] {gap['description']}")
            print(f"   Regulamento: {gap['regulation']}")
            if gap.get('article'):
                print(f"   Artigo: {gap['article']}")
            print(f"   Recomendação: {gap['recommendation']}")
            if gap.get('affected_nodes'):
                print(f"   Nós Afetados: {', '.join(gap['affected_nodes'])}")

        print(f"\n💡 Sugestões de Melhoria: {len(analysis_result.get('suggestions', []))}")
        print("-" * 80)
        for i, suggestion in enumerate(analysis_result.get('suggestions', []), 1):
            print(f"\n{i}. [{suggestion['priority'].upper()}] {suggestion['title']}")
            print(f"   Tipo: {suggestion['type']}")
            print(f"   Descrição: {suggestion['description']}")
            if suggestion.get('estimated_effort'):
                print(f"   Esforço Estimado: {suggestion['estimated_effort']}")

        # Salvar resultado completo
        output_data = {
            "diagram": diagram_result,
            "process": process_result,
            "analysis": analysis_result
        }

        with open("examples/complete_workflow_result.json", "w") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False, default=str)

        print("\n" + "=" * 80)
        print("💾 Resultado completo salvo em: examples/complete_workflow_result.json")
        print("=" * 80)

        return output_data


if __name__ == "__main__":
    asyncio.run(complete_workflow_example())
