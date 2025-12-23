# Análise de Segurança - MCP e Geração de Chaves

**Data**: 2025-12-23  
**Status**: ⚠️ Requer Melhorias

## 🔍 Análise Atual

### ✅ Geração de Chaves - CONFIÁVEL

**Status**: ✅ **SEGURO**

A geração de API keys é **criptograficamente segura**:

```python
# app/services/apikey_service.py
import secrets

def generate_api_key(self, environment: str = "live") -> str:
    """Generate a cryptographically secure API key."""
    random_bytes = secrets.token_hex(32)  # 64 caracteres hexadecimais
    return f"ce_{environment}_{random_bytes}"
```

**Pontos Fortes**:
- ✅ Usa `secrets.token_hex()` - gerador criptograficamente seguro do Python
- ✅ 64 caracteres hexadecimais = 256 bits de entropia
- ✅ Hash bcrypt (12 rounds) antes de armazenar
- ✅ Nunca armazenado em texto plano
- ✅ Exibição única (mostrado apenas uma vez)

**Conclusão**: A geração de chaves é **confiável e segura**.

---

### ⚠️ MCP Gateway - VULNERÁVEL

**Status**: ⚠️ **NÃO PROTEGIDO ADEQUADAMENTE**

#### Problema 1: Validação Fraca de API Key

**Código Atual** (`mcp-servers/gateway/src/index.ts`):

```typescript
const validateApiKey = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or invalid authorization header",
    });
  }

  // ⚠️ PROBLEMA: Apenas verifica se não está vazio!
  // In production, validate against your API key service
  // For now, just check if it's not empty
  const token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({
      error: "Invalid API key",
    });
  }

  next(); // ⚠️ Permite qualquer token não-vazio!
};
```

**Vulnerabilidades**:
- ❌ **Não valida contra o backend**: Aceita qualquer string não-vazia
- ❌ **Não verifica hash**: Não compara com Firestore
- ❌ **Não verifica expiração**: Chaves expiradas ainda funcionam
- ❌ **Não verifica permissões**: Não checa se key tem permissão para o endpoint
- ❌ **Não verifica revogação**: Chaves revogadas ainda funcionam

**Impacto**: Qualquer pessoa com uma string qualquer pode usar o MCP Gateway!

---

#### Problema 2: MCP Desktop Local Sem Proteção

**Código Atual** (`mcp-servers/compliance-engine/src/index.ts`):

```typescript
const API_KEY = process.env.API_KEY || ""; // ⚠️ Opcional!

const client = new ComplianceEngineClient(API_BASE_URL, API_KEY);
// Se API_KEY vazio, client funciona sem autenticação
```

**Vulnerabilidades**:
- ❌ **API key opcional**: Pode funcionar sem chave
- ❌ **Sem validação**: Se chave fornecida, não é validada

---

#### Problema 3: Falta de Rate Limiting

**Código Atual**: Não há rate limiting no gateway.

**Vulnerabilidades**:
- ❌ **Abuso de recursos**: Requisições ilimitadas
- ❌ **DDoS**: Fácil de sobrecarregar o servidor
- ❌ **Custo**: Pode gerar custos altos no Vertex AI

---

## 🛡️ Soluções Propostas

### Solução 1: Validação Real de API Keys no Gateway

**Implementar validação contra ComplianceEngine API**:

```typescript
// mcp-servers/gateway/src/middleware/validate-api-key.ts
import axios from 'axios';

const COMPLIANCE_API_URL = process.env.COMPLIANCE_API_URL || 'http://localhost:8000';

interface APIKeyValidation {
  valid: boolean;
  key_id?: string;
  permissions?: string[];
  error?: string;
}

async function validateApiKeyAgainstBackend(
  apiKey: string
): Promise<APIKeyValidation> {
  try {
    // Chamar endpoint de validação do backend
    const response = await axios.post(
      `${COMPLIANCE_API_URL}/v1/api-keys/validate`,
      { api_key: apiKey },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 segundos timeout
      }
    );

    if (response.data.valid) {
      return {
        valid: true,
        key_id: response.data.key_id,
        permissions: response.data.permissions || [],
      };
    }

    return {
      valid: false,
      error: response.data.error || 'Invalid API key',
    };
  } catch (error: any) {
    // Se backend não disponível, negar acesso (fail-secure)
    console.error('Error validating API key:', error);
    return {
      valid: false,
      error: 'API key validation service unavailable',
    };
  }
}

export const validateApiKey = async (
  req: Request,
  res: Response,
  next: Function
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or invalid authorization header',
    });
  }

  const token = authHeader.substring(7);
  if (!token) {
    return res.status(401).json({
      error: 'Invalid API key',
    });
  }

  // ✅ VALIDAÇÃO REAL CONTRA BACKEND
  const validation = await validateApiKeyAgainstBackend(token);

  if (!validation.valid) {
    return res.status(401).json({
      error: validation.error || 'Invalid API key',
    });
  }

  // ✅ Adicionar informações da key ao request
  (req as any).apiKeyId = validation.key_id;
  (req as any).apiKeyPermissions = validation.permissions || [];

  next();
};
```

