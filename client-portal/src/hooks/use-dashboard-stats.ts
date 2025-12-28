import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api-client'

export interface DashboardStats {
  apiCallsToday: number
  apiCallsChange: string
  documentsAnalyzed: number
  documentsChange: string
  activeApiKeys: number
  activeApiKeysChange: string
  chatMessages: number
  chatMessagesChange: string
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      // Get API keys count
      const keysResponse = await adminApi.get('/v1/admin/apikeys')
      const activeKeys = keysResponse.data?.filter((k: any) => k.active).length || 0
      
      // Get usage metrics
      const usageResponse = await adminApi.get('/v1/admin/finops/usage?period=current_month')
      const usageData = usageResponse.data || {}
      
      // Get cost summary
      const costResponse = await adminApi.get('/v1/admin/finops/costs?period=current_month')
      const costData = costResponse.data || {}
      
      // Calculate changes (mock for now, should come from API)
      const apiCallsToday = usageData.total_requests || 0
      const documentsAnalyzed = 0 // TODO: Get from documents API
      const chatMessages = 0 // TODO: Get from chat API
      
      return {
        apiCallsToday,
        apiCallsChange: '+0%',
        documentsAnalyzed,
        documentsChange: '+0%',
        activeApiKeys: activeKeys,
        activeApiKeysChange: '+0%',
        chatMessages,
        chatMessagesChange: '+0%',
      } as DashboardStats
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

