import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { TutorPageHeader } from '@/components/TutorPageHeader'
import { Button } from '@/components/ui/button'
import { TablePagination } from '@/components/ui/table-pagination'
import { usePayrolls } from './hooks'
import { dateLabel, rangeLabel, rupiah } from './format'
import { PayrollError, PayrollLoading, PayrollPdfButton } from './PayrollShared'
import { PayrollDetailView } from './PayrollDetailView'

export function TutorPayrollPage() {
  const [params, setParams] = useSearchParams()
  const list = usePayrolls(
    { page: Math.max(1, Number(params.get('page')) || 1), limit: 12 },
    true,
    true,
  )
  return (
    <main className="min-h-dvh bg-background pb-6 text-foreground">
      <TutorPageHeader title="Slip Gaji" />
      <div className="payroll mx-auto max-w-5xl space-y-4 p-5">
        <p className="text-sm text-muted-foreground">
          Slip gaji tersedia setelah pembayaran dicatat oleh admin bimbel.
        </p>
        {list.isPending ? (
          <PayrollLoading />
        ) : list.isError ? (
          <PayrollError error={list.error} retry={() => void list.refetch()} />
        ) : !list.data.data.length ? (
          <div className="payroll-empty payroll-panel">
            <Wallet aria-hidden="true" />
            <h2>Belum ada slip gaji</h2>
            <p>Slip gaji yang sudah dibayar akan muncul di sini.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {list.data.data.map((p) => (
                <article key={p.id} className="payroll-panel space-y-3">
                  <h2 className="font-bold">{p.number}</h2>
                  <p className="text-sm">{rangeLabel(p)}</p>
                  <p className="text-xs text-muted-foreground">
                    Tanggal gaji {dateLabel(p.payDate)} · {p.totalSessions} sesi
                  </p>
                  <strong className="block text-xl">{rupiah(p.total)}</strong>
                  <div className="payroll-actions">
                    <Button asChild size="sm">
                      <Link to={`/tutor/payroll/${p.id}`}>Lihat Slip</Link>
                    </Button>
                    <PayrollPdfButton payroll={p} tutor />
                  </div>
                </article>
              ))}
            </div>
            <TablePagination
              meta={list.data.meta}
              itemLabel="slip gaji"
              ariaLabel="Halaman slip gaji"
              onPageChange={(page) => setParams({ page: String(page) })}
            />
          </>
        )}
      </div>
    </main>
  )
}
export function TutorPayrollDetailPage() {
  const { id = '' } = useParams()
  return (
    <main className="min-h-dvh bg-background pb-6 text-foreground">
      <TutorPageHeader title="Detail Slip Gaji" />
      <div className="mx-auto max-w-6xl p-5">
        <PayrollDetailView id={id} tutor />
      </div>
    </main>
  )
}
