# Exemplos de Prompts para IA de Desenvolvimento

Este documento contém exemplos práticos de prompts para usar em ferramentas de IA de desenvolvimento como **Cursor**, **Claude Code** e **Antigravity** ao trabalhar com a ComplianceEngine API.

---

## 🎯 Prompts para Cursor

### 1. Integração Básica

```
Crie uma função Python que integra com a ComplianceEngine API para gerar diagramas BPMN. 
A função deve:
- Aceitar uma descrição de processo como parâmetro
- Fazer requisição POST para /v1/diagrams/generate
- Tratar erros adequadamente
- Retornar o código Mermaid.js gerado
- Usar httpx para requisições assíncronas
```

### 2. Cliente Completo

```
Crie uma classe Python ComplianceEngineClient que encapsula todas as operações da API:
- generate_diagram(description, context)
- create_process(process_data)
- analyze_compliance(process_id, domain, context)
- get_process(process_id)
- list_processes(limit, domain)

Use httpx.AsyncClient, inclua tratamento de erros, type hints com Pydantic models, 
e documentação docstring completa.
```

### 3. Integração com Frontend

```
Crie um componente React que:
- Permite usuário inserir descrição de processo
- Chama a ComplianceEngine API para gerar diagrama
- Renderiza o diagrama Mermaid.js usando a biblioteca mermaid
- Mostra loading state durante requisição
- Exibe erros de forma amigável
- Permite exportar diagrama como PNG
```

### 4. Fluxo Completo de Compliance

```
Implemente uma função que executa o fluxo completo de análise de compliance:
1. Gera diagrama a partir de descrição
2. Cria processo no Firestore
3. Analisa compliance (LGPD)
4. Gera relatório em PDF com gaps e sugestões
5. Salva relatório localmente

Use a ComplianceEngine API e biblioteca reportlab para PDF.
```

### 5. Testes de Integração

```
Crie testes pytest para a integração com ComplianceEngine API:
- Teste de geração de diagrama com mock de resposta
- Teste de criação de processo
- Teste de análise de compliance
- Teste de tratamento de erros (404, 422, 500)
- Use pytest-asyncio e httpx mock
```

---

## 🤖 Prompts para Claude Code

### 1. Análise de Código Existente

```
Analise o arquivo examples/02_create_and_analyze_process.py e:
1. Identifique padrões de uso da API
2. Sugira melhorias no tratamento de erros
3. Proponha otimizações de performance
4. Adicione type hints onde faltam
5. Melhore a documentação
```

### 2. Refatoração

```
Refatore o código de integração da ComplianceEngine API para:
- Separar lógica de negócio de chamadas HTTP
- Criar abstrações para diferentes tipos de análise
- Implementar cache de resultados
- Adicionar retry logic com exponential backoff
- Seguir princípios SOLID
```

### 3. Documentação

```
Gere documentação completa para a classe ComplianceEngineClient incluindo:
- Docstrings em formato Google style
- Exemplos de uso para cada método
- Documentação de exceções possíveis
- Type hints completos
- README com casos de uso
```

### 4. Otimização

```
Otimize a integração com ComplianceEngine API para:
- Reduzir latência usando connection pooling
- Implementar batch processing para múltiplos processos
- Adicionar métricas de performance (tempo de resposta, taxa de erro)
- Cache inteligente baseado em TTL
- Paralelizar análises quando possível
```

### 5. Segurança

```
Adicione segurança à integração com ComplianceEngine API:
- Validação de inputs antes de enviar
- Sanitização de dados sensíveis nos logs
- Implementação de rate limiting no cliente
- Tratamento seguro de credenciais
- Validação de certificados SSL em produção
```

---

## 🚀 Prompts para Antigravity

### 1. Geração de Código

```
Gere código Python completo para um dashboard de compliance que:
- Lista todos os processos analisados
- Mostra score de compliance de cada um
- Permite filtrar por domínio (LGPD, SOX, GDPR)
- Exibe gaps críticos em destaque
- Integra com ComplianceEngine API
- Usa FastAPI para backend e React para frontend
```

