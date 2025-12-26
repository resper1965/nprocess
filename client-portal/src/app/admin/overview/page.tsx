"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { Activity, DollarSign, Key, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface Stats {
  apiCallsToday: number
  apiCallsChange: string
  costToday: number
  costChange: string
  activeKeys: number
  uptime: number
}

interface ServiceStatus {
  name: string
  status: "healthy" | "degraded" | "down"
  uptime: number
  latency: number
}

export default function OverviewPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [services, setServices] = useState<ServiceStatus[]>([])

  useEffect(() => {
    // TODO: Replace with actual API call to /v1/admin/stats
    const loadData = async () => {
      try {
        // Simulate API call - replace with actual fetch
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // In production, fetch from API:
        // const response = await fetch('/api/admin/stats')
        // const data = await response.json()
        
        setStats({
          apiCallsToday: 0,
          apiCallsChange: "-",
          costToday: 0,
          costChange: "-",
          activeKeys: 0,
          uptime: 99.9
        })
        
        setServices([
          { name: "n.process API", status: "healthy", uptime: 99.99, latency: 0 },
        ])
      } catch (error) {
        console.error("Failed to load stats:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Overview" 
        description="Monitor your n.process platform at a glance"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls (24h)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.apiCallsToday.toLocaleString() || "-"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-muted-foreground">{stats?.apiCallsChange}</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Today</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.costToday.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-muted-foreground">{stats?.costChange}</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeKeys || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Configured in the system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime (30d)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.uptime || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Service availability
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Service Status */}
          <Card>
            <CardHeader>
              <CardTitle>Service Health</CardTitle>
              <CardDescription>Current status of all services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">No services configured</p>
              ) : (
                services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{service.name}</p>
                        <Badge variant="success" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {service.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Uptime: {service.uptime}%</span>
                        <span>Latency: {service.latency}ms</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              <button className="p-4 text-left border rounded-md hover:bg-accent transition-colors">
                <Key className="w-5 h-5 mb-2 text-primary" />
                <p className="font-medium text-sm">Create API Key</p>
                <p className="text-xs text-muted-foreground mt-1">Generate new access key</p>
              </button>
              <button className="p-4 text-left border rounded-md hover:bg-accent transition-colors">
                <Activity className="w-5 h-5 mb-2 text-primary" />
                <p className="font-medium text-sm">View Analytics</p>
                <p className="text-xs text-muted-foreground mt-1">Check usage metrics</p>
              </button>
              <button className="p-4 text-left border rounded-md hover:bg-accent transition-colors">
                <DollarSign className="w-5 h-5 mb-2 text-primary" />
                <p className="font-medium text-sm">Cost Report</p>
                <p className="text-xs text-muted-foreground mt-1">Download monthly costs</p>
              </button>
              <button className="p-4 text-left border rounded-md hover:bg-accent transition-colors">
                <AlertCircle className="w-5 h-5 mb-2 text-primary" />
                <p className="font-medium text-sm">View Alerts</p>
                <p className="text-xs text-muted-foreground mt-1">Check system alerts</p>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
