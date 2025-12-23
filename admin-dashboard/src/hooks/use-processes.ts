import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  processesAPI,
  ProcessCreateRequest,
  ProcessResponse,
} from '@/lib/api-client'

/**
 * Query key factory for processes
 */
export const processesKeys = {
  all: ['processes'] as const,
  lists: () => [...processesKeys.all, 'list'] as const,
  list: () => [...processesKeys.lists()] as const,
  details: () => [...processesKeys.all, 'detail'] as const,
  detail: (id: string) => [...processesKeys.details(), id] as const,
}

/**
 * Hook to fetch all processes
 */
export function useProcesses() {
  return useQuery({
    queryKey: processesKeys.list(),
    queryFn: () => processesAPI.list(),
  })
}

/**
 * Hook to fetch a specific process
 */
export function useProcess(processId: string) {
  return useQuery({
    queryKey: processesKeys.detail(processId),
    queryFn: () => processesAPI.get(processId),
    enabled: !!processId,
  })
}

/**
 * Hook to create a new process
 */
export function useCreateProcess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ProcessCreateRequest) => processesAPI.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processesKeys.lists() })
    },
  })
}

/**
 * Hook to update a process
 */
export function useUpdateProcess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ processId, data }: { processId: string; data: Partial<ProcessCreateRequest> }) =>
      processesAPI.update(processId, data),
    onSuccess: (data, { processId }) => {
      queryClient.invalidateQueries({ queryKey: processesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: processesKeys.detail(processId) })
    },
  })
}

/**
 * Hook to delete a process
 */
export function useDeleteProcess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (processId: string) => processesAPI.delete(processId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: processesKeys.lists() })
    },
  })
}
