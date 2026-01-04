# Segurança e Autenticação - ComplianceEngine API

## 🔐 Visão Geral de Segurança

O ComplianceEngine API implementa múltiplas camadas de segurança para proteger acesso aos serviços e dados.

## 🔑 Sistema de API Keys

### Geração de API Keys

- **Formato**: `ce_live_<64 caracteres hexadecimais>`
- **Exemplo**: `ce_live_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`
- **Algoritmo**: Geração criptograficamente segura usando `secrets.token_hex(32)`

### Armazenamento Seguro

- **Hash**: API keys são hasheadas com **bcrypt** (12 rounds) antes de armazenar
- **Nunca armazenadas em texto plano**: Apenas o hash é salvo no Firestore
- **Exibição única**: Chaves são mostradas apenas uma vez durante criação
- **Prefixo para lookup**: Primeiros 16 caracteres armazenados para busca rápida

### Validação de API Keys

```python
# Processo de validação:
1. Extrair prefixo (16 primeiros caracteres)
2. Buscar no Firestore por prefixo + status="active"
3. Verificar hash com bcrypt
4. Verificar expiração
5. Verificar permissões
6. Atualizar last_used_at e contadores
```

### Permissões por API Key

Cada API key pode ter permissões específicas:

- `diagrams:generate` - Gerar diagramas BPMN
- `processes:create` - Criar processos
- `processes:read` - Ler processos
- `processes:update` - Atualizar processos
- `processes:delete` - Deletar processos
- `compliance:analyze` - Analisar compliance
- `compliance:read` - Ler análises

## 🛡️ Proteção de Endpoints

### Endpoints Públicos (Sem Autenticação)

- `GET /` - Health check básico
- `GET /health` - Health check detalhado
- `GET /docs` - Documentação Swagger
- `GET /redoc` - Documentação ReDoc

### Endpoints Protegidos (Requerem API Key)

**Todos os outros endpoints** requerem header:

```
Authorization: Bearer ce_live_<api_key>
```

**Endpoints principais**:
- `POST /v1/diagrams/generate`
- `POST /v1/processes`
- `GET /v1/processes`
- `GET /v1/processes/{id}`
- `POST /v1/compliance/analyze`
- `GET /v1/compliance/analyses/{id}`

### Respostas de Erro de Autenticação

```json
// 401 Unauthorized - API key ausente ou inválida
{
  "detail": "Missing or invalid authorization header"
}

// 401 Unauthorized - API key inválida
{
  "detail": "Invalid API key"
}

// 401 Unauthorized - API key expirada
{
  "detail": "API key has expired"
}

// 403 Forbidden - Permissões insuficientes
{
  "detail": "Insufficient permissions"
}
```

## 🔒 MCP (Model Context Protocol) - Segurança

### MCP Desktop (STDIO)

**Configuração Local**:
- Pode funcionar **sem API key** se configurado localmente
- **Recomendado usar API key** mesmo localmente para consistência

**Configuração Produção**:
- **API key obrigatória** via variável de ambiente
- Validação contra ComplianceEngine API

```json
{
  "mcpServers": {
    "compliance-engine": {
      "command": "node",
      "args": ["/path/to/mcp-server"],
      "env": {
        "API_KEY": "ce_live_..."  // OBRIGATÓRIO em produção
      }
    }
  }
}
```

### MCP Gateway (HTTP)

**Sempre requer API key**:

```typescript
// Middleware de validação
const validateApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or invalid authorization header"
    });
  }
  
  const token = authHeader.substring(7);
  // Validação contra API key service
  // ...
};
```

**Todas as requisições ao Gateway requerem**:
```
Authorization: Bearer ce_live_<api_key>
```

## 🚫 Rate Limiting

### Limites por API Key

Cada API key tem limites configuráveis:

- **Requests por minuto**: Padrão 100
- **Requests por hora**: Padrão 1000
- **Requests por dia**: Padrão 10000

### Resposta de Rate Limit

