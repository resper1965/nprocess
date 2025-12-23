# FinOps - Controle de Custos por API Key

**Spec ID**: 003  
**Título**: Sistema de Rastreamento e Controle de Custos por API Key  
**Status**: Draft  
**Data**: 2025-12-23  
**Autor**: ComplianceEngine Team

## 📋 Resumo Executivo

Esta spec define a implementação de um sistema completo de rastreamento e controle de custos por API key no FinOps Dashboard, permitindo:

1. **Rastreamento granular**: Atribuir custos de Vertex AI, Firestore, Cloud Run, etc. a cada API key
2. **Budgets por API key**: Definir limites de custo mensal/diário por chave
3. **Alertas automáticos**: Notificar quando custos excedem thresholds
4. **Dashboard detalhado**: Visualizar custos por API key, consumer, serviço
5. **Otimização**: Recomendações baseadas em padrões de uso

## 🎯 Objetivos

### Objetivos Principais

- ✅ **Rastrear custos por API key** em tempo real
- ✅ **Atribuir custos** de todos os serviços GCP (Vertex AI, Firestore, Cloud Run, etc.)
- ✅ **Definir budgets** por API key e consumer
- ✅ **Alertar** quando custos excedem limites
- ✅ **Otimizar** custos com recomendações automáticas

### Casos de Uso

1. **Admin cria API key** → Define budget mensal de $500
2. **API key gera custos** → Sistema atribui custos de Vertex AI, Firestore, etc.
3. **Custo atinge 80% do budget** → Alerta enviado ao admin
4. **Custo excede 100%** → API key pode ser suspensa automaticamente
5. **Dashboard mostra** → Custos detalhados por API key, consumer, serviço

## 🏗️ Arquitetura

### Componentes

```
┌─────────────────────────────────────────────────────────┐
│              FinOps Cost Tracking System                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Cost         │  │ Budget       │  │ Alerts       │  │
│  │ Attribution  │  │ Management   │  │ System       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┼─────────────────┘           │
│                           │                             │
└───────────────────────────┼─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Google Cloud Billing API                   │
│              + Custom Cost Attribution                   │
├─────────────────────────────────────────────────────────┤
│  - Vertex AI costs                                      │
│  - Firestore costs                                      │
│  - Cloud Run costs                                      │
│  - Cloud Storage costs                                  │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   Firestore          │
         │   (Cost Data)        │
         └──────────────────────┘
```

### Fluxo de Rastreamento de Custos

```
1. Requisição chega na API com API key
   ↓
2. Sistema registra requisição com:
   - API key ID
   - Endpoint chamado
   - Timestamp
   - Serviços usados (Vertex AI, Firestore, etc.)
   ↓
3. Após processamento, sistema calcula custos:
   - Vertex AI: $0.001 por requisição (exemplo)
   - Firestore: $0.0001 por read/write
   - Cloud Run: Proporcional ao tempo de execução
   ↓
4. Atribui custos à API key no Firestore
   ↓
5. Verifica budgets e thresholds
   ↓
6. Envia alertas se necessário
```

## 📐 Especificação Detalhada

### 1. Estrutura de Dados no Firestore

#### 1.1 Collection: `api_key_costs`

```typescript
interface APIKeyCost {
  id: string; // Auto-generated
  api_key_id: string;
  consumer_app_id: string;
  
  // Período
  period: 'daily' | 'monthly';
  period_start: Timestamp;
  period_end: Timestamp;
  
  // Custos por serviço
  costs: {
    vertex_ai: {
      amount: number; // USD
      requests: number;
      avg_cost_per_request: number;
    };
    firestore: {
      amount: number;
      reads: number;
      writes: number;
      deletes: number;
    };
    cloud_run: {
      amount: number;
      compute_time_seconds: number;
      memory_gb_hours: number;
    };
    cloud_storage?: {
      amount: number;
      storage_gb: number;
      operations: number;
    };
  };
  
  // Total
  total_cost: number;
  total_requests: number;
  avg_cost_per_request: number;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

#### 1.2 Collection: `api_key_budgets`

```typescript
interface APIKeyBudget {
  id: string;
  api_key_id: string;
  consumer_app_id: string;
  
  // Budgets
  daily_budget?: number; // USD
  monthly_budget: number; // USD
  yearly_budget?: number; // USD
  
  // Thresholds para alertas
  alert_thresholds: {
    warning: number; // 80% (default)
    critical: number; // 95% (default)
    exceeded: number; // 100%
  };
  
