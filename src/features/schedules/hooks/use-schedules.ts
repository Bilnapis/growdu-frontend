import { useQuery } from '@tanstack/react-query'

import {
  getSchedules,
  getSchedulesSummary,
  type ScheduleFilters,
} from '@/features/schedules/api/schedules-api'

export const schedulesQueryKey = ['schedules'] as const

export function useSchedules(filters: ScheduleFilters) {
  return useQuery({
    queryKey: [...schedulesQueryKey, filters],
    queryFn: ({ signal }) => getSchedules(filters, signal),
  })
}

export function useSchedulesSummary() {
  return useQuery({
    queryKey: [...schedulesQueryKey, 'summary'],
    queryFn: ({ signal }) => getSchedulesSummary(signal),
  })
}
