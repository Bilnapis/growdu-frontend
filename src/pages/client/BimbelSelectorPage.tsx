import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { TenantSelector } from "@/features/tenant-context/components/TenantSelector";
import { useOwnedTenants } from "@/features/tenant-context/hooks/use-owned-tenants";
import { getStoredAuthUser } from "@/lib/auth-session";
import {
  getStoredSelectedTenantId,
  storeSelectedTenant,
} from "@/lib/tenant-session";
import { logout } from "@/services/auth.service";
import { clearAuthSession } from "@/lib/auth-session";
import { clearSelectedTenant } from "@/lib/tenant-session";

export function BimbelSelectorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = getStoredAuthUser();
  const tenantsQuery = useOwnedTenants();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthSession();
      clearSelectedTenant();
      queryClient.clear();
      void navigate("/login", { replace: true });
    },
  });

  if (!user) {
    return null;
  }

  const userId = user.id;
  const selectedTenantId = getStoredSelectedTenantId(userId);
  const displayName = user.profileName ?? user.email;

  function handleSelect(tenantId: string) {
    storeSelectedTenant(userId, tenantId);
    queryClient.clear();
    void navigate("/dashboard", { replace: true });
  }

  if (tenantsQuery.isPending) {
    return <BimbelSelectorLoading displayName={displayName} />;
  }

  if (tenantsQuery.isError) {
    return (
      <BimbelSelectorState
        title="Bimbel belum dapat dimuat"
        description="Terjadi kendala saat mengambil daftar bimbel. Silakan coba lagi."
        actionLabel="Coba lagi"
        onAction={() => void tenantsQuery.refetch()}
        onSignOut={() => logoutMutation.mutate()}
      />
    );
  }

  if (tenantsQuery.data.length === 0) {
    return (
      <BimbelSelectorState
        title="Belum ada bimbel aktif"
        description="Akun owner ini belum memiliki bimbel aktif. Hubungi administrator pusat untuk mendapatkan akses."
        actionLabel="Keluar"
        onAction={() => logoutMutation.mutate()}
      />
    );
  }

  return (
    <TenantSelector
      displayName={displayName}
      tenants={tenantsQuery.data}
      selectedTenantId={selectedTenantId}
      isSelecting={false}
      isSigningOut={logoutMutation.isPending}
      onSelect={handleSelect}
      onSignOut={() => logoutMutation.mutate()}
    />
  );
}

function BimbelSelectorLoading({ displayName }: { displayName: string }) {
  return (
    <main
      className="grid min-h-screen place-items-center bg-[var(--color-bg)] px-4 text-center"
      aria-busy="true"
    >
      <div>
        <p className="text-sm font-bold text-[var(--color-primary)]">
          SELAMAT DATANG KEMBALI, {displayName.toLocaleUpperCase("id-ID")}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">
          Menyiapkan daftar bimbel...
        </h1>
        <div className="mt-8 grid w-[min(100%,63.75rem)] gap-[1.125rem] md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-[19.375rem] animate-pulse rounded-[0.875rem] border border-[var(--color-border)] bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

type BimbelSelectorStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  onSignOut?: () => void;
};

function BimbelSelectorState({
  title,
  description,
  actionLabel,
  onAction,
  onSignOut,
}: BimbelSelectorStateProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] px-4 text-center">
      <section
        className="max-w-md rounded-[0.875rem] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-sm)]"
        aria-labelledby="bimbel-selector-state-title"
      >
        <h1
          id="bimbel-selector-state-title"
          className="text-2xl font-extrabold"
        >
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          {description}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {onSignOut ? (
            <Button type="button" variant="outline" onClick={onSignOut}>
              Keluar
            </Button>
          ) : null}
          <Button type="button" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      </section>
    </main>
  );
}
