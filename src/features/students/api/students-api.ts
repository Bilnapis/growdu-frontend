import { apiRequest } from '@/services/api-client'

export type EntityStatus = 'active' | 'inactive'
export type StudentGender = 'male' | 'female'

export type StudentRegistrationInput = {
  name: string
  gender: StudentGender
  educationLevel: string
  school: string
  phoneNumber?: string
  address: string
  status: EntityStatus
  relationship: 'guardian'
} & (
  | {
      parentSource: 'new'
      newParent: {
        name: string
        phoneNumber: string
        email: string
        password: string
      }
    }
  | {
      parentSource: 'existing'
      parentId: string
    }
)

export type Student = {
  id: string
  tenantId: string
  studentCode: string
  name: string
  gender: StudentGender
  educationLevel: string
  school: string
  phoneNumber: string | null
  address: string
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

export type StudentPrimaryParent = {
  parentId: string
  parentName: string
  parentPhoneNumber: string
  parentContactEmail: string
  relationship: 'father' | 'mother' | 'guardian'
  isPrimary: boolean
  accessStatus: EntityStatus
}

export type StudentListItem = Student & {
  primaryParent: StudentPrimaryParent | null
}

export type StudentsFilters = {
  page: number
  limit: number
  search?: string
  status?: EntityStatus
  educationStage?: 'SD' | 'SMP' | 'SMA'
}

export type StudentUpdateInput = {
  name?: string
  gender?: StudentGender
  educationLevel?: string
  school?: string
  phoneNumber?: string | null
  address?: string
  status?: EntityStatus
}

type PaginatedStudentsResponse = {
  data: StudentListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type StudentsSummary = {
  active: number
  inactive: number
  missingParentContact: number
  withoutGroup: number
}

export type Parent = {
  id: string
  tenantId: string
  userId: string | null
  name: string
  phoneNumber: string
  contactEmail: string
  status: EntityStatus
  createdAt: string
  updatedAt: string
}

type PaginatedParentsResponse = {
  data: Parent[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function createStudentRegistration(input: StudentRegistrationInput) {
  return apiRequest<{ student: Student; parentId: string }>(
    '/students/registrations',
    {
      method: 'POST',
      body: input,
    },
  )
}

export function getStudents(filters: StudentsFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  })
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.educationStage) {
    params.set('educationStage', filters.educationStage)
  }

  return apiRequest<PaginatedStudentsResponse>(
    `/students?${params.toString()}`,
    { signal },
  )
}

export function getStudentsSummary(signal?: AbortSignal) {
  return apiRequest<StudentsSummary>('/students/summary', { signal })
}

export function updateStudent(id: string, input: StudentUpdateInput) {
  return apiRequest<Student>(`/students/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: input,
  })
}

export function getActiveParents(signal?: AbortSignal) {
  return apiRequest<PaginatedParentsResponse>(
    '/parents?page=1&limit=100&status=active',
    { signal },
  )
}
