import { useNavigate, useParams } from 'react-router-dom'

import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
} from '@/components/ui/dialog'
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
      <Dialog title="Ubah Data Tentor" onDismiss={dismiss}>
        <DialogBody>
          {query.isPending ? (
            <p role="status" className="text-sm text-muted-foreground">
              Memuat data tentor...
            </p>
          ) : (
            <>
              <p role="alert">
                {status === 404
                  ? 'Tentor tidak ditemukan.'
                  : status === 401 || status === 403
                    ? 'Anda tidak memiliki akses ke data tentor ini.'
                    : 'Data tentor belum dapat dimuat.'}
              </p>
            </>
          )}
        </DialogBody>
        {!query.isPending ? (
          <DialogFooter>
            <DialogButton variant="outline" onClick={dismiss}>
              Kembali ke Data Tentor
            </DialogButton>
            {status !== 404 && status !== 401 && status !== 403 ? (
              <DialogButton
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
              >
                Coba lagi
              </DialogButton>
            ) : null}
          </DialogFooter>
        ) : null}
      </Dialog>
    )
  }

  return <TutorForm key={query.data.id} tutor={query.data} />
}
