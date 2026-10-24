import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  CalendarDays,
  DoorOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Receipt,
  Settings,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'

import { cn } from '@/lib/utils'

export type SidebarClientItemId =
  | 'dashboard'
  | 'students'
  | 'tutors'
  | 'staff'
  | 'study-groups'
  | 'schedule'
  | 'rooms'
  | 'invoices'
  | 'payroll'
  | 'reports'
  | 'announcements'
  | 'settings'

type SidebarClientItem = {
  id: SidebarClientItemId
  label: string
  icon: LucideIcon
}

const sidebarClientItems: readonly SidebarClientItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Siswa & Orang Tua', icon: Users },
  { id: 'tutors', label: 'Tentor', icon: GraduationCap },
  { id: 'staff', label: 'User/Pegawai', icon: UserCog },
  { id: 'study-groups', label: 'Kelompok Belajar', icon: BookOpen },
  { id: 'schedule', label: 'Jadwal', icon: CalendarDays },
  { id: 'rooms', label: 'Ruangan', icon: DoorOpen },
  { id: 'invoices', label: 'Invoice SPP', icon: Receipt },
  { id: 'payroll', label: 'Penggajian', icon: Wallet },
  { id: 'reports', label: 'Laporan', icon: FileText },
  { id: 'announcements', label: 'Pengumuman', icon: Megaphone },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
]

type SidebarClientProps = {
  activeItem: SidebarClientItemId
  onItemSelect: (itemId: SidebarClientItemId) => void
  tenantName: string
  tenantLogoUrl?: string | null
  userRole?: string | null
  className?: string
}

export function SidebarClient({
  activeItem,
  onItemSelect,
  tenantName,
  tenantLogoUrl,
  userRole,
  className,
}: SidebarClientProps) {
  const roleLabel = getRoleLabel(userRole)

  return (
    <aside
      className={cn(
        'w-full shrink-0 border-b border-border bg-card p-5 lg:min-h-screen lg:w-[264px] lg:border-b-0 lg:border-r',
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        {tenantLogoUrl ? (
          <img
            src={tenantLogoUrl}
            alt={`Logo ${tenantName}`}
            className="h-[38px] w-[38px] shrink-0 rounded-lg border border-border object-cover"
          />
        ) : (
          <div
            className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-lg bg-primary text-base font-bold leading-[1.3] text-primary-foreground"
            aria-hidden="true"
          >
            {getInitials(tenantName)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm text-base font-bold leading-[1.2] text-foreground">
            {tenantName}
          </p>
          <p className="mt-0.5 truncate text-xs leading-[1.2] text-muted-foreground">
            {roleLabel}
          </p>
        </div>
      </div>

      <nav className="mt-[18px]" aria-label="Navigasi operasional bimbel">
        <ul className="grid gap-1">
          {sidebarClientItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeItem === id

            return (
              <li key={id}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] font-semibold leading-[1.3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onItemSelect(id)}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

function getInitials(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('id-ID')

  return initials || 'GD'
}

function getRoleLabel(role: string | null | undefined) {
  switch (role) {
    case 'owner':
      return 'Owner'
    case 'operator':
      return 'Operator'
    case 'tutor':
      return 'Tutor'
    case 'parent':
      return 'Orang Tua'
    default:
      return 'Pengguna'
  }
}
