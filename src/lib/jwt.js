const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN'])

/**
 * @param {string} token
 */
export function decodeAccessTokenPayload(token) {
  try {
    const segment = token.split('.')[1]
    if (!segment) return null

    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * @param {string} token
 */
export function isAdminAccessTokenValid(token) {
  const payload = decodeAccessTokenPayload(token)
  if (!payload?.sub) return false
  if (!ADMIN_ROLES.has(payload.role)) return false
  if (payload.exp != null && payload.exp * 1000 <= Date.now()) return false
  return true
}
