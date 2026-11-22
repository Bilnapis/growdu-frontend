import { apiRequest } from '@/services/api-client'

export type ReportStatus =
  'unfilled' | 'draft' | 'partially_published' | 'published'
export interface ReportContent {
  material: string
  progress: string
  followUp: string
  parentNote: string
}
export interface ReportStudent {
  id: string
  name: string
  school: string
  educationLevel: string
  status: 'present' | 'excused' | 'sick' | 'absent' | null
}
export interface ReportSession {
  id: string
  version: number
  date: string
  status: 'scheduled' | 'completed'
  students: ReportStudent[]
}
export interface ReportSnapshot {
  tenantName: string
  groupName: string
  tutorName: string
  subject: string
  sessions: ReportSession[]
}
export interface ReportNote {
  studentId: string
  note: string
}
export interface ReportRevision {
  id: string
  number: number
  content: ReportContent
  snapshot: ReportSnapshot | null
  publishedAt: string | null
  notes: ReportNote[]
}
export interface ReportAttendance {
  present: number
  excused: number
  sick: number
  absent: number
  pending: number
  sessions: number
  recorded: number
  percentage: number | null
}
export interface ReportContribution {
  required: boolean
  id: string | null
  tutorId: string
  tutorName: string
  version: number
  canEdit: boolean
  revising: boolean
  sourceChanged: boolean
  live: ReportSnapshot | null
  attendance: ReportAttendance
  draft: ReportRevision | null
  published: ReportRevision | null
  history: { number: number; publishedAt: string | null }[]
  events: {
    action: string
    reason: string | null
    revision: number
    createdAt: string
  }[]
}
export interface ReportGroup {
  id: string
  name: string
  period: string
  status: ReportStatus
  required: number
  published: number
  tutorNames: string
  studentCount: number
  sessionCount: number
}
export interface ReportGroupDetail {
  studentCount: number
  sessionCount: number
  id: string
  name: string
  period: string
  status: ReportStatus
  required: number
  published: number
  contributions: ReportContribution[]
}
export interface ReportFilters {
  period: string
  search?: string
  status?: ReportStatus
  page?: number
  limit?: number
}
export interface ReportGeneration {
  period: string
  created: number
  skipped: number
}
export interface ReportSettings {
  enabled: boolean
  generationDay: number
  version: number
  nextRunDate: string | null
  lastRunAt: string | null
  lastResult: (ReportGeneration & { processedAt: string }) | null
}
export interface ReportMutation {
  id: string
  version: number
}
export interface ReportPage {
  data: ReportGroup[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
const root = '/learning-reports'
export const getReportGroups = (filters: ReportFilters, signal?: AbortSignal) =>
  apiRequest<ReportPage>(root + '/groups', { params: filters, signal })
export const getReportSummary = (period: string, signal?: AbortSignal) =>
  apiRequest<{ total: number; published: number; pending: number }>(
    root + '/summary',
    { params: { period }, signal },
  )
export const getReportGroup = (
  id: string,
  period: string,
  signal?: AbortSignal,
) =>
  apiRequest<ReportGroupDetail>(root + '/groups/' + id, {
    params: { period },
    signal,
  })
export const createReport = (body: {
  studyGroupId: string
  tutorId: string
  period: string
}) => apiRequest<ReportMutation>(root, { method: 'POST', body })
export const saveReport = ({
  id,
  ...body
}: ReportContent & { id: string; version: number; notes: ReportNote[] }) =>
  apiRequest<ReportMutation>(root + '/' + id, { method: 'PATCH', body })
export const publishReport = ({
  id,
  version,
}: {
  id: string
  version: number
}) =>
  apiRequest<ReportMutation>(root + '/' + id + '/publications', {
    method: 'POST',
    body: { version },
  })
export const reviseReport = ({
  id,
  ...body
}: {
  id: string
  version: number
  reason: string
}) =>
  apiRequest<ReportMutation>(root + '/' + id + '/revisions', {
    method: 'POST',
    body,
  })
export const getReportSettings = (signal?: AbortSignal) =>
  apiRequest<ReportSettings>(root + '/settings', { signal })
export const saveReportSettings = (
  body: Pick<ReportSettings, 'enabled' | 'generationDay' | 'version'>,
) => apiRequest<ReportSettings>(root + '/settings', { method: 'PATCH', body })
export const generateReports = (period: string) =>
  apiRequest<ReportGeneration>(root + '/generations', {
    method: 'POST',
    body: { period },
  })
export const getReportPdf = (id: string, period: string, studentId?: string) =>
  apiRequest<Blob>(root + '/groups/' + id + '/pdf', {
    params: { period, studentId },
    responseType: 'blob',
  })
