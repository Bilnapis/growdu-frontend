import { useNavigate, useParams } from 'react-router-dom'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
} from '@/components/ui/dialog'
import { RoomForm } from '@/features/rooms/components/RoomForm'
import { useRoom } from '@/features/rooms/hooks/use-rooms'
import { ApiError } from '@/services/api-client'

export function RoomEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const query = useRoom(id)

  if (query.data) return <RoomForm key={query.data.id} room={query.data} />

  const status = query.error instanceof ApiError ? query.error.status : 0
  const dismiss = () => void navigate('/rooms', { replace: true })
  return (
    <Dialog title="Edit Ruangan" onDismiss={dismiss}>
      <DialogBody>
        {query.isPending ? (
          <p role="status" className="mt-5 text-sm text-muted-foreground">
            Memuat data ruangan...
          </p>
        ) : (
          <>
            <p role="alert" className="mt-5 text-sm">
              {status === 404
                ? 'Ruangan tidak ditemukan.'
                : status === 401 || status === 403
                  ? 'Anda tidak memiliki akses ke ruangan ini.'
                  : 'Data ruangan belum dapat dimuat.'}
            </p>
          </>
        )}
      </DialogBody>
      {!query.isPending ? (
        <DialogFooter>
          <DialogButton variant="outline" onClick={dismiss}>
            Kembali
          </DialogButton>
          {status !== 404 && status !== 401 && status !== 403 ? (
            <DialogButton onClick={() => void query.refetch()}>
              Coba lagi
            </DialogButton>
          ) : null}
        </DialogFooter>
      ) : null}
    </Dialog>
  )
}
