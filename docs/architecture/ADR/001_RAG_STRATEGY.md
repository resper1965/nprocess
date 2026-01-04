# ADR 001: Estratégia de RAG e Ingestão de Dados

**Data:** 26/12/2025
**Status:** APROVADO
**Impacto:** Crítico

## Contexto

O sistema precisa processar documentos regulatórios com estruturas rígidas (Leis com Artigos/Incisos) e Técnicas (Planilhas Excel CIS/NIST).

## Decisão

**NÃO utilizaremos** a ingestão automática "turnkey" do _Vertex AI Search & Conversation (Agent Builder)_ para o core de compliance.
**UTILIZAREMOS** um **Pipeline Customizado em Python** que alimenta o _Vertex AI Vector Search_.

## Justificativa

1.  **Granularidade:** O chunking automático do Google corta textos arbitrariamente (ex: a cada 500 caracteres), quebrando a unidade lógica jurídica (Artigo/Inciso). Precisamos de "Semantic Chunking" customizado.
2.  **Dados Tabulares:** Ferramentas automáticas falham em preservar o relacionamento horizontal de linhas em arquivos Excel complexos (como CIS Controls).
3.  **Custo de Atualização:** O pipeline customizado permite verificação de Hash (Diff) antes de re-vetorizar, economizando custos de API que o método automático não permite.

## Consequência Técnica

A equipe de desenvolvimento DEVE implementar os `Harvesters` e `Strategies` em código (Cloud Functions/Run), usando o Vertex AI apenas para a geração de Embeddings e Armazenamento Vetorial.
