# Compreensão do Domínio: Os 3 Pilares do n.process

Este documento detalha a compreensão funcional da plataforma, separando os conceitos de negócio da implementação técnica. O objetivo é alinhar a visão do produto.

## 1. Processos (The Workflow Engine)

**Não é apenas:** Um formulário ou um banco de dados.
**É:** Um motor de orquestração de trabalho (BPMN-lite).

- **Definição (Blueprint)**: O sistema permite desenhar "Tipos de Processo" (ex: "Onboarding de Fornecedor", "Aprovação de Crédito").
- **Instância (Execução)**: Cada vez que um processo roda, ele cria uma instância viva com um ciclo de vida.
- **Gestão de Estado**: O processo sabe em que etapa está (ex: "Aguardando Assinatura").
- **Atores**: Quem faz o quê (humano vs máquina).
- **SLA/Prazos**: O processo tem consciência do tempo (ex: "Esta etapa está atrasada há 2 horas").
- **Transições**: Lógica condicional (Se valor > 10k -> Vai para Gerente; Senão -> Aprovação Automática).

**Onde a IA entra aqui?** Sugerindo o próximo passo ou detectando gargalos no fluxo.

---

## 2. Compliance do Processo (The Rule Engine & Auditor)

**Não é apenas:** Segurança da informação (LGPD/Senha) ou logs de erro.
**É:** A garantia de que o **Rito do Negócio** seguiu as **Regras Externas e Internas**.

- **Verificação de Regras (Policy as Code)**:
  - _Regra_: "Nenhum pagamento acima de 50k pode ser aprovado sem 2 assinaturas."
  - _Compliance_: O sistema bloqueia ou flagga se isso for violado.
- **Auditoria Contínua (Shadow Audit)**: Em vez de auditar 1 vez por ano, o sistema audita cada transação em tempo real.
- **Matriz de Risco**: O sistema classifica processos baseados em risco. Um processo de "Compra de Canetas" tem compliance leve. Um de "Fusão e Aquisição" tem compliance pesado.
- **Assistente Regulatório**: A capacidade de perguntar "Este processo de contratação segue a nova lei trabalhista?" e obter uma análise contextual.

**Onde a IA entra aqui?** "Lendo" o processo executado e comparando com a "Norma" (PDF da Lei/ISO) para encontrar desvios sutis.

---

## 3. Documentos (Intelligent Content & Evidence)

**Não é apenas:** Um "Google Drive" ou upload de arquivos estáticos.
**É:** A transformação de documentos "mortos" (PDF/Imagem) em **Dados Vivos e Evidências Válidas**.

- **Extração (OCR/NLP)**: O documento entra como PDF, mas o sistema "lê" o CNPJ, a Data, o Valor. O documento vira dados estruturados para alimentar o Processo (Pilar 1).
- **Validação de Evidência**:
  - "Este documento é realmente um Contrato Social?"
  - "Ele está assinado?"
  - "Está dentro da validade?"
- **Rastreabilidade**: O documento é a prova imutável que suporta o Compliance (Pilar 2). Se o Compliance diz que "foi aprovado", o Documento é a prova do "porquê".

---

## A Intersecção (A Tríade)

O poder do `n.process` não está em ter os 3 separados, mas em como eles conversam:

1.  O **Processo** pede um **Documento**.
2.  O **Documento** é lido pela IA, extraindo dados.
3.  O **Compliance** usa esses dados para validar se o **Processo** pode avançar.

_Exemplo: O Processo de Pagamento (1) para. O usuário sobe a Nota Fiscal (3). O sistema lê o valor da Nota, compara com o Pedido de Compra e, se bater (Compliance - 2), libera o Pagamento (1)._
