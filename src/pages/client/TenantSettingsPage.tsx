import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCurrentTenant } from '@/features/tenant-context/hooks/use-owned-tenants'
import { TenantIdentityForm } from '@/features/tenant-settings/components/TenantIdentityForm'
import { TenantThemeForm } from '@/features/tenant-settings/components/TenantThemeForm'
import '@/features/tenant-settings/tenant-settings.css'

export function TenantSettingsPage({
  section,
}: {
  section: 'bimbel' | 'theme'
}) {
  const tenantQuery = useCurrentTenant()
  const tenant = tenantQuery.data
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        {section === 'theme' ? 'Pengaturan Warna Tema' : 'Pengaturan'}
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {section === 'theme'
          ? 'Atur warna utama yang digunakan pada tombol, menu aktif, dan elemen penting sistem.'
          : 'Pilih submenu untuk mengubah data bimbel atau warna tema.'}
      </p>
      <div className="tenant-settings-layout mt-7">
        <nav className="tenant-settings-nav" aria-label="Submenu pengaturan">
          <NavLink to="/settings/bimbel">Data Bimbel</NavLink>
          <NavLink to="/settings/theme">Warna Tema</NavLink>
        </nav>
        <div className="min-w-0">
          {tenantQuery.isError && tenant ? (
            <div
              role="alert"
              className="mb-4 rounded-md border border-border bg-card p-4 text-sm"
            >
              <p>
                Data terbaru belum dapat dimuat. Isian Anda tetap tersimpan di
                form ini.
              </p>
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => void tenantQuery.refetch()}
              >
                Coba lagi
              </Button>
            </div>
          ) : null}
          {tenant ? (
            section === 'theme' ? (
              <TenantThemeForm
                key={`${tenant.id}-theme`}
                primaryColor={tenant.primaryColor}
                tenantName={tenant.name}
              />
            ) : (
              <TenantIdentityForm key={tenant.id} tenant={tenant} />
            )
          ) : tenantQuery.isPending ? (
            <section
              className="tenant-settings-panel animate-pulse"
              aria-busy="true"
            >
              <p role="status">Memuat pengaturan bimbel...</p>
            </section>
          ) : (
            <section className="tenant-settings-panel" role="alert">
              <h2 className="text-lg font-semibold">
                Pengaturan belum dapat dimuat
              </h2>
              <p className="my-3 text-sm text-muted-foreground">
                Periksa koneksi dan akses bimbel Anda lalu coba kembali.
              </p>
              <Button
                variant="outline"
                onClick={() => void tenantQuery.refetch()}
              >
                Coba lagi
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
