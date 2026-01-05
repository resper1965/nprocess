/**
 * Unified API Client for n.process
 * Automatically includes Firebase ID token in all requests
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { auth } from './firebase-config'
import { User } from 'firebase/auth'

const ADMIN_API_URL = 'https://nprocess-admin-api-prod-43006907338.us-central1.run.app'
const API_URL = 'https://nprocess-api-prod-43006907338.us-central1.run.app'
const API_BASE_URL = API_URL

/**
 * Get Firebase ID token for authenticated requests
 */
async function getAuthToken(): Promise<string | null> {
  if (!auth?.currentUser) {
    return null
  }
  
  try {
    return await auth.currentUser.getIdToken()
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

/**
 * Create axios instance with automatic token injection
 */
function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor to add auth token
  client.interceptors.request.use(
    async (config) => {
      const token = await getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid - could trigger re-auth
        console.warn('Authentication failed, token may be expired')
        // Could redirect to login here if needed
      } else if (error.response?.status === 403) {
        console.warn('Forbidden: You may not have permission for this action')
      } else if ((error.response?.status || 0) >= 500) {
        console.error('Server error:', error.response?.data)
      }
      // Always reject to let the calling code handle it
      return Promise.reject(error)
    }
  )

  return client
}

/**
 * Admin Control Plane API Client
 * For administrative operations
 */
export const adminApi = createApiClient(ADMIN_API_URL)

/**
 * n.process API Client
 * For compliance and modeling operations
 */
export const nprocessApi = createApiClient(API_URL)

/**
 * Helper function to make authenticated fetch requests
 * Use this for one-off requests instead of axios
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken()
  
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  headers.set('Content-Type', 'application/json')

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Helper to get current user's Firebase ID token
 */
export async function getCurrentUserToken(): Promise<string | null> {
  return getAuthToken()
}

// ============================================================================
// Legacy API Key Management Functions (for backward compatibility)
// ============================================================================

/**
 * API Key creation request payload
 */
export interface APIKeyCreate {
  name: string
  consumer_app_id: string
  daily_quota?: number
  description?: string
  expires_at?: string | null
  quotas?: {
    requests_per_minute?: number
    requests_per_day?: number
    requests_per_month?: number
  }
  permissions?: string[]
}

/**
 * API Key response
 */
export interface APIKey {
  id: string
  name: string
  key: string
  consumer_app_id: string
  created_at: string
  last_used_at: string | null
  expires_at: string | null
  active: boolean
  daily_quota: number
  description?: string
}

/**
 * API Response wrapper
 */
export interface APIResponse<T> {
  data?: T
  error?: string
  message?: string
}

/**
 * Create a new API key (uses unified auth)
 */
export async function createAPIKey(
  payload: APIKeyCreate,
  authToken?: string
): Promise<APIResponse<APIKey>> {
  try {
    const token = authToken || await getAuthToken()
    
    const response = await authenticatedFetch(`${ADMIN_API_URL}/v1/admin/apikeys/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      return { error: error.error || error.message || error.detail || 'Failed to create API key' }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * List all API keys (uses unified auth)
 */
export async function listAPIKeys(
  authToken?: string
): Promise<APIResponse<APIKey[]>> {
  try {
    const response = await authenticatedFetch(`${ADMIN_API_URL}/v1/admin/apikeys/`)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      return { error: error.error || error.message || error.detail || 'Failed to list API keys' }
    }

    const data = await response.json()
    return { data: Array.isArray(data) ? data : data.keys || [] }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Revoke an API key (uses unified auth)
 */
export async function revokeAPIKey(
  keyId: string,
  authToken?: string
): Promise<APIResponse<void>> {
  try {
    const response = await authenticatedFetch(`${ADMIN_API_URL}/v1/admin/apikeys/${keyId}/revoke`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      return { error: error.error || error.message || error.detail || 'Failed to revoke API key' }
    }

    return {}
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Delete an API key (uses unified auth)
 */
export async function deleteAPIKey(
  keyId: string,
  authToken?: string
): Promise<APIResponse<void>> {
  try {
    const response = await authenticatedFetch(`${ADMIN_API_URL}/v1/admin/apikeys/${keyId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      return { error: error.error || error.message || error.detail || 'Failed to delete API key' }
    }

    return {}
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Get API base URL
 */
export function getAPIBaseURL(): string {
  return API_BASE_URL
}

/**
 * Get admin stats (overview metrics)
 */
export async function getAdminStats(): Promise<APIResponse<{
  apiCallsToday: number
  apiCallsChange: string
  costToday: number
  costChange: string
  activeKeys: number
  uptime: number
}>> {
  try {
    // Get API keys count
    const keysResponse = await listAPIKeys()
    const activeKeys = keysResponse.data?.filter(k => k.active).length || 0
    
    // Get cost summary
    const costResponse = await authenticatedFetch(`${ADMIN_API_URL}/v1/admin/finops/costs?period=current_month`)
    const costData = costResponse.ok ? await costResponse.json() : null
    
    // Get usage metrics
    const usageResponse = await authenticatedFetch(`${ADMIN_API_URL}/v1/admin/finops/usage?period=current_month`)
    const usageData = usageResponse.ok ? await usageResponse.json() : null
    
    return {
      data: {
        apiCallsToday: usageData?.total_requests || 0,
        apiCallsChange: usageData ? "+0%" : "-",
        costToday: costData?.total_cost || 0,
        costChange: costData ? "+0%" : "-",
        activeKeys,
        uptime: 99.9
      }
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Get services list
 */
export async function getServices(): Promise<APIResponse<Array<{
  name: string
  status: "healthy" | "degraded" | "down"
  uptime: number
  latency: number
}>>> {
  try {
    const response = await authenticatedFetch(`${ADMIN_API_URL}/v1/admin/services`)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      return { error: error.error || error.message || error.detail || 'Failed to get services' }
    }
    
    const data = await response.json()
    return { data: data || [] }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}
