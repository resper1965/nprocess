# ComplianceEngine API - Exemplos de Uso

Esta pasta contém exemplos práticos de como usar a ComplianceEngine API.

## Pré-requisitos

1. API rodando localmente ou em Cloud Run
2. Dependências instaladas: `pip install httpx`

## Exemplos Disponíveis

### 01_generate_diagram.py

Demonstra como gerar um diagrama BPMN (Mermaid.js) a partir de uma descrição textual de processo.

**Uso:**
```bash
python examples/01_generate_diagram.py
```

**O que faz:**
- Envia descrição de processo para o endpoint `/v1/diagrams/generate`
- Recebe texto normalizado e código Mermaid.js
- Salva resultado em `generated_diagram.json`
- Mostra instruções para visualizar no Mermaid Live Editor

**Casos de uso:**
- Documentar processos existentes
- Criar diagramas rapidamente a partir de descrições
- Padronizar documentação de processos

---

### 02_create_and_analyze_process.py

Demonstra o fluxo completo: gerar diagrama, criar processo e analisar compliance.

**Uso:**
```bash
python examples/02_create_and_analyze_process.py
```

**O que faz:**
1. Gera diagrama de um processo de tratamento de dados (LGPD)
2. Cria processo estruturado no Firestore
3. Analisa compliance contra regulamentação LGPD
4. Exibe gaps, recomendações e score de conformidade
5. Salva resultado completo em `complete_workflow_result.json`

**Casos de uso:**
- Análise de conformidade de processos
- Identificação automática de gaps regulatórios
- Geração de relatórios de auditoria

---

## Configuração

### API Local

Se a API estiver rodando localmente:
```python
API_BASE_URL = "http://localhost:8080"
```

### API em Cloud Run

Se a API estiver em produção:
```python
API_BASE_URL = "https://compliance-engine-dev-xxxxx-uc.a.run.app"
```

## Estrutura de Arquivos Gerados

```
examples/
├── generated_diagram.json           # Resultado do exemplo 01
├── complete_workflow_result.json    # Resultado do exemplo 02
└── ...                              # Outros resultados
```

## Próximos Exemplos (Em Desenvolvimento)

- **03_batch_analysis.py**: Análise em lote de múltiplos processos
- **04_custom_regulations.py**: Análise com regulamentos customizados
- **05_process_comparison.py**: Comparação entre versões de processos
- **06_export_report.py**: Exportação de relatórios em PDF/Excel

## Dicas

1. **Timeouts**: Análises complexas podem levar 30-60 segundos
2. **Rate Limits**: Em produção, implemente backoff exponencial
3. **Caching**: Considere cachear resultados de análises idênticas
4. **Monitoramento**: Use os logs para debug e monitoramento

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação principal: `../README.md`
- API Docs interativa: http://localhost:8080/docs
- Logs da aplicação: `make logs` ou `make logs-tail`
