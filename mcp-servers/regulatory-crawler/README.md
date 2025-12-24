# Regulatory Intelligence Crawler MCP Server

MCP Server for the Regulatory Intelligence Crawler - Monitor Brazilian regulatory sources for compliance updates.

## 🎯 Overview

This MCP server exposes the Regulatory Intelligence Crawler capabilities through the Model Context Protocol, enabling AI assistants and applications to:

- **Monitor regulatory sources** (ANEEL, ONS, ARCyber, ANS) for new publications
- **List regulatory updates** with filters for source, impact level, and date
- **Analyze impact** of regulations on company operations using Gemini AI
- **Subscribe to notifications** for critical regulatory changes
- **Track crawler status** and health

## 🛠️ Tools Provided

### 1. `trigger_crawl`

Manually trigger crawl of Brazilian regulatory sources.

**Input**:
```json
{
  "sources": ["aneel", "ons", "arcyber"]
}
```

**Output**:
```json
{
  "crawl_triggered": "2025-01-15T10:30:00Z",
  "sources_crawled": ["aneel", "ons", "arcyber"],
  "updates_found": 12,
  "updates": [
    {
      "update_id": "upd_aneel_12345",
      "source": "aneel",
      "title": "Resolução Normativa nº 1.050/2025 - Procedimentos de Rede",
      "publication_date": "2025-01-15",
      "impact_level": "high",
      "summary": "Atualização dos Procedimentos de Rede do Operador Nacional..."
    }
  ]
}
```

**Regulatory Sources**:
- **ANEEL** - Agência Nacional de Energia Elétrica (Resoluções Normativas, Homologatórias)
- **ONS** - Operador Nacional do Sistema Elétrico (Procedimentos de Rede)
- **ARCyber** - Framework de Cibersegurança do Setor Elétrico
- **ANS** - Agência Nacional de Saúde Suplementar (RN 623, RN 443, etc.)

### 2. `get_crawler_status`

Get current status of all regulatory crawlers.

**Output**:
```json
{
  "crawlers": [
    {
      "source": "aneel",
      "status": "active",
      "last_crawl": "2025-01-15T06:00:00Z",
      "updates_found": 3,
      "next_crawl": "2025-01-16T06:00:00Z",
      "health": "healthy"
    },
    {
      "source": "ons",
      "status": "active",
      "last_crawl": "2025-01-15T06:05:00Z",
      "updates_found": 5,
      "next_crawl": "2025-01-16T06:05:00Z",
      "health": "healthy"
    }
  ]
}
```

**Use Cases**:
- Monitor crawler health
- Check last crawl time
- Verify next scheduled crawl
- Diagnose crawler issues

### 3. `list_updates`

List regulatory updates with optional filters.

**Input**:
```json
{
  "source": "aneel",
  "impact_level": "high",
  "since_date": "2025-01-01",
  "limit": 20
}
```

**Output**:
```json
{
  "total_updates": 8,
  "filters_applied": {
    "source": "aneel",
    "impact_level": "high",
    "since_date": "2025-01-01"
  },
  "updates": [
    {
      "update_id": "upd_aneel_12345",
      "source": "aneel",
      "title": "Resolução Normativa nº 1.050/2025",
      "publication_date": "2025-01-15",
      "impact_level": "high",
      "document_type": "resolucao_normativa",
      "summary": "Atualização dos Procedimentos de Rede...",
      "url": "https://www.aneel.gov.br/documents/..."
    }
  ]
}
```

**Filters**:
- `source` - Filter by regulatory source (aneel, ons, arcyber, ans)
- `impact_level` - Filter by impact (critical, high, medium, low)
- `since_date` - Filter updates since date (YYYY-MM-DD format)
- `limit` - Maximum results (default: 50, max: 100)

### 4. `get_update_details`

Get comprehensive details about a specific regulatory update.

**Input**:
```json
{
  "update_id": "upd_aneel_12345"
}
```