**Melhorias**:
- ✅ Valida contra backend real
- ✅ Verifica hash, expiração, revogação
- ✅ Fail-secure (nega se backend indisponível)
- ✅ Adiciona permissões ao request

---

### Solução 2: Verificação de Permissões por Endpoint

**Adicionar verificação de permissões**:

```typescript
// mcp-servers/gateway/src/middleware/check-permissions.ts

const ENDPOINT_PERMISSIONS: Record<string, string[]> = {
  '/v1/tools/compliance/generate_bpmn_diagram': ['diagrams:generate'],
  '/v1/tools/compliance/create_process': ['processes:create'],
  '/v1/tools/compliance/list_processes': ['processes:read'],
  '/v1/tools/compliance/get_process': ['processes:read'],
  '/v1/tools/compliance/analyze_compliance': ['compliance:analyze'],
  '/v1/tools/rag/search_regulations': ['rag:search'],
  // ...
};

export const checkPermissions = (
  req: Request,
  res: Response,
  next: Function
) => {
  const requiredPermissions = ENDPOINT_PERMISSIONS[req.path];
  const userPermissions = (req as any).apiKeyPermissions || [];

  if (!requiredPermissions) {
    // Endpoint não requer permissões específicas
    return next();
  }

  // Verificar se usuário tem todas as permissões necessárias
  const hasAllPermissions = requiredPermissions.every((perm) =>
    userPermissions.includes(perm)
  );

  if (!hasAllPermissions) {
    return res.status(403).json({
      error: 'Insufficient permissions',
      required: requiredPermissions,
      granted: userPermissions,
    });
  }

  next();
};
```

**Uso**:

```typescript
app.post(
  '/v1/tools/compliance/generate_bpmn_diagram',
  validateApiKey,        // ✅ Valida API key
  checkPermissions,      // ✅ Verifica permissões
  async (req, res) => {
    // ...
  }
);
```

---

### Solução 3: Rate Limiting

**Implementar rate limiting por API key**:

```typescript
// mcp-servers/gateway/src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Rate limit por API key
export const apiKeyRateLimit = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'mcp_gateway:rate_limit:',
  }),
  windowMs: 60 * 1000, // 1 minuto
  max: async (req) => {
    // Buscar limite da API key do backend
    const keyId = (req as any).apiKeyId;
    if (!keyId) return 100; // Default

    // Buscar quota do backend
    const quota = await getAPIKeyQuota(keyId);
    return quota.requests_per_minute || 100;
  },
  keyGenerator: (req) => {
    // Usar API key ID como chave
    return (req as any).apiKeyId || req.ip;
  },
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

### Solução 4: Cache de Validação

**Cachear validações para performance**:

```typescript
// mcp-servers/gateway/src/middleware/cache-validation.ts
import NodeCache from 'node-cache';

const validationCache = new NodeCache({
  stdTTL: 300, // 5 minutos
  checkperiod: 60,
});

export async function validateApiKeyWithCache(
  apiKey: string
): Promise<APIKeyValidation> {
  // Verificar cache primeiro
  const cached = validationCache.get<APIKeyValidation>(apiKey);
  if (cached) {
    return cached;
  }

  // Validar contra backend
  const validation = await validateApiKeyAgainstBackend(apiKey);

  // Cachear apenas se válida
  if (validation.valid) {
    validationCache.set(apiKey, validation);
  }

  return validation;
}
```

**Benefícios**:
- ✅ Reduz carga no backend
- ✅ Melhora performance
- ✅ Cache invalida após 5 minutos (chaves revogadas são detectadas)

---

### Solução 5: MCP Desktop - API Key Obrigatória

**Tornar API key obrigatória no MCP Desktop**:

```typescript
// mcp-servers/compliance-engine/src/index.ts

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error('❌ API_KEY environment variable is required!');
  console.error('Set API_KEY=ce_live_... before starting the MCP server.');
  process.exit(1); // ✅ Falha se não tiver chave
}

