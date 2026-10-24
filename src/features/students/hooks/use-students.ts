import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createStudentRegistration,
  getActiveParents,
  getStudent,
  getStudentParents,
  getStudents,
  getStudentsSummary,
  type StudentsFilters,
  type StudentUpdateInput,
  updateStudent,
  type StudentRegistrationUpdateInput,
  updateStudentRegistration,
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

export function useStudent(id: string) {
  return useQuery({
    queryKey: [...studentsQueryKey, 'detail', id],
    queryFn: ({ signal }) => getStudent(id, signal),
    enabled: Boolean(id),
  })
}

export function useStudentParents(id: string) {
  return useQuery({
    queryKey: [...studentsQueryKey, 'detail', id, 'parents'],
    queryFn: ({ signal }) => getStudentParents(id, signal),
    enabled: Boolean(id),
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

export function useUpdateStudentRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: StudentRegistrationUpdateInput
    }) => updateStudentRegistration(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentsQueryKey })
      await queryClient.invalidateQueries({ queryKey: activeParentsQueryKey })
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
