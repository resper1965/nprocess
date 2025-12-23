import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import {
  apiKeysAPI,
  APIKeyCreate,
  APIKeyInfo,
  APIKeyResponse,
  APIKeyValidationRequest,
  APIKeyValidationResult,
  APIError,
} from '@/lib/api-client'

/**
 * Query key factory for API keys
 */
export const apiKeysKeys = {
  all: ['apiKeys'] as const,
  lists: () => [...apiKeysKeys.all, 'list'] as const,
  list: () => [...apiKeysKeys.lists()] as const,
  details: () => [...apiKeysKeys.all, 'detail'] as const,
  detail: (id: string) => [...apiKeysKeys.details(), id] as const,
}

/**
 * Hook to fetch all API keys
 */
export function useAPIKeys() {
  const { data: session } = useSession()
  const adminToken = (session as any)?.accessToken || ''

  return useQuery({
    queryKey: apiKeysKeys.list(),
    queryFn: () => apiKeysAPI.list(adminToken),
    enabled: !!adminToken,
  })
}

/**
 * Hook to fetch a specific API key
 */
export function useAPIKey(keyId: string) {
  const { data: session } = useSession()
  const adminToken = (session as any)?.accessToken || ''

  return useQuery({
    queryKey: apiKeysKeys.detail(keyId),
    queryFn: () => apiKeysAPI.get(keyId, adminToken),
    enabled: !!adminToken && !!keyId,
  })
}

/**
 * Hook to create a new API key
 */
export function useCreateAPIKey() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const adminToken = (session as any)?.accessToken || ''

  return useMutation({
    mutationFn: (request: APIKeyCreate) => apiKeysAPI.create(request, adminToken),
    onSuccess: () => {
      // Invalidate and refetch API keys list
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.lists() })
    },
  })
}

/**
 * Hook to revoke an API key
 */
export function useRevokeAPIKey() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const adminToken = (session as any)?.accessToken || ''

  return useMutation({
    mutationFn: (keyId: string) => apiKeysAPI.revoke(keyId, adminToken),
    onSuccess: (data, keyId) => {
      // Invalidate lists and the specific key detail
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.lists() })
      queryClient.invalidateQueries({ queryKey: apiKeysKeys.detail(keyId) })
    },
  })
}

/**
 * Hook to validate an API key
 */
export function useValidateAPIKey() {
  return useMutation({
    mutationFn: (request: APIKeyValidationRequest) => apiKeysAPI.validate(request),
  })
}
