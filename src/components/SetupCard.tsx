interface SetupCardProps {
  title: string
  description: string
  status?: 'ready' | 'next'
}

export function SetupCard({
  title,
  description,
  status = 'ready',
}: SetupCardProps) {
  const statusLabel = status === 'ready' ? 'Siap' : 'Berikutnya'

  return (
    <article className="setup-card">
      <div className="setup-card__heading">
        <h2>{title}</h2>
        <span className={`status-badge status-badge--${status}`}>
          {statusLabel}
        </span>
      </div>
      <p>{description}</p>
    </article>
  )
}

