import { type ReactNode, useLayoutEffect } from 'react'
import { useCurrentTenant } from '../hooks/use-owned-tenants'
import {
  defaultPrimaryColor,
  getThemeTokens,
} from '@/features/tenant-settings/utils/theme'

export function TenantThemeProvider({ children }: { children: ReactNode }) {
  const tenantQuery = useCurrentTenant()
  const color = tenantQuery.data?.primaryColor ?? defaultPrimaryColor

  useLayoutEffect(() => {
    const root = document.documentElement
    const tokens = getThemeTokens(color)
    const previous = Object.keys(tokens).map((key) => ({
      key,
      value: root.style.getPropertyValue(key),
      priority: root.style.getPropertyPriority(key),
    }))
    for (const [key, value] of Object.entries(tokens))
      root.style.setProperty(key, value)
    return () => {
      for (const { key, value, priority } of previous) {
        if (value) root.style.setProperty(key, value, priority)
        else root.style.removeProperty(key)
      }
    }
  }, [color])

  return children
}
