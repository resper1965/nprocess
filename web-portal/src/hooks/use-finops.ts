import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api-client'

export interface CostSummary {
  period: string
  total_cost: number
  cost_by_service: Record<string, number>
  cost_by_consumer: Record<string, number>
  budget: number
  budget_used_percent: number
  forecast_month_end: number
}

export interface UsageMetrics {
  period: string
  total_requests: number
  requests_by_service: Record<string, number>
  requests_by_consumer: Record<string, number>
  average_latency_ms: number
  error_rate_percent: number
}

export function useCostSummary(period: string = 'current_month') {
  return useQuery({
    queryKey: ['finops', 'costs', period],
    queryFn: async () => {
      const response = await adminApi.get(`/v1/admin/finops/costs?period=${period}`)
      return response.data as CostSummary
    },
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useUsageMetrics(period: string = 'current_month') {
  return useQuery({
    queryKey: ['finops', 'usage', period],
    queryFn: async () => {
      const response = await adminApi.get(`/v1/admin/finops/usage?period=${period}`)
      return response.data as UsageMetrics
    },
    refetchInterval: 60000, // Refetch every minute
  })
}

