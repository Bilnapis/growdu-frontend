import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/services/api-client'

export type SchedulingOptions = {
  tutors: { id: string; name: string }[]
  rooms: { id: string; name: string; code: string; capacity: number }[]
}

export function useSchedulingOptions<K extends keyof SchedulingOptions>(kind: K) {
  return useQuery({
    queryKey: ['scheduling-options'],
    queryFn: ({ signal }) => apiRequest<SchedulingOptions>('/class-sessions/form-options', { signal }),
    select: (options) => ({ data: options[kind] }),
  })
}