  // Ações automáticas
  auto_actions: {
    suspend_on_exceeded: boolean; // Suspender API key se exceder
    notify_on_warning: boolean; // Notificar em 80%
    notify_on_critical: boolean; // Notificar em 95%
  };
  
  // Status
  status: 'active' | 'suspended' | 'exceeded';
  suspended_at?: Timestamp;
  suspended_reason?: string;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string; // Admin email
}
```

#### 1.3 Collection: `cost_attributions`

```typescript
interface CostAttribution {
  id: string;
  api_key_id: string;
  request_id: string; // ID único da requisição
  
  // Requisição
  endpoint: string;
  method: string;
  timestamp: Timestamp;
  
  // Custos calculados
  costs: {
    vertex_ai?: {
      amount: number;
      model: string; // 'gemini-1.5-pro'
      tokens_input: number;
      tokens_output: number;
    };
    firestore?: {
      amount: number;
      operations: {
        reads: number;
        writes: number;
        deletes: number;
      };
    };
    cloud_run?: {
      amount: number;
      execution_time_ms: number;
      memory_mb: number;
    };
  };
  
  total_cost: number;
  
  // Metadata
  created_at: Timestamp;
}
```

### 2. Backend - Serviço de Rastreamento de Custos

#### 2.1 Cost Attribution Service

```python
# app/services/cost_attribution_service.py
from datetime import datetime, timedelta
from typing import Dict, Optional
from google.cloud import firestore
import logging

logger = logging.getLogger(__name__)

