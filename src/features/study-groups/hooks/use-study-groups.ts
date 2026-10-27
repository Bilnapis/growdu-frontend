import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createStudyGroup,
  getStudyGroup,
  getStudyGroups,
  getStudyGroupsSummary,
  updateStudyGroup,
  updateStudyGroupStatus,
  type StudyGroupFilters,
  type StudyGroupInput,
  getStudyGroupFormOptions,
  getStudyGroupStudents,
  type StudyGroupFormOptions,
} from '@/features/study-groups/api/study-groups-api'
import { studentsQueryKey } from '@/features/students/hooks/use-students'
export const studyGroupsQueryKey = ['study-groups'] as const

export function useStudyGroupOptions<K extends keyof StudyGroupFormOptions>(kind: K) {
  return useQuery({
    queryKey: ['study-group-options'],
    queryFn: ({ signal }) => getStudyGroupFormOptions(signal),
    select: (options) => ({ data: options[kind] }),
  })
}

export function useStudyGroupStudents(id: string) {
  return useQuery({
    queryKey: [...studyGroupsQueryKey, id, 'students'],
    queryFn: ({ signal }) => getStudyGroupStudents(id, signal),
    select: (students) => ({ data: students }),
  })
}
export function useStudyGroups(filters: StudyGroupFilters) {
  return useQuery({
    queryKey: [...studyGroupsQueryKey, filters],
    queryFn: ({ signal }) => getStudyGroups(filters, signal),
  })
}
export function useStudyGroupsSummary() {
  return useQuery({
    queryKey: [...studyGroupsQueryKey, 'summary'],
    queryFn: ({ signal }) => getStudyGroupsSummary(signal),
  })
}
export function useStudyGroup(id: string) {
  return useQuery({
    queryKey: [...studyGroupsQueryKey, 'detail', id],
    queryFn: ({ signal }) => getStudyGroup(id, signal),
    enabled: Boolean(id),
  })
}
function useInvalidate() {
  const client = useQueryClient()
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: studyGroupsQueryKey }),
      client.invalidateQueries({ queryKey: studentsQueryKey }),
      client.invalidateQueries({ queryKey: ['rooms'] }),
      client.invalidateQueries({ queryKey: ['class-sessions'] }),
      client.invalidateQueries({ queryKey: ['schedules'] }),
      client.invalidateQueries({ queryKey: ['configurations'] }),
    ])
}
export function useCreateStudyGroup() {
  const invalidate = useInvalidate()
  return useMutation({ mutationFn: createStudyGroup, onSuccess: invalidate })
}
export function useUpdateStudyGroup() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StudyGroupInput }) =>
      updateStudyGroup(id, input),
    onSuccess: invalidate,
  })
}
export function useUpdateStudyGroupStatus() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: 'active' | 'inactive'
    }) => updateStudyGroupStatus(id, status),
    onSuccess: invalidate,
  })
}
