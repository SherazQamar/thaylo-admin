/** @typedef {'ADMIN' | 'SUPER_ADMIN'} AdminPortalRole */

export const ADMIN_HOME = '/admin-dashboard'
export const SUPER_ADMIN_HOME = '/super-admin/dashboard'

/** @type {readonly AdminPortalRole[]} */
export const ADMIN_ONLY_ROLES = ['ADMIN']

/** @type {readonly AdminPortalRole[]} */
export const SUPER_ADMIN_ONLY_ROLES = ['SUPER_ADMIN']

const ADMIN_ROUTE_PREFIXES = [
  '/admin-dashboard',
  '/parents',
  '/wayfinders',
  '/reports',
  '/alerts',
  '/settings',
]

const SUPER_ADMIN_ROUTE_PREFIXES = [
  '/super-admin',
]

/**
 * @param {string | undefined} role
 */
export function getHomePathForRole(role) {
  if (role === 'SUPER_ADMIN') return SUPER_ADMIN_HOME
  return ADMIN_HOME
}

/**
 * @param {string | undefined} role
 */
export function isSuperAdminRole(role) {
  return role === 'SUPER_ADMIN'
}

/**
 * @param {string | undefined} role
 */
export function isRegularAdminRole(role) {
  return role === 'ADMIN'
}

/**
 * @param {string} path
 * @param {string | undefined} role
 */
export function isPathAllowedForRole(path, role) {
  if (!path || !role) return false

  const isSuperAdminPath = SUPER_ADMIN_ROUTE_PREFIXES.some((prefix) =>
    path.startsWith(prefix),
  )
  const isAdminPath = ADMIN_ROUTE_PREFIXES.some((prefix) =>
    path.startsWith(prefix),
  )

  if (role === 'SUPER_ADMIN') return isSuperAdminPath
  if (role === 'ADMIN') return isAdminPath
  return false
}

export function isProtectedAdminPath(path) {
  return (
    ADMIN_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    SUPER_ADMIN_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix))
  )
}
