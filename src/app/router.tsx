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
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { DashboardLandingPage } from '@/pages/DashboardLandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DashboardModulePlaceholderPage } from '@/pages/DashboardModulePlaceholderPage'
import { PlatformAdminLoginPage } from '@/pages/PlatformAdminLoginPage'
import { PlatformTenantsPage } from '@/pages/PlatformTenantsPage'
import { PlatformUsersPage } from '@/pages/PlatformUsersPage'
import { UserSettingsPage } from '@/pages/UserSettingsPage'
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout'
import { BimbelSelectorPage } from '@/pages/BimbelSelectorPage'

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
