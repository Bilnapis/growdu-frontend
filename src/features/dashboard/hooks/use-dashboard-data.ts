import { useQuery } from '@tanstack/react-query'

import { useSessions } from '@/features/class-sessions/api'
import { useReportSummary } from '@/features/learning-reports/hooks'
import { usePayrollSummary } from '@/features/payroll/hooks'
import { useCurrentUser } from '@/hooks/use-current-user'
import { getStoredAuthUser } from '@/lib/auth-session'
import { hasMenuAccess } from '@/lib/menu-access'
import { getStoredSelectedTenantId } from '@/lib/tenant-session'
import {
  getMonthlyCount,
  getMonthlyInvoiceSummary,
  type MonthlyCountResource,
} from '../api/dashboard-api'
import {
  dashboardMonthRange,
  previousDashboardMonth,
} from '../utils/dashboard-period'

function dashboardTenantId() {
  const user = getStoredAuthUser()
  return user?.role === 'owner'
    ? getStoredSelectedTenantId(user.id)
    : user?.tenantId
}

function useMonthlyCount(
  resource: MonthlyCountResource,
  month: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: [resource, 'summary', 'monthly', dashboardTenantId(), month],
    queryFn: ({ signal }) => getMonthlyCount(resource, month, signal),
    enabled,
  })
}

function useMonthlyInvoices(month: string, enabled: boolean) {
  return useQuery({
    queryKey: ['invoices', dashboardTenantId(), 'summary', 'monthly', month],
    queryFn: ({ signal }) => getMonthlyInvoiceSummary(month, signal),
    enabled,
    refetchInterval: 60_000,
  })
}

export function useDashboardMetrics(month: string) {
  const stored = getStoredAuthUser()
  const current = useCurrentUser()
  const user = stored?.role === 'operator' ? (current.data ?? null) : stored
  const access = {
    invoices: hasMenuAccess(user, 'invoices'),
    payroll: hasMenuAccess(user, 'payroll'),
    students: hasMenuAccess(user, 'students'),
    tutors: hasMenuAccess(user, 'tutors'),
    studyGroups: hasMenuAccess(user, 'study-groups'),
    reports: hasMenuAccess(user, 'reports'),
  }
  const range = dashboardMonthRange(month)
  const previousMonth = previousDashboardMonth(month)
  const previousRange = dashboardMonthRange(previousMonth)
  const invoices = useMonthlyInvoices(month, access.invoices)
  const previousInvoices = useMonthlyInvoices(previousMonth, access.invoices)
  const payroll = usePayrollSummary({ month }, access.payroll)
  const previousPayroll = usePayrollSummary(
    { month: previousMonth },
    access.payroll,
  )
  const students = useMonthlyCount('students', month, access.students)
  const tutors = useMonthlyCount('tutors', month, access.tutors)
  const studyGroups = useMonthlyCount('study-groups', month, access.studyGroups)
  const reports = useReportSummary(month, access.reports)
  const previousReports = useReportSummary(previousMonth, access.reports)
  const savedAttendance = useSessions({
    ...range,
    page: 1,
    limit: 1,
    attendanceStatus: 'saved',
  })
  const pendingAttendance = useSessions({
    ...range,
    page: 1,
    limit: 1,
    attendanceStatus: 'pending',
  })
  const previousAttendance = useSessions({
    ...previousRange,
    page: 1,
    limit: 1,
    attendanceStatus: 'saved',
  })

  return {
    access,
    students,
    invoices,
    previousInvoices,
    payroll,
    previousPayroll,
    tutors,
    studyGroups,
    reports,
    previousReports,
    savedAttendance,
    pendingAttendance,
    previousAttendance,
  }
}

export type DashboardData = ReturnType<typeof useDashboardMetrics>

export function useDashboardSchedule(month: string) {
  return useSessions({ ...dashboardMonthRange(month), page: 1, limit: 5 })
}
