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
import { StudentsPage } from '@/pages/client/StudentsPage'
import { StudentCreatePage } from '@/pages/client/StudentCreatePage'
import { StudentDetailPage } from '@/pages/client/StudentDetailPage'
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
