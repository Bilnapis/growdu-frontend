import { Outlet } from 'react-router-dom'
import { RoomManagement } from '@/features/rooms/components/RoomManagement'

export function RoomsPage() {
  return (
    <>
      <RoomManagement />
      <Outlet />
    </>
  )
}
