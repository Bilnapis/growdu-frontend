import { Outlet } from 'react-router-dom'

import { StudentManagement } from '@/features/students/components/StudentManagement'

export function StudentsPage() {
  return (
    <>
      <StudentManagement />
      <Outlet />
    </>
  )
}
