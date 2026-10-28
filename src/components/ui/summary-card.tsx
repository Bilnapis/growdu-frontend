import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { Card } from '@/components/ui/card'

type SummaryCardTone = 'primary' | 'success' | 'muted' | 'warning' | 'danger'

type SummaryCardProps = {
  icon: LucideIcon
  label: string
  value?: number | string | null
  tone?: SummaryCardTone
}

type SummaryCardGridProps = {
  label: string
  children: ReactNode
  columns?: 2 | 4
  isLoading?: boolean
}

const toneClasses: Record<SummaryCardTone, string> = {
  primary: 'bg-[var(--color-primary-soft)] text-primary-text',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  muted: 'bg-muted text-muted-foreground',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
}

export function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = 'primary',
}: SummaryCardProps) {
  return (
    <Card className="min-w-0 p-4 shadow-none">
      <div className="flex items-center gap-2">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${toneClasses[tone]}`}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <h2 className="min-w-0 break-words text-xs font-bold text-muted-foreground">
          {label}
        </h2>
      </div>
      <p className="mt-1.5 break-words text-[26px] font-bold leading-[1.3]">
        {value ?? '—'}
      </p>
    </Card>
  )
}

export function SummaryCardGrid({
  label,
  children,
  columns = 4,
  isLoading = false,
}: SummaryCardGridProps) {
  return (
    <section
      aria-label={label}
      aria-busy={isLoading}
      className={`mt-5 grid min-w-0 gap-3 sm:grid-cols-2 ${columns === 4 ? 'xl:grid-cols-4' : ''}`}
    >
      {children}
    </section>
  )
}
