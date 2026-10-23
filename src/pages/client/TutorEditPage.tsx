import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { TutorForm } from '@/features/tutors/components/TutorForm'
import { useTutor } from '@/features/tutors/hooks/use-tutors'
import { ApiError } from '@/services/api-client'

export function TutorEditPage() {
  const { id = '' } = useParams()
  const query = useTutor(id)
  const status = query.error instanceof ApiError ? query.error.status : null

  if (query.isPending) {
    return <p role="status" className="p-6 text-sm text-muted-foreground">Memuat data tentor...</p>
  }

  if (query.isError || !query.data) {
    return (
      <section className="space-y-4 rounded-lg border border-border bg-card p-5">
        <h1 className="text-2xl font-bold">Ubah Data Tentor</h1>
        <p role="alert">{status === 404 ? 'Tentor tidak ditemukan.' : status === 401 || status === 403 ? 'Anda tidak memiliki akses ke data tentor ini.' : 'Data tentor belum dapat dimuat.'}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/tutors">Kembali ke Data Tentor</Link></Button>
          {status !== 404 && status !== 401 && status !== 403 ? <Button disabled={query.isFetching} onClick={() => void query.refetch()}>Coba lagi</Button> : null}
        </div>
      </section>
    )
  }

  return <TutorForm key={query.data.id} tutor={query.data} />
}
