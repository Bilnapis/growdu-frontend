import { apiRequest } from '@/services/api-client'
import type {
  EntityStatus,
  StudentListItem,
} from '@/features/students/api/students-api'

export type StudyGroupSchedule = {
  id: string
  tutorId: string
  tutorName: string
  tutorExpertise: string | null
  roomId: string | null
  roomName: string | null
  roomCode: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
}
export type StudyGroup = {
  id: string
  tenantId: string
  name: string
  subjects: string[]
  schedules: StudyGroupSchedule[]
  studentCount: number
  studentIds: string[]
  status: EntityStatus
  createdAt: string
  updatedAt: string
}
export type StudyGroupListItem = Omit<
  StudyGroup,
  'tenantId' | 'studentIds' | 'createdAt' | 'updatedAt'
>
export type StudyGroupInput = {
  name: string
  schedules: Array<{
    id?: string
    tutorId: string
    roomId?: string
    dayOfWeek: number
    startTime: string
    endTime: string
  }>
  studentIds: string[]
}
export type StudyGroupFilters = {
  page: number
  limit: number
  search?: string
  tutorId?: string
  dayOfWeek?: number
  status?: EntityStatus
}
export type StudyGroupsSummary = {
  total: number
  active: number
  inactive: number
  schedulesToday: number
}
type Page<T> = {
  data: T[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
const encode = (id: string) => encodeURIComponent(id)
export function getStudyGroups(
  filters: StudyGroupFilters,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  })
  if (filters.search) params.set('search', filters.search)
  if (filters.tutorId) params.set('tutorId', filters.tutorId)
  if (filters.dayOfWeek) params.set('dayOfWeek', String(filters.dayOfWeek))
  if (filters.status) params.set('status', filters.status)
  return apiRequest<Page<StudyGroupListItem>>(`/study-groups?${params}`, {
    signal,
  })
}
export function getStudyGroupsSummary(signal?: AbortSignal) {
  return apiRequest<StudyGroupsSummary>('/study-groups/summary', { signal })
}
export function getStudyGroup(id: string, signal?: AbortSignal) {
  return apiRequest<StudyGroup>(`/study-groups/${encode(id)}`, { signal })
}
export function createStudyGroup(input: StudyGroupInput) {
  return apiRequest<StudyGroup>('/study-groups', {
    method: 'POST',
    body: input,
  })
}
export function updateStudyGroup(id: string, input: StudyGroupInput) {
  return apiRequest<StudyGroup>(`/study-groups/${encode(id)}`, {
    method: 'PATCH',
    body: input,
  })
}
export function updateStudyGroupStatus(id: string, status: EntityStatus) {
  return apiRequest<StudyGroup>(`/study-groups/${encode(id)}/status`, {
    method: 'PATCH',
    body: { status },
  })
}
export type { StudentListItem }
