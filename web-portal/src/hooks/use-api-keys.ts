"use client"

import { useState, useEffect } from "react"
import { listAPIKeys, createAPIKey, deleteAPIKey, revokeAPIKey } from "@/lib/api-client"
import type { APIKey as APIKeyType } from "@/lib/api-client"

export interface ApiKey {
  id: string
  name: string
  key: string
  key_id?: string // Alias for id
  consumer_app_id: string
  created_at: string
  last_used_at: string | null
  expires_at: string | null
  active: boolean
  status?: 'active' | 'revoked' | 'expired'
  daily_quota?: number
  description?: string
  quotas?: {
    requests_per_minute?: number
    requests_per_day?: number
    requests_per_month?: number
  }
  usage?: {
    requests_today?: number
    requests_this_month?: number
  }
}

// Map API response to local format
function mapAPIKey(apiKey: APIKeyType): ApiKey {
  return {
    id: apiKey.id,
    key_id: apiKey.id,
    name: apiKey.name,
    key: apiKey.key,
    consumer_app_id: apiKey.consumer_app_id,
    created_at: apiKey.created_at,
    last_used_at: apiKey.last_used_at,
    expires_at: apiKey.expires_at,
    active: apiKey.active,
    status: apiKey.active ? 'active' : 'revoked',
    daily_quota: apiKey.daily_quota,
    description: apiKey.description,
    quotas: {
      requests_per_day: apiKey.daily_quota,
    },
  }
}

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await listAPIKeys()
        
        if (response.error) {
          setError(response.error)
          setApiKeys([])
        } else if (response.data) {
          setApiKeys(response.data.map(mapAPIKey))
        } else {
          setApiKeys([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load API keys")
        setApiKeys([])
      } finally {
        setLoading(false)
      }
    }

    loadApiKeys()
  }, [])

  const createApiKey = async (name: string, consumerAppId?: string) => {
    const response = await createAPIKey({
      name,
      consumer_app_id: consumerAppId || 'default',
      daily_quota: 10000,
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      const newKey = mapAPIKey(response.data)
      setApiKeys(prev => [...prev, newKey])
      return newKey
    }
    
    throw new Error('Failed to create API key')
  }

  const deleteApiKey = async (id: string) => {
    const response = await deleteAPIKey(id)
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    setApiKeys(prev => prev.filter(key => key.id !== id))
  }

  const revokeApiKey = async (id: string) => {
    const response = await revokeAPIKey(id)
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    setApiKeys(prev => prev.map(key => 
      key.id === id ? { ...key, active: false, status: 'revoked' as const } : key
    ))
  }

  return {
    apiKeys,
    loading,
    error,
    createApiKey,
    deleteApiKey,
    revokeApiKey,
  }
}

export function useCreateAPIKey() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { createApiKey } = useApiKeys()
  return {
    isPending,
    error,
    mutateAsync: async (request: any) => {
      setIsPending(true)
      setError(null)
      try {
        // Use the API client directly for better error handling
        const response = await createAPIKey({
          name: request.name,
          consumer_app_id: request.consumer_app_id,
          description: request.description,
          daily_quota: request.quotas?.requests_per_day || 10000,
          quotas: request.quotas,
          permissions: request.permissions || ['read', 'write'],
        })
        
        if (response.error) {
          throw new Error(response.error)
        }
        
        if (!response.data) {
          throw new Error('Failed to create API key')
        }
        
        return { api_key: response.data.key }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create API key')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
  }
}

export function useRevokeAPIKey() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { revokeApiKey } = useApiKeys()
  return {
    isPending,
    error,
    mutateAsync: async (keyId: string) => {
      setIsPending(true)
      setError(null)
      try {
        await revokeAPIKey(keyId)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to revoke API key')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
  }
}

// Alias to avoid naming conflict
export function useAPIKeysList() {
  const { apiKeys, loading, error } = useApiKeys()
  return {
    data: apiKeys,
    isLoading: loading,
    error,
  }
}

