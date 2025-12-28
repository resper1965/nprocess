import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api-client'

export interface AuditLogEntry {
  log_id: string
  timestamp: string
  user_id: string
  user_email?: string
  action: string
  resource_type: string
  resource_id: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  status: 'success' | 'failure'
  error_message?: string
}

export function useAuditLogs(limit: number = 10) {
  return useQuery({
    queryKey: ['audit', 'logs', limit],
    queryFn: async () => {
      const response = await adminApi.get('/v1/admin/audit/logs', {
        params: { limit, offset: 0 }
      })
      return response.data as AuditLogEntry[]
    },
    refetchInterval: 60000, // Refetch every minute
  })
}

/**
 * Transform audit log entry to dashboard activity format
 */
export function transformAuditLogToActivity(log: AuditLogEntry, t: any) {
  const timestamp = new Date(log.timestamp)
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  let timeAgo = ''
  if (diffHours < 1) {
    const minutes = Math.floor(diffMs / (1000 * 60))
    timeAgo = `${minutes} ${minutes === 1 ? (t.dashboard.activity.minuteAgo || 'minuto atrás') : (t.dashboard.activity.minutesAgo || 'minutos atrás')}`
  } else if (diffHours < 24) {
    timeAgo = `${diffHours} ${diffHours === 1 ? (t.dashboard.activity.hourAgo || 'hora atrás') : (t.dashboard.activity.hoursAgo || 'horas atrás')}`
  } else {
    timeAgo = `${diffDays} ${diffDays === 1 ? (t.dashboard.activity.dayAgo || 'dia atrás') : (t.dashboard.activity.daysAgo || 'dias atrás')}`
  }

  // Map action types to user-friendly messages
  // Handle both enum values (create, read, update, delete) and custom action strings
  const actionStr = typeof log.action === 'string' ? log.action : String(log.action)
  
  const actionMap: Record<string, string> = {
    // Enum values
    'create': t.dashboard.activity.created || 'Criado',
    'read': t.dashboard.activity.viewed || 'Visualizado',
    'update': t.dashboard.activity.updated || 'Atualizado',
    'delete': t.dashboard.activity.deleted || 'Deletado',
    'revoke': t.dashboard.activity.revoked || 'Revogado',
    // Custom action strings
    'api_key.created': t.dashboard.activity.apiKeyCreated || 'API Key criada',
    'api_key.revoked': t.dashboard.activity.apiKeyRevoked || 'API Key revogada',
    'api_key.deleted': t.dashboard.activity.apiKeyDeleted || 'API Key deletada',
    'document.analyzed': t.dashboard.activity.documentAnalyzed || 'Documento analisado',
    'document.uploaded': t.dashboard.activity.documentUploaded || 'Documento enviado',
    'chat.message': t.dashboard.activity.chatSession || 'Sessão de chat',
    'integration.configured': t.dashboard.activity.integrationConfigured || 'Integração configurada',
    'compliance.analysis': t.dashboard.activity.complianceAnalysis || 'Análise de compliance',
    'user.created': t.dashboard.activity.userCreated || 'Usuário criado',
    'user.updated': t.dashboard.activity.userUpdated || 'Usuário atualizado',
  }

  // Try to get friendly message, fallback to resource type + action
  let action = actionMap[actionStr]
  if (!action && log.resource_type) {
    const resourceTypeMap: Record<string, string> = {
      'api_key': t.dashboard.activity.apiKey || 'API Key',
      'document': t.dashboard.activity.document || 'Documento',
      'user': t.dashboard.activity.user || 'Usuário',
      'integration': t.dashboard.activity.integration || 'Integração',
    }
    const resourceName = resourceTypeMap[log.resource_type] || log.resource_type
    action = `${resourceName} ${actionMap[actionStr] || actionStr}`
  }
  
  if (!action) {
    action = actionStr
  }
  const document = log.details?.name || log.details?.document_name || log.details?.key_name || log.resource_id

  return {
    action,
    document,
    time: timeAgo,
    status: log.status === 'success' ? (t.dashboard.activity.success || 'sucesso') : (t.dashboard.activity.error || 'erro'),
  }
}

