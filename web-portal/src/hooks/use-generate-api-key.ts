"use client"

import { useState } from 'react'
import { generateAPIKey, rotateAPIKey, generateQuickAPIKey, type APIKeyGenerationRequest, type APIKeyGenerationResult } from '@/lib/api-key-generator'
import { toast } from 'sonner'

/**
 * Hook para geração de API Keys
 * 
 * Fornece funções e estado para gerar chaves de API do ness.
 * As chaves são geradas no backend e fornecidas aos clientes.
 */
export function useGenerateAPIKey() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Gera uma nova API Key
   */
  const generate = async (request: APIKeyGenerationRequest): Promise<APIKeyGenerationResult> => {
    setIsGenerating(true)
    setError(null)
    setGeneratedKey(null)

    try {
      const result = await generateAPIKey(request)

      if (result.success && result.api_key) {
        setGeneratedKey(result.api_key)
        toast.success('API Key gerada com sucesso!', {
          description: 'Copie a chave agora - ela não será exibida novamente',
        })
      } else {
        setError(result.error || 'Erro ao gerar chave')
        toast.error('Erro ao gerar API Key', {
          description: result.error || 'Tente novamente',
        })
      }

      return result
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro desconhecido'
      setError(errorMessage)
      toast.error('Erro ao gerar API Key', {
        description: errorMessage,
      })
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Rotaciona uma API Key existente
   */
  const rotate = async (keyId: string, newKeyName?: string): Promise<APIKeyGenerationResult> => {
    setIsGenerating(true)
    setError(null)
    setGeneratedKey(null)

    try {
      const result = await rotateAPIKey(keyId, newKeyName)

      if (result.success && result.api_key) {
        setGeneratedKey(result.api_key)
        toast.success('API Key rotacionada com sucesso!', {
          description: 'Nova chave gerada. Copie agora para fornecer ao cliente',
        })
      } else {
        setError(result.error || 'Erro ao rotacionar chave')
        toast.error('Erro ao rotacionar API Key', {
          description: result.error || 'Tente novamente',
        })
      }

      return result
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro desconhecido'
      setError(errorMessage)
      toast.error('Erro ao rotacionar API Key', {
        description: errorMessage,
      })
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Gera uma chave rápida (valores padrão)
   */
  const generateQuick = async (consumerId: string, keyName: string): Promise<APIKeyGenerationResult> => {
    return generate({
      name: keyName,
      consumer_app_id: consumerId,
      daily_quota: 10000,
      permissions: ['read', 'write'],
      environment: 'prod',
    })
  }

  /**
   * Limpa o estado (útil após copiar a chave)
   */
  const clear = () => {
    setGeneratedKey(null)
    setError(null)
  }

  return {
    generate,
    rotate,
    generateQuick,
    clear,
    isGenerating,
    generatedKey,
    error,
  }
}
