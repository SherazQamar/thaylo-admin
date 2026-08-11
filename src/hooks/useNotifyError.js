import { useEffect, useRef } from 'react'
import { getApiErrorMessage } from '../lib/auth-api'
import { notify } from '../lib/notify'

/**
 * Toast an error once when it becomes truthy (React Query / state errors).
 * Usage: useNotifyError(query.error)
 */
export function useNotifyError(error, enabled = true) {
  const lastMessageRef = useRef(null)

  useEffect(() => {
    if (!enabled || !error) {
      if (!error) lastMessageRef.current = null
      return
    }

    const message =
      typeof error === 'string' ? error.trim() : getApiErrorMessage(error)
    if (!message || message === lastMessageRef.current) return
    lastMessageRef.current = message
    notify.error(error)
  }, [error, enabled])
}
