import { toast } from 'sonner'
import { getApiErrorMessage } from './auth-api'

/**
 * Single entry-point for user-facing toasts across thaylo-admin.
 * Prefer notify.error(err) in catch / onError handlers instead of inline red banners.
 */
export const notify = {
  /**
   * @param {unknown} error
   * @param {string} [fallback]
   */
  error(error, fallback) {
    const message =
      typeof error === 'string'
        ? error.trim()
        : getApiErrorMessage(error, fallback ?? 'Something went wrong. Please try again.')
    if (!message) return
    toast.error(message)
  },

  /**
   * @param {string} message
   */
  success(message) {
    const text = message?.trim?.() ?? ''
    if (!text) return
    toast.success(text)
  },

  /**
   * @param {string} message
   */
  info(message) {
    const text = message?.trim?.() ?? ''
    if (!text) return
    toast.info(text)
  },

  /**
   * @param {string} message
   */
  warning(message) {
    const text = message?.trim?.() ?? ''
    if (!text) return
    toast.warning(text)
  },
}
