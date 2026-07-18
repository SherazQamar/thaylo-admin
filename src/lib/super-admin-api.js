import { api } from './api'
import { DASHBOARD_POLL_INTERVAL_MS } from './admin-api'

/**
 * @typedef {'ELA' | 'Math' | 'Science' | 'Social Studies' | 'Electives'} SubjectModule
 */

/**
 * @typedef {{
 *   key: string;
 *   label: string;
 *   value: number;
 *   displayValue: string;
 *   changePercent: number | null;
 * }} SuperAdminStat
 */

/**
 * @typedef {{
 *   label: string;
 *   date: string;
 *   bySubject: Record<SubjectModule, number>;
 * }} PlatformActivityDay
 */

/**
 * @typedef {{
 *   stats: SuperAdminStat[];
 *   platformActivity: { rangeLabel: string; days: PlatformActivityDay[] };
 *   timeInContentArea: Array<{ subject: SubjectModule; minutes: number; percent: number }>;
 *   alertsBySubject: Array<{ subject: SubjectModule; count: number; percent: number }>;
 * }} SuperAdminDashboard
 */

export const superAdminQueryKeys = {
  dashboard: () => ['super-admin', 'dashboard'],
  insights: (params) => ['super-admin', 'insights', params],
}

export { DASHBOARD_POLL_INTERVAL_MS as SUPER_DASHBOARD_POLL_INTERVAL_MS }

/**
 * @returns {Promise<SuperAdminDashboard>}
 */
export async function fetchSuperAdminDashboard() {
  const { data } = await api.get('/admin/super-dashboard')
  return data.data
}

/**
 * @typedef {{
 *   moduleLabel: string;
 *   stats: Array<{ key: string; label: string; value: string; changePercent: number | null; hint?: string }>;
 *   skillFamilies: Array<{ family: string; percent: number; started: number; mastered: number; color: string }>;
 *   highestReteachLessons: Array<{
 *     lessonKey: string;
 *     lessonTitle: string;
 *     lessonOrder: number;
 *     started: number;
 *     reteachCount: number;
 *     reteachRatePercent: number;
 *   }>;
 *   detailRows: Array<{
 *     student: string;
 *     module: string;
 *     lesson: string;
 *     score: string;
 *     time: string;
 *     reteach: 'Yes' | 'No';
 *     status: string;
 *   }>;
 *   filters: {
 *     grades: string[];
 *     modules: string[];
 *     lessons: Array<{ key: string; label: string }>;
 *   };
 * }} SuperAdminInsights
 */

/**
 * @param {{ grade?: string; module?: string; lesson?: string; range?: '7d' | '30d' | '90d' | 'all' }} [params]
 * @returns {Promise<SuperAdminInsights>}
 */
export async function fetchSuperAdminInsights(params = {}) {
  const { data } = await api.get('/admin/super-insights', {
    params: {
      grade: params.grade ?? '4',
      module: params.module ?? 'ELA',
      range: params.range ?? 'all',
      ...(params.lesson ? { lesson: params.lesson } : {}),
    },
  })
  return data.data
}
