"""
Exemplo 1: Geração de Diagrama BPMN a partir de descrição textual.

Este exemplo demonstra como usar o endpoint /v1/diagrams/generate
para converter uma descrição de processo em diagrama Mermaid.js.
"""
import asyncio
import json
import httpx


API_BASE_URL = "http://localhost:8080"


async def generate_diagram_example():
    """Gera diagrama BPMN a partir de descrição."""

    print("=" * 80)
    print("Exemplo 1: Geração de Diagrama BPMN")
    print("=" * 80)

    # Descrição do processo
    description = """
    Processo de Solicitação de Férias:

    1. O colaborador acessa o sistema e preenche o formulário de solicitação de férias,
       informando o período desejado e justificativa.

    2. O sistema verifica automaticamente se o colaborador possui saldo de dias
       suficiente. Se não houver saldo, a solicitação é rejeitada automaticamente.

    3. Se houver saldo, a solicitação é enviada para aprovação do gestor direto.

    4. O gestor analisa a solicitação considerando:
       - Calendário da equipe
       - Períodos já aprovados
       - Necessidades do projeto

    5. O gestor pode:
       a) Aprovar a solicitação
       b) Rejeitar a solicitação com justificativa
       c) Solicitar alteração do período

    6. Se aprovado, o RH é notificado e:
       - Atualiza o calendário corporativo
       - Registra as férias no sistema de ponto
       - Envia confirmação ao colaborador

    7. O colaborador recebe notificação por e-mail com o resultado.
    """

    context = """
    Departamento: Recursos Humanos
    Empresa: Empresa de médio porte (200-500 funcionários)
    Regulamentação: CLT - Consolidação das Leis do Trabalho
    """

    # Request payload
    payload = {
        "description": description,
        "context": context
    }

    print("\n📝 Descrição do Processo:")
    print(description[:200] + "...")

    print("\n🔄 Gerando diagrama com IA...")

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{API_BASE_URL}/v1/diagrams/generate",
                json=payload
            )

            if response.status_code == 200:
                result = response.json()

                print("\n✅ Diagrama gerado com sucesso!\n")

                print("📋 Texto Normalizado:")
                print("-" * 80)
                print(result["normalized_text"])
                print()

                print("🎨 Código Mermaid.js:")
                print("-" * 80)
                print(result["mermaid_code"])
                print()

                print("📊 Metadados:")
                print("-" * 80)
                print(json.dumps(result.get("metadata", {}), indent=2))
                print()

                # Salvar resultado em arquivo
                with open("examples/generated_diagram.json", "w") as f:
                    json.dump(result, f, indent=2, ensure_ascii=False)
                print("💾 Resultado salvo em: examples/generated_diagram.json")

                # Instruções para visualização
                print("\n" + "=" * 80)
                print("🎯 Como visualizar o diagrama:")
                print("=" * 80)
                print("1. Acesse: https://mermaid.live")
                print("2. Cole o código Mermaid acima")
                print("3. O diagrama será renderizado automaticamente")
                print()

                return result

            else:
                print(f"\n❌ Erro ao gerar diagrama: {response.status_code}")
                print(response.text)
                return None

        except Exception as e:
            print(f"\n❌ Erro na requisição: {e}")
            return None


if __name__ == "__main__":
    asyncio.run(generate_diagram_example())
