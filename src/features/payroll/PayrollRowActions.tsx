import { Eye, Wallet } from 'lucide-react'

import { TableRowActions } from '@/components/ui/table-row-actions'
import type { PayrollRow } from './api'

export function PayrollRowActions({ payroll }: { payroll: PayrollRow }) {
  return (
    <TableRowActions
      label={payroll.number}
      actions={[
        { label: 'Lihat detail', icon: Eye, to: `/payroll/${payroll.id}` },
        ...(payroll.status !== 'paid'
          ? [
              {
                label: 'Bayar gaji',
                icon: Wallet,
                to: `/payroll/${payroll.id}?action=payment`,
              },
            ]
          : []),
      ]}
    />
  )
}
