"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, DollarSign, Key, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

export default function OverviewPage() {
  // Mock data - replace with actual API calls
  const stats = {
    apiCallsToday: 15847,
    apiCallsChange: "+12.3%",
    costToday: 47.32,
    costChange: "+5.2%",
    activeKeys: 7,
    keysChange: "0",
    uptime: 99.98,
    uptimeChange: "+0.01%"
  }

  const services = [
    { name: "ComplianceEngine API", status: "healthy", uptime: 99.99, latency: 234 },
    { name: "RegulatoryRAG API", status: "healthy", uptime: 99.95, latency: 189 },
  ]

  const recentActivity = [
    { type: "API Key Created", consumer: "Contracts App", time: "2 hours ago" },
    { type: "High API Usage", consumer: "Audit Portal", time: "4 hours ago" },
    { type: "Service Deployed", service: "ComplianceEngine v1.2.0", time: "1 day ago" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your ComplianceEngine platform at a glance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.apiCallsToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">{stats.apiCallsChange}</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.costToday.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">{stats.costChange}</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeKeys}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-gray-500">{stats.keysChange}</span> change
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uptime}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">{stats.uptimeChange}</span> from last month
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
            {services.map((service) => (
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
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events across the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.consumer || activity.service}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and operations</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
  )
}
