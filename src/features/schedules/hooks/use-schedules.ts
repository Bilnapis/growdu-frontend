import { useQuery } from '@tanstack/react-query'

import {
  getScheduleById,
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

export function useSchedule(id: string | undefined) {
  return useQuery({
    queryKey: [...schedulesQueryKey, 'detail', id],
    queryFn: ({ signal }) => getScheduleById(id ?? '', signal),
    enabled: Boolean(id),
  })
}
