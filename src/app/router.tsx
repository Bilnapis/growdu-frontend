import { Navigate, createBrowserRouter } from 'react-router-dom'

import {
  AdminLoginRoute,
  AuthenticatedRoute,
  OwnerRoute,
  PlatformAdminRoute,
  UnauthenticatedRoute,
} from '@/app/route-guards'
import { AdminLayout } from '@/features/admin/components/AdminLayout'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlatformAdminLoginPage } from '@/pages/PlatformAdminLoginPage'
import { PlatformUsersPage } from '@/pages/PlatformUsersPage'
import { SetupPage } from '@/pages/SetupPage'
import { UserSettingsPage } from '@/pages/UserSettingsPage'

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
            path: 'dashboard',
            element: <SetupPage />,
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
