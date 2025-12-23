# AI Assistant Prompts for ComplianceEngine Integration

This document contains ready-to-use prompts for AI code assistants (Cursor, Windsurf, GitHub Copilot, etc.) to integrate with the ComplianceEngine platform.

## Table of Contents

1. [Generate Process Diagram](#1-generate-process-diagram)
2. [Analyze Process Compliance](#2-analyze-process-compliance)
3. [Search Regulations](#3-search-regulations)
4. [Complete Workflow](#4-complete-workflow)
5. [Error Handling](#5-error-handling)

---

## Prerequisites

### API Key Setup

```bash
# Get your API key from the admin dashboard
# https://compliance-admin.yourcompany.com/api-keys

export COMPLIANCE_API_KEY="ce_live_your_api_key_here"
export COMPLIANCE_API_URL="https://compliance-engine-xxx.run.app"
```

---

## 1. Generate Process Diagram

### Prompt for Cursor/Windsurf:

```
Create a Python function that uses the ComplianceEngine API to generate a BPMN diagram from a text description.

API Details:
- Endpoint: POST {COMPLIANCE_API_URL}/v1/diagrams/generate
- Auth: Bearer token in header
- Request body:
  {
    "description": "text description of the process",
    "context": "optional context"
  }
- Response:
  {
    "normalized_text": "normalized process description",
    "mermaid_code": "mermaid.js diagram code",
    "metadata": {...}
  }

Requirements:
- Use requests library
- Handle errors properly (401, 422, 500)
- Return both normalized text and mermaid code
- Save mermaid code to file
- Add type hints

Example usage:
result = generate_diagram(
    "Employee submits vacation request, manager approves, HR updates calendar"
)
```

### Expected Generated Code:

```python
import requests
from typing import Dict, Optional

def generate_diagram(
    description: str,
    context: Optional[str] = None,
    api_key: str = None,
    api_url: str = None
) -> Dict[str, str]:
    """
    Generate BPMN diagram from text description.

    Args:
        description: Text description of the business process
        context: Optional context about the process
        api_key: ComplianceEngine API key (or set COMPLIANCE_API_KEY env var)
        api_url: API base URL (or set COMPLIANCE_API_URL env var)

    Returns:
        Dict with 'normalized_text' and 'mermaid_code'

    Raises:
        ValueError: If API key is missing
        requests.HTTPError: If API request fails
    """
    import os

    api_key = api_key or os.getenv('COMPLIANCE_API_KEY')
    api_url = api_url or os.getenv('COMPLIANCE_API_URL', 'https://compliance-engine-xxx.run.app')

    if not api_key:
        raise ValueError("API key is required. Set COMPLIANCE_API_KEY environment variable.")

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    payload = {
        'description': description,
        'context': context
    }

    response = requests.post(
        f'{api_url}/v1/diagrams/generate',
        json=payload,
        headers=headers,
        timeout=60
    )

    response.raise_for_status()

    result = response.json()

    # Optionally save to file
    with open('process_diagram.mmd', 'w') as f:
        f.write(result['mermaid_code'])

    return {
        'normalized_text': result['normalized_text'],
        'mermaid_code': result['mermaid_code'],
        'metadata': result.get('metadata', {})
    }


# Example usage
if __name__ == '__main__':
    result = generate_diagram(
        description="""
        Purchase approval process:
        1. Employee creates purchase request
        2. System checks budget availability
        3. If over $5000, requires VP approval
        4. Finance processes payment
        5. Employee receives confirmation
        """,
        context="Finance department - Purchase approval workflow"
    )

    print("✓ Diagram generated!")
    print(f"Activities: {result['metadata'].get('activities_count')}")
    print(f"Mermaid code saved to: process_diagram.mmd")
```

---

## 2. Analyze Process Compliance

### Prompt for Cursor/Windsurf:

```
Create a Python function that analyzes a business process for compliance gaps using the ComplianceEngine API.

API Details:
- First, create process: POST /v1/processes
- Then analyze: POST /v1/compliance/analyze
- Auth: Bearer token
- Process creation requires: name, description, domain, mermaid_code, nodes, flows
- Analysis requires: process_id, domain
- Returns: gaps (with severity), suggestions, overall_score

Requirements:
- Create process from diagram result
- Analyze against specified domain (LGPD, SOX, GDPR)
- Display gaps grouped by severity
- Show recommendations
- Color-code severity (red=critical, yellow=high, etc.)
```

### Expected Generated Code:

```python
import requests
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class ComplianceGap:
    gap_id: str
    severity: str
    regulation: str
    description: str
    recommendation: str

def analyze_compliance(
    process_id: str,
    domain: str,
    api_key: str = None,
    api_url: str = None
) -> Dict:
    """
    Analyze process for compliance gaps.

    Args:
        process_id: ID of the process to analyze
        domain: Regulatory domain (LGPD, SOX, GDPR, etc.)
        api_key: ComplianceEngine API key
        api_url: API base URL

    Returns:
        Analysis results with gaps and suggestions
    """
    import os

    api_key = api_key or os.getenv('COMPLIANCE_API_KEY')
    api_url = api_url or os.getenv('COMPLIANCE_API_URL')

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    payload = {
        'process_id': process_id,
        'domain': domain
    }

    response = requests.post(
        f'{api_url}/v1/compliance/analyze',
        json=payload,
        headers=headers,
        timeout=120  # Analysis can take time
    )

    response.raise_for_status()
    return response.json()


def display_analysis(analysis: Dict):
    """Display analysis results in a readable format."""

    severity_colors = {
        'critical': '\033[91m',  # Red
        'high': '\033[93m',      # Yellow
        'medium': '\033[94m',    # Blue
        'low': '\033[92m'        # Green
    }
    reset = '\033[0m'

    print(f"\n{'='*80}")
    print(f"COMPLIANCE ANALYSIS REPORT")
    print(f"{'='*80}\n")

    print(f"Overall Score: {analysis['overall_score']:.1f}/100")
    print(f"Domain: {analysis['domain']}")
    print(f"\n{analysis['summary']}\n")

    # Group gaps by severity
    gaps_by_severity = {}
    for gap in analysis['gaps']:
        severity = gap['severity']
        if severity not in gaps_by_severity:
            gaps_by_severity[severity] = []
        gaps_by_severity[severity].append(gap)

    # Display gaps
    for severity in ['critical', 'high', 'medium', 'low']:
        gaps = gaps_by_severity.get(severity, [])
        if gaps:
            color = severity_colors[severity]
            print(f"\n{color}[{severity.upper()}]{reset} {len(gaps)} gap(s):")
            for gap in gaps:
                print(f"  • {gap['description']}")
                print(f"    → {gap['recommendation']}\n")

    # Display suggestions
    if analysis['suggestions']:
        print(f"\n💡 SUGGESTIONS ({len(analysis['suggestions'])}):")
        for sug in analysis['suggestions']:
            print(f"  [{sug['priority'].upper()}] {sug['title']}")
            print(f"  {sug['description']}\n")


# Example usage
if __name__ == '__main__':
    # Assume we have a process_id from previous creation
    analysis = analyze_compliance(
        process_id='abc123xyz',
        domain='LGPD'
    )

    display_analysis(analysis)
```

---

## 3. Search Regulations

### Prompt for Cursor/Windsurf:

```
Create a function to search regulatory content using the RegulatoryRAG API.

API Details:
- Endpoint: POST {RAG_API_URL}/v1/regulations/search
- Request:
  {
    "query": "search query",
    "domains": ["LGPD", "SOX"],
    "top_k": 5
  }
- Response:
  {
    "regulations": [
      {
        "title": "...",
        "article": "...",
        "content": "...",
        "relevance_score": 0.95
      }
    ],
    "quality_score": 0.87
  }

Requirements:
- Semantic search across regulations
- Filter by domains
- Display results with relevance scores
- Highlight matched content
```

### Expected Generated Code:

```python
import requests
from typing import List, Dict

def search_regulations(
    query: str,
    domains: List[str] = None,
    top_k: int = 5,
    api_key: str = None,
    api_url: str = None
) -> List[Dict]:
    """
    Search regulatory content using semantic search.

    Args:
        query: Search query
        domains: List of regulatory domains to search
        top_k: Number of results to return
        api_key: API key
        api_url: RegulatoryRAG API URL

    Returns:
        List of matching regulations
    """
    import os

    api_key = api_key or os.getenv('COMPLIANCE_API_KEY')
    api_url = api_url or os.getenv('RAG_API_URL', 'https://regulatory-rag-xxx.run.app')

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    payload = {
        'query': query,
        'domains': domains or ['LGPD', 'SOX', 'GDPR'],
        'top_k': top_k
    }

    response = requests.post(
        f'{api_url}/v1/regulations/search',
        json=payload,
        headers=headers,
        timeout=30
    )

    response.raise_for_status()
    return response.json()['regulations']


def display_results(results: List[Dict]):
    """Display search results."""
    for i, reg in enumerate(results, 1):
        print(f"\n{i}. {reg['title']} - {reg.get('article', 'N/A')}")
        print(f"   Relevance: {reg.get('relevance_score', 0):.2%}")
        print(f"   {reg['content'][:200]}...")


# Example usage
if __name__ == '__main__':
    results = search_regulations(
        query="personal data protection and consent",
        domains=["LGPD", "GDPR"],
        top_k=3
    )

    display_results(results)
```

---

## 4. Complete Workflow

### Prompt for AI Assistant:

```
Create a complete Python script that:
1. Generates a BPMN diagram from description
2. Creates the process in the system
3. Analyzes it for compliance
4. Generates a PDF report

Use the ComplianceEngine API with proper error handling and logging.
```

---

## 5. Error Handling

### Common Error Codes:

```python
ERROR_HANDLING = {
    401: "Invalid or missing API key",
    403: "Insufficient permissions",
    422: "Invalid request data",
    429: "Rate limit exceeded",
    503: "Service unavailable - RAG API down",
    500: "Internal server error"
}

def handle_api_error(response):
    """Handle API errors gracefully."""
    if response.status_code in ERROR_HANDLING:
        print(f"❌ Error: {ERROR_HANDLING[response.status_code]}")
        if response.status_code == 503:
            print("   Service is temporarily unavailable.")
            print("   This ensures 100% reliable responses.")
            print("   Please try again in a few moments.")
    else:
        print(f"❌ Unexpected error: {response.status_code}")

    # Log for debugging
    try:
        error_detail = response.json()
        print(f"   Details: {error_detail.get('detail', 'N/A')}")
    except:
        pass
```

---

## Integration Examples for Different Languages

### JavaScript/TypeScript

```typescript
// Example for Node.js/TypeScript
import axios from 'axios';

interface DiagramRequest {
  description: string;
  context?: string;
}

async function generateDiagram(request: DiagramRequest): Promise<any> {
  const response = await axios.post(
    `${process.env.COMPLIANCE_API_URL}/v1/diagrams/generate`,
    request,
    {
      headers: {
        'Authorization': `Bearer ${process.env.COMPLIANCE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    }
  );

  return response.data;
}
```

### Go

```go
// Example for Go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
    "os"
)

type DiagramRequest struct {
    Description string `json:"description"`
    Context     string `json:"context,omitempty"`
}

func generateDiagram(req DiagramRequest) (map[string]interface{}, error) {
    apiURL := os.Getenv("COMPLIANCE_API_URL")
    apiKey := os.Getenv("COMPLIANCE_API_KEY")

    jsonData, _ := json.Marshal(req)

    httpReq, _ := http.NewRequest(
        "POST",
        apiURL+"/v1/diagrams/generate",
        bytes.NewBuffer(jsonData),
    )

    httpReq.Header.Set("Authorization", "Bearer "+apiKey)
    httpReq.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(httpReq)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)

    return result, nil
}
```

---

## Best Practices

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly
   - Use different keys for dev/staging/prod

2. **Error Handling**
   - Always check response status
   - Implement retry logic for 503 errors
   - Log errors for debugging
   - Provide user-friendly messages

3. **Performance**
   - Cache regulation search results
   - Use connection pooling
   - Set appropriate timeouts
   - Implement rate limiting on client side

4. **Monitoring**
   - Track API usage
   - Monitor response times
   - Set up alerts for errors
   - Review cost attribution

---

## Support

For issues or questions:
- API Documentation: https://compliance-api.yourcompany.com/docs
- Admin Dashboard: https://compliance-admin.yourcompany.com
- Support: compliance-team@yourcompany.com
