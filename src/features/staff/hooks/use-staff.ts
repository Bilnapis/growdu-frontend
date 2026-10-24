import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createStaff, getStaff, updateStaff, type StaffUpdateInput, type StaffFilters, type StaffInput } from '@/features/staff/api/staff-api'
import { usersQueryKey } from '@/features/users/hooks/use-users'

export const staffQueryKey = ['staff'] as const

export function useStaff(tenantId: string | null, filters: StaffFilters) {
  return useQuery({
    queryKey: [...staffQueryKey, tenantId, filters],
    queryFn: ({ signal }) => {
      if (!tenantId) throw new Error('Bimbel belum dipilih.')
      return getStaff(tenantId, filters, signal)
    },
    enabled: Boolean(tenantId),
  })
}

export function useCreateStaff(tenantId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: StaffInput) => {
      if (!tenantId) throw new Error('Bimbel belum dipilih.')
      return createStaff(tenantId, input)
    },
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...staffQueryKey, tenantId] }),
        queryClient.invalidateQueries({ queryKey: usersQueryKey }),
      ])
    },
  })
}

export function useUpdateStaff(tenantId: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: StaffUpdateInput }) => {
      if (!tenantId) throw new Error('Bimbel belum dipilih.')
      return updateStaff(tenantId, id, input)
    },
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...staffQueryKey, tenantId] }),
        queryClient.invalidateQueries({ queryKey: usersQueryKey }),
      ])
    },
  })
}
