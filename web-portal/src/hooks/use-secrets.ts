import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api-client'
import { toast } from 'sonner'

export interface Secret {
  id: string
  secret_name: string
  integration_type: string
  description?: string
  created_at: string
  last_used_at?: string
}

export interface SecretCreate {
  secret_name: string
  secret_value: string
  integration_type: 'google_cloud' | 'aws' | 'azure' | 'github'
  description?: string
}

export function useSecrets() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<Secret[], Error>({
    queryKey: ['secrets'],
    queryFn: async () => {
      try {
        const response = await adminApi.get('/v1/admin/secrets/')
        return response.data
      } catch (err: any) {
        console.error('Error fetching secrets:', err)
        const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to fetch secrets'
        throw new Error(errorMessage)
      }
    },
    retry: 1,
  })

  const createSecretMutation = useMutation<Secret, Error, SecretCreate>({
    mutationFn: async (payload) => {
      const response = await adminApi.post('/v1/admin/secrets/', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] })
      toast.success('Secret created successfully')
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to create secret'
      toast.error(errorMessage)
      console.error('Error creating secret:', err)
    },
  })

  const deleteSecretMutation = useMutation<void, Error, string>({
    mutationFn: async (secretId) => {
      await adminApi.delete(`/v1/admin/secrets/${secretId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] })
      toast.success('Secret deleted successfully')
    },
    onError: (err: any) => {
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to delete secret'
      toast.error(errorMessage)
      console.error('Error deleting secret:', err)
    },
  })

  return {
    secrets: data || [],
    isLoading,
    error,
    createSecret: createSecretMutation.mutateAsync,
    deleteSecret: deleteSecretMutation.mutateAsync,
    isCreating: createSecretMutation.isPending,
    isDeleting: deleteSecretMutation.isPending,
  }
}

