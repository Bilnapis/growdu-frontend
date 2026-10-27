import { useQuery } from '@tanstack/react-query'
import { getStoredAuthUser, type AuthUser } from '@/lib/auth-session'
import { apiRequest } from '@/services/api-client'

export const currentUserQueryKey = ['auth', 'me'] as const

export function useCurrentUser() {
  const user = getStoredAuthUser()
  return useQuery({
    queryKey: [...currentUserQueryKey, user?.id],
    queryFn: ({ signal }) => apiRequest<AuthUser>('/auth/me', { signal }),
    enabled: user?.role === 'operator',
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 30_000,
    retry: false,
  })
}
