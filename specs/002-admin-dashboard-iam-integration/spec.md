# Admin Dashboard - Integração IAM e Analytics

**Spec ID**: 002  
**Título**: Admin Dashboard com Integração IAM (Google Cloud) e Analytics  
**Status**: Draft  
**Data**: 2025-12-23  
**Autor**: ComplianceEngine Team

## 📋 Resumo Executivo

Esta spec define a implementação de um Admin Dashboard completo para o ComplianceEngine, baseado no dashboard de referência ([resper1965/clone](https://github.com/resper1965/clone)), adaptado para usar Google Cloud IAM, Firestore e integração com a API existente.

### Objetivos Principais

1. **Gestão de API Keys** - Interface completa para criar, listar, revogar e monitorar API keys
2. **Analytics e Métricas** - Dashboard de analytics com métricas de uso, conversões e performance
3. **Controle de Usuários** - Sistema de IAM baseado em Google Cloud Identity com RBAC
4. **Integração com Backend** - Consumo da API ComplianceEngine existente

## 🎯 Contexto e Motivação

### Dashboard de Referência

O dashboard de referência ([resper1965/clone](https://github.com/resper1965/clone)) fornece:

- **Página de API Keys** (`/apps/api-keys`):
  - DataTable com listagem de API keys
  - Dialog para criar novas API keys
  - Cards de métricas (API calls, conversões, etc.)
  - Ações de revogação e edição

- **Página de Analytics** (`/website-analytics`):
  - Gráficos de métricas
  - Filtros por período
  - Visualizações de dados

### Adaptação para ComplianceEngine

**Tecnologias a usar**:
- **Autenticação**: Google Cloud Identity (IAM) via NextAuth.js
- **Banco de Dados**: Firestore (já em uso)
- **Backend**: ComplianceEngine API existente
- **Frontend**: Next.js 16 com design system ness

## 🏗️ Arquitetura

### Componentes Principais

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Dashboard                       │
│                  (Next.js Frontend)                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Auth       │  │  API Keys    │  │  Analytics   │  │
│  │  (NextAuth)  │  │  Management  │  │  Dashboard   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┼─────────────────┘           │
│                           │                             │
└───────────────────────────┼─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              ComplianceEngine API                      │
│              (FastAPI Backend)                         │
├─────────────────────────────────────────────────────────┤
│  /v1/api-keys/*  │  /v1/admin/*  │  /v1/analytics/*  │
└──────────────────┼────────────────┼────────────────────┘
                   │                │
                   ▼                ▼
         ┌─────────────────┐  ┌──────────────┐
         │   Firestore     │  │ Google Cloud │
         │   (Database)    │  │     IAM      │
         └─────────────────┘  └──────────────┘
```

### Fluxo de Autenticação

```
1. Usuário acessa Admin Dashboard
   ↓
2. NextAuth.js redireciona para Google OAuth (se não autenticado)
   ↓
3. Google Cloud Identity valida usuário
   ↓
4. NextAuth.js cria sessão JWT
   ↓
5. Middleware verifica permissões (RBAC)
   ↓
6. Usuário acessa páginas baseado em role
```

## 📐 Especificação Detalhada

### 1. Sistema de Autenticação e IAM

#### 1.1 Integração com Google Cloud Identity

**Objetivo**: Usar Google Cloud IAM para autenticação e autorização.

**Implementação**:

```typescript
// admin-dashboard/src/lib/auth/google-iam.ts
import { GoogleAuth } from 'google-auth-library';
import { IAMClient } from '@google-cloud/iam';

export class GoogleIAMService {
  private auth: GoogleAuth;
  private iamClient: IAMClient;

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    this.iamClient = new IAMClient();
  }

  async verifyUser(email: string): Promise<boolean> {
    // Verificar se email existe no Google Workspace/Cloud Identity
    // Retornar true se usuário existe
  }

  async getUserRoles(email: string): Promise<string[]> {
    // Buscar roles do usuário no Google Cloud IAM
    // Retornar array de roles: ['admin', 'viewer', 'editor']
  }

  async checkPermission(
    email: string,
    resource: string,
    permission: string
  ): Promise<boolean> {
    // Verificar permissão específica usando IAM
  }
}
```

#### 1.2 NextAuth.js Configuration

**Arquivo**: `admin-dashboard/src/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { GoogleIAMService } from '@/lib/auth/google-iam';

const iamService = new GoogleIAMService();

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Verificar se usuário existe no Google Cloud Identity
        const exists = await iamService.verifyUser(user.email!);
        if (!exists) {
          return false; // Bloquear acesso
        }

        // Buscar roles do usuário
        const roles = await iamService.getUserRoles(user.email!);
        (user as any).roles = roles;

        return true;
      }
      return false;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email;
        token.roles = (user as any).roles || [];
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).roles = token.roles;
        (session.user as any).email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
```

#### 1.3 RBAC (Role-Based Access Control)

**Roles definidos**:

- **Super Admin**: Acesso total, pode gerenciar usuários
- **Admin**: Pode criar/gerenciar API keys, ver analytics
- **Editor**: Pode criar API keys, ver analytics limitado
- **Viewer**: Apenas leitura de analytics e API keys

**Middleware de autorização**:

```typescript
// admin-dashboard/src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const roles = (token?.roles as string[]) || [];

    // Rotas que requerem admin
    if (path.startsWith('/admin') && !roles.includes('admin') && !roles.includes('super-admin')) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Rotas que requerem super admin
    if (path.startsWith('/admin/users') && !roles.includes('super-admin')) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);
```

### 2. Página de API Keys

#### 2.1 Estrutura da Página

**Rota**: `/dashboard/api-keys`

**Componentes principais** (baseado em [clone/apps/api-keys](https://github.com/resper1965/clone/tree/main/app/dashboard/(auth)/apps/api-keys)):

1. **DataTable** (`datatable.tsx`):
   - Listagem de todas as API keys
   - Colunas: Nome, Key (mascarada), Status, Criado em, Último uso, Ações
   - Filtros e busca
   - Paginação

2. **Create API Key Dialog** (`create-api-key-dialog.tsx`):
   - Formulário para criar nova API key
   - Campos: Nome, Ambiente (live/test), Permissões, Expiração
   - Exibição única da chave após criação

3. **Métricas Cards**:
   - **API Calls Card**: Total de chamadas, sucesso, erro
   - **Successful Conversions**: Conversões bem-sucedidas
   - **Failed Conversions**: Falhas
   - **Upgrade Plan Card**: Informações de plano/quota

#### 2.2 Integração com Backend

**Hook customizado**:

```typescript
// admin-dashboard/src/hooks/use-api-keys.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useAPIKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/api-keys', {
        headers: {
          Authorization: `Bearer ${await getSessionToken()}`,
        },
      });
      return response.data;
    },
  });
}

export function useCreateAPIKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: APIKeyCreateRequest) => {
      const response = await apiClient.post('/v1/api-keys', data, {
        headers: {
          Authorization: `Bearer ${await getSessionToken()}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useRevokeAPIKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (keyId: string) => {
      const response = await apiClient.post(
        `/v1/api-keys/${keyId}/revoke`,
        {},
        {
          headers: {
            Authorization: `Bearer ${await getSessionToken()}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}
```

#### 2.3 Componente DataTable

```typescript
// admin-dashboard/src/app/(dashboard)/api-keys/datatable.tsx
'use client';

import { useState } from 'react';
import { useAPIKeys, useRevokeAPIKey } from '@/hooks/use-api-keys';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Trash2, Copy } from 'lucide-react';

export function APIKeysDataTable() {
  const { data: apiKeys, isLoading } = useAPIKeys();
  const revokeMutation = useRevokeAPIKey();
  const [search, setSearch] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const filteredKeys = apiKeys?.filter((key) =>
    key.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 12)}...${key.substring(key.length - 4)}`;
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar API keys..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Último uso</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredKeys?.map((key) => (
            <TableRow key={key.id}>
              <TableCell>{key.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="text-sm">
                    {visibleKeys.has(key.id) ? key.key : maskKey(key.key)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(key.id)}
                  >
                    {visibleKeys.has(key.id) ? <EyeOff /> : <Eye />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(key.key)}
                  >
                    <Copy />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={key.status === 'active' ? 'success' : 'destructive'}>
                  {key.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                {key.last_used_at
                  ? new Date(key.last_used_at).toLocaleDateString()
                  : 'Nunca'}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => revokeMutation.mutate(key.id)}
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 3. Página de Analytics

#### 3.1 Estrutura da Página

**Rota**: `/dashboard/analytics`

**Componentes principais** (baseado em [clone/website-analytics](https://github.com/resper1965/clone/tree/main/app/dashboard/(auth)/website-analytics)):

1. **Métricas Principais**:
   - Total de requisições
   - Taxa de sucesso
   - Tempo médio de resposta
   - Requisições por endpoint

2. **Gráficos**:
   - Linha do tempo de requisições
   - Distribuição por endpoint
   - Erros por tipo
   - Uso por API key

3. **Filtros**:
   - Período (últimos 7 dias, 30 dias, 90 dias, custom)
   - Endpoint específico
   - API key específica
   - Status (sucesso/erro)

#### 3.2 Backend - Endpoints de Analytics

**Novos endpoints na API**:

```python
# app/routers/analytics.py
from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/v1/analytics", tags=["Analytics"])

@router.get("/metrics")
async def get_metrics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    api_key_id: Optional[str] = Query(None),
    admin_token: str = Depends(verify_admin_token)
):
    """
    Retorna métricas agregadas de uso da API.
    """
    # Agregar dados do Firestore
    # Retornar: total_requests, success_rate, avg_response_time, etc.
    pass

@router.get("/requests/timeline")
async def get_requests_timeline(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    granularity: str = Query("hour"),  # hour, day, week
    admin_token: str = Depends(verify_admin_token)
):
    """
    Retorna timeline de requisições para gráfico.
    """
    pass

@router.get("/requests/by-endpoint")
async def get_requests_by_endpoint(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    admin_token: str = Depends(verify_admin_token)
):
    """
    Retorna distribuição de requisições por endpoint.
    """
    pass

@router.get("/errors")
async def get_errors(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    admin_token: str = Depends(verify_admin_token)
):
    """
    Retorna análise de erros.
    """
    pass
```

#### 3.3 Componente de Analytics

```typescript
// admin-dashboard/src/app/(dashboard)/analytics/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [granularity, setGranularity] = useState('hour');

  const { data: metrics } = useQuery({
    queryKey: ['analytics', 'metrics', dateRange, granularity],
    queryFn: async () => {
      const response = await apiClient.get('/v1/analytics/metrics', {
        params: {
          start_date: dateRange.from.toISOString(),
          end_date: dateRange.to.toISOString(),
          granularity,
        },
        headers: {
          Authorization: `Bearer ${await getSessionToken()}`,
        },
      });
      return response.data;
    },
  });

  const { data: timeline } = useQuery({
    queryKey: ['analytics', 'timeline', dateRange, granularity],
    queryFn: async () => {
      const response = await apiClient.get('/v1/analytics/requests/timeline', {
        params: {
          start_date: dateRange.from.toISOString(),
          end_date: dateRange.to.toISOString(),
          granularity,
        },
        headers: {
          Authorization: `Bearer ${await getSessionToken()}`,
        },
      });
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Select value={granularity} onValueChange={setGranularity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Por hora</SelectItem>
              <SelectItem value="day">Por dia</SelectItem>
              <SelectItem value="week">Por semana</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Requisições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_requests || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.success_rate ? `${(metrics.success_rate * 100).toFixed(1)}%` : '0%'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avg_response_time ? `${metrics.avg_response_time}ms` : '0ms'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Erros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_errors || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Requisições ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart width={800} height={300} data={timeline}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="requests" stroke="#00ade8" />
            <Line type="monotone" dataKey="errors" stroke="#ef4444" />
          </LineChart>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Estrutura de Dados no Firestore

#### 4.1 Collection: `api_keys`

```typescript
interface APIKey {
  id: string;
  name: string;
  key_hash: string; // bcrypt hash
  key_prefix: string; // primeiros 16 caracteres
  environment: 'live' | 'test';
  status: 'active' | 'revoked' | 'expired';
  permissions: string[];
  created_at: Timestamp;
  created_by: string; // email do admin
  last_used_at?: Timestamp;
  expires_at?: Timestamp;
  revoked_at?: Timestamp;
  revoked_by?: string;
  usage: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    last_request_at?: Timestamp;
  };
  rate_limits: {
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
  };
}
```

#### 4.2 Collection: `api_requests` (para analytics)

```typescript
interface APIRequest {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  timestamp: Timestamp;
  user_agent?: string;
  ip_address?: string;
  error_message?: string;
}
```

#### 4.3 Collection: `admin_users` (cache de roles)

```typescript
interface AdminUser {
  email: string;
  name: string;
  roles: string[]; // ['admin', 'viewer', etc.]
  last_login: Timestamp;
  created_at: Timestamp;
  created_by?: string;
  mfa_enabled: boolean;
}
```

### 5. Backend - Novos Endpoints

#### 5.1 Endpoints de Admin

```python
# app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.services.google_iam_service import GoogleIAMService

router = APIRouter(prefix="/v1/admin", tags=["Admin"])

@router.get("/users")
async def list_users(
    admin_token: str = Depends(verify_admin_token)
):
    """
    Lista todos os usuários admin.
    Requer role: super-admin
    """
    # Verificar se usuário tem role super-admin
    # Buscar usuários do Firestore (cache)
    # Retornar lista
    pass

@router.post("/users")
async def create_user(
    user_data: UserCreateRequest,
    admin_token: str = Depends(verify_admin_token)
):
    """
    Adiciona novo usuário admin.
    Requer role: super-admin
    """
    # Verificar role
    # Criar usuário no Google Cloud IAM (se necessário)
    # Salvar no Firestore
    pass

@router.delete("/users/{email}")
async def delete_user(
    email: str,
    admin_token: str = Depends(verify_admin_token)
):
    """
    Remove usuário admin.
    Requer role: super-admin
    """
    pass
```

#### 5.2 Serviço Google IAM

```python
# app/services/google_iam_service.py
from google.cloud import iam
from google.oauth2 import service_account
import os

class GoogleIAMService:
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        self.iam_client = iam.IAMClient()
    
    async def verify_user(self, email: str) -> bool:
        """Verifica se usuário existe no Google Cloud Identity."""
        # Implementar verificação
        pass
    
    async def get_user_roles(self, email: str) -> list[str]:
        """Busca roles do usuário."""
        # Buscar do Firestore (cache) ou Google Cloud IAM
        pass
    
    async def assign_role(self, email: str, role: str):
        """Atribui role a usuário."""
        # Atualizar Google Cloud IAM
        # Atualizar cache no Firestore
        pass
```

## 🎨 Design System

### Componentes Reutilizáveis

Baseado no design system ness e componentes do dashboard de referência:

- **Cards**: Métricas, informações
- **DataTable**: Listagens com paginação, filtros, busca
- **Dialogs**: Criar/editar API keys, confirmações
- **Charts**: Recharts para gráficos
- **Forms**: React Hook Form + Zod validation

### Cores e Tipografia

Seguir design system ness:
- **Cores**: Slate-950 (background), #00ade8 (primary)
- **Tipografia**: Inter (corpo), Montserrat (títulos)

## 📊 Métricas e Analytics

### Métricas Coletadas

1. **Por API Key**:
   - Total de requisições
   - Taxa de sucesso/erro
   - Tempo médio de resposta
   - Último uso

2. **Por Endpoint**:
   - Número de chamadas
   - Taxa de erro
   - Tempo médio

3. **Geral**:
   - Total de API keys ativas
   - Total de requisições (período)
   - Picos de uso
   - Erros mais comuns

### Armazenamento

- **Tempo real**: Firestore (últimas 24h)
- **Histórico**: BigQuery (opcional, para análises longas)
- **Agregações**: Calculadas on-demand ou pré-agregadas

## 🔒 Segurança

### Autenticação

- Google OAuth 2.0 via NextAuth.js
- JWT tokens para sessão
- Refresh tokens

### Autorização

- RBAC baseado em Google Cloud IAM
- Middleware de verificação de roles
- Proteção de rotas no frontend e backend

### Auditoria

- Log de todas as ações admin
- Quem criou/revogou API keys
- Acessos ao dashboard
- Mudanças de permissões

## 📝 Checklist de Implementação

### Fase 1: Autenticação e IAM
- [ ] Configurar Google OAuth no NextAuth.js
- [ ] Implementar GoogleIAMService
- [ ] Criar middleware de autorização
- [ ] Implementar RBAC
- [ ] Página de login

### Fase 2: API Keys Management
- [ ] DataTable de API keys
- [ ] Dialog de criação
- [ ] Integração com backend
- [ ] Cards de métricas
- [ ] Ações (revogar, copiar, visualizar)

### Fase 3: Analytics
- [ ] Endpoints de analytics no backend
- [ ] Coleta de métricas (middleware)
- [ ] Página de analytics
- [ ] Gráficos e visualizações
- [ ] Filtros e períodos

### Fase 4: Admin Users Management
- [ ] Listagem de usuários
- [ ] Criação/edição de usuários
- [ ] Atribuição de roles
- [ ] Integração com Google Cloud IAM

### Fase 5: Polimento
- [ ] Testes E2E
- [ ] Documentação
- [ ] Performance optimization
- [ ] Error handling

## 🚀 Deploy

### Variáveis de Ambiente

```bash
# Google Cloud
GOOGLE_CLOUD_PROJECT=nprocess
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# NextAuth
NEXTAUTH_URL=https://admin.nprocess.com
NEXTAUTH_SECRET=...

# API
COMPLIANCE_API_URL=https://compliance-engine-xxx.run.app
```

### Cloud Run

```bash
gcloud run deploy admin-dashboard \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=nprocess
```

## 📚 Referências

- [Dashboard de Referência](https://github.com/resper1965/clone)
- [Google Cloud IAM](https://cloud.google.com/iam/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Design System ness](../docs/FRONTEND_PROPOSAL.md)

---

**Próximos Passos**: Revisar spec, aprovar, criar tasks no GitHub Spec-Kit

