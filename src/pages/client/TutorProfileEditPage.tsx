import { TutorPageHeader } from '@/components/TutorPageHeader'

import { TutorProfileForm } from '@/features/tutor-account/components/TutorProfileForm'
import { useTutorProfile } from '@/features/tutor-account/hooks/use-tutor-profile'

export function TutorProfileEditPage() {
  const profile = useTutorProfile()

  return (
    <main className="min-h-dvh bg-background pb-6 text-foreground">
      <div className="mx-auto w-full max-w-[430px]">
        <TutorPageHeader
          title="Ubah Data Diri"
          backTo="/tutor/profile"
          backLabel="Kembali ke profil"
        />
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
    </main>
  )
}
