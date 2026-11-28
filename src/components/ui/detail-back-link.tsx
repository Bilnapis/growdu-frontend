import { Link } from 'react-router-dom'

export function DetailBackLink({
  to,
  children,
}: {
  to: string
  children: string
}) {
  return (
    <Link
      to={to}
      className="mb-[var(--space-3)] inline-block text-xs text-[var(--color-primary-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <span aria-hidden="true">← </span>
      {children}
    </Link>
  )
}
