import type { ReactNode } from 'react'

export function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="min-w-0 rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-[1.35]">{title}</h2>
          <p className="mt-1 text-[13px] leading-[1.35] text-[var(--color-muted)]">
            {description}
          </p>
        </div>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}
