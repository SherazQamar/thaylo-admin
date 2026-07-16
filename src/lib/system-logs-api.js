import { api } from './api'

export const ADMIN_PAGE_SIZE = 10

/**
 * @template T
 * @param {{ data?: T[]; meta?: Record<string, unknown> }} body
 */
function unwrapPaginated(body) {
  return { items: body.data ?? [], meta: body.meta ?? null }
}

export const systemLogQueryKeys = {
  all: ['admin', 'system-logs'],
  list: (params) => ['admin', 'system-logs', 'list', params],
}

/**
 * @param {{ page?: number; limit?: number; level?: string; category?: string }} [params]
 */
export async function fetchSystemLogs(params = {}) {
  const { data } = await api.get('/admin/system-logs', {
    params: {
      page: params.page ?? 1,
      limit: ADMIN_PAGE_SIZE,
      ...(params.level ? { level: params.level } : {}),
      ...(params.category ? { category: params.category } : {}),
    },
  })
  return unwrapPaginated(data)
}

export const SYSTEM_LOG_LEVEL_LABELS = {
  INFO: 'Info',
  WARN: 'Warning',
  ERROR: 'Error',
}

export const SYSTEM_LOG_LEVEL_STYLES = {
  INFO: 'border-white/20 text-white/60 bg-white/5',
  WARN: 'border-[#FFC542]/40 text-[#FFC542] bg-[#FFC542]/10',
  ERROR: 'border-[#FF7B7B]/40 text-[#FF7B7B] bg-[#FF7B7B]/10',
}
