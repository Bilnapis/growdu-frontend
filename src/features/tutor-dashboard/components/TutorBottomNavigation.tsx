import {
  CalendarDays,
  CircleUserRound,
  FileText,
  House,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

type TutorNavigationItem = {
  label: string
  icon: LucideIcon
  to?: string
}

const navigationItems: readonly TutorNavigationItem[] = [
  { label: 'Beranda', icon: House, to: '/tutor/dashboard' },
  { label: 'Siswa', icon: UsersRound },
  { label: 'Jadwal', icon: CalendarDays, to: '/tutor/sessions' },
  { label: 'Laporan', icon: FileText },
  { label: 'Profil', icon: CircleUserRound, to: '/tutor/profile' },
]

function TutorNavigationItem({ item }: { item: TutorNavigationItem }) {
  const { label, icon: Icon, to } = item
  const content = (
    <>
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      <span className="text-[10px] font-extrabold leading-[1.3]">{label}</span>
    </>
  )

  if (!to) {
    return (
      <span
        className="flex min-w-0 flex-col items-center justify-center gap-[3px] rounded-lg px-1 text-muted-foreground"
        aria-label={`${label}, segera tersedia`}
      >
        {content}
      </span>
    )
  }

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex min-w-0 flex-col items-center justify-center gap-[3px] rounded-lg px-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          isActive
            ? 'bg-primary-soft text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`
      }
    >
      {content}
    </NavLink>
  )
}

export function TutorBottomNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t bg-card"
      aria-label="Navigasi tentor"
    >
      <div className="mx-auto grid h-16 w-full max-w-[430px] grid-cols-5 gap-2 px-[18px] py-2">
        {navigationItems.map((item) => (
          <TutorNavigationItem key={item.label} item={item} />
        ))}
      </div>
    </nav>
  )
}
