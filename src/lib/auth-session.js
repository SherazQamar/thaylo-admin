import { clearAdminToken, clearLegacyAuthStorage, setAdminToken } from './auth-cookies'
import { useAuthStore } from '../stores/auth.store'

export function setAdminSession(accessToken, user) {
  clearLegacyAuthStorage()
  setAdminToken(accessToken)
  useAuthStore.getState().setUser(user)
}

export function clearAdminSession() {
  clearAdminToken()
  useAuthStore.getState().clearUser()
  clearLegacyAuthStorage()
}

export function logoutAdmin() {
  clearAdminSession()
}
