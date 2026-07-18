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
 *   lastSeenAt: string | null;
 *   createdAt: string;
 * }} SystemUser
 */

/**
 * @typedef {{ total: number; lastPage: number; currentPage: number; perPage: number; prev: number | null; next: number | null }} PaginationMeta
 */

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
 * @param {{ page?: number; limit?: number; search?: string; role?: string }} [params]
 */
export async function fetchSystemUsers(params = {}) {
  const { data } = await api.get('/user/all-users', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
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
