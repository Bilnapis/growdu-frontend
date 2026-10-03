import { Building2, KeyRound } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <span className="text-xs font-bold uppercase tracking-wider text-primary">
        BimbelKit platform
      </span>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Super Admin
      </h1>
      <p className="mt-2 max-w-2xl leading-6 text-muted-foreground">
        Area operasional internal untuk mengelola layanan BimbelKit lintas tenant.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Menu administrasi">
        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle className="pt-3 text-xl">Manajemen tenant</CardTitle>
            <CardDescription className="leading-6">
              Kelola status dan informasi bimbel dari seluruh tenant dalam satu
              panel saat modul tenant tersedia.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Modul disiapkan sebagai langkah berikutnya.
          </CardContent>
        </Card>

        <Card className="border-dashed bg-slate-50">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-200 text-slate-600">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle className="pt-3 text-xl">Modul berikutnya</CardTitle>
            <CardDescription className="leading-6">
              Pengelolaan akun super-admin dan audit aktivitas dapat ditambahkan
              setelah kebutuhan operasionalnya ditetapkan.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  )
}
