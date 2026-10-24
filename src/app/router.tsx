import { Navigate, createBrowserRouter } from 'react-router-dom'

import {
  AdminLoginRoute,
  AuthenticatedRoute,
  OwnerRoute,
  PlatformAdminRoute,
  TenantContextRoute,
  UnauthenticatedRoute,
} from '@/app/route-guards'
import { AdminLayout } from '@/features/admin/components/AdminLayout'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { PlatformAdminLoginPage } from '@/pages/admin/PlatformAdminLoginPage'
import { PlatformTenantsPage } from '@/pages/admin/PlatformTenantsPage'
import { PlatformUsersPage } from '@/pages/admin/PlatformUsersPage'
import { BimbelSelectorPage } from '@/pages/client/BimbelSelectorPage'
import { DashboardLandingPage } from '@/pages/client/DashboardLandingPage'
import { DashboardModulePlaceholderPage } from '@/pages/client/DashboardModulePlaceholderPage'
import { DashboardPage } from '@/pages/client/DashboardPage'
import { LoginPage } from '@/pages/client/LoginPage'
import { RoomCreatePage } from '@/pages/client/RoomCreatePage'
import { RoomDetailPage } from '@/pages/client/RoomDetailPage'
import { RoomEditPage } from '@/pages/client/RoomEditPage'
import { RoomsPage } from '@/pages/client/RoomsPage'
import { SchedulePage } from '@/pages/client/SchedulePage'
import { ScheduleDetailPage } from '@/pages/client/ScheduleDetailPage'
import { StudentsPage } from '@/pages/client/StudentsPage'
import { StudentCreatePage } from '@/pages/client/StudentCreatePage'
import { StudentDetailPage } from '@/pages/client/StudentDetailPage'
import { StudyGroupDetailPage } from '@/pages/client/StudyGroupDetailPage'
import { StudyGroupFormPage } from '@/pages/client/StudyGroupFormPage'
import { StudyGroupsPage } from '@/pages/client/StudyGroupsPage'
import { StaffCreatePage } from '@/pages/client/StaffCreatePage'
import { StaffDetailPage } from '@/pages/client/StaffDetailPage'
import { StaffPage } from '@/pages/client/StaffPage'
import { TutorCreatePage } from '@/pages/client/TutorCreatePage'
import { TutorDetailPage } from '@/pages/client/TutorDetailPage'
import { TutorEditPage } from '@/pages/client/TutorEditPage'
import { TutorsPage } from '@/pages/client/TutorsPage'
import { UserSettingsPage } from '@/pages/client/UserSettingsPage'
import { NotFoundPage } from '@/pages/shared/NotFoundPage'
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        element: <AuthenticatedRoute />,
        children: [
          {
            element: <OwnerRoute />,
            children: [
              {
                path: 'bimbel/select',
                element: <BimbelSelectorPage />,
              },
            ],
          },
          {
            element: <TenantContextRoute />,
            children: [
              {
                element: <DashboardLandingPage />,
                children: [
                  {
                    element: <DashboardLayout />,
                    children: [
                      {
                        path: 'dashboard',
                        element: <DashboardPage />,
                      },
                      {
                        path: 'students',
                        element: <StudentsPage />,
                        children: [
                          { path: 'new', element: <StudentCreatePage /> },
                        ],
                      },
                      {
                        path: 'students/:id',
                        element: <StudentDetailPage />,
                      },
                      {
                        path: 'tutors',
                        element: <TutorsPage />,
                        children: [
                          { path: 'new', element: <TutorCreatePage /> },
                          { path: ':id/edit', element: <TutorEditPage /> },
                        ],
                      },
                      {
                        path: 'tutors/:id',
                        element: <TutorDetailPage />,
                      },
                      {
                        path: 'staff',
                        element: <StaffPage />,
                        children: [
                          { path: 'new', element: <StaffCreatePage /> },
                        ],
                      },
                      {
                        path: 'staff/:id',
                        element: <StaffDetailPage />,
                      },
                      {
                        path: 'study-groups',
                        element: <StudyGroupsPage />,
                      },
                      {
                        path: 'study-groups/new',
                        element: <StudyGroupFormPage />,
                      },
                      {
                        path: 'study-groups/:id/edit',
                        element: <StudyGroupFormPage />,
                      },
                      {
                        path: 'study-groups/:id',
                        element: <StudyGroupDetailPage />,
                      },
                      {
                        path: 'rooms',
                        element: <RoomsPage />,
                        children: [
                          { path: 'new', element: <RoomCreatePage /> },
                          { path: ':id/edit', element: <RoomEditPage /> },
                        ],
                      },
                      {
                        path: 'rooms/:id',
                        element: <RoomDetailPage />,
                      },
                      {
                        path: 'schedule',
                        element: <SchedulePage />,
                      },
                      {
                        path: 'schedule/:id',
                        element: <ScheduleDetailPage />,
                      },
                      {
                        path: ':section',
                        element: <DashboardModulePlaceholderPage />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        element: <UnauthenticatedRoute />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
        ],
      },
      {
        element: <AdminLoginRoute />,
        children: [
          {
            path: 'admin/login',
            element: <PlatformAdminLoginPage />,
          },
        ],
      },
      {
        element: <PlatformAdminRoute />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <AdminDashboardPage />,
              },
              {
                path: 'users',
                element: <PlatformUsersPage />,
              },
              {
                path: 'tenants',
                element: <PlatformTenantsPage />,
              },
            ],
          },
        ],
      },
      {
        element: <OwnerRoute />,
        children: [
          {
            path: 'settings/users',
            element: <UserSettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
