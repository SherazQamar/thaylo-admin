import Cookies from 'js-cookie'

/** Separate from thaylo_fe so parent/wayfinder sessions are not overwritten on localhost. */
const ADMIN_TOKEN_KEY = 'thaylo_admin_access_token'

/** Matches backend JWT_EXPIRES_IN=1d */
const TOKEN_EXPIRES_DAYS = 1

const cookieOptions = {
  path: '/',
  sameSite: 'lax',
  secure:
    typeof window !== 'undefined' && window.location.protocol === 'https:',
  expires: TOKEN_EXPIRES_DAYS,
}

const removeOptions = {
  path: cookieOptions.path,
  sameSite: cookieOptions.sameSite,
  secure: cookieOptions.secure,
}

export function setAdminToken(token) {
  Cookies.set(ADMIN_TOKEN_KEY, token, cookieOptions)
}

export function getAdminToken() {
  return Cookies.get(ADMIN_TOKEN_KEY)
}

export function clearAdminToken() {
  Cookies.remove(ADMIN_TOKEN_KEY, removeOptions)
}

export function clearLegacyAuthStorage() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('thaylo-admin-auth')
}
