import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RoomListItem } from '@/features/rooms/api/rooms-api'
import {
  useDeleteRoom,
  useUpdateRoomStatus,
} from '@/features/rooms/hooks/use-rooms'
import { ApiError } from '@/services/api-client'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
  DialogForm,
} from '@/components/ui/dialog'

export function RoomActionDialog({
  room,
  action,
  onClose,
}: {
  room: RoomListItem
  action: 'status' | 'delete'
  onClose: () => void
}) {
  const navigate = useNavigate()
  const statusMutation = useUpdateRoomStatus()
  const deleteMutation = useDeleteRoom()
  const [error, setError] = useState<string | null>(null)
  const pending = statusMutation.isPending || deleteMutation.isPending
  const willDeactivate = room.status === 'active'
  const title =
    action === 'delete'
      ? `Hapus ${room.name} (${room.code})?`
      : willDeactivate
        ? `Nonaktifkan ${room.name} (${room.code})?`
        : `Aktifkan ${room.name} (${room.code})?`

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const options = {
      onSuccess: () => {
        if (action === 'delete') {
          void navigate('/rooms', {
            replace: true,
            state: { roomFlash: 'Data ruangan berhasil dihapus.' },
          })
        } else {
          onClose()
        }
      },
      onError: (reason: unknown) =>
        setError(
          reason instanceof ApiError
            ? reason.message
            : 'Perubahan ruangan belum dapat diproses.',
        ),
    }

    if (action === 'delete') deleteMutation.mutate(room.id, options)
    else {
      statusMutation.mutate(
        { id: room.id, status: willDeactivate ? 'inactive' : 'active' },
        options,
      )
    }
  }

  return (
    <Dialog
      title={title}
      description={
        action === 'delete'
          ? 'Ruangan hanya dapat dihapus jika belum pernah digunakan oleh jadwal kelompok belajar.'
          : willDeactivate
            ? 'Menonaktifkan ruangan akan mencegah penjadwalan baru. Jadwal terdahulu tetap tersimpan.'
            : 'Ruangan aktif dapat dipilih kembali saat membuat atau mengubah jadwal.'
      }
      isPending={pending}
      onDismiss={onClose}
    >
      <DialogForm onSubmit={submit}>
        <DialogBody>
          {willDeactivate &&
          action === 'status' &&
          room.activeGroupCount > 0 ? (
            <div className="mt-5 rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4 text-sm text-[var(--color-danger)]">
              <p className="font-bold">Peringatan Operasional:</p>
              <p className="mt-1 leading-5">
                Ruangan ini digunakan oleh {room.activeGroupCount} kelompok
                aktif ({room.activeStudentCount} siswa). Alihkan jadwal ke
                ruangan lain bila diperlukan.
              </p>
            </div>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <DialogButton
            type="button"
            variant="outline"
            disabled={pending}
            onClick={onClose}
          >
            Batal
          </DialogButton>
          <DialogButton
            type="submit"
            variant={
              action === 'delete' || willDeactivate ? 'destructive' : 'default'
            }
            disabled={pending}
          >
            {pending
              ? 'Memproses...'
              : action === 'delete'
                ? 'Ya, Hapus Ruangan'
                : willDeactivate
                  ? 'Ya, Nonaktifkan Ruangan'
                  : 'Aktifkan Ruangan'}
          </DialogButton>
        </DialogFooter>
      </DialogForm>
    </Dialog>
  )
}
