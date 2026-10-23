import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createTutor,
  getTutor,
  getTutorFormOptions,
  getTutors,
  type TutorFormOptions,
  type TutorInput,
  type TutorsFilters,
  updateTutor,
} from '@/features/tutors/api/tutors-api'

export const tutorsQueryKey = ['tutors'] as const
export const tutorFormOptionsQueryKey = [...tutorsQueryKey, 'form-options'] as const

export function useTutors(filters: TutorsFilters) {
  return useQuery({
    queryKey: [...tutorsQueryKey, filters],
    queryFn: ({ signal }) => getTutors(filters, signal),
  })
}

export function useTutorFormOptions() {
  return useQuery<TutorFormOptions>({
    queryKey: tutorFormOptionsQueryKey,
    queryFn: ({ signal }) => getTutorFormOptions(signal),
  })
}

export function useTutor(id: string) {
  return useQuery({
    queryKey: [...tutorsQueryKey, 'detail', id],
    queryFn: ({ signal }) => getTutor(id, signal),
    enabled: Boolean(id),
  })
}

export function useCreateTutor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTutor,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tutorsQueryKey })
    },
  })
}

export function useUpdateTutor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TutorInput }) =>
      updateTutor(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tutorsQueryKey })
    },
  })
}
