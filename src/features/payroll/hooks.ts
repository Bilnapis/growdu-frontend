import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getStoredAuthUser } from '@/lib/auth-session'
import { getStoredSelectedTenantId } from '@/lib/tenant-session'
import { useCurrentUser } from '@/hooks/use-current-user'
import { hasMenuAccess } from '@/lib/menu-access'
import {
  getPayroll,
  getPayrolls,
  getPayrollSummary,
  getPayrollSettings,
  getPayrollPeriods,
  getPayrollTutors,
  type PayrollFilters,
} from './api'

function payrollKey() {
  const user = getStoredAuthUser()
  return [
    'payroll',
    user?.role === 'owner'
      ? getStoredSelectedTenantId(user.id)
      : user?.tenantId,
    user?.id,
  ] as const
}
export function usePayrollAccess() {
  const stored = getStoredAuthUser()
  const current = useCurrentUser()
  return hasMenuAccess(
    stored?.role === 'operator' ? (current.data ?? null) : stored,
    'payroll',
  )
}
export function usePayrolls(
  filters: PayrollFilters,
  enabled = true,
  tutor = false,
) {
  return useQuery({
    queryKey: [...payrollKey(), 'list', tutor, filters],
    queryFn: ({ signal }) => getPayrolls(filters, signal, tutor),
    enabled,
    refetchInterval: 60_000,
  })
}
export function usePayroll(id: string, tutor = false) {
  return useQuery({
    queryKey: [...payrollKey(), 'detail', tutor, id],
    queryFn: ({ signal }) => getPayroll(id, signal, tutor),
    enabled: Boolean(id),
    refetchInterval: 60_000,
  })
}
export function usePayrollSummary(
  filters: PayrollFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: [...payrollKey(), 'summary', filters],
    queryFn: ({ signal }) => getPayrollSummary(filters, signal),
    enabled,
    refetchInterval: 60_000,
  })
}
export function usePayrollSettings() {
  return useQuery({
    queryKey: [...payrollKey(), 'settings'],
    queryFn: ({ signal }) => getPayrollSettings(signal),
  })
}
export function usePayrollPeriods() {
  return useQuery({
    queryKey: [...payrollKey(), 'periods'],
    queryFn: ({ signal }) => getPayrollPeriods(signal),
    refetchInterval: 60_000,
  })
}
export function usePayrollTutors(search: string, page = 1) {
  return useQuery({
    queryKey: [...payrollKey(), 'tutors', search, page],
    queryFn: ({ signal }) => getPayrollTutors(search, page, signal),
  })
}
export function usePayrollMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    retry: false,
    onSuccess: async () => {
      await Promise.all(
        ['payroll', 'class-sessions'].map((key) =>
          client.invalidateQueries({ queryKey: [key] }),
        ),
      )
    },
  })
}
