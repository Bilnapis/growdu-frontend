import { X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { TutorDialog } from '@/features/tutors/components/TutorDialog'
import { TutorForm } from '@/features/tutors/components/TutorForm'
import { useTutor } from '@/features/tutors/hooks/use-tutors'
import { ApiError } from '@/services/api-client'

export function TutorEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const query = useTutor(id)
  const status = query.error instanceof ApiError ? query.error.status : null

  if (query.isPending || query.isError || !query.data) {
    const dismiss = () => void navigate('/tutors', { replace: true })

    return (
      <TutorDialog isPending={false} onDismiss={dismiss}>
        <section className="space-y-5">
          <header className="flex items-center justify-between gap-4">
            <h1 id="tutor-form-title" className="text-2xl font-bold">Ubah Data Tentor</h1>
            <button
              type="button"
              aria-label="Tutup modal ubah tentor"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary"
              onClick={dismiss}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </header>
          {query.isPending ? (
            <p role="status" className="text-sm text-muted-foreground">Memuat data tentor...</p>
          ) : (
            <>
              <p role="alert">{status === 404 ? 'Tentor tidak ditemukan.' : status === 401 || status === 403 ? 'Anda tidak memiliki akses ke data tentor ini.' : 'Data tentor belum dapat dimuat.'}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={dismiss}>Kembali ke Data Tentor</Button>
                {status !== 404 && status !== 401 && status !== 403 ? <Button disabled={query.isFetching} onClick={() => void query.refetch()}>Coba lagi</Button> : null}
              </div>
            </>
          )}
        </section>
      </TutorDialog>
    )
  }

  return <TutorForm key={query.data.id} tutor={query.data} />
}
