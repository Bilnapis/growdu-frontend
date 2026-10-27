import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { TutorPasswordForm } from '@/features/tutor-account/components/TutorPasswordForm'
import { TutorBottomNavigation } from '@/features/tutor-dashboard/components/TutorBottomNavigation'

export function TutorPasswordEditPage() {
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
          <h1 className="text-base font-bold">Ubah Kata Sandi</h1>
        </header>
        <TutorPasswordForm />
      </div>
      <TutorBottomNavigation />
    </main>
  )
}
