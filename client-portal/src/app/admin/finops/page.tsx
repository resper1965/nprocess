"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Loader2 } from "lucide-react"
import { useCostSummary, useUsageMetrics } from "@/hooks/use-finops"

export default function FinOpsPage() {
  const { data: costData, isLoading: costsLoading } = useCostSummary('current_month')
  const { data: usageData, isLoading: usageLoading } = useUsageMetrics('current_month')
  
  const isLoading = costsLoading || usageLoading
  
  // Transform API data
  const costs = costData ? {
    monthToDate: costData.total_cost,
    projected: costData.forecast_month_end,
    budget: costData.budget,
    lastMonth: costData.total_cost * 0.96, // TODO: Get from API
    perCall: costData.total_cost / (usageData?.total_requests || 1)
  } : {
    monthToDate: 0,
    projected: 0,
    budget: 0,
    lastMonth: 0,
    perCall: 0
  }

  // Transform API data
  const costByService = costData?.cost_by_service ? Object.entries(costData.cost_by_service).map(([service, cost]) => {
    const calls = usageData?.requests_by_service?.[service] || 0
    const percentage = costs.monthToDate > 0 ? (Number(cost) / costs.monthToDate) * 100 : 0
    return { service, cost: Number(cost), calls, percentage }
  }) : []

  const costByConsumer = costData?.cost_by_consumer ? Object.entries(costData.cost_by_consumer).map(([consumer, cost]) => {
    const calls = usageData?.requests_by_consumer?.[consumer] || 0
    return { consumer, cost: Number(cost), calls }
  }) : []

  const recommendations = [
    {
      title: "High usage from Contracts App",
      description: "Consider implementing caching to reduce API calls by ~30%",
      impact: "$276/month",
      priority: "high"
    },
    {
      title: "Underutilized daily quota",
      description: "Test Suite using only 12% of allocated quota",
      impact: "Reduce quota to save $45/month",
      priority: "medium"
    },
    {
      title: "Enable cache for regulation searches",
      description: "60% of searches are repeated queries",
      impact: "$247/month",
      priority: "high"
    }
  ]

  const variance = ((costs.monthToDate - costs.lastMonth) / costs.lastMonth) * 100
  const budgetUsed = (costs.monthToDate / costs.budget) * 100
  const projectedVariance = ((costs.projected - costs.budget) / costs.budget) * 100

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">FinOps Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track and optimize platform costs in real-time
        </p>
      </div>

      {/* Cost Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month to Date</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costs.monthToDate.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {variance > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-red-500" />
                  <span className="text-red-500">+{variance.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">{variance.toFixed(1)}%</span>
                </>
              )}
              <span>vs last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Month End</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costs.projected.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {projectedVariance < 0 ? (
                <span className="text-green-500">Under budget by ${Math.abs(costs.budget - costs.projected).toFixed(2)}</span>
              ) : (
                <span className="text-yellow-500">On track</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costs.budget.toFixed(2)}</div>
            <div className="mt-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {budgetUsed.toFixed(1)}% used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per API Call</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${costs.perCall.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">-8.3%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Cost by Service */}
        <Card>
          <CardHeader>
            <CardTitle>Cost by Service</CardTitle>
            <CardDescription>Breakdown of costs across services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {costByService.map((item) => (
              <div key={item.service} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.service}</span>
                  <span className="text-muted-foreground">
                    ${item.cost.toFixed(2)} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                {item.calls > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {item.calls.toLocaleString()} API calls
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cost by Consumer */}
        <Card>
          <CardHeader>
            <CardTitle>Cost by Consumer</CardTitle>
            <CardDescription>Which applications are generating costs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {costByConsumer.map((item) => (
              <div key={item.consumer} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{item.consumer}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.calls.toLocaleString()} calls • ${(item.cost / item.calls).toFixed(4)}/call
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${item.cost.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Cost Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Recommendations</CardTitle>
          <CardDescription>
            AI-powered suggestions to reduce costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 border rounded-lg"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge
                    variant={rec.priority === "high" ? "error" : "warning"}
                    className="text-xs"
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {rec.description}
                </p>
                <p className="text-sm font-medium text-green-500">
                  Potential savings: {rec.impact}
                </p>
              </div>
              <button className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors">
                Apply
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
