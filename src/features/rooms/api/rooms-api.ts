import { apiRequest } from '@/services/api-client'

export type RoomStatus = 'active' | 'inactive'
export type RoomCapacityCategory = 'small' | 'medium' | 'large'

export type RoomListItem = {
  id: string
  name: string
  code: string
  capacity: number
  status: RoomStatus
  activeGroupCount: number
  activeStudentCount: number
  todaySessionCount: number
  todayStartTime: string | null
  todayEndTime: string | null
}

export type RoomSchedule = {
  id: string
  tutorId: string
  tutorName: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

export type RoomStudyGroup = {
  id: string
  name: string
  studentCount: number
  schedules: RoomSchedule[]
}

export type Room = RoomListItem & {
  tenantId: string
  studyGroups: RoomStudyGroup[]
  createdAt: string
  updatedAt: string
}

export type RoomInput = {
  name: string
  code: string
  capacity: number
}

export type RoomFilters = {
  page: number
  limit: number
  search?: string
  status?: RoomStatus
  capacityCategory?: RoomCapacityCategory
}

export type RoomsSummary = {
  activeRooms: number
  sessionsToday: number
  totalCapacity: number
  inactiveRooms: number
}

export type PaginatedRooms = {
  data: RoomListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function getRooms(filters: RoomFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  })
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.capacityCategory) {
    params.set('capacityCategory', filters.capacityCategory)
  }

  return apiRequest<PaginatedRooms>(`/rooms?${params.toString()}`, { signal })
}

export function getRoomsSummary(signal?: AbortSignal) {
  return apiRequest<RoomsSummary>('/rooms/summary', { signal })
}

export function getRoom(id: string, signal?: AbortSignal) {
  return apiRequest<Room>(`/rooms/${encodeURIComponent(id)}`, { signal })
}

export function createRoom(input: RoomInput) {
  return apiRequest<Room>('/rooms', { method: 'POST', body: input })
}

export function updateRoom(id: string, input: RoomInput) {
  return apiRequest<Room>(`/rooms/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: input,
  })
}

export function updateRoomStatus(id: string, status: RoomStatus) {
  return apiRequest<Room>(`/rooms/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export function deleteRoom(id: string) {
  return apiRequest<void>(`/rooms/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