### 2. Arquitetura

```
Proponha arquitetura para sistema que integra ComplianceEngine API:
- Como estruturar microserviços
- Onde armazenar cache de análises
- Como implementar fila para análises assíncronas
- Estratégia de retry e circuit breaker
- Monitoramento e observabilidade
```

### 3. Migração

```
Crie plano de migração para integrar ComplianceEngine API em sistema legado:
- Identifique pontos de integração
- Proponha estratégia de migração gradual
- Crie adapters para compatibilidade
- Defina testes de regressão
- Documente processo de rollback
```

### 4. Escalabilidade

```
Projete solução escalável para usar ComplianceEngine API em alta demanda:
- Como lidar com 1000+ requisições/minuto
- Estratégia de cache distribuído
- Load balancing entre instâncias
- Rate limiting inteligente
- Monitoramento de custos GCP
```

---

## 📋 Prompts Genéricos (Funcionam em Qualquer Ferramenta)

### 1. Debugging

```
Estou tendo erro 422 ao chamar /v1/diagrams/generate. 
O erro diz "description não pode estar vazia" mas estou enviando descrição.
Analise meu código e identifique o problema:

[cole seu código aqui]
```

### 2. Melhorias

```
Como posso melhorar este código de integração com ComplianceEngine API?
Quero adicionar:
- Retry automático em caso de falha
- Logging estruturado
- Métricas de performance
- Tratamento de timeout

[cole seu código aqui]
```

### 3. Novas Features

```
Preciso adicionar funcionalidade que:
- Monitora processos e analisa compliance periodicamente
- Envia alertas quando score cai abaixo de 70
- Gera relatório semanal automático
- Integra com ComplianceEngine API

Crie arquitetura e código inicial.
```

### 4. Testes

```
Crie suite de testes para minha integração com ComplianceEngine API:
- Testes unitários para cada método
- Testes de integração com API real (marcados como integration)
- Testes de performance (latência, throughput)
- Testes de erro handling
- Use pytest, fixtures e mocks apropriados
```

### 5. Documentação

```
Gere documentação completa para minha integração com ComplianceEngine API:
- README com instruções de instalação
- Exemplos de uso para cada cenário
- Diagrama de arquitetura
- Troubleshooting guide
- Changelog
```

---

## 🎨 Prompts Específicos por Caso de Uso

### Caso 1: Sistema ERP

```
Crie módulo de compliance para sistema ERP que:
- Integra com ComplianceEngine API
- Analisa processos de compras automaticamente
- Gera alertas quando processos não estão em conformidade
- Armazena histórico de análises
- Permite exportar relatórios de auditoria
```

### Caso 2: Plataforma de Gestão

```
Desenvolva feature de análise de compliance para plataforma de gestão:
- Usuário pode mapear processo via interface
- Sistema chama ComplianceEngine API para gerar diagrama
- Análise automática de compliance ao salvar processo
- Dashboard mostra score e gaps
- Notificações quando novos gaps são identificados
```

### Caso 3: Ferramenta de Auditoria

```
Crie ferramenta de auditoria que usa ComplianceEngine API:
- Importa processos de múltiplas fontes
- Analisa todos contra LGPD, SOX, GDPR
- Gera relatório consolidado com todos os gaps
- Prioriza gaps por severidade
- Sugere plano de ação baseado em sugestões da API
```

### Caso 4: Sistema de Documentação

```
Desenvolva sistema que:
- Permite usuário descrever processo em texto livre
- Chama ComplianceEngine API para gerar diagrama BPMN
- Renderiza diagrama na documentação
- Mantém sincronização entre texto e diagrama
- Exporta documentação completa (texto + diagrama)
```

---

## 🔧 Prompts para Correção de Problemas

### Problema 1: Timeout

```
Minha requisição para /v1/compliance/analyze está dando timeout após 30s.
Como posso:
- Aumentar timeout do cliente
- Implementar polling assíncrono
- Adicionar progress indicator
- Tratar timeout graciosamente
```

### Problema 2: Rate Limiting

