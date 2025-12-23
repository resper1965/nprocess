import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  complianceAPI,
  ComplianceAnalyzeRequest,
  ComplianceAnalyzeResponse,
} from '@/lib/api-client'

/**
 * Query key factory for compliance analyses
 */
export const complianceKeys = {
  all: ['compliance'] as const,
  lists: () => [...complianceKeys.all, 'list'] as const,
  list: () => [...complianceKeys.lists()] as const,
  details: () => [...complianceKeys.all, 'detail'] as const,
  detail: (id: string) => [...complianceKeys.details(), id] as const,
}

/**
 * Hook to fetch all compliance analyses
 */
export function useComplianceAnalyses() {
  return useQuery({
    queryKey: complianceKeys.list(),
    queryFn: () => complianceAPI.list(),
  })
}

/**
 * Hook to fetch a specific compliance analysis
 */
export function useComplianceAnalysis(analysisId: string) {
  return useQuery({
    queryKey: complianceKeys.detail(analysisId),
    queryFn: () => complianceAPI.get(analysisId),
    enabled: !!analysisId,
  })
}

/**
 * Hook to analyze a process for compliance
 */
export function useAnalyzeCompliance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ComplianceAnalyzeRequest) => complianceAPI.analyze(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.lists() })
    },
  })
}
