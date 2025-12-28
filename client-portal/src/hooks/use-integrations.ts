import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api-client'
import { toast } from 'sonner'

export interface Integration {
  id: string
  name: string
  description: string
  status: 'connected' | 'disconnected'
  requires_plan?: string
  configurable: boolean
  config?: {
    folder_id?: string
    folder_name?: string
    auto_upload?: boolean
    share_with_emails?: string[]
  }
  connected_at?: string
}

export interface IntegrationConfig {
  folder_id?: string
  folder_name?: string
  auto_upload?: boolean
  share_with_emails?: string[]
}

export function useIntegrations() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<Integration[], Error>({
    queryKey: ['integrations'],
    queryFn: async () => {
      try {
        const response = await adminApi.get('/v1/integrations')
        return response.data
      } catch (err: any) {
        console.error('Error fetching integrations:', err)
        const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to fetch integrations'
        throw new Error(errorMessage)
      }
    },
    retry: 1,
  })

  const connectMutation = useMutation<void, Error, string>({
    mutationFn: async (integrationId) => {
      await adminApi.post(`/v1/integrations/${integrationId}/connect`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Integration connected successfully')
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to connect integration'
      toast.error(errorMessage)
      console.error('Error connecting integration:', err)
    },
  })

  const disconnectMutation = useMutation<void, Error, string>({
    mutationFn: async (integrationId) => {
      await adminApi.post(`/v1/integrations/${integrationId}/disconnect`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Integration disconnected successfully')
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to disconnect integration'
      toast.error(errorMessage)
      console.error('Error disconnecting integration:', err)
    },
  })

  const updateConfigMutation = useMutation<void, Error, { integrationId: string; config: IntegrationConfig }>({
    mutationFn: async ({ integrationId, config }) => {
      await adminApi.patch(`/v1/integrations/${integrationId}/config`, config)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Configuration updated successfully')
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to update configuration'
      toast.error(errorMessage)
      console.error('Error updating configuration:', err)
    },
  })

  return {
    integrations: data || [],
    isLoading,
    error,
    connect: connectMutation.mutateAsync,
    disconnect: disconnectMutation.mutateAsync,
    updateConfig: updateConfigMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isUpdatingConfig: updateConfigMutation.isPending,
  }
}

