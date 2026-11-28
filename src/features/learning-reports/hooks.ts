import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { getStoredAuthUser } from '@/lib/auth-session'
import { getStoredSelectedTenantId } from '@/lib/tenant-session'
import {
  getReportGroup,
  getReportGroups,
  getReportSettings,
  getReportSummary,
  type ReportFilters,
} from './api'

export function reportKey() {
  const user = getStoredAuthUser()
  return [
    'learning-reports',
    user?.role === 'owner'
      ? getStoredSelectedTenantId(user.id)
      : user?.tenantId,
    user?.role,
    user?.id,
  ] as const
}
export function useReportGroups(filters: ReportFilters) {
  return useQuery({
    queryKey: [...reportKey(), 'groups', filters],
    queryFn: ({ signal }) => getReportGroups(filters, signal),
    refetchInterval: 60_000,
  })
}
export function useReportSummary(period: string, enabled = true) {
  return useQuery({
    queryKey: [...reportKey(), 'summary', period],
    queryFn: ({ signal }) => getReportSummary(period, signal),
    enabled,
    refetchInterval: 60_000,
  })
}
export function useReportGroup(id: string, period: string) {
  return useQuery({
    queryKey: [...reportKey(), 'group', id, period],
    queryFn: ({ signal }) => getReportGroup(id, period, signal),
    enabled: Boolean(id),
  })
}
export function useReportSettings(enabled: boolean) {
  return useQuery({
    queryKey: [...reportKey(), 'settings'],
    queryFn: ({ signal }) => getReportSettings(signal),
    enabled,
  })
}
export function useReportMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
) {
  const client = useQueryClient()
  const key = reportKey()
  return useMutation({
    mutationFn,
    retry: false,
    onSettled: async () => {
      await client.invalidateQueries({ queryKey: key })
    },
  })
}

export function useReportGroupOptions(period: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: [...reportKey(), 'group-options', period],
    queryFn: ({ signal, pageParam }) =>
      getReportGroups({ period, page: pageParam, limit: 100 }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    enabled,
  })
}
