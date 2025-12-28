import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api-client'

export interface ServiceInfo {
  service_id: string
  service_name: string
  status: 'healthy' | 'degraded' | 'down'
  uptime_percent: number
  last_check_at: string
  response_time_ms: number
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await adminApi.get('/v1/admin/services')
      return response.data as ServiceInfo[]
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useServiceHealth(serviceId: string) {
  return useQuery({
    queryKey: ['services', serviceId, 'health'],
    queryFn: async () => {
      const response = await adminApi.get(`/v1/admin/services/${serviceId}/health`)
      return response.data as ServiceInfo
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!serviceId,
  })
}

