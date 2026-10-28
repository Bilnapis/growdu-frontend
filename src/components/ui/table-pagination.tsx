import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

type TablePaginationProps = {
  meta: { page: number; limit: number; total: number; totalPages: number }
  itemLabel: string
  ariaLabel: string
  onPageChange: (page: number) => void
}

export function TablePagination({
  meta,
  itemLabel,
  ariaLabel,
  onPageChange,
}: TablePaginationProps) {
  const start = Math.min(
    Math.max(meta.page - 1, 1),
    Math.max(1, meta.totalPages - 2),
  )
  const pages = Array.from(
    { length: Math.min(3, meta.totalPages) },
    (_, index) => start + index,
  )

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 px-3 py-4 text-xs text-muted-foreground">
      <span>
        Menampilkan {(meta.page - 1) * meta.limit + 1}-
        {Math.min(meta.page * meta.limit, meta.total)} dari {meta.total}{' '}
        {itemLabel}
      </span>
      <nav aria-label={ariaLabel} className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="Halaman sebelumnya"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        {pages.map((page) => (
          <Button
            type="button"
            key={page}
            variant={page === meta.page ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            aria-label={`Halaman ${page}`}
            aria-current={page === meta.page ? 'page' : undefined}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="Halaman berikutnya"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </nav>
    </footer>
  )
}
