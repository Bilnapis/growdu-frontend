import type { RouteObject } from 'react-router-dom'

export function learningReportRoutes(prefix: string): RouteObject[] {
  return [
    {
      path: prefix,
      lazy: async () => ({
        Component: (await import('./ReportsListPage')).ReportsListPage,
      }),
    },
    {
      path: prefix + '/new',
      lazy: async () => ({
        Component: (await import('./ReportFormPage')).ReportFormPage,
      }),
    },
    {
      path: prefix + '/:groupId',
      lazy: async () => ({
        Component: (await import('./ReportDetailPage')).ReportDetailPage,
      }),
    },
    {
      path: prefix + '/:groupId/edit',
      lazy: async () => ({
        Component: (await import('./ReportFormPage')).ReportFormPage,
      }),
    },
  ]
}
