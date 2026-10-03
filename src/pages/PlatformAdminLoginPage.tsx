import { type FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { platformAdminLogin } from "@/features/platform-admin/api/platform-admin-api";
import { ApiError } from "@/lib/api-client";
import { storePlatformAdminSession } from "@/lib/platform-admin-session";

type LoginRedirectState = {
  from?: { pathname?: unknown; search?: unknown; hash?: unknown };
};

export function PlatformAdminLoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useMutation({
    mutationFn: platformAdminLogin,
    onSuccess: (response) => {
      storePlatformAdminSession({
        accessToken: response.accessToken,
        admin: response.admin,
      });
      void navigate(getRedirectPath(location.state), { replace: true });
    },
    onError: (error) => {
      setFormError(
        error instanceof ApiError && error.status === 401
          ? "Email atau kata sandi tidak sesuai."
          : error instanceof ApiError && error.status === 400
            ? "Gunakan email yang valid dan kata sandi minimal 5 karakter."
            : "Login belum dapat diproses. Silakan coba lagi.",
      );
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const formData = new FormData(event.currentTarget);
    const email = getFormValue(formData, "email");
    const password = getFormValue(formData, "password", false);
    loginMutation.mutate({ email, password });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-4 sm:p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardTitle id="platform-admin-login-title" className="pt-4 text-2xl">
            BimbelKit Super Admin
          </CardTitle>
          <CardDescription className="leading-6">
            Masuk dengan akun administrator platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={handleSubmit}
            aria-labelledby="platform-admin-login-title"
          >
            <div className="grid gap-2">
              <Label htmlFor="platform-admin-email">Email</Label>
              <Input
                id="platform-admin-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                disabled={loginMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platform-admin-password">Kata sandi</Label>
              <div className="flex rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Input
                  id="platform-admin-password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  minLength={5}
                  maxLength={128}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                  disabled={loginMutation.isPending}
                  aria-describedby="platform-admin-password-hint"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={() => setIsPasswordVisible((value) => !value)}
                  disabled={loginMutation.isPending}
                  aria-label={
                    isPasswordVisible
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                >
                  {isPasswordVisible ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
            {formError ? (
              <p
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {formError}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function getRedirectPath(state: unknown) {
  if (!isLoginRedirectState(state)) return "/admin";
  const pathname =
    typeof state.from?.pathname === "string" ? state.from.pathname : "/admin";
  const search =
    typeof state.from?.search === "string" ? state.from.search : "";
  const hash = typeof state.from?.hash === "string" ? state.from.hash : "";
  return pathname === "/admin/login" || pathname === "/"
    ? "/admin"
    : `${pathname}${search}${hash}`;
}

function isLoginRedirectState(state: unknown): state is LoginRedirectState {
  return typeof state === "object" && state !== null && "from" in state;
}

function getFormValue(formData: FormData, name: string, trim = true) {
  const value = formData.get(name);
  return typeof value === "string" ? (trim ? value.trim() : value) : "";
}
