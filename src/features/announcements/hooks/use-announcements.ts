import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getStoredAuthUser } from '@/lib/auth-session'
import { getStoredSelectedTenantId } from '@/lib/tenant-session'
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  type AnnouncementFilters,
  type AnnouncementInput,
} from '../api/announcements-api'

function useAnnouncementScope() {
  const user = getStoredAuthUser()
  const tenantId =
    user?.role === 'owner' ? getStoredSelectedTenantId(user.id) : user?.tenantId
  return {
    key: ['announcements', user?.id, tenantId, user?.role] as const,
    enabled: Boolean(user && tenantId),
  }
}

const refreshOptions = {
  refetchInterval: 60_000,
  refetchOnWindowFocus: 'always' as const,
}

export function useAnnouncements(filters: AnnouncementFilters, active = false) {
  const scope = useAnnouncementScope()
  return useQuery({
    queryKey: [...scope.key, active ? 'active' : 'list', filters],
    queryFn: ({ signal }) => getAnnouncements(filters, active, signal),
    enabled: scope.enabled,
    ...refreshOptions,
  })
}

export function useAnnouncement(id: string) {
  const scope = useAnnouncementScope()
  return useQuery({
    queryKey: [...scope.key, 'detail', id],
    queryFn: ({ signal }) => getAnnouncement(id, signal),
    enabled: scope.enabled && Boolean(id),
  })
}

export function useAnnouncementMutations() {
  const scope = useAnnouncementScope()
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: scope.key })
  const create = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: AnnouncementInput }) =>
      updateAnnouncement(id, input),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: invalidate,
  })
  return { create, update, remove }
}
