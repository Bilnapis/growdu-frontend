import { Outlet } from 'react-router-dom'
import { AnnouncementManagement } from '@/features/announcements/components/AnnouncementManagement'

export function AnnouncementsPage() {
  return (
    <>
      <AnnouncementManagement />
      <Outlet />
    </>
  )
}
