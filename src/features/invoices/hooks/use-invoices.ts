import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getStoredAuthUser } from '@/lib/auth-session'
import { getStoredSelectedTenantId } from '@/lib/tenant-session'
import { hasMenuAccess } from '@/lib/menu-access'
import { useCurrentUser } from '@/hooks/use-current-user'
import {
  getInvoice,
  getInvoices,
  getInvoiceSummary,
  getInvoiceOptions,
  getInvoiceSettings,
  getBillingProfile,
  getInvoiceStudentOptions,
  type InvoiceFilters,
  type InvoiceStudentFilters,
} from '../api/invoices-api'

function invoiceKey() {
  const user = getStoredAuthUser()
  const tenantId =
    user?.role === 'owner' ? getStoredSelectedTenantId(user.id) : user?.tenantId
  return ['invoices', tenantId] as const
}
export function useInvoiceAccess() {
  const stored = getStoredAuthUser()
  const current = useCurrentUser()
  return hasMenuAccess(
    stored?.role === 'operator' ? (current.data ?? null) : stored,
    'invoices',
  )
}
export function useInvoices(filters: InvoiceFilters, enabled = true) {
  return useQuery({
    queryKey: [...invoiceKey(), 'list', filters],
    queryFn: ({ signal }) => getInvoices(filters, signal),
    enabled,
    refetchInterval: 60_000,
  })
}
export function useInvoiceSummary(
  filters: InvoiceFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: [...invoiceKey(), 'summary', filters],
    queryFn: ({ signal }) => getInvoiceSummary(filters, signal),
    enabled,
    refetchInterval: 60_000,
  })
}
export function useInvoice(id: string) {
  return useQuery({
    queryKey: [...invoiceKey(), 'detail', id],
    queryFn: ({ signal }) => getInvoice(id, signal),
    enabled: Boolean(id),
    refetchInterval: 60_000,
  })
}
export function useInvoiceOptions() {
  return useQuery({
    queryKey: [...invoiceKey(), 'options'],
    queryFn: ({ signal }) => getInvoiceOptions(signal),
  })
}
export function useInvoiceSettings(enabled = true) {
  return useQuery({
    queryKey: [...invoiceKey(), 'settings'],
    queryFn: ({ signal }) => getInvoiceSettings(signal),
    enabled,
  })
}
export function useInvoiceStudentOptions(filters: InvoiceStudentFilters) {
  return useQuery({
    queryKey: [...invoiceKey(), 'student-options', filters],
    queryFn: ({ signal }) => getInvoiceStudentOptions(filters, signal),
  })
}
export function useBillingProfile(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [...invoiceKey(), 'billing', id],
    queryFn: ({ signal }) => getBillingProfile(id, signal),
    enabled,
  })
}
export function useInvoiceMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    retry: false,
    onSuccess: async () => {
      await Promise.all(
        ['invoices', 'students', 'study-groups', 'tutor-students'].map((key) =>
          client.invalidateQueries({ queryKey: [key] }),
        ),
      )
    },
  })
}
