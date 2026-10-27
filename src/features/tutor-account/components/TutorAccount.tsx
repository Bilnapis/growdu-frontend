import {
  ChevronRight,
  Landmark,
  LockKeyhole,
  LogOut,
  UserRoundPen,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type AccountMenuItem = {
  label: string
  description: string
  icon: LucideIcon
  to?: string
}

type TutorAccountProps = {
  name: string
  roleLabel: string
  isLoggingOut: boolean
  onLogout: () => void
}

const accountMenuItems: readonly AccountMenuItem[] = [
  {
    label: 'Ubah Data Diri',
    description: 'Perbarui nama dan informasi kontak',
    icon: UserRoundPen,
    to: '/tutor/profile/edit',
  },
  {
    label: 'Ubah Data Rekening',
    description: 'Kelola rekening untuk penggajian',
    icon: Landmark,
    to: '/tutor/profile/bank-account',
  },
  {
    label: 'Ubah Kata Sandi',
    description: 'Amankan akun Anda dengan kata sandi baru',
    icon: LockKeyhole,
    to: '/tutor/profile/password',
  },
]

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return 'T'
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function TutorAccount({
  name,
  roleLabel,
  isLoggingOut,
  onLogout,
}: TutorAccountProps) {
  const navigate = useNavigate()
  return (
    <div className="mx-auto w-full max-w-[430px] px-4 py-[18px]">
      <h1 className="text-xl font-bold leading-tight">Profil</h1>

      <section
        className="mt-5 flex items-center gap-3 rounded-[10px] border bg-card p-4"
        aria-label="Identitas tentor"
      >
        <div
          className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full bg-primary text-[17px] font-bold text-primary-foreground"
          aria-hidden="true"
        >
          {getInitials(name)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold">{name}</h2>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {roleLabel}
          </p>
        </div>
      </section>

      <section className="mt-5" aria-labelledby="account-settings-title">
        <h2
          id="account-settings-title"
          className="text-[11px] font-bold tracking-[0.6px] text-muted-foreground"
        >
          PENGATURAN AKUN
        </h2>
        <div className="mt-2 overflow-hidden rounded-[10px] border bg-card">
          {accountMenuItems.map(
            ({ label, description, icon: Icon, to }, index) => (
              <button
                key={label}
                type="button"
                disabled={!to}
                onClick={() => {
                  if (to) void navigate(to)
                }}
                title={to ? undefined : 'Segera tersedia'}
                className={`flex h-[66px] w-full items-center gap-3 px-3.5 text-left enabled:hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                  index < accountMenuItems.length - 1 ? 'border-b' : ''
                }`}
              >
                <Icon
                  className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    {label}
                  </span>
                  <span className="mt-[3px] block truncate text-[11px] text-muted-foreground">
                    {description}
                  </span>
                </span>
                <ChevronRight
                  className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                {!to ? <span className="sr-only">Segera tersedia</span> : null}
              </button>
            ),
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2.5 rounded-lg border border-danger bg-card text-sm font-semibold text-danger transition-colors hover:bg-danger-bg focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
      >
        <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
        {isLoggingOut ? 'Keluar...' : 'Keluar'}
      </button>

      <p className="mt-5 text-center text-[11px] text-muted-foreground">
        BimbelKit v1.0.0
      </p>
    </div>
  )
}
