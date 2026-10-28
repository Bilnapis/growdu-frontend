import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

type TutorPageHeaderProps = {
  title: string
  backLabel?: string
} & (
  | { backTo?: string; onBack?: never }
  | { backTo?: never; onBack: () => void }
)

const backButtonClassName =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

export function TutorPageHeader({
  title,
  backLabel = 'Kembali ke dashboard',
  backTo = '/tutor/dashboard',
  onBack,
}: TutorPageHeaderProps) {
  return (
    <header className="grid h-[52px] grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-2.5 border-b bg-card px-4">
      {onBack ? (
        <button
          type="button"
          aria-label={backLabel}
          className={backButtonClassName}
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <Link
          to={backTo}
          aria-label={backLabel}
          className={backButtonClassName}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
      <h1 className="min-w-0 text-center text-base font-bold">
        {title}
      </h1>
    </header>
  )
}
