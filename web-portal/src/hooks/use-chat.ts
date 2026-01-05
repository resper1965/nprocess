import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '@/lib/api-client'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatResponse {
  message: string
  actions_performed?: string[]
  suggestions?: string[]
  session_id: string
  timestamp: string
}

export function useChat(sessionId?: string) {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId)

  const sendMessage = useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      const response = await adminApi.post('/v1/admin/chat', {
        message,
        session_id: currentSessionId,
      })
      
      if (response.data.session_id && !currentSessionId) {
        setCurrentSessionId(response.data.session_id)
      }
      
      return response.data
    },
  })

  const clearHistory = useMutation({
    mutationFn: async (sessionIdToClear: string) => {
      await adminApi.delete(`/v1/admin/chat/history/${sessionIdToClear}`)
      if (sessionIdToClear === currentSessionId) {
        setCurrentSessionId(undefined)
      }
    },
  })

  return {
    sendMessage: sendMessage.mutateAsync,
    isLoading: sendMessage.isPending,
    error: sendMessage.error,
    currentSessionId,
    clearHistory: clearHistory.mutateAsync,
  }
}

