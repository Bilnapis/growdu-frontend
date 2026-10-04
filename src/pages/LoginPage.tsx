import { type FormEvent, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CalendarDays, Eye, EyeOff, FileText, Users } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/services/api-client'
import { login } from '@/services/auth.service'
import { clearAuthSession, storeAuthSession } from '@/lib/auth-session'

type IconName = 'calendar' | 'users' | 'file' | 'eye' | 'eyeOff'

const features: Array<{ label: string; icon: IconName }> = [
  { label: 'Jadwal belajar lebih teratur', icon: 'calendar' },
  { label: 'Data siswa dan tentor terpusat', icon: 'users' },
  { label: 'Laporan belajar mudah dipantau', icon: 'file' },
]

type LoginRedirectState = {
  from?: {
    pathname?: unknown
    search?: unknown
    hash?: unknown
  }
}

type LoginPageProps = {
  adminOnly?: boolean
}

function LoginIcon({ name }: { name: IconName }) {
  if (name === 'calendar') {
    return <CalendarDays className="h-5 w-5" aria-hidden="true" />
  }

  if (name === 'users') {
    return <Users className="h-5 w-5" aria-hidden="true" />
  }

  if (name === 'file') {
    return <FileText className="h-5 w-5" aria-hidden="true" />
  }

  if (name === 'eyeOff') {
    return <EyeOff className="h-5 w-5" aria-hidden="true" />
  }

  return <Eye className="h-5 w-5" aria-hidden="true" />
}

export function LoginPage({ adminOnly = false }: LoginPageProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      if (adminOnly && response.user.role !== 'owner') {
        clearAuthSession()
        setFormError('Akun ini tidak memiliki akses ke area Super Admin.')
        return
      }

      storeAuthSession({
        accessToken: response.accessToken,
        user: response.user,
      })
      void navigate(
        getRedirectPath(
          location.state,
          adminOnly
            ? '/admin'
            : response.user.role === 'owner'
              ? '/bimbel/select'
              : '/dashboard',
          adminOnly ? '/admin/login' : '/login',
        ),
        { replace: true },
      )
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        setFormError('Email atau kata sandi tidak sesuai.')
        return
      }

      setFormError(
        error instanceof Error
          ? error.message
          : 'Login gagal. Silakan coba lagi.',
      )
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const formData = new FormData(event.currentTarget)
    const emailValue = formData.get('email')
    const passwordValue = formData.get('password')
    const email = typeof emailValue === 'string' ? emailValue.trim() : ''
    const password = typeof passwordValue === 'string' ? passwordValue : ''

    loginMutation.mutate({ email, password })
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(32rem,37.5rem)_minmax(28rem,1fr)]">
      <section
        className="flex min-h-screen flex-col justify-between bg-[var(--color-primary-dark)] p-8 text-primary-foreground sm:p-14 lg:min-h-screen"
        aria-label="GrowDu"
      >
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-10 w-10 place-items-center rounded-md bg-[var(--color-primary-soft)] text-sm font-bold leading-none text-[var(--color-primary-dark)]"
            aria-hidden="true"
          >
            GD
          </span>
          <span className="flex flex-col gap-0.5 leading-tight">
            <strong className="text-base">GrowDu</strong>
            <span className="text-xs text-[var(--color-primary-soft)]">Operasional Bimbel</span>
          </span>
        </div>

        <div className="w-full max-w-[29.5rem] py-12 lg:py-0">
          <h1 className="text-[2rem] leading-tight sm:text-[2.625rem]">
            Operasional rapi. Belajar lebih fokus.
          </h1>
          <p className="mt-6 text-base leading-7 text-[var(--color-primary-soft)]">
            Kelola jadwal, siswa, dan laporan belajar dalam satu tempat bersama
            GrowDu.
          </p>

          <ul
            className="mt-4 flex flex-col gap-4 text-sm"
            aria-label="Fitur GrowDu"
          >
            {features.map((feature) => (
              <li key={feature.label} className="flex items-center gap-3">
                <LoginIcon name={feature.icon} />
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-blue-100">&copy; 2026 GrowDu</p>
      </section>

      <section
        className="grid min-h-screen place-items-center px-4 py-8 sm:px-8 lg:min-h-screen"
        aria-labelledby="login-title"
      >
        <Card className="w-full max-w-[29rem] border-0 shadow-none sm:border sm:shadow-sm">
          <CardHeader className="px-0 sm:px-8 sm:pt-8">
            <CardTitle id="login-title" className="text-3xl">
              {adminOnly ? 'Masuk Super Admin' : 'Selamat datang'}
            </CardTitle>
            <CardDescription>
              {adminOnly
                ? 'Gunakan akun owner untuk mengelola pengguna bimbel.'
                : 'Masuk dengan akun Anda untuk melanjutkan.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0 sm:px-8 sm:pb-8">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    required
                    disabled={loginMutation.isPending}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Kata sandi</Label>
                  <div className="flex rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <Input
                      id="password"
                      name="password"
                      type={isPasswordVisible ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Masukkan kata sandi"
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                      disabled={loginMutation.isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 shrink-0 text-muted-foreground hover:text-foreground"
                      aria-label={
                        isPasswordVisible
                          ? 'Sembunyikan kata sandi'
                          : 'Tampilkan kata sandi'
                      }
                      disabled={loginMutation.isPending}
                      onClick={() => setIsPasswordVisible((visible) => !visible)}
                    >
                      <LoginIcon name={isPasswordVisible ? 'eyeOff' : 'eye'} />
                    </Button>
                  </div>
                </div>
              </div>

              {formError ? (
                <p
                  className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {formError}
                </p>
              ) : null}

              <Button
                className="mt-7 h-11 w-full"
                type="submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Memproses...' : 'Masuk'}
              </Button>

              <div className="mt-7 flex flex-col items-center gap-1 border-t pt-5 text-center">
                <p className="text-xs text-muted-foreground">
                  Belum punya akun atau kesulitan masuk?
                </p>
                <strong className="text-xs">Hubungi admin bimbel Anda.</strong>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function getRedirectPath(
  state: unknown,
  fallbackPath: string,
  loginPath: string,
) {
  if (!isLoginRedirectState(state)) {
    return fallbackPath
  }

  const pathname =
    typeof state.from?.pathname === 'string'
      ? state.from.pathname
      : fallbackPath
  const search = typeof state.from?.search === 'string' ? state.from.search : ''
  const hash = typeof state.from?.hash === 'string' ? state.from.hash : ''

  if (pathname === loginPath || pathname === '/') {
    return fallbackPath
  }

  return `${pathname}${search}${hash}`
}

function isLoginRedirectState(state: unknown): state is LoginRedirectState {
  return typeof state === 'object' && state !== null && 'from' in state
}
