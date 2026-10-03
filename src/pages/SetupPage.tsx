import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { SetupCard } from "@/components/SetupCard";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { clearAuthSession } from "@/lib/auth-session";
import { logout } from "@/services/auth.service";

const foundations = [
  {
    title: "React + TypeScript",
    description: "React 18 dengan TypeScript strict dan import alias @/.",
  },
  {
    title: "Routing",
    description: "React Router siap untuk route owner, admin, dan tentor.",
  },
  {
    title: "Server state",
    description: "TanStack Query tersedia untuk integrasi API dan cache data.",
  },
  {
    title: "Design tokens",
    description: "Token GrowDu telah dipetakan ke CSS custom properties.",
  },
] as const;

export function SetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthSession();
      queryClient.clear();
      void navigate("/login", { replace: true });
    },
  });

  function handleLogout() {
    logoutMutation.mutate();
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(20rem,0.8fr)_minmax(32rem,1.2fr)]">
      <section
        className="flex min-h-screen flex-col justify-between gap-10 bg-gradient-to-br from-sky-950 to-sky-700 p-8 text-primary-foreground sm:p-12 lg:p-16"
        aria-labelledby="setup-title"
      >
        <div className="flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 text-lg font-bold"
            aria-label="GrowDu"
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-md border border-white/30 bg-white/15"
              aria-hidden="true"
            >
              G
            </span>
            <span>GrowDu</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/30 bg-white/15 text-primary-foreground hover:bg-white/25 hover:text-primary-foreground"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {logoutMutation.isPending ? "Keluar..." : "Keluar"}
          </Button>
        </div>

        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
            Frontend foundation test
          </span>
          <h1
            id="setup-title"
            className="mt-3 text-4xl leading-tight tracking-normal sm:text-5xl"
          >
            Project siap dikembangkan
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-sky-100">
            Fondasi dashboard GrowDu sudah aktif. Mulai implementasi dari app
            shell, autentikasi, lalu modul operasional sesuai dokumentasi MVP.
          </p>
        </div>

        <dl className="grid overflow-hidden rounded-md border border-white/20 bg-sky-950/40 sm:grid-cols-[0.6fr_1.4fr]">
          <div className="min-w-0 p-4">
            <dt className="mb-2 text-xs font-semibold text-sky-200">
              Environment
            </dt>
            <dd className="truncate text-sm font-semibold">
              {import.meta.env.MODE}
            </dd>
          </div>
          <div className="min-w-0 border-t border-white/20 p-4 sm:border-l sm:border-t-0">
            <dt className="mb-2 text-xs font-semibold text-sky-200">
              API base URL
            </dt>
            <dd className="truncate text-sm font-semibold">{env.apiBaseUrl}</dd>
          </div>
        </dl>
      </section>

      <section
        className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-8 sm:p-12 lg:p-16"
        aria-labelledby="foundation-title"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Baseline
            </span>
            <h2 id="foundation-title" className="mt-2 text-2xl font-semibold">
              Fondasi yang tersedia
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {foundations.length} item
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {foundations.map((foundation) => (
            <SetupCard key={foundation.title} {...foundation} />
          ))}
        </div>

        <SetupCard
          title="App shell & autentikasi"
          description="Langkah berikutnya: bangun layout berbasis role dan sambungkan alur login ke API backend."
          status="next"
        />
      </section>
    </main>
  );
}
