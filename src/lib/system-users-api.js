import { api } from './api'

/**
 * @typedef {{
 *   id: number;
 *   name: string | null;
 *   email: string;
 *   phone: string | null;
 *   role: 'PARENT' | 'ADMIN' | 'SUPER_ADMIN' | 'WAY_FINDER';
 *   isActive: boolean;
 *   isEmailVerified: boolean;
 *   invitePending?: boolean;
 *   lastSeenAt: string | null;
 *   createdAt: string;
 * }} SystemUser
 */

/**
 * @typedef {{ total: number; lastPage: number; currentPage: number; perPage: number; prev: number | null; next: number | null }} PaginationMeta
 */

/** Roles Super Admin can invite (not Parent/Child). */
export const CREATABLE_STAFF_ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'WAY_FINDER', label: 'Wayfinder' },
]

export const ASSIGNABLE_ROLES = [
  { value: 'PARENT', label: 'Parent' },
  { value: 'WAY_FINDER', label: 'Wayfinder' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
]

export const systemUserQueryKeys = {
  list: (params) => ['super-admin', 'users', params],
}

/**
 * @param {{ page?: number; limit?: number; search?: string; role?: string; status?: 'active' | 'inactive' }} [params]
 */
export async function fetchSystemUsers(params = {}) {
  const { data } = await api.get('/user/all-users', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      status: params.status ?? 'active',
      ...(params.search ? { search: params.search } : {}),
      ...(params.role ? { role: params.role } : {}),
    },
  })
  return {
    items: /** @type {SystemUser[]} */ (data.data ?? []),
    meta: /** @type {PaginationMeta | null} */ (data.meta ?? null),
  }
}

/**
 * @param {{
 *   fullName: string;
 *   email: string;
 *   phone?: string;
 *   role: 'ADMIN' | 'SUPER_ADMIN' | 'WAY_FINDER';
 *   region?: string;
 *   specialty?: string;
 *   gradeLevel?: string;
 *   languagesSpoken?: string[];
 * }} payload
 */
export async function createStaffUser(payload) {
  const { data } = await api.post('/user/staff', payload)
  return /** @type {SystemUser} */ (data.data)
}

/**
 * @param {number} userId
 * @param {{ name?: string; phone?: string; isActive?: boolean }} payload
 */
export async function updateSystemUser(userId, payload) {
  const { data } = await api.patch(`/user/${userId}`, payload)
  return /** @type {SystemUser} */ (data.data)
}

/**
 * Soft-deactivate a user (sets isActive=false).
 * @param {number} userId
 */
export async function deleteSystemUser(userId) {
  const { data } = await api.delete(`/user/${userId}`)
  return data.data
}

/**
 * Resend set-password invite for staff with pending setup.
 * @param {number} userId
 */
export async function resendStaffInvite(userId) {
  const { data } = await api.post(`/user/${userId}/resend-invite`)
  return data.data
}

/**
 * @param {number} userId
 * @param {'PARENT' | 'ADMIN' | 'SUPER_ADMIN' | 'WAY_FINDER'} role
 */
export async function updateSystemUserRole(userId, role) {
  const { data } = await api.patch(`/user/${userId}/role`, { role })
  return /** @type {SystemUser} */ (data.data)
}

export function formatSystemRole(role) {
  const found = ASSIGNABLE_ROLES.find((r) => r.value === role)
  return found?.label ?? role
}
