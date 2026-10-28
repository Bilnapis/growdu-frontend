import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAnnouncements } from '../hooks/use-announcements'
import { announcementErrorMessage } from '../utils/announcements'
import { AnnouncementPagination } from './AnnouncementPagination'

export function DashboardAnnouncements({
  audience,
  className,
  hideWhenEmpty = false,
}: {
  audience: 'admin' | 'tutor'
  className?: string
  hideWhenEmpty?: boolean
}) {
  const [page, setPage] = useState(1)
  const query = useAnnouncements({ page, limit: 5 }, true)

  if (hideWhenEmpty && query.isSuccess && query.data.data.length === 0) {
    return null
  }

  return (
    <section
      className={className}
      aria-labelledby={`announcements-${audience}-title`}
      aria-busy={query.isPending}
    >
      <h2
        id={`announcements-${audience}-title`}
        className="mb-3 text-[15px] font-bold"
      >
        Pengumuman
      </h2>
      {query.isPending ? (
        <div
          role="status"
          className="h-24 animate-pulse rounded-lg border bg-card p-4 text-sm text-muted-foreground"
        >
          Memuat pengumuman...
        </div>
      ) : query.isError ? (
        <div role="alert" className="rounded-lg border bg-card p-4 text-sm">
          <p>{announcementErrorMessage(query.error)}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void query.refetch()}
          >
            Coba lagi
          </Button>
        </div>
      ) : !query.data?.data.length ? (
        <p className="rounded-lg border bg-card p-4 text-[13px] text-muted-foreground">
          Belum ada pengumuman aktif.
        </p>
      ) : (
        <div className="grid gap-3">
          {query.data.data.map((announcement) => (
            <article
              key={announcement.id}
              className="flex min-w-0 items-start gap-3.5 rounded-lg border bg-card p-4"
            >
              <Megaphone
                className="mt-0.5 h-6 w-6 shrink-0 text-primary-text"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <h4 className="break-words text-[14px] font-semibold leading-[1.3]">
                  {announcement.title}
                </h4>
                <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-muted-foreground">
                  {announcement.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
      {query.data ? (
        <AnnouncementPagination
          page={page}
          totalPages={query.data.meta.totalPages}
          onChange={setPage}
        />
      ) : null}
    </section>
  )
}