```json
// 429 Too Many Requests
{
  "detail": "Rate limit exceeded",
  "retry_after": 60,
  "limit": 100,
  "remaining": 0,
  "reset_at": "2025-12-23T12:00:00Z"
}
```

## 🔐 Admin Dashboard - Autenticação

### Autenticação de Administradores

Para criar/gerenciar API keys, é necessário autenticação admin:

**Atual (Temporário)**:
- Token deve começar com `admin_`
- TODO: Implementar JWT/OAuth2 completo

**Futuro (Produção)**:
- JWT tokens do Admin Dashboard
- OAuth2 com Google/SSO
- Role-based access control (RBAC)

## 🌐 CORS e Headers de Segurança

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure para produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Produção**: Configure `allow_origins` com domínios específicos.

### Security Headers

Recomendado adicionar (via Cloud Run ou proxy):

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

## 🔍 Auditoria e Logging

### Logs de Segurança

Todas as operações são logadas:

- **Criação de API keys**: Quem criou, quando, para qual aplicação
- **Uso de API keys**: Timestamp, endpoint, status
- **Tentativas de acesso inválidas**: IP, timestamp, motivo
- **Revogação de API keys**: Quem revogou, quando, motivo

### Firestore Collections de Segurança

```
api_keys/
  {key_id}/
    - key_hash (bcrypt)
    - key_prefix
    - status (active|revoked|expired)
    - created_at
    - last_used_at
    - usage.total_requests
    - revoked_at
    - revoked_by
```

## ⚠️ Boas Práticas de Segurança

### Para Desenvolvedores

1. **Nunca commite API keys**:
   ```bash
   # Use variáveis de ambiente
   export COMPLIANCE_ENGINE_API_KEY=ce_live_...
   ```

2. **Rotacione API keys regularmente**:
   - Crie nova API key
   - Atualize aplicação
   - Revogue antiga após período de transição

3. **Use permissões mínimas**:
   - Apenas permissões necessárias por API key
   - Diferentes keys para diferentes ambientes

4. **Monitore uso**:
   - Verifique logs regularmente
   - Configure alertas para uso anômalo

5. **HTTPS sempre**:
   - Nunca use HTTP em produção
   - Valide certificados SSL

### Para Administradores

1. **Audite API keys regularmente**:
   - Revogue keys não utilizadas
   - Verifique permissões
   - Monitore uso

2. **Configure rate limits apropriados**:
   - Baseado em uso real
   - Prevenir abuso

3. **Mantenha logs**:
   - Retenha logs de segurança
   - Configure alertas

4. **Backup de dados**:
   - Firestore backups automáticos
   - Teste restauração

## 🚨 Incidentes de Segurança

### Se uma API Key for comprometida:

1. **Revogue imediatamente**:
   ```bash
   POST /v1/api-keys/{id}/revoke
   ```

2. **Verifique logs**:
   - Identifique uso não autorizado
   - Determine escopo do comprometimento

3. **Crie nova API key**:
   - Para aplicação afetada
   - Atualize aplicação

4. **Notifique equipe**:
   - Documente incidente
   - Atualize procedimentos se necessário

## 📋 Checklist de Segurança

- [ ] API keys armazenadas com hash bcrypt
- [ ] Validação de API key em todos os endpoints protegidos
- [ ] Rate limiting configurado
- [ ] CORS configurado para produção
- [ ] HTTPS habilitado
- [ ] Logs de segurança ativos
- [ ] Auditoria de API keys
- [ ] Rotação de chaves planejada
- [ ] Backup de dados configurado
- [ ] Plano de resposta a incidentes

## 🔗 Referências

- [docs/AUTHENTICATION.md](AUTHENTICATION.md) - Guia de autenticação
- [docs/AI_INTEGRATION_GUIDE.md](AI_INTEGRATION_GUIDE.md) - Guia para IAs
- [docs/INTEGRATION.md](INTEGRATION.md) - Manual de integração

---

**Última atualização**: 2025-12-23  
**Versão**: 1.0.0

