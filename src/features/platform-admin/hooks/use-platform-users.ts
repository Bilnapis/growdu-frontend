import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createPlatformUser,
  getPlatformTenants,
  getPlatformUser,
  getPlatformUsers,
  resetPlatformUserPassword,
  type CreatePlatformUserInput,
  type PlatformUserFilters,
  type UpdatePlatformUserInput,
  updatePlatformUser,
} from '@/features/platform-admin/api/platform-admin-api'

export const platformUsersQueryKey = ['platform-admin', 'users'] as const
export const platformTenantsQueryKey = ['platform-admin', 'tenants'] as const

export function usePlatformUsers(filters: PlatformUserFilters) {
  return useQuery({
    queryKey: [...platformUsersQueryKey, filters],
    queryFn: ({ signal }) => getPlatformUsers(filters, signal),
  })
}

export function usePlatformUser(id: string) {
  return useQuery({
    queryKey: [...platformUsersQueryKey, id],
    queryFn: ({ signal }) => getPlatformUser(id, signal),
  })
}

export function useUpdatePlatformUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: UpdatePlatformUserInput
    }) => updatePlatformUser(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: platformUsersQueryKey })
    },
  })
}

export function useResetPlatformUserPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetPlatformUserPassword(id, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: platformUsersQueryKey })
    },
  })
}

export function useCreatePlatformUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePlatformUserInput) => createPlatformUser(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: platformUsersQueryKey })
    },
  })
}

export function usePlatformTenants() {
  return useQuery({
    queryKey: platformTenantsQueryKey,
    queryFn: ({ signal }) => getPlatformTenants(signal),
    staleTime: 5 * 60_000,
  })
}
