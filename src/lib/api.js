import axios, { isAxiosError } from 'axios'
import { getAdminToken } from './auth-cookies'
import { logoutAdmin } from './auth-session'

const baseURL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const authMode = config.authMode ?? 'user'

  if (authMode === 'none') {
    return config
  }

  const token = getAdminToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      const authMode = error.config?.authMode ?? 'user'
      if (authMode === 'user') {
        const path = window.location.pathname
        const protectedPrefixes = [
          '/admin-dashboard',
          '/parents',
          '/wayfinders',
          '/reports',
          '/alerts',
          '/settings',
        ]

        if (protectedPrefixes.some((prefix) => path.startsWith(prefix))) {
          logoutAdmin()
          const returnUrl = encodeURIComponent(path)
          window.location.href = `/?returnUrl=${returnUrl}`
        }
      }
    }
    return Promise.reject(error)
  },
)
