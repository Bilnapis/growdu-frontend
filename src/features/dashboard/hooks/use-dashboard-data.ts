import { useSessions } from '@/features/class-sessions/api'
import { useStudentsSummary } from '@/features/students/hooks/use-students'
import { useStudyGroupsSummary } from '@/features/study-groups/hooks/use-study-groups'
import { useTutorsSummary } from '@/features/tutors/hooks/use-tutors'
import { previousMonthDate } from '../utils/metric-comparison'
import {
  useInvoiceAccess,
  useInvoiceSummary,
} from '@/features/invoices/hooks/use-invoices'
import { usePayrollAccess, usePayrollSummary } from '@/features/payroll/hooks'

export function useDashboardMetrics(today: string) {
  const previousDate = previousMonthDate(today)
  const invoiceAccess = useInvoiceAccess()
  const invoices = useInvoiceSummary({}, invoiceAccess)
  const payrollAccess = usePayrollAccess()
  const payroll = usePayrollSummary({ month: today.slice(0, 7) }, payrollAccess)
  const previousPayroll = usePayrollSummary(
    { month: previousDate.slice(0, 7) },
    payrollAccess,
  )
  const students = useStudentsSummary()
  const tutors = useTutorsSummary()
  const studyGroups = useStudyGroupsSummary()
  const savedAttendance = useSessions({
    from: today,
    to: today,
    page: 1,
    limit: 1,
    attendanceStatus: 'saved',
  })
  const pendingAttendance = useSessions({
    from: today,
    to: today,
    page: 1,
    limit: 1,
    attendanceStatus: 'pending',
  })
  const previousAttendance = useSessions({
    from: previousDate,
    to: previousDate,
    page: 1,
    limit: 1,
    attendanceStatus: 'saved',
  })

  return {
    students,
    invoices,
    invoiceAccess,
    payroll,
    previousPayroll,
    payrollAccess,
    tutors,
    studyGroups,
    savedAttendance,
    pendingAttendance,
    previousAttendance,
  }
}

export function useDashboardTodaySchedule(today: string) {
  return useSessions({ from: today, to: today, page: 1, limit: 5 })
}
