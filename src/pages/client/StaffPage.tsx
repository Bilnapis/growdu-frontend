import { Outlet } from 'react-router-dom'

import { StaffManagement } from '@/features/staff/components/StaffManagement'

export function StaffPage() {
  return (
    <>
      <StaffManagement />
      <Outlet />
    </>
  )
}
