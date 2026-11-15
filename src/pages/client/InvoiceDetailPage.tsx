import { useParams } from 'react-router-dom'
import { InvoiceDetailView } from '@/features/invoices/components/InvoiceDetailView'
export function InvoiceDetailPage() {
  const { id = '' } = useParams()
  return <InvoiceDetailView id={id} />
}
