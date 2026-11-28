import { apiRequest } from '@/services/api-client'
import type { InvoiceSummary } from '@/features/invoices/api/invoices-api'

export type MonthlyCount = {
  count: number | null
  previousMonthCount: number | null
}

export type MonthlyInvoiceSummary = InvoiceSummary & {
  paidAmount: number
  unpaidAmount: number
  overdueAmount: number
  receivedAmount: number
}

export type MonthlyCountResource = 'students' | 'tutors' | 'study-groups'

export function getMonthlyCount(
  resource: MonthlyCountResource,
  month: string,
  signal?: AbortSignal,
) {
  return apiRequest<MonthlyCount>(`/${resource}/monthly-summary`, {
    params: { month },
    signal,
  })
}

export function getMonthlyInvoiceSummary(month: string, signal?: AbortSignal) {
  return apiRequest<MonthlyInvoiceSummary>('/invoices/monthly-summary', {
    params: { month },
    signal,
  })
}
