import { Link, useRouteError } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const routeError = useRouteError()

  return (
    <main className="grid min-h-screen place-content-center justify-items-start p-6">
      <span className="text-xs font-bold uppercase tracking-wider text-primary">
        404
      </span>
      <h1 className="mt-3 text-3xl font-semibold leading-tight">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        {routeError instanceof Error
          ? routeError.message
          : 'Alamat yang kamu buka tidak tersedia.'}
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Kembali ke beranda</Link>
      </Button>
    </main>
  )
}
