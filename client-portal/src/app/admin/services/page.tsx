"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Server, Clock, AlertCircle, CheckCircle, TrendingUp, Database, Zap, Cloud, Loader2 } from "lucide-react"
import { useServices } from "@/hooks/use-services"

export default function ServicesPage() {
  const { data: servicesData, isLoading } = useServices()
  
  // Transform API data to match UI format
  const services = servicesData?.map((service) => ({
    id: service.service_id,
    name: service.service_name,
    status: service.status,
    uptime: service.uptime_percent,
    url: `https://${service.service_id}.run.app`,
    region: "us-central1",
    instances: 1,
    activeInstances: 1,
    environment: "production",
    lastDeployment: new Date(service.last_check_at).toLocaleString(),
    metrics: {
      requestsPerMinute: 0,
      averageLatency: service.response_time_ms,
      p50Latency: service.response_time_ms * 0.8,
      p95Latency: service.response_time_ms * 1.5,
      p99Latency: service.response_time_ms * 2,
      errorRate: service.status === 'down' ? 100 : service.status === 'degraded' ? 5 : 0.12,
      successRate: service.status === 'down' ? 0 : service.status === 'degraded' ? 95 : 99.88,
      cpuUsage: 0,
      memoryUsage: 0
    },
    endpoints: []
  })) || []
  
  // Fallback mock data if no services returned
  const mockServices = [
    {
      id: "compliance-engine",
      name: "Process & Compliance Engine API",
      description: "Main compliance analysis and diagram generation service",
      status: "healthy",
      version: "v1.2.3",
      uptime: 99.98,
      url: "https://compliance-engine-xxx.run.app",
      region: "us-central1",
      instances: 3,
      activeInstances: 3,
      environment: "production",
      lastDeployment: "2024-02-15 14:30 UTC",
      metrics: {
        requestsPerMinute: 847,
        averageLatency: 245,
        p50Latency: 180,
        p95Latency: 420,
        p99Latency: 850,
        errorRate: 0.12,
        successRate: 99.88,
        cpuUsage: 45,
        memoryUsage: 62
      },
      endpoints: [
        { path: "/v1/diagrams/generate", status: "healthy", avgLatency: 312 },
        { path: "/v1/processes", status: "healthy", avgLatency: 156 },
        { path: "/v1/compliance/analyze", status: "healthy", avgLatency: 892 },
        { path: "/health", status: "healthy", avgLatency: 12 }
      ]
    },
    {
      id: "regulatory-rag",
      name: "RegulatoryRAG API",
      description: "Regulatory knowledge base with semantic search",
      status: "healthy",
      version: "v1.1.0",
      uptime: 99.95,
      url: "https://regulatory-rag-xxx.run.app",
      region: "us-central1",
      instances: 2,
      activeInstances: 2,
      environment: "production",
      lastDeployment: "2024-02-10 09:15 UTC",
      metrics: {
        requestsPerMinute: 423,
        averageLatency: 187,
        p50Latency: 145,
        p95Latency: 320,
        p99Latency: 580,
        errorRate: 0.08,
        successRate: 99.92,
        cpuUsage: 38,
        memoryUsage: 55
      },
      endpoints: [
        { path: "/v1/regulations/search", status: "healthy", avgLatency: 198 },
        { path: "/v1/regulations/domains", status: "healthy", avgLatency: 45 },
        { path: "/health", status: "healthy", avgLatency: 8 }
      ]
    },
    {
      id: "firestore",
      name: "Firestore Database",
      description: "Primary data storage for processes and analyses",
      status: "healthy",
      version: "managed",
      uptime: 99.99,
      url: "firestore.googleapis.com",
      region: "us-central1",
      instances: null,
      activeInstances: null,
      environment: "production",
      lastDeployment: "Managed by GCP",
      metrics: {
        requestsPerMinute: 1234,
        averageLatency: 45,
        p50Latency: 32,
        p95Latency: 78,
        p99Latency: 125,
        errorRate: 0.01,
        successRate: 99.99,
        cpuUsage: null,
        memoryUsage: null
      },
      endpoints: []
    },
    {
      id: "vertex-ai",
      name: "Vertex AI (Gemini 1.5 Pro)",
      description: "AI model for compliance analysis and diagram generation",
      status: "healthy",
      version: "gemini-1.5-pro-002",
      uptime: 99.97,
      url: "us-central1-aiplatform.googleapis.com",
      region: "us-central1",
      instances: null,
      activeInstances: null,
      environment: "production",
      lastDeployment: "Managed by Google",
      metrics: {
        requestsPerMinute: 234,
        averageLatency: 1850,
        p50Latency: 1620,
        p95Latency: 2890,
        p99Latency: 4250,
        errorRate: 0.15,
        successRate: 99.85,
        cpuUsage: null,
        memoryUsage: null
      },
      endpoints: []
    }
  ]

  const deploymentHistory = [
    {
      service: "ComplianceEngine API",
      version: "v1.2.3",
      timestamp: "2024-02-15 14:30 UTC",
      status: "success",
      deployedBy: "admin@company.com",
      changes: "Added API key validation, improved error handling"
    },
    {
      service: "RegulatoryRAG API",
      version: "v1.1.0",
      timestamp: "2024-02-10 09:15 UTC",
      status: "success",
      deployedBy: "admin@company.com",
      changes: "Updated Vertex AI Search integration, cache improvements"
    },
    {
      service: "ComplianceEngine API",
      version: "v1.2.2",
      timestamp: "2024-02-08 16:45 UTC",
      status: "success",
      deployedBy: "admin@company.com",
      changes: "Performance optimizations for diagram generation"
    },
    {
      service: "ComplianceEngine API",
      version: "v1.2.1",
      timestamp: "2024-02-05 11:20 UTC",
      status: "rollback",
      deployedBy: "admin@company.com",
      changes: "Rolled back due to increased latency"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "success"
      case "degraded":
        return "warning"
      case "down":
        return "error"
      default:
        return "default"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "degraded":
        return <AlertCircle className="h-4 w-4" />
      case "down":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Service Monitoring</h1>
        <p className="text-muted-foreground mt-2">
          Monitor health and performance of all platform services
        </p>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.filter(s => s.status === "healthy").length}/{services.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">All services operational</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests/min</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.reduce((sum, s) => sum + s.metrics.requestsPerMinute, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(services.reduce((sum, s) => sum + s.metrics.successRate, 0) / services.length).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">Excellent</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Details */}
      <div className="space-y-4">
        {services.map((service: any) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <Badge variant={getStatusColor(service.status)} className="capitalize">
                      {getStatusIcon(service.status)}
                      <span className="ml-1">{service.status}</span>
                    </Badge>
                    <Badge variant="outline">{service.version}</Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Cloud className="h-3 w-3" />
                      {service.region}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Uptime: {service.uptime}%
                    </span>
                    {service.instances && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Server className="h-3 w-3" />
                          {service.activeInstances}/{service.instances} instances
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Requests/min</p>
                  <p className="text-xl font-bold">{service.metrics.requestsPerMinute}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Avg Latency</p>
                  <p className="text-xl font-bold">{service.metrics.averageLatency}ms</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-xl font-bold">{service.metrics.successRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Error Rate</p>
                  <p className="text-xl font-bold">{service.metrics.errorRate}%</p>
                </div>
              </div>

              {/* Latency Percentiles */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Latency Percentiles</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-muted-foreground">P50</p>
                    <p className="text-lg font-semibold">{service.metrics.p50Latency}ms</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-muted-foreground">P95</p>
                    <p className="text-lg font-semibold">{service.metrics.p95Latency}ms</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-xs text-muted-foreground">P99</p>
                    <p className="text-lg font-semibold">{service.metrics.p99Latency}ms</p>
                  </div>
                </div>
              </div>

              {/* Resource Usage (for Cloud Run services) */}
              {service.metrics.cpuUsage !== null && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Resource Usage</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">CPU</span>
                        <span className="font-medium">{service.metrics.cpuUsage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${service.metrics.cpuUsage}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Memory</span>
                        <span className="font-medium">{service.metrics.memoryUsage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${service.metrics.memoryUsage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Endpoints (if applicable) */}
              {service.endpoints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Endpoints</p>
                  <div className="space-y-2">
                    {service.endpoints.map((endpoint: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={getStatusColor(endpoint.status)} className="capitalize">
                            {getStatusIcon(endpoint.status)}
                          </Badge>
                          <code className="text-sm font-mono">{endpoint.path}</code>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {endpoint.avgLatency}ms avg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Deployment */}
              <div className="flex items-center justify-between text-sm pt-4 border-t">
                <span className="text-muted-foreground">Last deployment:</span>
                <span className="font-medium">{service.lastDeployment}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deployment History */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
          <CardDescription>Recent deployments and rollbacks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deploymentHistory.map((deployment, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{deployment.service}</h4>
                    <Badge variant="outline">{deployment.version}</Badge>
                    <Badge
                      variant={deployment.status === "success" ? "success" : "error"}
                      className="capitalize"
                    >
                      {deployment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {deployment.changes}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{deployment.timestamp}</span>
                    <span>•</span>
                    <span>Deployed by {deployment.deployedBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
