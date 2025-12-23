"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, TrendingUp, TrendingDown, Activity, DollarSign, Key, BarChart3 } from "lucide-react"

export default function ConsumersPage() {
  // Mock data - replace with actual API data
  const consumers = [
    {
      id: "1",
      name: "Contracts Application",
      description: "Main contracts management system",
      status: "active",
      apiKeys: 3,
      activeKeys: 2,
      requestsToday: 12847,
      requestsTrend: 8.3,
      costToday: 38.54,
      costTrend: -5.2,
      environment: "production",
      owner: "Legal Department",
      email: "legal-team@company.com",
      createdAt: "2024-01-15",
      lastActivity: "2 minutes ago"
    },
    {
      id: "2",
      name: "Audit Portal",
      description: "Internal audit and compliance portal",
      status: "active",
      apiKeys: 2,
      activeKeys: 2,
      requestsToday: 8234,
      requestsTrend: 12.5,
      costToday: 24.70,
      costTrend: 10.1,
      environment: "production",
      owner: "Audit Department",
      email: "audit@company.com",
      createdAt: "2024-01-20",
      lastActivity: "15 minutes ago"
    },
    {
      id: "3",
      name: "Internal Tools",
      description: "Developer tools and testing utilities",
      status: "active",
      apiKeys: 5,
      activeKeys: 3,
      requestsToday: 3421,
      requestsTrend: -15.3,
      costToday: 10.26,
      costTrend: -18.2,
      environment: "development",
      owner: "Engineering Team",
      email: "dev-team@company.com",
      createdAt: "2024-02-01",
      lastActivity: "1 hour ago"
    },
    {
      id: "4",
      name: "Test Suite",
      description: "Automated testing and CI/CD integration",
      status: "active",
      apiKeys: 2,
      activeKeys: 1,
      requestsToday: 1234,
      requestsTrend: 5.0,
      costToday: 3.70,
      costTrend: 4.2,
      environment: "testing",
      owner: "QA Team",
      email: "qa@company.com",
      createdAt: "2024-02-10",
      lastActivity: "3 hours ago"
    },
    {
      id: "5",
      name: "Mobile App Backend",
      description: "Backend services for mobile application",
      status: "inactive",
      apiKeys: 1,
      activeKeys: 0,
      requestsToday: 0,
      requestsTrend: -100,
      costToday: 0,
      costTrend: -100,
      environment: "production",
      owner: "Mobile Team",
      email: "mobile@company.com",
      createdAt: "2023-12-01",
      lastActivity: "7 days ago"
    }
  ]

  const stats = {
    totalConsumers: consumers.length,
    activeConsumers: consumers.filter(c => c.status === "active").length,
    totalRequests: consumers.reduce((sum, c) => sum + c.requestsToday, 0),
    totalCost: consumers.reduce((sum, c) => sum + c.costToday, 0)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consumer Applications</h1>
          <p className="text-muted-foreground mt-2">
            Manage applications consuming your APIs
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Consumer
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConsumers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">{stats.activeConsumers} active</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consumers.reduce((sum, c) => sum + c.apiKeys, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">
                {consumers.reduce((sum, c) => sum + c.activeKeys, 0)} active
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all consumers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Platform total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search consumers..."
            className="pl-9"
          />
        </div>
        <Button variant="outline">All Status</Button>
        <Button variant="outline">All Environments</Button>
      </div>

      {/* Consumers List */}
      <div className="space-y-4">
        {consumers.map((consumer) => (
          <Card key={consumer.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{consumer.name}</h3>
                    <Badge
                      variant={consumer.status === "active" ? "success" : "default"}
                      className="capitalize"
                    >
                      {consumer.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {consumer.environment}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {consumer.description}
                  </p>
                  <div className="flex items-center gap-6 text-xs text-muted-foreground mt-2">
                    <span>{consumer.owner}</span>
                    <span>•</span>
                    <span>{consumer.email}</span>
                    <span>•</span>
                    <span>Created {consumer.createdAt}</span>
                    <span>•</span>
                    <span>Last activity: {consumer.lastActivity}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Manage Keys
                  </Button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">API Keys</p>
                  <p className="text-2xl font-bold">{consumer.apiKeys}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">{consumer.activeKeys} active</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Requests Today</p>
                  <p className="text-2xl font-bold">{consumer.requestsToday.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {consumer.requestsTrend > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">+{consumer.requestsTrend.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-red-500" />
                        <span className="text-red-500">{consumer.requestsTrend.toFixed(1)}%</span>
                      </>
                    )}
                    <span className="text-muted-foreground">vs yesterday</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Cost Today</p>
                  <p className="text-2xl font-bold">${consumer.costToday.toFixed(2)}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {consumer.costTrend > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-red-500" />
                        <span className="text-red-500">+{consumer.costTrend.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">{consumer.costTrend.toFixed(1)}%</span>
                      </>
                    )}
                    <span className="text-muted-foreground">vs yesterday</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Avg Cost/Request</p>
                  <p className="text-2xl font-bold">
                    ${consumer.requestsToday > 0
                      ? (consumer.costToday / consumer.requestsToday).toFixed(4)
                      : "0.0000"
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Unit economics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (shown when no consumers) */}
      {consumers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No consumers yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by adding your first consumer application
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Consumer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
