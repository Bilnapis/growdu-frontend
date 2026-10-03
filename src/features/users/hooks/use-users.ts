import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getUsers,
  resetUserPassword,
  type UpdateUserInput,
  updateUser,
  type UsersFilters,
} from '@/features/users/api/users-api'

export const usersQueryKey = ['users'] as const

export function useUsers(filters: UsersFilters) {
  return useQuery({
    queryKey: [...usersQueryKey, filters],
    queryFn: ({ signal }) => getUsers(filters, signal),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
    },
  })
}

export function useResetUserPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetUserPassword(id, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
    },
  })
}
