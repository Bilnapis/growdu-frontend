import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createTutor,
  getTutors,
  type TutorInput,
  type TutorsFilters,
  updateTutor,
} from '@/features/tutors/api/tutors-api'

export const tutorsQueryKey = ['tutors'] as const

export function useTutors(filters: TutorsFilters) {
  return useQuery({
    queryKey: [...tutorsQueryKey, filters],
    queryFn: ({ signal }) => getTutors(filters, signal),
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
