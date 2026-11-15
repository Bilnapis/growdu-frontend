import { Navigate, useParams } from 'react-router-dom'
export function InvoicePaymentPage() {
  const { id = '' } = useParams()
  return <Navigate to={`/invoices/${id}?action=payment`} replace />
}
