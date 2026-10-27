import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AnnouncementDialog } from '@/features/announcements/components/AnnouncementDialog'
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
    <AnnouncementDialog
      onDismiss={dismiss}
      labelledBy="announcement-edit-title"
    >
      <h1 id="announcement-edit-title" className="text-xl font-bold">
        Ubah Pengumuman
      </h1>
      {query.isPending ? (
        <p role="status" className="my-5 text-sm text-muted-foreground">
          Memuat pengumuman...
        </p>
      ) : (
        <p role="alert" className="my-5 text-sm">
          {announcementErrorMessage(query.error)}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={dismiss}>
          Kembali
        </Button>
        {query.isError ? (
          <Button type="button" onClick={() => void query.refetch()}>
            Coba lagi
          </Button>
        ) : null}
      </div>
    </AnnouncementDialog>
  )
}
