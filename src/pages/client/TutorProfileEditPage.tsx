import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { TutorProfileForm } from '@/features/tutor-account/components/TutorProfileForm'
import { useTutorProfile } from '@/features/tutor-account/hooks/use-tutor-profile'
import { TutorBottomNavigation } from '@/features/tutor-dashboard/components/TutorBottomNavigation'

export function TutorProfileEditPage() {
  const profile = useTutorProfile()

  return (
    <main className="min-h-dvh bg-background pb-24 text-foreground">
      <div className="mx-auto w-full max-w-[430px]">
        <header className="relative flex h-[52px] items-center justify-center border-b bg-card px-4">
          <Link
            to="/tutor/profile"
            aria-label="Kembali ke profil"
            className="absolute left-4 grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <h1 className="text-base font-bold">Ubah Data Diri</h1>
        </header>
        {profile.isPending ? (
          <div
            role="status"
            className="px-4 pt-4 text-sm text-muted-foreground"
          >
            Memuat data diri...
          </div>
        ) : profile.isError ? (
          <div className="space-y-3 p-4">
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              Data diri belum dapat dimuat.
            </p>
            <button
              type="button"
              onClick={() => void profile.refetch()}
              disabled={profile.isFetching}
              className="rounded-md border bg-card px-3 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <TutorProfileForm key={profile.data.id} tutor={profile.data} />
        )}
      </div>
      <TutorBottomNavigation />
    </main>
  )
}
