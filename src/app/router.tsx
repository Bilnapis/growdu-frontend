import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AnnouncementsPage } from '@/pages/client/AnnouncementsPage'
import { AnnouncementCreatePage } from '@/pages/client/AnnouncementCreatePage'
import { AnnouncementEditPage } from '@/pages/client/AnnouncementEditPage'
import { SessionsPage } from '@/features/class-sessions/SessionsPage'
import { SessionDetailPage } from '@/features/class-sessions/SessionDetailPage'
import { SessionRecordPage } from '@/features/class-sessions/SessionRecordPage'

import {
  AdminLoginRoute,
  AuthenticatedRoute,
  OwnerRoute,
  PlatformAdminRoute,
  TenantContextRoute,
  TutorRoute,
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
import { TutorDashboardPage } from '@/pages/client/TutorDashboardPage'
import { TutorProfilePage } from '@/pages/client/TutorProfilePage'
import { TutorProfileEditPage } from '@/pages/client/TutorProfileEditPage'
import { TutorBankAccountEditPage } from '@/pages/client/TutorBankAccountEditPage'
import { TutorPasswordEditPage } from '@/pages/client/TutorPasswordEditPage'
import { TutorSchedulePage } from '@/pages/client/TutorSchedulePage'
import { TutorStudentsPage } from '@/pages/client/TutorStudentsPage'
import { TutorStudentDetailPage } from '@/pages/client/TutorStudentDetailPage'
import { TutorsPage } from '@/pages/client/TutorsPage'
import { UserSettingsPage } from '@/pages/client/UserSettingsPage'
import { TenantSettingsPage } from '@/pages/client/TenantSettingsPage'
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
                element: <TutorRoute />,
                children: [
                  {
                    path: 'tutor/dashboard',
                    element: <TutorDashboardPage />,
                  },
                  {
                    path: 'tutor/profile',
                    element: <TutorProfilePage />,
                  },
                  {
                    path: 'tutor/profile/edit',
                    element: <TutorProfileEditPage />,
                  },
                  {
                    path: 'tutor/profile/bank-account',
                    element: <TutorBankAccountEditPage />,
                  },
                  {
                    path: 'tutor/profile/password',
                    element: <TutorPasswordEditPage />,
                  },
                  { path: 'tutor/sessions', element: <TutorSchedulePage /> },
                  { path: 'tutor/students', element: <TutorStudentsPage /> },
                  {
                    path: 'tutor/students/:studentId',
                    element: <TutorStudentDetailPage />,
                  },
                  {
                    path: 'tutor/sessions/:sessionId/record',
                    element: <SessionRecordPage />,
                  },
                ],
              },
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
                        element: <SessionsPage />,
                      },
                      {
                        path: 'schedule/:id',
                        element: <SessionDetailPage />,
                      },
                      {
                        path: 'schedule/:id/record',
                        element: <SessionRecordPage />,
                      },
                      {
                        path: 'announcements',
                        element: <AnnouncementsPage />,
                        children: [
                          { path: 'new', element: <AnnouncementCreatePage /> },
                          { path: ':id/edit', element: <AnnouncementEditPage /> },
                        ],
                      },
                      {
                        path: ':section',
                        element: <DashboardModulePlaceholderPage />,
                      },
                      { path: 'settings', element: <Navigate to="/settings/bimbel" replace /> },
                      { path: 'settings/bimbel', element: <TenantSettingsPage section="bimbel" /> },
                      { path: 'settings/theme', element: <TenantSettingsPage section="theme" /> },
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
