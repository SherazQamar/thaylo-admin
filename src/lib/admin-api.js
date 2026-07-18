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
 * @typedef {{ id: number; name: string | null; email: string; phone: string | null; isEmailVerified: boolean; childrenCount: number; invitePending: boolean; region: string | null; languagesSpoken: string[]; lastName: string | null; lastSeenAt: string | null; isOnline: boolean; createdAt: string }} WayfinderListItem
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
 * @typedef {{ fullName: string; email: string; phone: string; specialty?: string; gradeLevel?: string; region: string; languagesSpoken?: string[]; isActive?: boolean }} CreateWayfinderPayload
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

/**
 * @typedef {{
 *   activeStudentsThisMonth: number;
 *   activeStudentsChangePercent: number | null;
 *   currentActiveSessions: number;
 *   pendingAlerts: number;
 *   activeWayfinders: number;
 * }} AdminDashboardStats
 */

/**
 * @typedef {{
 *   month: string;
 *   year: number;
 *   monthlyActiveUsers: number;
 *   avgDailyTimeMinutes: number;
 * }} AdminDashboardEngagementPoint
 */

/**
 * @typedef {{
 *   active: number;
 *   completedToday: number;
 *   liveSessions: number;
 *   averageDurationMinutes: number | null;
 * }} AdminDashboardDailySessions
 */

/**
 * @typedef {{ id: number; title: string; message: string; severity: string; createdAt: string }} AdminDashboardAlert
 */

/**
 * @typedef {{ id: string; text: string; createdAt: string }} AdminDashboardActivity
 */

/**
 * @typedef {{
 *   stats: AdminDashboardStats;
 *   engagementTrend: AdminDashboardEngagementPoint[];
 *   dailySessionOverview: AdminDashboardDailySessions;
 *   recentAlerts: AdminDashboardAlert[];
 *   recentActivity: AdminDashboardActivity[];
 *   generatedAt: string;
 * }} AdminDashboard
 */

/**
 * @typedef {{ page?: number; limit?: number; search?: string; assignment?: 'unassigned' | 'all' }} StudentListParams
 */

export const adminQueryKeys = {
  dashboard: () => ['admin', 'dashboard'],
  reports: (params) => ['admin', 'reports', params],
  alerts: () => ['admin', 'alerts'],
  wayfinders: (params) => ['admin', 'wayfinders', params],
  wayfinderStudents: (wayfinderId, params) => ['admin', 'wayfinders', wayfinderId, 'students', params],
  parents: (params) => ['admin', 'parents', params],
  students: (params) => ['admin', 'students', params],
  student: (id) => ['admin', 'students', id],
}

/**
 * Polling interval for live dashboard feeds (alerts / activity / sessions).
 * 30s keeps the UI fresh without hammering the API while an admin works.
 */
export const DASHBOARD_POLL_INTERVAL_MS = 30_000

/**
 * @returns {Promise<AdminDashboard>}
 */
export async function fetchAdminDashboard() {
  const { data } = await api.get('/admin/dashboard')
  return data.data
}

/**
 * @typedef {'7d' | '30d' | '90d'} ReportsDateRangeKey
 */

/**
 * @typedef {{
 *   rangeKey: ReportsDateRangeKey;
 *   rangeLabel: string;
 *   rangeStart: string;
 *   rangeEnd: string;
 *   stats: Array<{ label: string; value: string; changePercent: number | null }>;
 *   learningActivity: Array<{ label: string; completedLessons: number }>;
 *   supportIndicators: {
 *     academic: number;
 *     engagement: number;
 *     socialEmotional: number;
 *     insight: string;
 *     rangeLabel: string;
 *   };
 *   avgTimePerModuleThisWeek: Array<{ module: string; avgMinutes: number }>;
 *   masteryProfile: {
 *     masteredFirstTime: number;
 *     masteredSecondTime: number;
 *     masteredThirdTime: number;
 *     supportNeeded: number;
 *     total: number;
 *   };
 *   students: Array<{
 *     id: number;
 *     name: string;
 *     grade: string | null;
 *     wayfinderName: string | null;
 *     status: 'Active' | 'Idle';
 *     lastActiveAt: string | null;
 *     flags: number;
 *   }>;
 *   generatedAt: string;
 * }} AdminReports
 */

/**
 * @param {{ range?: ReportsDateRangeKey }} [params]
 * @returns {Promise<AdminReports>}
 */
export async function fetchAdminReports(params = {}) {
  const { data } = await api.get('/admin/reports', {
    params: params.range ? { range: params.range } : undefined,
  })
  return data.data
}

/**
 * @typedef {{
 *   id: string;
 *   kind: 'LESSON_FAILURE' | 'SEL_RED_FLAG' | 'PARENT_MESSAGE';
 *   title: string;
 *   message: string;
 *   priority: 'High' | 'Medium' | 'Low';
 *   accent: string;
 *   createdAt: string;
 *   childId: number | null;
 *   childName: string | null;
 *   parentName: string | null;
 *   wayfinderName: string | null;
 *   lessonAlertId: number | null;
 *   roomId: number | null;
 *   severity: string | null;
 *   hoursWaiting: number | null;
 * }} AdminAlertItem
 */

/**
 * @typedef {{
 *   priorityAlerts: AdminAlertItem[];
 *   otherAlerts: AdminAlertItem[];
 *   totalCount: number;
 *   generatedAt: string;
 * }} AdminAlerts
 */

/**
 * @returns {Promise<AdminAlerts>}
 */
export async function fetchAdminAlerts() {
  const { data } = await api.get('/admin/alerts')
  return data.data
}

/**
 * @template T
 * @param {ApiResponse<T[]>} body
 */
function unwrapPaginated(body) {
  return { items: body.data ?? [], meta: body.meta ?? null }
}

/**
 * @typedef {{ page?: number; limit?: number; search?: string; status?: 'active' | 'all'; assignment?: 'unassigned' | 'all' }} WayfinderListParams
 */

/**
 * @param {WayfinderListParams} [params]
 */
export async function fetchWayfinders(params = {}) {
  const { data } = await api.get('/admin/wayfinders', {
    params: {
      ...withDefaultPagination(params),
      ...(params.status && params.status !== 'all' ? { status: params.status } : {}),
      ...(params.assignment && params.assignment !== 'all'
        ? { assignment: params.assignment }
        : {}),
    },
  })
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
 * @param {StudentListParams} [params]
 */
export async function fetchStudents(params = {}) {
  const { data } = await api.get('/admin/students', {
    params: {
      ...withDefaultPagination(params),
      ...(params.assignment && params.assignment !== 'all'
        ? { assignment: params.assignment }
        : {}),
    },
  })
  return unwrapPaginated(data)
}

/**
 * @param {number} studentId
 */
export async function fetchStudentById(studentId) {
  const { data } = await api.get(`/admin/students/${studentId}`)
  return data.data
}
