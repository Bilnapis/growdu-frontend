import { Navigate, useParams } from 'react-router-dom'
import { PayrollManagement } from '@/features/payroll/PayrollManagement'
import { PayrollDetailView } from '@/features/payroll/PayrollDetailView'
export function PayrollPage() {
  return <PayrollManagement />
}
export function PayrollDetailPage() {
  const { id = '' } = useParams()
  return <PayrollDetailView id={id} />
}
export function PayrollPaymentPage() {
  const { id = '' } = useParams()
  return <Navigate to={`/payroll/${id}?action=payment`} replace />
}
