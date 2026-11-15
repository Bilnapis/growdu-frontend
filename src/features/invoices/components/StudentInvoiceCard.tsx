import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { Student } from '@/features/students/api/students-api'
import {
  useBillingProfile,
  useInvoiceAccess,
  useInvoices,
  useInvoiceSettings,
} from '../hooks/use-invoices'
import { dateLabel, periodLabel, rupiah } from '../invoice-format'
import { InvoiceError, InvoicePanel, InvoiceStatusBadge } from './InvoiceShared'
import { GenerateInvoicesDialog } from './InvoiceDialogs'
import '../invoices.css'

export function StudentInvoiceCard({
  student,
}: {
  student: Pick<Student, 'id' | 'name' | 'status'>
}) {
  const studentId = student.id
  const [isGenerating, setIsGenerating] = useState(false)
  const [notice, setNotice] = useState('')
  const access = useInvoiceAccess()
  const invoices = useInvoices({ studentId, page: 1, limit: 1 }, access)
  const profile = useBillingProfile(studentId, access)
  const settings = useInvoiceSettings(access)
  if (!access) return null
  const latest = invoices.data?.data[0]
  return (
    <div className="invoices invoice-stack">
      <InvoicePanel
        title="Invoice SPP Terakhir"
        description="Ringkasan tagihan SPP terbaru siswa."
      >
        {notice ? (
          <p role="status" className="invoice-success">
            {notice}
          </p>
        ) : null}
        {invoices.isPending ? (
          <p role="status" className="text-sm">
            Memuat invoice...
          </p>
        ) : invoices.isError ? (
          <InvoiceError
            error={invoices.error}
            retry={() => void invoices.refetch()}
          />
        ) : latest ? (
          <div className="space-y-3 text-sm">
            <strong>{latest.number}</strong>
            <p>
              {periodLabel(latest.period)} · {rupiah(latest.total)}
            </p>
            <InvoiceStatusBadge status={latest.status} />
            <p className="text-xs text-muted-foreground">
              Jatuh tempo {dateLabel(latest.dueDate)}
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/invoices/${latest.id}`}>Lihat Invoice SPP</Link>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada invoice SPP untuk siswa ini.
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          disabled={
            student.status !== 'active' ||
            profile.data?.monthlyFee == null ||
            !settings.data
          }
          onClick={() => setIsGenerating(true)}
        >
          Generate Invoice Siswa
        </Button>
        {student.status !== 'active' ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Invoice baru hanya dapat dibuat untuk siswa aktif.
          </p>
        ) : profile.data?.monthlyFee == null ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Simpan tarif SPP sebelum membuat invoice siswa.
          </p>
        ) : null}
        {settings.isError ? (
          <InvoiceError
            error={settings.error}
            retry={() => void settings.refetch()}
          />
        ) : null}
        <Button asChild variant="link" className="mt-3 px-0">
          <Link to={`/invoices?studentId=${studentId}&period=`}>
            Semua invoice siswa
          </Link>
        </Button>
      </InvoicePanel>
      {isGenerating && settings.data ? (
        <GenerateInvoicesDialog
          settings={settings.data}
          student={{ id: student.id, name: student.name }}
          onClose={() => setIsGenerating(false)}
          onGenerated={setNotice}
        />
      ) : null}
    </div>
  )
}
