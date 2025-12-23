import { useMutation } from '@tanstack/react-query'
import {
  diagramsAPI,
  DiagramGenerateRequest,
  DiagramGenerateResponse,
} from '@/lib/api-client'

/**
 * Hook to generate a BPMN diagram from text description
 */
export function useGenerateDiagram() {
  return useMutation({
    mutationFn: (request: DiagramGenerateRequest) => diagramsAPI.generate(request),
  })
}
