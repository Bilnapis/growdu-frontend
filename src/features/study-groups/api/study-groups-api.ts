import { apiRequest } from '@/services/api-client'
import type {
  EntityStatus,
  StudentListItem,
} from '@/features/students/api/students-api'
import type { SchedulingOptions } from '@/features/class-sessions/use-scheduling-options'

export type StudyGroupStudentOption = {
  id: string
  name: string
  school: string
  educationLevel: string
  status: EntityStatus
}
export type StudyGroupFormOptions = SchedulingOptions & {
  students: (StudyGroupStudentOption & { address: string })[]
}

export function getStudyGroupFormOptions(signal?: AbortSignal) {
  return apiRequest<StudyGroupFormOptions>('/study-groups/form-options', {
    signal,
  })
}

export function getStudyGroupStudents(id: string, signal?: AbortSignal) {
  return apiRequest<StudyGroupStudentOption[]>(
    `/study-groups/${encodeURIComponent(id)}/students`,
    { signal },
  )
}

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
  effectiveFrom: string
  effectiveUntil: string
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
  previousMonthTotal: number
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

export async function getActiveStudyGroups(signal?: AbortSignal) {
  const groups: StudyGroupListItem[] = []
  let page = 1
  let totalPages: number
  do {
    const result = await getStudyGroups(
      { page, limit: 100, status: 'active' },
      signal,
    )
    groups.push(...result.data)
    totalPages = result.meta.totalPages
    page += 1
  } while (page <= totalPages)
  return groups
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
export async function updateStudyGroup(id: string, input: StudyGroupInput) {
  await apiRequest(`/study-groups/${encode(id)}/configurations`, {
    method: 'POST',
    body: input,
  })
  return getStudyGroup(id)
}
export type ConfigurationHistory = {
  id: string
  effectiveFrom: string
  effectiveUntil: string
  createdAt: string
  supersededAt: string | null
  studentIds: string[]
  schedules: Array<{
    id: string
    tutorId: string
    roomId: string | null
    dayOfWeek: number
    startTime: string
    endTime: string
  }>
}
export function getConfigurations(id: string, signal?: AbortSignal) {
  return apiRequest<ConfigurationHistory[]>(
    `/study-groups/${encode(id)}/configurations`,
    { signal },
  )
}
export function previewConfiguration(id: string, input: StudyGroupInput) {
  return apiRequest<{ created: number; updated: number; skipped: number }>(
    `/study-groups/${encode(id)}/configurations/preview`,
    { method: 'POST', body: input },
  )
}
export function updateStudyGroupStatus(id: string, status: EntityStatus) {
  return apiRequest<StudyGroup>(`/study-groups/${encode(id)}/status`, {
    method: 'PATCH',
    body: { status },
  })
}
export type { StudentListItem }
