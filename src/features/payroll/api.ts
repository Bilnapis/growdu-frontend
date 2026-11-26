import { apiRequest } from '@/services/api-client'

export type PayrollStatus = 'paid' | 'unpaid' | 'overdue'
export type PayrollPeriod = {
  id: string
  startDate: string
  endDate: string
  payDate: string
  generatedAt: string | null
}
export type PayrollSettings = {
  payday: number
  enabled: boolean
  configured: boolean
  nextPeriod: PayrollPeriod | null
}
export type PayrollFilters = {
  page?: number
  limit?: number
  search?: string
  month?: string
  periodId?: string
  tutorId?: string
  status?: PayrollStatus
}
export type PayrollRow = {
  id: string
  tutorId: string
  periodId: string
  number: string
  tutorName: string
  startDate: string
  endDate: string
  payDate: string
  issuedDate: string
  total: string
  totalSessions: number
  baseRate: string | null
  status: PayrollStatus
  version: number
}
export type PayrollItem = {
  id: string
  studyGroupId: string | null
  kind: 'teaching' | 'addition' | 'deduction'
  description: string
  sourceCount: number
  sessionAdjustment: number
  quantity: number
  correctionReason: string | null
  rate: string
  subtotal: string
}
export type PayrollPayment = {
  id: string
  amount: string
  paidAt: string
  method: 'cash' | 'bank_transfer'
  reference: string | null
  note: string | null
  recordedByName: string
  proofName: string | null
  reversedAt: string | null
  reversalReason: string | null
}
export type PayrollDetail = PayrollRow & {
  sources: {
    sessionId: string
    sessionDate: string
    studyGroupId: string
    studyGroupName: string
    version: number
  }[]
  defaultRate: string
  sourceChanged: boolean
  snapshot: {
    tenantName: string
    tenantAddress: string | null
    tutorName: string
    tutorPhone: string
    tutorEmail: string | null
    subject: string | null
    bankName: string | null
    accountName: string | null
    accountNumber: string | null
  }
  items: PayrollItem[]
  payments: PayrollPayment[]
  events: {
    id: string
    type: string
    actorId: string | null
    details: Record<string, unknown>
    createdAt: string
  }[]
}
export type PayrollSummary = {
  total: number
  totalAmount: string
  paid: number
  unpaid: number
  overdue: number
  paidAmount: string
}
export type PayrollPage = {
  data: PayrollRow[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
export type TutorOptions = {
  data: {
    id: string
    name: string
    sessionRate: string
    status: 'active' | 'inactive'
  }[]
  meta: PayrollPage['meta']
}
export type TeachingInput = {
  id: string
  quantity: number
  rate: string
  correctionReason?: string
}
export type AdjustmentInput = {
  kind: 'addition' | 'deduction'
  description: string
  amount: string
}
export type GenerationResult = {
  periodId: string
  created: number
  skippedExisting: number
  skippedMissingRate: number
  skippedNoSessions: number
}

function params(filters: PayrollFilters) {
  const result = new URLSearchParams()
  for (const [key, value] of Object.entries(filters))
    if (value !== undefined && value !== '') result.set(key, String(value))
  return result.toString()
}
export const getPayrolls = (
  filters: PayrollFilters,
  signal?: AbortSignal,
  tutor = false,
) =>
  apiRequest<PayrollPage>(
    `${tutor ? '/tutor' : ''}/payroll?${params(filters)}`,
    { signal },
  )
export const getPayroll = (id: string, signal?: AbortSignal, tutor = false) =>
  apiRequest<PayrollDetail>(
    `${tutor ? '/tutor' : ''}/payroll/${encodeURIComponent(id)}`,
    { signal },
  )
export const getPayrollSummary = (
  filters: PayrollFilters,
  signal?: AbortSignal,
) =>
  apiRequest<PayrollSummary>(`/payroll/summary?${params(filters)}`, { signal })
export const getPayrollSettings = (signal?: AbortSignal) =>
  apiRequest<PayrollSettings>('/payroll/settings', { signal })
export const getPayrollPeriods = (signal?: AbortSignal) =>
  apiRequest<PayrollPeriod[]>('/payroll/periods', { signal })
export const getPayrollTutors = (
  search: string,
  page: number,
  signal?: AbortSignal,
) =>
  apiRequest<TutorOptions>(
    `/payroll/tutor-options?${params({ search, page, limit: 20 })}`,
    { signal },
  )
export const savePayrollSettings = (body: {
  payday: number
  enabled: boolean
}) =>
  apiRequest<PayrollSettings>('/payroll/settings', { method: 'PATCH', body })
export const generatePayroll = (body: {
  sessionMonth: string
  tutorId?: string
}) =>
  apiRequest<GenerationResult>('/payroll/generations/by-month', {
    method: 'POST',
    body,
  })
export const savePayrollItems = ({
  id,
  ...body
}: {
  id: string
  version: number
  teaching: TeachingInput[]
  adjustments: AdjustmentInput[]
}) =>
  apiRequest<PayrollDetail>(`/payroll/${id}/items`, { method: 'PATCH', body })
export const recalculatePayroll = ({
  id,
  version,
}: {
  id: string
  version: number
}) =>
  apiRequest<PayrollDetail>(`/payroll/${id}/recalculations`, {
    method: 'POST',
    body: { version },
  })
export const recordPayrollPayment = ({
  id,
  body,
}: {
  id: string
  body: FormData
}) =>
  apiRequest<PayrollDetail>(`/payroll/${id}/payments`, { method: 'POST', body })
export const reversePayrollPayment = ({
  id,
  paymentId,
  ...body
}: {
  id: string
  paymentId: string
  version: number
  reason: string
}) =>
  apiRequest<PayrollDetail>(`/payroll/${id}/payments/${paymentId}/reversals`, {
    method: 'POST',
    body,
  })
export const getPayrollPdf = (id: string, tutor = false, paymentId?: string) =>
  apiRequest<Blob>(
    `${tutor ? '/tutor' : ''}/payroll/${id}${paymentId ? `/payments/${paymentId}` : ''}/pdf`,
    { responseType: 'blob' },
  )
export const getPayrollProof = (id: string, paymentId: string) =>
  apiRequest<Blob>(`/payroll/${id}/payments/${paymentId}/proof`, {
    responseType: 'blob',
  })
export const getPayrollExport = (filters: PayrollFilters) =>
  apiRequest<Blob>(`/payroll/export?${params(filters)}`, {
    responseType: 'blob',
  })
