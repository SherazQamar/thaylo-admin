import { api } from './api'
import { getAdminToken } from './auth-cookies'
import { CURRICULUM_STATUS_LABELS } from './curriculum-api'

export const ADDENDA_PAGE_SIZE = 10

export const ADDENDA_STATUS_LABELS = CURRICULUM_STATUS_LABELS

export const ADDENDA_INFO_MESSAGE =
  'Upload Addenda in chunks (e.g. Lessons 1–10, then 11–20). Multiple packages can stay published for the same grade — the system merges them by lesson. Overlapping lesson keys use the newest published package.'

export const ADDENDA_PUBLISH_CONFIRM_MESSAGE =
  'This package becomes live alongside any other published Addenda for the same subject and grade. Students get pathways merged by lesson number. If this file overlaps an older package, this newer one wins for those lessons.'

export const addendaQueryKeys = {
  list: (params) => ['admin', 'curriculum-addenda', params],
  detail: (id) => ['admin', 'curriculum-addenda', id],
}

function withDefaultPagination(params = {}) {
  return {
    page: params.page ?? 1,
    limit: ADDENDA_PAGE_SIZE,
    ...(params.search ? { search: params.search } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.subject ? { subject: params.subject } : {}),
  }
}

function unwrapPaginated(body) {
  return { items: body.data ?? [], meta: body.meta ?? null }
}

export async function fetchAddenda(params = {}) {
  const { data } = await api.get('/admin/curriculum-addenda', {
    params: withDefaultPagination(params),
  })
  return unwrapPaginated(data)
}

export async function fetchAddendum(id) {
  const { data } = await api.get(`/admin/curriculum-addenda/${id}`)
  return data.data
}

export async function parseAddendaDocument(file) {
  const formData = new FormData()
  formData.append('file', file)

  const token = getAdminToken()
  const baseURL = api.defaults.baseURL

  const response = await fetch(`${baseURL}/admin/curriculum-addenda/parse-document`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  const json = await response.json()
  if (!response.ok) {
    throw new Error(json?.message || 'Failed to parse addenda document')
  }

  return json.data
}

export async function createAddendumFromParsed(payload) {
  const { data } = await api.post('/admin/curriculum-addenda', {
    parsed: payload.parsed,
    rawText: payload.rawText,
    sourceDocUrl: payload.sourceDocUrl,
  })
  return data.data
}

export async function updateAddendumStatus(id, payload) {
  const { data } = await api.patch(`/admin/curriculum-addenda/${id}`, payload)
  return data.data
}

export async function updateAddendumScript(id, scriptJson) {
  const { data } = await api.patch(`/admin/curriculum-addenda/${id}`, { scriptJson })
  return data.data
}

export async function deleteAddendum(id) {
  const { data } = await api.delete(`/admin/curriculum-addenda/${id}`)
  return data.data
}

export function attemptLabel(attemptNumber) {
  if (!attemptNumber || attemptNumber <= 1) return 'Attempt 1 (first teach)'
  return `Attempt ${attemptNumber} (Retry ${attemptNumber - 1})`
}
