import { apiRequest } from '@/services/api-client'

export type ScheduleEducationLevel = 'sd' | 'smp' | 'sma' | 'other'

export type ScheduleListItem = {
  id: string
  studyGroupId: string
  studyGroupName: string
  subject: string | null
  tutorId: string
  tutorName: string
  roomId: string | null
  roomName: string | null
  roomCode: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
  studentCount: number
  attendanceStatus: 'unavailable'
}

export type ScheduleFilters = {
  page: number
  limit: number
  search?: string
  dayOfWeek?: number
  educationLevel?: ScheduleEducationLevel
}

export type SchedulesSummary = {
  totalSchedules: number
  schedulesWithAttendance: number
  schedulesPendingAttendance: number
  schedulesToday: number
}

export type PaginatedSchedules = {
  data: ScheduleListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function getSchedules(filters: ScheduleFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  })
  if (filters.search) params.set('search', filters.search)
  if (filters.dayOfWeek) params.set('dayOfWeek', String(filters.dayOfWeek))
  if (filters.educationLevel) {
    params.set('educationLevel', filters.educationLevel)
  }

  return apiRequest<PaginatedSchedules>(`/schedules?${params.toString()}`, {
    signal,
  })
}

export function getSchedulesSummary(signal?: AbortSignal) {
  return apiRequest<SchedulesSummary>('/schedules/summary', { signal })
}
