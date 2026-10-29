import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Dialog,
  DialogBody,
  DialogButton,
  DialogFooter,
} from '@/components/ui/dialog'
import { AnnouncementForm } from '@/features/announcements/components/AnnouncementForm'
import { useAnnouncement } from '@/features/announcements/hooks/use-announcements'
import { announcementErrorMessage } from '@/features/announcements/utils/announcements'

export function AnnouncementEditPage() {
  const { id = '' } = useParams()
  const { search } = useLocation()
  const navigate = useNavigate()
  const query = useAnnouncement(id)
  const dismiss = () =>
    void navigate(`/announcements${search}`, { replace: true })
  if (query.isSuccess)
    return <AnnouncementForm key={query.data.id} announcement={query.data} />
  return (
    <Dialog
      title="Ubah Pengumuman"
      onDismiss={dismiss}
      returnFocusSelector="[data-announcement-trigger]"
    >
      <DialogBody>
        {query.isPending ? (
          <p role="status" className="my-5 text-sm text-muted-foreground">
            Memuat pengumuman...
          </p>
        ) : (
          <p role="alert" className="my-5 text-sm">
            {announcementErrorMessage(query.error)}
          </p>
        )}
      </DialogBody>
      <DialogFooter>
        <DialogButton type="button" variant="outline" onClick={dismiss}>
          Kembali
        </DialogButton>
        {query.isError ? (
          <DialogButton type="button" onClick={() => void query.refetch()}>
            Coba lagi
          </DialogButton>
        ) : null}
      </DialogFooter>
    </Dialog>
  )
}