**Output**:
```json
{
  "update_id": "upd_aneel_12345",
  "source": "aneel",
  "title": "Resolução Normativa nº 1.050/2025",
  "document_type": "resolucao_normativa",
  "publication_date": "2025-01-15",
  "impact_level": "high",
  "full_summary": "Esta resolução estabelece novos procedimentos...",
  "affected_sectors": ["energy_distribution", "generation"],
  "compliance_deadlines": {
    "implementation": "2025-06-30",
    "reporting": "2025-12-31"
  },
  "key_changes": [
    "Novos requisitos de segurança cibernética",
    "Prazo reduzido para notificação de incidentes",
    "Obrigatoriedade de auditoria trimestral"
  ],
  "document_url": "https://www.aneel.gov.br/documents/...",
  "crawled_at": "2025-01-15T10:30:00Z"
}
```

### 5. `analyze_impact`

Analyze impact of regulatory update on company operations using Gemini AI.

**Input**:
```json
{
  "update_id": "upd_aneel_12345",
  "company_context": {
    "company_name": "Distribuidora XYZ",
    "sector": "energy_distribution",
    "size": "large",
    "operations": ["energy_distribution", "smart_meters", "billing"]
  },
  "existing_processes": ["proc_001", "proc_015"]
}
```

**Output**:
```json
{
  "update_id": "upd_aneel_12345",
  "company": "Distribuidora XYZ",
  "analysis": {
    "impact_assessment": "Alto impacto nas operações de distribuição e sistemas de medição",
    "affected_processes": [
      {
        "process_id": "proc_001",
        "process_name": "Monitoramento de Rede",
        "impact_description": "Requer implementação de controles adicionais de cibersegurança",
        "changes_required": true
      }
    ],
    "required_changes": [
      "Implementar auditoria trimestral de segurança cibernética",
      "Atualizar processo de notificação de incidentes (72h → 24h)",
      "Revisar políticas de acesso aos sistemas SCADA"
    ],
    "compliance_gaps": [
      {
        "gap": "Falta de processo automatizado para notificação de incidentes",
        "severity": "high",
        "recommendation": "Implementar sistema de alerta automático integrado ao SCADA"
      }
    ],
    "recommended_actions": [
      {
        "action": "Criar BPMN para processo de notificação de incidentes",
        "priority": "critical",
        "estimated_effort": "2 weeks"
      },
      {
        "action": "Implementar controles ISO 27001 A.16.1.4",
        "priority": "high",
        "estimated_effort": "4 weeks"
      }
    ],
    "estimated_effort": "6-8 weeks",
    "deadline": "2025-06-30"
  }
}
```

**Analysis Features**:
- **Impact Assessment** - Overall impact on company operations
- **Affected Processes** - Which existing processes need changes
- **Compliance Gaps** - What's missing for compliance
- **Recommended Actions** - Prioritized action items with effort estimates
- **Deadline Tracking** - Compliance deadlines from regulation

### 6. `subscribe_notifications`

Subscribe to notifications for regulatory updates.

**Input**:
```json
{
  "update_id": "upd_aneel_12345",
  "channels": ["email", "slack"],
  "recipients": [
    "compliance@company.com",
    "#regulatory-updates"
  ],
  "priority": "high"
}
```

**Output**:
```json
{
  "status": "subscribed",
  "update_id": "upd_aneel_12345",
  "channels": ["email", "slack"],
  "recipients_count": 2,
  "priority": "high",
  "message": "You will receive notifications when there are updates."
}
```

**Notification Channels**:
- **email** - Send email alerts
- **slack** - Post to Slack channels
- **webhook** - HTTP POST to webhook URL

**Priority Levels**:
- **critical** - Immediate notification
- **high** - Within 1 hour
- **medium** - Daily digest
- **low** - Weekly summary

## 📦 Installation

### Prerequisites

- Node.js 18+
- Access to Regulatory Intelligence Crawler API

### Install Dependencies

```bash
cd mcp-servers/regulatory-crawler
npm install
npm run build
```

## ⚙️ Configuration

### Environment Variables

- `CRAWLER_API_URL` - Regulatory Intelligence Crawler API URL (default: `http://localhost:8003`)
- `API_KEY` - API authentication key (optional)

### Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "regulatory-crawler": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-servers/regulatory-crawler/build/index.js"],
      "env": {
        "CRAWLER_API_URL": "https://regulatory-crawler-xxx.run.app",
        "API_KEY": "ce_live_..."
      }
    }
  }
}
```

## 🚀 Usage Examples

### Example 1: Check for Latest ANEEL Updates

```typescript
// Trigger crawl for ANEEL only
const crawl = await mcp.call("trigger_crawl", {
  sources: ["aneel"]
});

// List high-impact updates from last 30 days
const updates = await mcp.call("list_updates", {
  source: "aneel",
  impact_level: "high",
  since_date: "2024-12-15",
  limit: 10
});
```

### Example 2: Analyze Impact on Company

```typescript
// Get update details
const update = await mcp.call("get_update_details", {
  update_id: "upd_aneel_12345"
});

// Analyze impact
const analysis = await mcp.call("analyze_impact", {
  update_id: "upd_aneel_12345",
  company_context: {
    company_name: "Distribuidora XYZ",
    sector: "energy_distribution",
    operations: ["distribution", "smart_meters"]
  },
  existing_processes: ["proc_001", "proc_015"]
});
```

### Example 3: Set Up Compliance Monitoring

```typescript
// Subscribe to critical ANS updates (healthcare)
const subscription = await mcp.call("subscribe_notifications", {
  update_id: "upd_ans_67890",
  channels: ["email", "slack"],
  recipients: [
    "compliance@healthplan.com",
    "#compliance-alerts"
  ],
  priority: "critical"
});
```

### Example 4: Monitor Crawler Health

```typescript
// Check crawler status
const status = await mcp.call("get_crawler_status");

// Verify all crawlers are healthy
status.crawlers.forEach(crawler => {
  if (crawler.health !== "healthy") {
    console.log(`⚠️ ${crawler.source} crawler is degraded`);
  }
});
```

## 🔗 Integration with Other MCP Servers

Regulatory Crawler MCP works seamlessly with other ComplianceEngine MCP servers:

```typescript
// 1. List regulatory updates from Regulatory Crawler MCP
const updates = await mcp.call("list_updates", {
  source: "aneel",
  impact_level: "high",
  limit: 5
});

// 2. Analyze impact with Regulatory Crawler MCP
const analysis = await mcp.call("analyze_impact", {
  update_id: updates.updates[0].update_id,
  company_context: { sector: "energy" }
});

// 3. Search related regulations with RegulatoryRAG MCP
const regulations = await mcp.call("search_by_datasets", {
  query: updates.updates[0].title,
  datasets: ["aneel", "ons"]
});

// 4. Generate BPMN for compliance with ComplianceEngine MCP
const bpmn = await mcp.call("generate_bpmn", {
  description: `Processo para atender: ${updates.updates[0].title}`
});

// 5. Generate documentation with Document Generator MCP
const docs = await mcp.call("generate_documents", {
  process_id: "compliance_" + updates.updates[0].update_id,
  process_name: updates.updates[0].title,
  bpmn_xml: bpmn.bpmn_xml
});
```

## 🛡️ Best Practices

1. **Monitor regularly** - Check crawler status daily
2. **Set up filters** - Use impact_level filters to focus on critical updates
3. **Analyze before acting** - Use analyze_impact to understand full scope
4. **Subscribe strategically** - Set up notifications for critical sectors only
5. **Integrate with processes** - Connect regulatory updates to BPMN generation

## 📊 Regulatory Sources Coverage

| Source | Coverage | Document Types | Update Frequency |
|--------|----------|----------------|------------------|
| **ANEEL** | Energia Elétrica | RN, RH, Notas Técnicas | Diário |
| **ONS** | Operador Sistema | Procedimentos de Rede | Semanal |
| **ARCyber** | Cibersegurança | Framework, Orientações | Mensal |
| **ANS** | Saúde Suplementar | RN 623, RN 443, RN 452 | Diário |

## 🎓 Impact Level Classification

The crawler uses **Gemini AI** to classify impact levels:

- **Critical** - Immediate action required, affects core operations, short compliance deadline
- **High** - Significant changes required, affects multiple processes, reasonable deadline
- **Medium** - Moderate changes, affects specific areas, longer deadline
- **Low** - Minor updates, informational, no urgent action required

## 📝 License

MIT