// Validar formato
if (!API_KEY.startsWith('ce_live_') && !API_KEY.startsWith('ce_test_')) {
  console.error('❌ Invalid API key format. Must start with ce_live_ or ce_test_');
  process.exit(1);
}

const client = new ComplianceEngineClient(API_BASE_URL, API_KEY);
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (Atual) | Depois (Proposto) |
|---------|---------------|-------------------|
| **Validação de API Key** | ❌ Apenas verifica se não está vazio | ✅ Valida contra backend (hash, expiração, revogação) |
| **Permissões** | ❌ Não verifica | ✅ Verifica permissões por endpoint |
| **Rate Limiting** | ❌ Não existe | ✅ Rate limit por API key |
| **MCP Desktop** | ⚠️ API key opcional | ✅ API key obrigatória |
| **Cache** | ❌ Sem cache | ✅ Cache de validações (5 min) |
| **Fail-Secure** | ❌ Permite se backend down | ✅ Nega acesso se backend down |
| **Auditoria** | ❌ Não registra | ✅ Log de todas as validações |

---

## ✅ Checklist de Implementação

### Prioridade Alta (P0) - Segurança Crítica

- [ ] **Implementar validação real de API keys no Gateway**
  - [ ] Criar endpoint `/v1/api-keys/validate` no backend
  - [ ] Implementar `validateApiKeyAgainstBackend()` no gateway
  - [ ] Substituir validação atual pela nova
  - [ ] Testes de validação

- [ ] **Tornar API key obrigatória no MCP Desktop**
  - [ ] Validar presença de API_KEY
  - [ ] Validar formato
  - [ ] Falhar se não tiver

- [ ] **Implementar verificação de permissões**
  - [ ] Mapear endpoints → permissões
  - [ ] Implementar middleware `checkPermissions`
  - [ ] Aplicar em todos os endpoints

### Prioridade Média (P1) - Importante

- [ ] **Implementar rate limiting**
  - [ ] Configurar Redis
  - [ ] Implementar middleware
  - [ ] Buscar quotas do backend

- [ ] **Implementar cache de validação**
  - [ ] Configurar NodeCache
  - [ ] Implementar cache com TTL
  - [ ] Invalidar cache em caso de revogação

### Prioridade Baixa (P2) - Melhorias

- [ ] **Auditoria e logging**
  - [ ] Log de todas as validações
  - [ ] Log de tentativas inválidas
  - [ ] Métricas de uso

- [ ] **Monitoramento**
  - [ ] Alertas para uso anômalo
  - [ ] Dashboard de segurança
  - [ ] Relatórios de acesso

---

## 🔒 Resumo de Segurança

### ✅ Pontos Fortes Atuais

1. **Geração de chaves**: Criptograficamente segura
2. **Armazenamento**: Hash bcrypt, nunca texto plano
3. **Backend**: Validação completa implementada

### ⚠️ Pontos Fracos Atuais

1. **MCP Gateway**: Validação muito fraca (aceita qualquer string)
2. **MCP Desktop**: API key opcional
3. **Permissões**: Não verificadas no gateway
4. **Rate Limiting**: Não existe

### ✅ Após Implementação das Soluções

1. **MCP Gateway**: Validação completa contra backend
2. **MCP Desktop**: API key obrigatória
3. **Permissões**: Verificadas por endpoint
4. **Rate Limiting**: Implementado
5. **Cache**: Performance otimizada
6. **Fail-Secure**: Nega acesso se backend indisponível

---

## 📝 Conclusão

### Geração de Chaves: ✅ CONFIÁVEL

A geração de API keys é **criptograficamente segura e confiável**.

### Proteção do MCP: ⚠️ REQUER MELHORIAS

**Atualmente NÃO está protegido adequadamente**. O gateway aceita qualquer string não-vazia como API key válida.

**Com as melhorias propostas**, o MCP ficará **totalmente protegido**:
- ✅ Validação real contra backend
- ✅ Verificação de permissões
- ✅ Rate limiting
- ✅ API key obrigatória

**Recomendação**: Implementar as soluções de **Prioridade Alta (P0)** imediatamente antes de usar em produção.

---

**Próximos Passos**:
1. Implementar validação real no gateway
2. Tornar API key obrigatória no MCP Desktop
3. Adicionar verificação de permissões
4. Implementar rate limiting

