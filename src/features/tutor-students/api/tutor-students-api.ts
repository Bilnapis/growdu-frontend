import { useQuery } from '@tanstack/react-query'

import { ApiError, apiRequest } from '@/services/api-client'

export type TutorStudent = {
  id: string
  name: string
  school: string
  educationLevel: string
  studyGroups: { id: string; name: string }[]
}

type TutorStudentsResponse = {
  data: TutorStudent[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export type TutorStudentDetail = TutorStudent & {
  gender: 'male' | 'female'
}

export function useTutorStudent(id: string) {
  return useQuery({
    queryKey: ['students', 'mine', 'detail', id],
    queryFn: ({ signal }) =>
      apiRequest<TutorStudentDetail>(
        `/students/mine/${encodeURIComponent(id)}`,
        {
          signal,
        },
      ),
    enabled: Boolean(id),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && [403, 404].includes(error.status)) &&
      failureCount < 2,
  })
}

export function useTutorStudents(page: number, search: string) {
  return useQuery({
    queryKey: ['students', 'mine', { page, search }],
    queryFn: ({ signal }) => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)

      return apiRequest<TutorStudentsResponse>(`/students/mine?${params}`, {
        signal,
      })
    },
  })
}
