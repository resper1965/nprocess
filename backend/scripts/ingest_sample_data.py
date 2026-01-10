#!/usr/bin/env python3
"""
Script para ingerir dados legais de exemplo no Knowledge Store.

Uso:
    uv run python scripts/ingest_sample_data.py
"""

import asyncio

# Sample LGPD Articles for testing
LGPD_SAMPLES = [
    {
        "content": """Art. 1º Esta Lei dispõe sobre o tratamento de dados pessoais, inclusive nos meios digitais, por pessoa natural ou por pessoa jurídica de direito público ou privado, com o objetivo de proteger os direitos fundamentais de liberdade e de privacidade e o livre desenvolvimento da personalidade da pessoa natural.""",
        "metadata": {"law": "LGPD", "article": "1"}
    },
    {
        "content": """Art. 5º Para os fins desta Lei, considera-se:
I - dado pessoal: informação relacionada a pessoa natural identificada ou identificável;
II - dado pessoal sensível: dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico, quando vinculado a uma pessoa natural;
III - dado anonimizado: dado relativo a titular que não possa ser identificado, considerando a utilização de meios técnicos razoáveis e disponíveis na ocasião de seu tratamento;
IV - banco de dados: conjunto estruturado de dados pessoais, estabelecido em um ou em vários locais, em suporte eletrônico ou físico;
V - titular: pessoa natural a quem se referem os dados pessoais que são objeto de tratamento;""",
        "metadata": {"law": "LGPD", "article": "5"}
    },
    {
        "content": """Art. 7º O tratamento de dados pessoais somente poderá ser realizado nas seguintes hipóteses:
I - mediante o fornecimento de consentimento pelo titular;
II - para o cumprimento de obrigação legal ou regulatória pelo controlador;
III - pela administração pública, para o tratamento e uso compartilhado de dados necessários à execução de políticas públicas;
IV - para a realização de estudos por órgão de pesquisa;
V - quando necessário para a execução de contrato ou de procedimentos preliminares relacionados a contrato do qual seja parte o titular;
VI - para o exercício regular de direitos em processo judicial, administrativo ou arbitral;
VII - para a proteção da vida ou da incolumidade física do titular ou de terceiro;
VIII - para a tutela da saúde, exclusivamente, em procedimento realizado por profissionais de saúde;
IX - quando necessário para atender aos interesses legítimos do controlador ou de terceiro;
X - para a proteção do crédito.""",
        "metadata": {"law": "LGPD", "article": "7"}
    },
    {
        "content": """Art. 18. O titular dos dados pessoais tem direito a obter do controlador, em relação aos dados do titular por ele tratados, a qualquer momento e mediante requisição:
I - confirmação da existência de tratamento;
II - acesso aos dados;
III - correção de dados incompletos, inexatos ou desatualizados;
IV - anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com o disposto nesta Lei;
V - portabilidade dos dados a outro fornecedor de serviço ou produto;
VI - eliminação dos dados pessoais tratados com o consentimento do titular;
VII - informação das entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados;
VIII - informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa;
IX - revogação do consentimento.""",
        "metadata": {"law": "LGPD", "article": "18"}
    },
]


async def ingest_samples():
    """Ingest sample LGPD data."""
    from app.services.ingestion.chunking import LegalDocumentStrategy
    
    print("🔄 Starting sample data ingestion...")
    print(f"   Documents to ingest: {len(LGPD_SAMPLES)}")
    
    # Use legal chunking strategy
    chunker = LegalDocumentStrategy()
    
    total_chunks = 0
    for doc in LGPD_SAMPLES:
        chunks = chunker.chunk(doc["content"], doc["metadata"])
        total_chunks += len(chunks)
        print(f"   ✓ {doc['metadata']['law']} Art. {doc['metadata']['article']}: {len(chunks)} chunk(s)")
    
    print(f"\n✅ Ingestion complete!")
    print(f"   Total chunks created: {total_chunks}")
    print(f"\n⚠️  Note: This is a dry run. To actually store in Firestore,")
    print(f"   you need to configure GCP credentials and use the API.")


if __name__ == "__main__":
    asyncio.run(ingest_samples())
