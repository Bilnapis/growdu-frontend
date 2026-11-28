import { Eye, Pencil, UserCheck, UserX } from 'lucide-react'

import { TableRowActions } from '@/components/ui/table-row-actions'
import type { StaffMember } from '@/features/staff/api/staff-api'

type Action = 'detail' | 'edit' | 'status'

export function StaffRowActions({
  staff,
  onAction,
}: {
  staff: StaffMember
  onAction: (action: Action) => void
}) {
  const isActive = staff.status === 'active'

  return (
    <TableRowActions
      label={staff.name}
      actions={[
        {
          label: 'Lihat detail',
          icon: Eye,
          onSelect: () => onAction('detail'),
        },
        {
          label: 'Ubah data & hak akses',
          icon: Pencil,
          onSelect: () => onAction('edit'),
        },
        {
          label: isActive ? 'Nonaktifkan pegawai' : 'Aktifkan pegawai',
          icon: isActive ? UserX : UserCheck,
          tone: isActive ? 'danger' : 'success',
          onSelect: () => onAction('status'),
        },
      ]}
    />
  )
}
