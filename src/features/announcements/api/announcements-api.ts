import { apiRequest } from '@/services/api-client'

export type AnnouncementTarget = 'all' | 'admin' | 'tutor' | 'parent'
export type AnnouncementStatus = 'draft' | 'scheduled' | 'active' | 'expired'

export type Announcement = {
  id: string
  tenantId: string
  title: string
  content: string
  targetRole: AnnouncementTarget
  status: AnnouncementStatus
  startsAt: string | null
  endsAt: string | null
  createdAt: string
  updatedAt: string
}

export type AnnouncementInput = Pick<
  Announcement,
  'title' | 'content' | 'targetRole' | 'startsAt' | 'endsAt'
>
export type AnnouncementFilters = {
  page: number
  limit: number
  search?: string
  targetRole?: AnnouncementTarget
}
export type PaginatedAnnouncements = {
  data: Announcement[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export function getAnnouncements(
  filters: AnnouncementFilters,
  active: boolean,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  })
  if (!active && filters.search) params.set('search', filters.search)
  if (!active && filters.targetRole)
    params.set('targetRole', filters.targetRole)
  return apiRequest<PaginatedAnnouncements>(
    `/announcements${active ? '/active' : ''}?${params.toString()}`,
    { signal },
  )
}

export function getAnnouncement(id: string, signal?: AbortSignal) {
  return apiRequest<Announcement>(`/announcements/${encodeURIComponent(id)}`, {
    signal,
  })
}

export function createAnnouncement(input: AnnouncementInput) {
  return apiRequest<Announcement>('/announcements', {
    method: 'POST',
    body: input,
  })
}

export function updateAnnouncement(id: string, input: AnnouncementInput) {
  return apiRequest<Announcement>(`/announcements/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deleteAnnouncement(id: string) {
  return apiRequest<void>(`/announcements/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
