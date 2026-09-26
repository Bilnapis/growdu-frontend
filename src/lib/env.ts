const fallbackApiBaseUrl = 'http://localhost:3000/api'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || fallbackApiBaseUrl,
} as const

