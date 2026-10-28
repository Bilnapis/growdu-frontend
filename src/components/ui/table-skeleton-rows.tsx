import { cn } from '@/lib/utils'

type TableSkeletonRowsProps = {
  columns: number
  rows?: number
  label: string
  rowClassName?: string
  cellClassName?: string
}

export function TableSkeletonRows({
  columns,
  rows = 5,
  label,
  rowClassName,
  cellClassName,
}: TableSkeletonRowsProps) {
  return (
    <>
      <tr>
        <td colSpan={columns} className="p-0">
          <span role="status" className="sr-only">
            {label}
          </span>
        </td>
      </tr>
      {Array.from({ length: rows }, (_, row) => (
        <tr
          key={row}
          aria-hidden="true"
          className={cn('h-[70px] bg-card', rowClassName)}
        >
          {Array.from({ length: columns }, (_, column) => (
            <td key={column} className={cn('px-[18px] py-3', cellClassName)}>
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
