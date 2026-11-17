import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { usePayrollAccess, usePayrolls } from './hooks'
import { rangeLabel, rupiah } from './format'
import { PayrollBadge, PayrollError } from './PayrollShared'

export function TutorLatestPayroll({ tutorId }: { tutorId: string }) {
  const access = usePayrollAccess()
  const query = usePayrolls({ tutorId, limit: 1 }, access)
  if (!access)
    return (
      <p className="text-sm text-muted-foreground">
        Akses menu Penggajian diperlukan untuk melihat riwayat.
      </p>
    )
  if (query.isPending)
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Memuat penggajian terakhir...
      </p>
    )
  if (query.isError)
    return (
      <PayrollError error={query.error} retry={() => void query.refetch()} />
    )
  const latest = query.data.data[0]
  return (
    <>
      <div className="space-y-2 rounded-md border bg-muted p-4 text-sm">
        {latest ? (
          <>
            <strong className="block">{latest.number}</strong>
            <p>{rangeLabel(latest)}</p>
            <p className="font-bold">{rupiah(latest.total)}</p>
            <PayrollBadge status={latest.status} />
          </>
        ) : (
          <p>Data penggajian belum tersedia.</p>
        )}
      </div>
      <Button asChild variant="outline" className="w-full">
        <Link
          to={
            latest
              ? `/payroll/${latest.id}`
              : `/payroll?tutorId=${encodeURIComponent(tutorId)}`
          }
        >
          Lihat Penggajian
        </Link>
      </Button>
    </>
  )
}
