import { createBrowserRouter } from 'react-router-dom'

import { NotFoundPage } from '@/pages/NotFoundPage'
import { SetupPage } from '@/pages/SetupPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SetupPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

