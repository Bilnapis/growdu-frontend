import { apiRequest } from '@/services/api-client'

export type TutorStatus = 'active' | 'inactive'

export type Tutor = {
  id: string
  tenantId: string
  userId: string | null
  name: string
  phoneNumber: string
  sessionRate: string
  status: TutorStatus
  createdAt: string
  updatedAt: string
}

export type TutorsFilters = {
  page: number
  limit: number
  search?: string
  status?: TutorStatus
}

type PaginatedTutorsResponse = {
  data: Tutor[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type TutorInput = {
  name: string
  phoneNumber: string
  sessionRate: string
  status?: TutorStatus
}

export function getTutors(filters: TutorsFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  })

  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)

  return apiRequest<PaginatedTutorsResponse>(`/tutors?${params.toString()}`, {
    signal,
  })
}

export function createTutor(input: TutorInput) {
  return apiRequest<Tutor>('/tutors', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateTutor(id: string, input: TutorInput) {
  return apiRequest<Tutor>(`/tutors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}
