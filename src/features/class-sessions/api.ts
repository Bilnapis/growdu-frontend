import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/services/api-client'

export type AttendanceStatus = 'present' | 'excused' | 'sick' | 'absent'
export type SessionStudent = {
  studentId: string
  name: string
  school: string
  educationLevel: string
  status: AttendanceStatus | null
  note: string | null
}
export type ClassSession = {
  id: string
  studyGroupId: string
  studyGroupName: string
  sessionDate: string
  startTime: string
  endTime: string
  tutorId: string
  tutorName: string
  roomId: string | null
  roomName: string | null
  roomCode: string | null
  subject: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  attendanceStatus: 'pending' | 'saved'
  studentCount: number
  topic: string | null
  tutorNote: string | null
  version: number
  lockedAt: string | null
  students: SessionStudent[]
}
export type SessionFilters = {
  from: string
  to: string
  page?: number
  limit?: number
  studyGroupId?: string
  tutorId?: string
  status?: string
  attendanceStatus?: string
  search?: string
}
export type SessionRecord = {
  version: number
  topic: string
  tutorNote: string
  attendance: { studentId: string; status: AttendanceStatus; note: string }[]
}
export type SessionOverride = {
  version: number
  reason: string
  sessionDate?: string
  startTime?: string
  endTime?: string
  tutorId?: string
  roomId?: string
  status?: 'cancelled'
}
export type SessionListItem = Omit<ClassSession, 'students'>
type Page = {
  data: SessionListItem[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
export const sessionKeys = ['class-sessions'] as const
export function isDate(value: string | null): value is string {
  return (
    !!value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value + 'T00:00:00Z')) &&
    new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value
  )
}
export function todayInJakarta() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
export function shiftDate(date: string, days: number) {
  const value = new Date(date + 'T00:00:00Z')
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}
export function sessionDateLabel(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date + 'T00:00:00+07:00'))
}
export function useSessions(filters: SessionFilters) {
  return useQuery({
    queryKey: [...sessionKeys, filters],
    queryFn: ({ signal }) => {
      const params = new URLSearchParams({
        page: String(filters.page ?? 1),
        limit: String(filters.limit ?? 100),
      })
      for (const [key, value] of Object.entries(filters))
        if (value !== undefined && value !== '') params.set(key, String(value))
      return apiRequest<Page>('/class-sessions?' + params.toString(), {
        signal,
      })
    },
  })
}
export function useSession(id: string) {
  return useQuery({
    queryKey: [...sessionKeys, 'detail', id],
    queryFn: ({ signal }) =>
      apiRequest<ClassSession>('/class-sessions/' + encodeURIComponent(id), {
        signal,
      }),
    enabled: !!id,
  })
}
export function useSaveSession(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: SessionRecord) =>
      apiRequest<ClassSession>(
        '/class-sessions/' + encodeURIComponent(id) + '/record',
        { method: 'PUT', body: input },
      ),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: sessionKeys }),
        client.invalidateQueries({ queryKey: ['study-groups', 'summary'] }),
      ]),
  })
}
export function useOverrideSession(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: SessionOverride) =>
      apiRequest<ClassSession>('/class-sessions/' + encodeURIComponent(id), {
        method: 'PATCH',
        body: input,
      }),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: sessionKeys }),
        client.invalidateQueries({ queryKey: ['study-groups', 'summary'] }),
        client.invalidateQueries({ queryKey: ['rooms'] }),
      ]),
  })
}