```
Estou recebendo erro 429 (Too Many Requests) da API.
Implemente:
- Rate limiting no cliente
- Queue para requisições
- Retry com backoff exponencial
- Monitoramento de rate limit
```

### Problema 3: Erros de Validação

```
Como validar dados antes de enviar para ComplianceEngine API?
Crie:
- Validação de description (tamanho, formato)
- Validação de process structure
- Validação de domain (valores permitidos)
- Mensagens de erro claras para usuário
```

---

## 📊 Prompts para Análise e Relatórios

### 1. Dashboard

```
Crie dashboard que mostra:
- Lista de processos com score de compliance
- Gráfico de evolução de scores ao longo do tempo
- Top 10 gaps mais críticos
- Distribuição de processos por domínio
- Integra com ComplianceEngine API para dados
```

### 2. Relatórios

```
Gere sistema de relatórios que:
- Exporta análise de compliance em PDF
- Inclui diagramas Mermaid renderizados
- Lista todos os gaps com recomendações
- Compara múltiplos processos
- Formato executivo e técnico
```

### 3. Alertas

```
Implemente sistema de alertas que:
- Monitora processos via ComplianceEngine API
- Envia email quando score cai abaixo de threshold
- Notifica sobre novos gaps críticos
- Cria tickets automaticamente para gaps high severity
- Dashboard de alertas em tempo real
```

---

## 🎓 Prompts para Aprendizado

### 1. Entendendo a API

```
Explique como funciona a ComplianceEngine API:
- Qual o fluxo completo de uma análise?
- Como os diagramas são gerados?
- Como funciona a análise de compliance?
- Quais são os limites e constraints?
- Como tratar erros comuns?
```

### 2. Boas Práticas

```
Quais são as melhores práticas para integrar com ComplianceEngine API?
Inclua:
- Padrões de código
- Estrutura de projeto
- Tratamento de erros
- Performance
- Segurança
- Testes
```

### 3. Arquitetura

```
Explique a arquitetura recomendada para sistema que usa ComplianceEngine API:
- Onde colocar lógica de integração?
- Como estruturar camadas?
- Onde fazer cache?
- Como implementar retry?
- Como monitorar?
```

---

## 💡 Dicas para Usar Prompts Efetivamente

### 1. Seja Específico
❌ "Crie integração com API"  
✅ "Crie classe Python que integra com ComplianceEngine API usando httpx, com retry logic e tratamento de erros"

### 2. Forneça Contexto
❌ "Adicione validação"  
✅ "Adicione validação Pydantic para request de /v1/diagrams/generate, validando que description tem entre 10 e 10000 caracteres"

### 3. Defina Requisitos
❌ "Melhore performance"  
✅ "Otimize para reduzir latência de 5s para <2s, usando connection pooling e cache de resultados por 1 hora"

### 4. Inclua Exemplos
❌ "Crie função"  
✅ "Crie função generate_diagram(description: str) -> dict que chama /v1/diagrams/generate e retorna {'mermaid_code': '...', 'metadata': {...}}"

### 5. Especifique Tecnologias
❌ "Crie frontend"  
✅ "Crie componente React com TypeScript que renderiza diagramas Mermaid usando biblioteca mermaid, com loading state e error handling"

---

## 📝 Template de Prompt Completo

Use este template para criar seus próprios prompts:

```
[CONTEXTO]
Estou trabalhando em [projeto/aplicação] que precisa [objetivo].

[REQUISITOS]
Preciso que você:
1. [requisito 1]
2. [requisito 2]
3. [requisito 3]

[TECNOLOGIAS]
- Linguagem: [Python/JavaScript/etc]
- Framework: [FastAPI/React/etc]
- Bibliotecas: [httpx/mermaid/etc]

[CONSTRAINTS]
- [limitação 1]
- [limitação 2]

[EXEMPLO]
Exemplo de código existente ou estrutura desejada:
[cole código ou descreva]

[ENTREGÁVEIS]
Quero receber:
- [item 1]
- [item 2]
```

---

**Última atualização**: 2025-12-22  
**Versão**: 1.0.0

