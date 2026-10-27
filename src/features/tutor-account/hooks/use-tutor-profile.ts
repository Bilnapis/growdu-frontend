import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getTutorProfile, updateTutorProfile } from '../api/tutor-profile-api'
import { tutorsQueryKey } from '@/features/tutors/hooks/use-tutors'
import { authUserStorageKey, getStoredAuthUser } from '@/lib/auth-session'

export const tutorProfileQueryKey = ['tutor-profile'] as const

export function useTutorProfile() {
  return useQuery({
    queryKey: tutorProfileQueryKey,
    queryFn: ({ signal }) => getTutorProfile(signal),
  })
}

export function useUpdateTutorProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTutorProfile,
    onSuccess: async (tutor) => {
      queryClient.setQueryData(tutorProfileQueryKey, tutor)
      const user = getStoredAuthUser()
      if (user && user.id === tutor.userId) {
        window.localStorage.setItem(
          authUserStorageKey,
          JSON.stringify({
            ...user,
            profileName: tutor.name,
            email: tutor.email ?? user.email,
          }),
        )
      }
      await queryClient.invalidateQueries({ queryKey: tutorsQueryKey })
    },
  })
}
