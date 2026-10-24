import { X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { RoomDialog } from '@/features/rooms/components/RoomDialog'
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
    <RoomDialog
      isPending={query.isPending}
      onDismiss={dismiss}
      labelledBy="room-edit-loading-title"
    >
      <section className="p-5 sm:p-6">
        <header className="flex items-center justify-between gap-4">
          <h1 id="room-edit-loading-title" className="text-xl font-bold">
            Edit Ruangan
          </h1>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={dismiss}
            aria-label="Tutup dialog edit ruangan"
          >
            <X className="h-5 w-5" />
          </Button>
        </header>
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
            <div className="mt-5 flex gap-2">
              <Button variant="outline" onClick={dismiss}>
                Kembali
              </Button>
              {status !== 404 && status !== 401 && status !== 403 ? (
                <Button onClick={() => void query.refetch()}>Coba lagi</Button>
              ) : null}
            </div>
          </>
        )}
      </section>
    </RoomDialog>
  )
}
