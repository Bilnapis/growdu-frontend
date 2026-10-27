import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AnnouncementPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1 && page === 1) return null
  return (
    <nav
      aria-label="Halaman pengumuman"
      className="mt-4 flex flex-wrap items-center justify-end gap-3 text-xs text-muted-foreground"
    >
      <span aria-live="polite">
        Halaman {page} dari {Math.max(totalPages, 1)}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="h-4 w-4" /> Sebelumnya
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Halaman berikutnya"
      >
        Berikutnya <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