class CostAttributionService:
    """Service for tracking and attributing costs to API keys."""
    
    # Preços por serviço (configuráveis)
    PRICING = {
        'vertex_ai': {
            'gemini-1.5-pro': {
                'input': 0.000125,  # $0.125 per 1M tokens
                'output': 0.0005,   # $0.50 per 1M tokens
            }
        },
        'firestore': {
            'read': 0.00006,   # $0.06 per 100k reads
            'write': 0.00018,  # $0.18 per 100k writes
            'delete': 0.00002, # $0.02 per 100k deletes
        },
        'cloud_run': {
            'cpu_second': 0.00002400,  # $0.024 per vCPU-second
            'memory_gb_second': 0.00000250,  # $0.0025 per GB-second
        }
    }
    
    def __init__(self, db: firestore.Client):
        self.db = db
        self.costs_collection = 'api_key_costs'
        self.attributions_collection = 'cost_attributions'
        self.budgets_collection = 'api_key_budgets'
    
    async def attribute_cost(
        self,
        api_key_id: str,
        request_id: str,
        endpoint: str,
        costs: Dict,
        timestamp: Optional[datetime] = None
    ):
        """
        Attribute cost to an API key for a specific request.
        
        Args:
            api_key_id: API key ID
            request_id: Unique request ID
            endpoint: API endpoint called
            costs: Dict with cost breakdown by service
            timestamp: Request timestamp
        """
        if timestamp is None:
            timestamp = datetime.utcnow()
        
        # Calculate total cost
        total_cost = sum(
            cost.get('amount', 0) 
            for cost in costs.values()
        )
        
        # Store attribution
        attribution_data = {
            'api_key_id': api_key_id,
            'request_id': request_id,
            'endpoint': endpoint,
            'method': 'POST',  # ou GET, etc.
            'timestamp': timestamp,
            'costs': costs,
            'total_cost': total_cost,
            'created_at': firestore.SERVER_TIMESTAMP,
        }
        
        self.db.collection(self.attributions_collection).add(attribution_data)
        
        # Update aggregated costs
        await self._update_aggregated_costs(api_key_id, costs, timestamp)
        
        # Check budgets
        await self._check_budgets(api_key_id, total_cost)
        
        logger.info(
            f"Cost attributed: ${total_cost:.4f} to API key {api_key_id} "
            f"for request {request_id}"
        )
    
    async def _update_aggregated_costs(
        self,
        api_key_id: str,
        costs: Dict,
        timestamp: datetime
    ):
        """Update daily and monthly aggregated costs."""
        # Get or create daily cost document
        date_str = timestamp.strftime('%Y-%m-%d')
        daily_doc_id = f"{api_key_id}_{date_str}"
        
        daily_ref = self.db.collection(self.costs_collection).document(daily_doc_id)
        daily_doc = daily_ref.get()
        
        if daily_doc.exists:
            daily_data = daily_doc.to_dict()
        else:
            daily_data = {
                'api_key_id': api_key_id,
                'period': 'daily',
                'period_start': datetime.combine(timestamp.date(), datetime.min.time()),
                'period_end': datetime.combine(timestamp.date(), datetime.max.time()),
                'costs': {
                    'vertex_ai': {'amount': 0, 'requests': 0},
                    'firestore': {'amount': 0, 'reads': 0, 'writes': 0, 'deletes': 0},
                    'cloud_run': {'amount': 0, 'compute_time_seconds': 0},
                },
                'total_cost': 0,
                'total_requests': 0,
            }
        
        # Update costs
        for service, cost_data in costs.items():
            if service in daily_data['costs']:
                daily_data['costs'][service]['amount'] += cost_data.get('amount', 0)
                if 'requests' in daily_data['costs'][service]:
                    daily_data['costs'][service]['requests'] += 1
        
        daily_data['total_cost'] += sum(c.get('amount', 0) for c in costs.values())
        daily_data['total_requests'] += 1
        daily_data['updated_at'] = firestore.SERVER_TIMESTAMP
        
        daily_ref.set(daily_data, merge=True)
        
        # Similar for monthly aggregation
        month_str = timestamp.strftime('%Y-%m')
        monthly_doc_id = f"{api_key_id}_{month_str}"
        # ... (similar logic)
    
    async def _check_budgets(self, api_key_id: str, cost: float):
        """Check if cost exceeds budget thresholds."""
        budgets_ref = self.db.collection(self.budgets_collection)
        budgets_query = budgets_ref.where('api_key_id', '==', api_key_id).limit(1)
        
        budgets = list(budgets_query.stream())
        if not budgets:
            return  # No budget defined
        
        budget_doc = budgets[0]
        budget_data = budget_doc.to_dict()
        
        # Get current period costs
        current_costs = await self.get_current_period_costs(api_key_id)
        
        # Check thresholds
        monthly_budget = budget_data.get('monthly_budget', 0)
        if monthly_budget > 0:
            usage_percent = (current_costs / monthly_budget) * 100
            
            thresholds = budget_data.get('alert_thresholds', {})
            warning = thresholds.get('warning', 80)
            critical = thresholds.get('critical', 95)
            
            if usage_percent >= 100:
                # Budget exceeded
                await self._handle_budget_exceeded(api_key_id, budget_doc)
            elif usage_percent >= critical:
                await self._send_alert(api_key_id, 'critical', usage_percent)
            elif usage_percent >= warning:
                await self._send_alert(api_key_id, 'warning', usage_percent)
    
    async def get_costs_by_api_key(
        self,
        api_key_id: str,
        period: str = 'monthly',
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """Get aggregated costs for an API key."""
        # Implementation
        pass
    
    async def get_costs_by_consumer(
        self,
        consumer_app_id: str,
        period: str = 'monthly'
    ) -> Dict:
        """Get aggregated costs for a consumer app."""
        # Implementation
        pass
```

#### 2.2 Middleware de Rastreamento

```python
# app/middleware/cost_tracking.py
import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.services.cost_attribution_service import CostAttributionService

class CostTrackingMiddleware(BaseHTTPMiddleware):
    """Middleware to track costs for each API request."""
    
    def __init__(self, app, cost_service: CostAttributionService):
        super().__init__(app)
        self.cost_service = cost_service
    
    async def dispatch(self, request: Request, call_next):
        # Extract API key from request
        api_key_id = request.state.api_key_id  # Set by auth middleware
        if not api_key_id:
            # No API key, skip tracking
            return await call_next(request)
        
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        # Track Firestore operations (hook into Firestore client)
        firestore_ops = {'reads': 0, 'writes': 0, 'deletes': 0}
        
        try:
            response = await call_next(request)
            
            # Calculate execution time
            execution_time_ms = (time.time() - start_time) * 1000
            
            # Calculate costs
            costs = {}
            
            # Cloud Run cost (execution time)
            if execution_time_ms > 0:
                # Assume 2 vCPU, 2GB memory
                cpu_seconds = (execution_time_ms / 1000) * 2
                memory_gb_seconds = (execution_time_ms / 1000) * 2
                
                costs['cloud_run'] = {
                    'amount': (
                        cpu_seconds * self.cost_service.PRICING['cloud_run']['cpu_second'] +
                        memory_gb_seconds * self.cost_service.PRICING['cloud_run']['memory_gb_second']
                    ),
                    'execution_time_ms': execution_time_ms,
                    'memory_mb': 2048,
                }
            
            # Firestore costs
            if sum(firestore_ops.values()) > 0:
                costs['firestore'] = {
                    'amount': (
                        firestore_ops['reads'] * self.cost_service.PRICING['firestore']['read'] +
                        firestore_ops['writes'] * self.cost_service.PRICING['firestore']['write'] +
                        firestore_ops['deletes'] * self.cost_service.PRICING['firestore']['delete']
                    ),
                    'reads': firestore_ops['reads'],
                    'writes': firestore_ops['writes'],
                    'deletes': firestore_ops['deletes'],
                }
            
            # Vertex AI costs (if used)
            # Tracked separately in AI service
            
            # Attribute costs
            await self.cost_service.attribute_cost(
                api_key_id=api_key_id,
                request_id=request_id,
                endpoint=str(request.url.path),
                costs=costs,
            )
            
            return response
            
        except Exception as e:
            # Still track costs even if request fails
            logger.error(f"Error in cost tracking: {e}")
            return await call_next(request)
```

#### 2.3 Endpoints de FinOps

```python
# app/routers/finops.py
from fastapi import APIRouter, Depends, Query
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/v1/finops", tags=["FinOps"])

@router.get("/costs/by-api-key/{api_key_id}")
async def get_costs_by_api_key(
    api_key_id: str,
    period: str = Query("monthly", regex="^(daily|monthly|yearly)$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    admin_token: str = Depends(verify_admin_token)
):
    """Get costs for a specific API key."""
    cost_service = get_cost_attribution_service()
    costs = await cost_service.get_costs_by_api_key(
        api_key_id, period, start_date, end_date
    )
    return costs

@router.get("/costs/by-consumer/{consumer_app_id}")
async def get_costs_by_consumer(
    consumer_app_id: str,
    period: str = Query("monthly"),
    admin_token: str = Depends(verify_admin_token)
):
    """Get costs for a consumer app (all API keys)."""
    cost_service = get_cost_attribution_service()
    costs = await cost_service.get_costs_by_consumer(consumer_app_id, period)
    return costs

@router.post("/budgets")
async def create_budget(
    budget_data: APIKeyBudgetCreate,
    admin_token: str = Depends(verify_admin_token)
):
    """Create budget for an API key."""
    # Implementation
    pass

@router.get("/budgets/{api_key_id}")
async def get_budget(
    api_key_id: str,
    admin_token: str = Depends(verify_admin_token)
):
    """Get budget for an API key."""
    # Implementation
    pass

@router.put("/budgets/{api_key_id}")
async def update_budget(
    api_key_id: str,
    budget_data: APIKeyBudgetUpdate,
    admin_token: str = Depends(verify_admin_token)
):
    """Update budget for an API key."""
    # Implementation
    pass
```

### 3. Frontend - Dashboard FinOps

#### 3.1 Página Principal de Custos por API Key

```typescript
// admin-dashboard/src/app/(dashboard)/finops/api-keys/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

export default function FinOpsAPIKeysPage() {
  const { data: apiKeysCosts, isLoading } = useQuery({
    queryKey: ['finops', 'api-keys'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/finops/costs/by-api-key', {
        headers: {
          Authorization: `Bearer ${await getSessionToken()}`,
        },
      });
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Custos por API Key</h1>
        <p className="text-muted-foreground">
          Rastreamento detalhado de custos por chave de API
        </p>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${apiKeysCosts?.today_total?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${apiKeysCosts?.month_total?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">API Keys Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeysCosts?.active_keys || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Budget Excedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {apiKeysCosts?.exceeded_budgets || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Custos por API Key */}
      <Card>
        <CardHeader>
          <CardTitle>Custos Detalhados por API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>API Key</TableHead>
                <TableHead>Consumer</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Usado</TableHead>
                <TableHead>Vertex AI</TableHead>
                <TableHead>Firestore</TableHead>
                <TableHead>Cloud Run</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeysCosts?.keys?.map((keyCost: any) => {
                const budgetPercent = keyCost.budget
                  ? (keyCost.total_cost / keyCost.budget) * 100
                  : 0;
                
                return (
                  <TableRow key={keyCost.api_key_id}>
                    <TableCell className="font-medium">
                      {keyCost.api_key_name}
                    </TableCell>
                    <TableCell>{keyCost.consumer_app_id}</TableCell>
                    <TableCell>
                      ${keyCost.budget?.toFixed(2) || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              budgetPercent >= 100
                                ? 'bg-red-500'
                                : budgetPercent >= 95
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">
                          {budgetPercent.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>${keyCost.costs.vertex_ai?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>${keyCost.costs.firestore?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>${keyCost.costs.cloud_run?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="font-bold">
                      ${keyCost.total_cost?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      {budgetPercent >= 100 ? (
                        <Badge variant="destructive">Excedido</Badge>
                      ) : budgetPercent >= 95 ? (
                        <Badge variant="warning">Crítico</Badge>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 3.2 Dialog de Configuração de Budget

```typescript
// admin-dashboard/src/components/finops/budget-dialog.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function BudgetDialog({
  apiKeyId,
  open,
  onOpenChange,
}: {
  apiKeyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');
  const [suspendOnExceeded, setSuspendOnExceeded] = useState(false);
  const [warningThreshold, setWarningThreshold] = useState(80);
  const [criticalThreshold, setCriticalThreshold] = useState(95);

  const queryClient = useQueryClient();

  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      const response = await apiClient.post('/v1/finops/budgets', budgetData, {
        headers: {
          Authorization: `Bearer ${await getSessionToken()}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finops'] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBudgetMutation.mutate({
      api_key_id: apiKeyId,
      monthly_budget: parseFloat(monthlyBudget),
      daily_budget: dailyBudget ? parseFloat(dailyBudget) : undefined,
      alert_thresholds: {
        warning: warningThreshold,
        critical: criticalThreshold,
      },
      auto_actions: {
        suspend_on_exceeded: suspendOnExceeded,
        notify_on_warning: true,
        notify_on_critical: true,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Budget para API Key</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monthly-budget">Budget Mensal (USD)</Label>
            <Input
              id="monthly-budget"
              type="number"
              step="0.01"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="daily-budget">Budget Diário (USD) - Opcional</Label>
            <Input
              id="daily-budget"
              type="number"
              step="0.01"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="warning-threshold">Alerta de Aviso (%)</Label>
            <Input
              id="warning-threshold"
              type="number"
              min="0"
              max="100"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="critical-threshold">Alerta Crítico (%)</Label>
            <Input
              id="critical-threshold"
              type="number"
              min="0"
              max="100"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="suspend-on-exceeded"
              checked={suspendOnExceeded}
              onCheckedChange={setSuspendOnExceeded}
            />
            <Label htmlFor="suspend-on-exceeded">
              Suspender API key automaticamente se exceder budget
            </Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createBudgetMutation.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Integração com Google Cloud Billing

#### 4.1 Sincronização de Custos Reais

```python
# app/services/gcp_billing_sync.py
from google.cloud import billing_v1
from google.cloud.billing_v1 import types
import asyncio

class GCPBillingSyncService:
    """Sync actual GCP billing costs with attributed costs."""
    
    async def sync_costs(self, start_date: datetime, end_date: datetime):
        """
        Sync actual GCP billing costs and compare with attributed costs.
        
        This helps identify:
        - Costs not attributed to any API key
        - Discrepancies between estimated and actual costs
        - Unattributed infrastructure costs
        """
        # Use GCP Billing API to get actual costs
        # Compare with attributed costs
        # Generate reconciliation report
        pass
```

## 📊 Métricas e Alertas

### Alertas Configuráveis

1. **Warning (80%)**: Email/notificação quando budget atinge 80%
2. **Critical (95%)**: Email/notificação urgente quando atinge 95%
3. **Exceeded (100%)**: 
   - Notificação imediata
   - Opção de suspender API key automaticamente
   - Relatório de custos excedidos

### Métricas Calculadas

- **Custo por requisição**: Total / Número de requisições
- **Custo por endpoint**: Agregado por endpoint
- **Custo por serviço**: Vertex AI vs Firestore vs Cloud Run
- **Tendência**: Comparação com período anterior
- **Projeção**: Estimativa de custo no fim do período

## ✅ Checklist de Implementação

### Fase 1: Backend - Rastreamento Básico
- [ ] Criar `CostAttributionService`
- [ ] Implementar middleware de rastreamento
- [ ] Criar collections no Firestore
- [ ] Endpoints de consulta de custos
- [ ] Testes unitários

### Fase 2: Backend - Budgets e Alertas
- [ ] Criar `APIKeyBudgetService`
- [ ] Endpoints de CRUD de budgets
- [ ] Sistema de alertas (email/webhook)
- [ ] Suspensão automática de API keys
- [ ] Testes de integração

### Fase 3: Frontend - Dashboard
- [ ] Página de custos por API key
- [ ] Dialog de configuração de budget
- [ ] Gráficos de custos ao longo do tempo
- [ ] Tabela de custos detalhados
- [ ] Alertas visuais

### Fase 4: Otimizações
- [ ] Cache de custos agregados
- [ ] Sincronização com GCP Billing API
- [ ] Recomendações automáticas
- [ ] Export de relatórios

## 🔗 Referências

- [Google Cloud Billing API](https://cloud.google.com/billing/docs/reference/rest)
- [Firestore Pricing](https://cloud.google.com/firestore/pricing)
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)

---

**Próximos Passos**: Revisar spec, aprovar, criar tasks no GitHub Spec-Kit

