import { api } from './api'

export const platformQueryKeys = {
  tickets: (params) => ['super-admin', 'support-tickets', params],
}

export async function fetchSupportTickets(params = {}) {
  const { data } = await api.get('/admin/platform/support-tickets', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      ...(params.status ? { status: params.status } : {}),
    },
  })
  return { items: data.data ?? [], meta: data.meta ?? null }
}

export async function createSupportTicket(payload) {
  const { data } = await api.post('/admin/platform/support-tickets', payload)
  return data.data
}

export async function updateSupportTicket(id, payload) {
  const { data } = await api.patch(`/admin/platform/support-tickets/${id}`, payload)
  return data.data
}
