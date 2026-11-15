import { apiRequest } from '@/services/api-client'

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue'
export type InvoiceItemKind = 'tuition' | 'charge' | 'discount'
export type BankAccount = {
  bankName: string
  branch: string
  accountNumber: string
  accountHolder: string
}
export type InvoiceSettings = {
  dueDay: number
  graceDays: number
  bankAccount: BankAccount | null
}
export type BillingProfile = {
  studentId: string
  monthlyFee: number | null
  nextInvoicePeriod: string | null
}
export type InvoiceGroup = { id: string; name: string }
export type InvoiceListItem = {
  id: string
  studentId: string
  number: string
  period: string
  studentName: string
  groups: InvoiceGroup[]
  issuedDate: string
  dueDate: string
  suspensionDate: string
  total: number
  status: InvoiceStatus
  version: number
  updatedAt: string
}
export type InvoiceItemInput = {
  kind: InvoiceItemKind
  description: string
  quantity: number
  unitAmount: number
}
export type InvoiceItem = InvoiceItemInput & { id: string; subtotal: number }
export type InvoicePayment = {
  id: string
  amount: number
  paidAt: string
  method: 'cash' | 'bank_transfer'
  reference: string | null
  note: string | null
  recordedByName: string
  proofName: string | null
  reversedAt: string | null
  reversalReason: string | null
}
export type InvoiceEvent = {
  id: string
  type: string
  actorId: string | null
  details: Record<string, unknown>
  createdAt: string
}
export type InvoiceDetail = InvoiceListItem & {
  snapshot: {
    tenantName: string
    tenantAddress: string | null
    studentCode: string
    studentName: string
    educationLevel: string
    school: string
    address: string
    parentName: string | null
    parentPhone: string | null
    parentEmail: string | null
    groups: InvoiceGroup[]
    bankAccount: BankAccount | null
  }
  items: InvoiceItem[]
  payments: InvoicePayment[]
  events: InvoiceEvent[]
  billingBlocked: boolean
  studentStatus: 'active' | 'inactive'
}
export type InvoiceFilters = {
  page?: number
  limit?: number
  search?: string
  period?: string
  status?: InvoiceStatus
  groupId?: string
  studentId?: string
}
export type InvoicePage = {
  data: InvoiceListItem[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
export type InvoiceSummary = {
  total: number
  totalAmount: number
  paid: number
  unpaid: number
  overdue: number
  pending: number
}
export type GenerationResult = {
  created: number
  skippedExisting: number
  skippedMissingFee: number
  period: string
}
export type InvoiceGenerationInput = { dueDate: string; studentId?: string }
export type InvoiceStudentOption = {
  id: string
  name: string
  studentCode: string
  monthlyFee: number | null
}
export type InvoiceStudentFilters = {
  page: number
  limit: number
  search?: string
}
export type InvoiceStudentOptionsPage = {
  data: InvoiceStudentOption[]
  meta: InvoicePage['meta']
}

function params(filters: InvoiceFilters) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters))
    if (value !== undefined && value !== '') query.set(key, String(value))
  return query.toString()
}
export const getInvoices = (filters: InvoiceFilters, signal?: AbortSignal) =>
  apiRequest<InvoicePage>(`/invoices?${params(filters)}`, { signal })
export const getInvoiceSummary = (
  filters: InvoiceFilters,
  signal?: AbortSignal,
) =>
  apiRequest<InvoiceSummary>(`/invoices/summary?${params(filters)}`, { signal })
export const getInvoice = (id: string, signal?: AbortSignal) =>
  apiRequest<InvoiceDetail>(`/invoices/${encodeURIComponent(id)}`, { signal })
export const getInvoiceOptions = (signal?: AbortSignal) =>
  apiRequest<{ groups: InvoiceGroup[] }>('/invoices/options', { signal })
export const getInvoiceSettings = (signal?: AbortSignal) =>
  apiRequest<InvoiceSettings>('/invoices/settings', { signal })
export const saveInvoiceSettings = (
  body: Pick<InvoiceSettings, 'dueDay' | 'graceDays'>,
) =>
  apiRequest<InvoiceSettings>('/invoices/settings', { method: 'PATCH', body })
export const getInvoiceStudentOptions = (
  filters: InvoiceStudentFilters,
  signal?: AbortSignal,
) =>
  apiRequest<InvoiceStudentOptionsPage>(
    `/invoices/student-options?${params(filters)}`,
    { signal },
  )
export const generateInvoices = (body: InvoiceGenerationInput) =>
  apiRequest<GenerationResult>('/invoices/generations', {
    method: 'POST',
    body,
  })
export const saveInvoiceItems = ({
  id,
  version,
  items,
}: {
  id: string
  version: number
  items: InvoiceItemInput[]
}) =>
  apiRequest<InvoiceDetail>(`/invoices/${id}/items`, {
    method: 'PATCH',
    body: { version, items },
  })
export const recordPayment = ({ id, body }: { id: string; body: FormData }) =>
  apiRequest<InvoiceDetail>(`/invoices/${id}/payments`, {
    method: 'POST',
    body,
  })
export const reversePayment = ({
  id,
  paymentId,
  version,
  reason,
}: {
  id: string
  paymentId: string
  version: number
  reason: string
}) =>
  apiRequest<InvoiceDetail>(`/invoices/${id}/payments/${paymentId}/reversals`, {
    method: 'POST',
    body: { version, reason },
  })
export const getBillingProfile = (id: string, signal?: AbortSignal) =>
  apiRequest<BillingProfile>(`/invoices/students/${id}/billing-profile`, {
    signal,
  })
export const saveBillingProfile = ({
  id,
  monthlyFee,
}: {
  id: string
  monthlyFee: number | null
}) =>
  apiRequest<BillingProfile>(`/invoices/students/${id}/billing-profile`, {
    method: 'PATCH',
    body: { monthlyFee },
  })
export const getPaymentAccount = (signal?: AbortSignal) =>
  apiRequest<InvoiceSettings>('/tenants/me/invoice-payment-account', { signal })
export const savePaymentAccount = (bankAccount: BankAccount | null) =>
  apiRequest<InvoiceSettings>('/tenants/me/invoice-payment-account', {
    method: 'PATCH',
    body: { bankAccount },
  })
export const getInvoicePdf = (id: string) =>
  apiRequest<Blob>(`/invoices/${id}/pdf`, { responseType: 'blob' })
export const getPaymentProof = (id: string, paymentId: string) =>
  apiRequest<Blob>(`/invoices/${id}/payments/${paymentId}/proof`, {
    responseType: 'blob',
  })
