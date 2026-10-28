import { TutorPageHeader } from '@/components/TutorPageHeader'

import { TutorPasswordForm } from '@/features/tutor-account/components/TutorPasswordForm'

export function TutorPasswordEditPage() {
  return (
    <main className="min-h-dvh bg-background pb-6 text-foreground">
      <div className="mx-auto w-full max-w-[430px]">
        <TutorPageHeader
          title="Ubah Kata Sandi"
          backTo="/tutor/profile"
          backLabel="Kembali ke profil"
        />
        <TutorPasswordForm />
      </div>
    </main>
  )
}
