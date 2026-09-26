import { Link, useRouteError } from 'react-router-dom'

export function NotFoundPage() {
  const routeError = useRouteError()

  return (
    <main className="not-found-page">
      <span className="eyebrow">404</span>
      <h1>Halaman tidak ditemukan</h1>
      <p>
        {routeError instanceof Error
          ? routeError.message
          : 'Alamat yang kamu buka tidak tersedia.'}
      </p>
      <Link className="primary-link" to="/">
        Kembali ke beranda
      </Link>
    </main>
  )
}

