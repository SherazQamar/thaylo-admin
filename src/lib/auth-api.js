import { isAxiosError } from 'axios'
import { api } from './api'
import { useAuthStore } from '../stores/auth.store'

/** @typedef {'ADMIN' | 'SUPER_ADMIN' | 'PARENT' | 'WAY_FINDER'} UserRole */

/**
 * @template T
 * @typedef {{ statusCode: number; message: string; data: T; success: boolean; timestamp: string }} ApiResponse
 */

/**
 * @typedef {{ id: number; email: string; name: string | null; role: UserRole; isEmailVerified?: boolean; avatarKey?: string | null; avatarUrl?: string | null }} AdminUser
 */

/**
 * @param {string} email
 * @param {string} password
 */
export async function loginAdmin(email, password) {
  const { data } = await api.post(
    '/auth/login',
    { email, password },
    { authMode: 'none' },
  )
  return data.data
}

export async function fetchAdminProfile() {
  const { data } = await api.get('/auth/profile')
  return data.data
}

/**
 * @param {{ name: string; phone?: string; country?: string; timeZone?: string }} payload
 */
export async function updateAdminProfile(payload) {
  const { data } = await api.put('/auth/update', payload)
  return data.data
}

/**
 * @param {{ currentPassword: string; newPassword: string; confirmPassword: string }} payload
 */
export async function changeAdminPassword(payload) {
  const { data } = await api.post('/auth/change-password', payload)
  return data.data
}

export async function refreshAdminSession() {
  const profile = await fetchAdminProfile()
  useAuthStore.getState().setUser(profile)
  return profile
}

/**
 * @param {unknown} error
 * @returns {string}
 */
export function getApiErrorMessage(error) {
  if (error instanceof Error && !isAxiosError(error)) {
    return error.message
  }
  if (isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message)) return message.join(', ')
  }
  return 'Something went wrong. Please try again.'
}

export function isAdminPortalRole(role) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

/**
 * @param {string} token
 * @returns {Promise<{ role: string }>}
 */
export async function validateResetToken(token) {
  const { data } = await api.get('/auth/validate-reset-token', {
    params: { token },
    authMode: 'none',
  })
  return data.data
}

/**
 * @param {{ token: string; newPassword: string; confirmPassword: string }} payload
 */
export async function setStaffInvitePassword(payload) {
  const { data } = await api.post('/auth/staff/set-password', payload, {
    authMode: 'none',
  })
  return data.data
}
