import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { fetchAdminProfile, isAdminPortalRole } from '../lib/auth-api'
import { getAdminToken } from '../lib/auth-cookies'
import { logoutAdmin } from '../lib/auth-session'
import { useAuthStore } from '../stores/auth.store'

export default function AdminAuthGuard({ children }) {
  const location = useLocation()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const token = getAdminToken()
    if (!token) {
      setStatus('unauthenticated')
      return
    }

    let cancelled = false

    fetchAdminProfile()
      .then((profile) => {
        if (cancelled) return

        if (!isAdminPortalRole(profile.role)) {
          logoutAdmin()
          setStatus('unauthenticated')
          return
        }

        useAuthStore.getState().setUser(profile)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        logoutAdmin()
        setStatus('unauthenticated')
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#111023]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00CED1] border-t-transparent rounded-full animate-spin" />
          <p
            className="text-white/50 text-sm"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Loading…
          </p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    const returnUrl = encodeURIComponent(location.pathname)
    return <Navigate to={`/?returnUrl=${returnUrl}`} replace />
  }

  return children
}
