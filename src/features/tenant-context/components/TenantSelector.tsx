import { ArrowRight, Check, CircleHelp, LogOut, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type OwnedTenant } from "@/features/tenant-context/api/tenant-context-api";

type TenantSelectorProps = {
  displayName: string;
  tenants: OwnedTenant[];
  selectedTenantId: string | null;
  isSelecting: boolean;
  isSigningOut: boolean;
  onSelect: (tenantId: string) => void;
  onSignOut: () => void;
};

const monogramStyles = [
  "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-[var(--color-success)]",
] as const;

export function TenantSelector({
  displayName,
  tenants,
  selectedTenantId,
  isSelecting,
  isSigningOut,
  onSelect,
  onSignOut,
}: TenantSelectorProps) {
  const initials = getInitials(displayName);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] px-4 py-5 text-[var(--color-text)] sm:px-8 sm:py-8 lg:px-[4.5rem]">
      <div
        className="pointer-events-none absolute -right-44 -top-52 h-[37.5rem] w-[37.5rem] rounded-full bg-[rgb(217_236_255_/_0.55)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-72 -left-44 h-[31.25rem] w-[31.25rem] rounded-full bg-[var(--color-primary-soft)]"
        aria-hidden="true"
      />

      <header className="relative mx-auto flex max-w-[81rem] items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-[2.375rem] w-[2.375rem] place-items-center rounded-lg bg-[var(--color-primary)] text-sm font-bold text-white">
            GD
          </span>
          <span className="flex flex-col leading-tight">
            <strong className="text-base">GrowDu</strong>
            <span className="text-xs text-[var(--color-muted)]">
              Operasional Bimbel
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-right text-xs sm:flex sm:flex-col">
            <strong className="text-[var(--color-text)]">{displayName}</strong>
            <span className="text-[var(--color-muted)]">Owner</span>
          </span>
          <span className="grid h-[2.375rem] w-[2.375rem] place-items-center rounded-full bg-[var(--color-primary-soft)] text-xs font-extrabold text-[var(--color-primary-dark)]">
            {initials}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[var(--color-muted)] hover:text-[var(--color-text)]"
            aria-label="Keluar dari akun"
            disabled={isSigningOut}
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <section
        className="relative mx-auto flex max-w-[63.75rem] flex-col items-center pt-16 text-center sm:pt-20"
        aria-labelledby="tenant-selector-title"
      >
        <h1
          id="tenant-selector-title"
          className="mt-2 text-[2rem] font-bold leading-tight tracking-tight sm:text-[2.125rem]"
        >
          Pilih bimbel untuk mulai bekerja
        </h1>
        <p className="mt-2 max-w-[43.75rem] text-sm leading-6 text-[var(--color-muted)]">
          Kamu memiliki akses ke beberapa unit bimbingan belajar. Pilih satu
          untuk membuka dashboard dan mengelola operasionalnya.
        </p>

        <div
          className="mt-8 grid w-full grid-cols-[minmax(0,25rem)] justify-center gap-8 md:grid-cols-[repeat(auto-fit,minmax(22rem,25rem))]"
          aria-label="Daftar bimbel"
        >
          {tenants.map((tenant, index) => {
            const isSelected = tenant.id === selectedTenantId;

            return (
              <article
                key={tenant.id}
                className={`flex min-h-[19.375rem] flex-col rounded-md bg-[var(--color-surface)] p-[1.375rem] text-left transition-shadow ${
                  isSelected
                    ? "border-2 border-[var(--color-primary)] shadow-[0_8px_18px_rgb(31_143_229_/_0.15)]"
                    : "border border-[var(--color-border)]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {tenant.logoUrl ? (
                    <img
                      src={tenant.logoUrl}
                      alt={`Logo ${tenant.name}`}
                      className="h-12 w-12 rounded-md border border-[var(--color-border)] object-cover"
                    />
                  ) : (
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-md text-[0.9375rem] font-extrabold ${monogramStyles[index % monogramStyles.length]}`}
                    >
                      {getInitials(tenant.name)}
                    </span>
                  )}
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-2 py-1 text-[0.6875rem] font-bold text-[var(--color-primary-dark)]">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      Terakhir dibuka
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-[1.125rem] text-[1.1875rem] font-bold leading-snug">
                  {tenant.name}
                </h2>
                <p className="mt-2 flex min-h-10 items-start gap-1.5 text-[0.8125rem] leading-5 text-[var(--color-muted)]">
                  <MapPin
                    className="mt-0.5 h-[0.9375rem] w-[0.9375rem] shrink-0"
                    aria-hidden="true"
                  />
                  <span>{tenant.address ?? "Alamat bimbel belum diatur"}</span>
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[var(--color-bg-light)] p-2.5">
                    <dt className="text-[0.6875rem] text-[var(--color-muted)]">
                      Status
                    </dt>
                    <dd className="mt-1 text-sm font-bold">Aktif</dd>
                  </div>
                  <div className="rounded-lg bg-[var(--color-bg-light)] p-2.5">
                    <dt className="text-[0.6875rem] text-[var(--color-muted)]">
                      Akses
                    </dt>
                    <dd className="mt-1 text-sm font-bold">Owner</dd>
                  </div>
                </dl>

                <Button
                  type="button"
                  className={`mt-auto h-[2.625rem] w-full ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-brand-600)]"
                      : "bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)] hover:bg-[var(--color-brand-200)]"
                  }`}
                  disabled={isSelecting || isSigningOut}
                  onClick={() => onSelect(tenant.id)}
                >
                  {isSelecting
                    ? "Membuka bimbel..."
                    : isSelected
                      ? "Lanjutkan ke dashboard"
                      : "Pilih bimbel ini"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </article>
            );
          })}
        </div>

        <p className="mt-7 flex items-center gap-2 text-center text-[0.8125rem] text-[var(--color-muted)]">
          <CircleHelp className="h-4 w-4 shrink-0" aria-hidden="true" />
          Tidak menemukan bimbel yang dicari? Hubungi administrator pusat.
        </p>
      </section>
    </main>
  );
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("id-ID");
}
