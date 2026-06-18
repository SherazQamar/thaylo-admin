import { api } from './api'

export const ADMIN_PAGE_SIZE = 10

/** @typedef {{ total: number; lastPage: number; currentPage: number; perPage: number; prev: number | null; next: number | null }} PaginationMeta */

/**
 * @template T
 * @typedef {{ statusCode: number; message: string; data: T; success: boolean; timestamp: string; meta?: PaginationMeta }} ApiResponse
 */

/**
 * @typedef {{ page?: number; limit?: number; search?: string }} ListParams
 */

function withDefaultPagination(params = {}) {
  return {
    page: params.page ?? 1,
    limit: ADMIN_PAGE_SIZE,
    ...(params.search ? { search: params.search } : {}),
  }
}

/**
 * @typedef {{ id: number; name: string | null; email: string; phone: string | null; isEmailVerified: boolean; childrenCount: number; invitePending: boolean; createdAt: string }} WayfinderListItem
 */

/**
 * @typedef {{ id: number; userName: string; grade: string | null; assignedAt: string | null; createdAt: string; parent: { id: number; name: string | null; email: string } }} WayfinderStudent
 */

/**
 * @typedef {{ id: number; userName: string; grade: string | null; wayfinderId: number | null; assignedAt: string | null; createdAt: string }} ParentChild
 */

/**
 * @typedef {{ id: number; name: string | null; email: string; phone: string | null; guardianType: string | null; secondaryGuardianName: string | null; secondaryGuardianType: string | null; country: string | null; isEmailVerified: boolean; childrenCount: number; children: ParentChild[]; createdAt: string }} ParentListItem
 */

/**
 * @typedef {{ fullName: string; email: string; phone: string; specialty?: string; gradeLevel?: string; isActive?: boolean }} CreateWayfinderPayload
 */

/**
 * @typedef {{ wayfinderId: number; childId: number }} AssignChildPayload
 */

/**
 * @typedef {{ id: number; firstName: string | null; secondName: string | null; userName: string; grade: string | null; wayfinderId: number | null; assignedAt: string | null; createdAt: string; parent: { id: number; name: string | null; email: string; phone: string | null }; wayfinder: { id: number; name: string | null; email: string; specialty: string | null; gradeLevel: string | null } | null }} StudentListItem
 */

/**
 * @typedef {{ id: number; firstName: string | null; secondName: string | null; userName: string; grade: string | null; documentUrls: string[]; permission: Record<string, unknown> | null; wayfinderId: number | null; assignedAt: string | null; createdAt: string; updatedAt: string; parent: { id: number; name: string | null; email: string; phone: string | null; guardianType: string | null; secondaryGuardianName: string | null; secondaryGuardianType: string | null; country: string | null; isEmailVerified: boolean }; wayfinder: { id: number; name: string | null; email: string; specialty: string | null; gradeLevel: string | null } | null }} StudentDetail
 */

export const adminQueryKeys = {
  wayfinders: (params) => ['admin', 'wayfinders', params],
  wayfinderStudents: (wayfinderId, params) => ['admin', 'wayfinders', wayfinderId, 'students', params],
  parents: (params) => ['admin', 'parents', params],
  students: (params) => ['admin', 'students', params],
  student: (id) => ['admin', 'students', id],
}

/**
 * @template T
 * @param {ApiResponse<T[]>} body
 */
function unwrapPaginated(body) {
  return { items: body.data ?? [], meta: body.meta ?? null }
}

/**
 * @param {ListParams} [params]
 */
export async function fetchWayfinders(params = {}) {
  const { data } = await api.get('/admin/wayfinders', { params: withDefaultPagination(params) })
  return unwrapPaginated(data)
}

/**
 * @param {CreateWayfinderPayload} payload
 */
export async function createWayfinder(payload) {
  const { data } = await api.post('/admin/wayfinders', payload)
  return data.data
}

/**
 * @param {number} wayfinderId
 */
export async function resendWayfinderInvite(wayfinderId) {
  const { data } = await api.post(`/admin/wayfinders/${wayfinderId}/resend-invite`)
  return data.data
}

/**
 * @param {number} wayfinderId
 * @param {ListParams} [params]
 */
export async function fetchWayfinderStudents(wayfinderId, params = {}) {
  const { data } = await api.get(`/admin/wayfinders/${wayfinderId}/students`, {
    params: withDefaultPagination(params),
  })
  return unwrapPaginated(data)
}

/**
 * @param {ListParams} [params]
 */
export async function fetchParents(params = {}) {
  const { data } = await api.get('/admin/parents', { params: withDefaultPagination(params) })
  return unwrapPaginated(data)
}

/**
 * @param {AssignChildPayload} payload
 */
export async function assignChildToWayfinder(payload) {
  const { data } = await api.post('/admin/assign-child', payload)
  return data.data
}

/**
 * @param {ListParams} [params]
 */
export async function fetchStudents(params = {}) {
  const { data } = await api.get('/admin/students', { params: withDefaultPagination(params) })
  return unwrapPaginated(data)
}

/**
 * @param {number} studentId
 */
export async function fetchStudentById(studentId) {
  const { data } = await api.get(`/admin/students/${studentId}`)
  return data.data
}
