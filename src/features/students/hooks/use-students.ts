import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createStudentRegistration,
  getActiveParents,
  getStudents,
  getStudentsSummary,
  type StudentsFilters,
  type StudentUpdateInput,
  updateStudent,
} from '@/features/students/api/students-api'

export const studentsQueryKey = ['students'] as const
const activeParentsQueryKey = ['parents', 'active'] as const

export function useCreateStudentRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStudentRegistration,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentsQueryKey })
      await queryClient.invalidateQueries({ queryKey: activeParentsQueryKey })
    },
  })
}

export function useStudents(filters: StudentsFilters) {
  return useQuery({
    queryKey: [...studentsQueryKey, filters],
    queryFn: ({ signal }) => getStudents(filters, signal),
  })
}

export function useStudentsSummary() {
  return useQuery({
    queryKey: [...studentsQueryKey, 'summary'],
    queryFn: ({ signal }) => getStudentsSummary(signal),
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StudentUpdateInput }) =>
      updateStudent(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentsQueryKey })
    },
  })
}

export function useActiveParents(enabled: boolean) {
  return useQuery({
    queryKey: activeParentsQueryKey,
    queryFn: ({ signal }) => getActiveParents(signal),
    enabled,
    staleTime: 60_000,
  })
}
