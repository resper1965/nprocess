/**
 * API Key Generator Utilities
 * 
 * Rotinas para geração e gerenciamento de API Keys do ness.
 * As chaves são geradas no backend (criptograficamente seguras) e
 * fornecidas aos clientes para uso em suas aplicações.
 */

import { adminApi } from './api-client'
import { toast } from 'sonner'

export interface APIKeyGenerationRequest {
  name: string
  consumer_app_id: string
  description?: string
  daily_quota?: number
  quotas?: {
    requests_per_minute?: number
    requests_per_day?: number
    requests_per_month?: number
  }
  permissions?: string[]
  allowed_standards?: {
    marketplace?: string[]
    custom?: string[]
  }
  environment?: 'prod' | 'staging' | 'dev'
  expires_at?: string
}

export interface APIKeyGenerationResult {
  success: boolean
  api_key?: string
  key_id?: string
  error?: string
}

/**
 * Gera uma nova API Key no backend
 * 
 * @param request - Dados da chave a ser gerada
 * @returns Resultado com a chave gerada (exibida apenas uma vez)
 */
export async function generateAPIKey(
  request: APIKeyGenerationRequest
): Promise<APIKeyGenerationResult> {
  try {
    const response = await adminApi.post('/v1/admin/apikeys', {
      name: request.name,
      consumer_app_id: request.consumer_app_id,
      description: request.description,
      daily_quota: request.daily_quota || 10000,
      quotas: request.quotas || {
        requests_per_minute: 100,
        requests_per_day: request.daily_quota || 10000,
        requests_per_month: (request.daily_quota || 10000) * 30,
      },
      permissions: request.permissions || ['read', 'write'],
      allowed_standards: request.allowed_standards,
      environment: request.environment || 'prod',
      expires_at: request.expires_at,
    })

    if (response.data?.api_key) {
      return {
        success: true,
        api_key: response.data.api_key,
        key_id: response.data.key_id,
      }
    }

    return {
      success: false,
      error: 'Resposta da API inválida',
    }
  } catch (error: any) {
    console.error('Erro ao gerar API Key:', error)
    const errorMessage = error?.response?.data?.detail || error?.message || 'Erro desconhecido ao gerar chave'
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Rotaciona uma API Key existente
 * Gera uma nova chave e revoga a antiga
 * 
 * @param keyId - ID da chave a ser rotacionada
 * @param newKeyName - Nome para a nova chave (opcional)
 * @returns Resultado com a nova chave gerada
 */
export async function rotateAPIKey(
  keyId: string,
  newKeyName?: string
): Promise<APIKeyGenerationResult> {
  try {
    // 1. Buscar dados da chave existente
    const existingKeyResponse = await adminApi.get(`/v1/admin/apikeys/${keyId}`)
    const existingKey = existingKeyResponse.data

    if (!existingKey) {
      return {
        success: false,
        error: 'Chave não encontrada',
      }
    }

    // 2. Gerar nova chave com mesmos parâmetros
    const generateResult = await generateAPIKey({
      name: newKeyName || `${existingKey.name} (rotated)`,
      consumer_app_id: existingKey.consumer_app_id,
      description: `Rotated from ${keyId}`,
      daily_quota: existingKey.quotas?.requests_per_day || existingKey.daily_quota || 10000,
      quotas: existingKey.quotas,
      permissions: existingKey.permissions || ['read', 'write'],
      allowed_standards: existingKey.allowed_standards,
      environment: existingKey.environment || 'prod',
    })

    if (!generateResult.success) {
      return generateResult
    }

    // 3. Revogar chave antiga
    try {
      await adminApi.post(`/v1/admin/apikeys/${keyId}/revoke`)
    } catch (revokeError) {
      console.warn('Erro ao revogar chave antiga:', revokeError)
      // Não falha a operação se a revogação falhar
    }

    return generateResult
  } catch (error: any) {
    console.error('Erro ao rotacionar API Key:', error)
    const errorMessage = error?.response?.data?.detail || error?.message || 'Erro desconhecido ao rotacionar chave'
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Gera uma API Key rápida para um consumer
 * Função de conveniência com valores padrão
 * 
 * @param consumerId - ID do consumer
 * @param keyName - Nome da chave
 * @returns Resultado com a chave gerada
 */
export async function generateQuickAPIKey(
  consumerId: string,
  keyName: string
): Promise<APIKeyGenerationResult> {
  return generateAPIKey({
    name: keyName,
    consumer_app_id: consumerId,
    daily_quota: 10000,
    permissions: ['read', 'write'],
    environment: 'prod',
  })
}

/**
 * Copia uma chave para a área de transferência
 * 
 * @param key - Chave a ser copiada
 * @returns true se copiado com sucesso
 */
export async function copyKeyToClipboard(key: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(key)
    toast.success('Chave copiada!', {
      description: 'A chave foi copiada para a área de transferência',
    })
    return true
  } catch (error) {
    console.error('Erro ao copiar chave:', error)
    toast.error('Erro ao copiar chave', {
      description: 'Não foi possível copiar a chave automaticamente',
    })
    return false
  }
}
