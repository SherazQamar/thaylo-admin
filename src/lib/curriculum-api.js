import { api } from './api'
import { getAdminToken } from './auth-cookies'
import {
  createMockCurriculumFromParse,
  loadMockCurricula,
  simulateRefinement,
  updateMockCurriculum,
} from './curriculum-mock-data'

export const CURRICULUM_PAGE_SIZE = 10

/** Beta: parser extracts only Expectation 1 — Lessons 1–5 (4.ELA.WLL.1). */
export const CURRICULUM_BETA_LESSON_LIMIT = 5

export const CURRICULUM_BETA_INFO_MESSAGE =
  'Beta testing: uploads parse the full document but only generate Lessons 1–5 (Expectation 4.ELA.WLL.1 — Shades of Meaning). The full curriculum has 12 chapters and 60 lessons.'

export const CURRICULUM_STATUS_LABELS = {
  DRAFT: 'Draft',
  IN_REVIEW: 'In review',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
}

export const CURRICULUM_QUESTION_TYPE_LABELS = {
  MCQ: 'Multiple choice',
  OPEN_TEXT: 'Open text',
  OPEN_THEN_MCQ: 'Open then options',
  ICON_MATRIX: 'Icon matrix',
  AVATAR_MESSAGE: 'Avatar message',
  REORDER: 'Reorder',
  HIGHLIGHT: 'Highlight',
  DRAG_DROP: 'Drag and drop',
  CHECKBOX: 'Checkbox',
  CONFIDENCE_METER: 'Confidence meter',
  OPEN_MIC: 'Open mic',
  HANDWRITING_UPLOAD: 'Handwriting upload',
}

export const curriculumQueryKeys = {
  list: (params) => ['admin', 'curriculum', params],
  detail: (id) => ['admin', 'curriculum', id],
}

const USE_MOCK = import.meta.env.VITE_CURRICULUM_USE_MOCK !== 'false'

function withDefaultPagination(params = {}) {
  return {
    page: params.page ?? 1,
    limit: CURRICULUM_PAGE_SIZE,
    ...(params.search ? { search: params.search } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.subject ? { subject: params.subject } : {}),
  }
}

function unwrapPaginated(body) {
  return { items: body.data ?? [], meta: body.meta ?? null }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function filterMockList(params) {
  let items = loadMockCurricula()
  const search = params.search?.trim().toLowerCase()
  if (params.status) {
    items = items.filter((item) => item.status === params.status)
  }
  if (params.subject) {
    items = items.filter(
      (item) => item.subject.toLowerCase() === params.subject.toLowerCase(),
    )
  }
  if (search) {
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        item.slug.toLowerCase().includes(search) ||
        item.subject.toLowerCase().includes(search),
    )
  }

  const page = params.page ?? 1
  const limit = params.limit ?? CURRICULUM_PAGE_SIZE
  const total = items.length
  const lastPage = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit

  return {
    items: items.slice(start, start + limit).map(toListItem),
    meta: {
      total,
      lastPage,
      currentPage: page,
      perPage: limit,
      prev: page > 1 ? page - 1 : null,
      next: page < lastPage ? page + 1 : null,
    },
  }
}

/** @param {import('./curriculum-mock-data').CurriculumDetail} item */
function toListItem(item) {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    subject: item.subject,
    gradeLevel: item.gradeLevel,
    status: item.status,
    version: item.version,
    lessonCount: item.lessonCount,
    estimatedMinutes: item.estimatedMinutes,
    tone: item.tone,
    sourceDocUrl: item.sourceDocUrl,
    updatedAt: item.updatedAt,
    createdAt: item.createdAt,
  }
}

export function isCurriculumMockMode() {
  return USE_MOCK
}

export async function fetchCurricula(params = {}) {
  const query = withDefaultPagination(params)

  if (USE_MOCK) {
    await delay(350)
    return filterMockList(query)
  }

  const { data } = await api.get('/admin/curriculum', { params: query })
  return unwrapPaginated(data)
}

export async function fetchCurriculum(id) {
  if (USE_MOCK) {
    await delay(250)
    const item = loadMockCurricula().find((row) => row.id === Number(id))
    if (!item) throw new Error('Curriculum not found')
    return item
  }

  const { data } = await api.get(`/admin/curriculum/${id}`)
  return data.data
}

/**
 * @param {File} file
 */
export async function parseCurriculumDocument(file) {
  if (USE_MOCK) {
    await delay(1200)
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    const elementStubs = [
      { element: 'a', elementTitle: 'Intensity Scaling' },
      { element: 'b', elementTitle: 'Contextual Fit' },
      { element: 'c', elementTitle: 'Negative/Positive Weight' },
      { element: 'd', elementTitle: 'Synonym Substitution' },
      { element: 'e', elementTitle: 'Precision Check' },
    ]

    return {
      rawText: `Parsed content from ${file.name}…`,
      sourceDocUrl: null,
      parsed: {
        metadata: {
          title: baseName || 'Grade 4 ELA — Shades of Meaning',
          subject: 'ELA',
          gradeLevel: 'Grade 4',
          expectationCode: '4.ELA.WLL.1',
          expectationTitle: 'Shades of Meaning (Nuance)',
          estimatedMinutes: 25,
          tone: 'Warm, professional, encouraging — never shaming',
          betaMode: true,
          betaLessonLimit: CURRICULUM_BETA_LESSON_LIMIT,
          documentScope: `Beta: Lessons 1–${CURRICULUM_BETA_LESSON_LIMIT} only (Expectation 1 of 12)`,
        },
        lessons: elementStubs.map((stub, index) => ({
          key: `lesson-${index + 1}`,
          order: index + 1,
          title: `Lesson ${index + 1}: ${stub.elementTitle}`,
          element: stub.element,
          elementTitle: stub.elementTitle,
          studentLanguage: `I'm able to demonstrate ${stub.elementTitle.toLowerCase()}.`,
          sections: [
            {
              id: 'student-language',
              label: 'Student Language',
              content: `I'm able to demonstrate ${stub.elementTitle.toLowerCase()}.`,
            },
            {
              id: 'instructional-core',
              label: 'Instructional Core',
              content: `Extracted from ${file.name} — connect backend for full document text.`,
            },
          ],
          assessments: [],
          questions: [],
        })),
      },
    }
  }

  const formData = new FormData()
  formData.append('file', file)

  const token = getAdminToken()
  const baseURL = api.defaults.baseURL

  const response = await fetch(`${baseURL}/admin/curriculum/parse-document`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  const json = await response.json()
  if (!response.ok) {
    throw new Error(json?.message || 'Failed to parse document')
  }

  return json.data
}

/**
 * @param {{
 *   parsed: import('./curriculum-mock-data').CurriculumScriptJson;
 *   rawText: string;
 *   sourceDocUrl?: string;
 * }} payload
 */
export async function createCurriculumFromParsed(payload) {
  if (USE_MOCK) {
    await delay(500)
    return createMockCurriculumFromParse({
      scriptJson: payload.parsed,
      rawText: payload.rawText,
      sourceDocUrl: payload.sourceDocUrl,
    })
  }

  const { data } = await api.post('/admin/curriculum', {
    parsed: payload.parsed,
    rawText: payload.rawText,
    sourceDocUrl: payload.sourceDocUrl,
  })
  return data.data
}

/**
 * @param {number} id
 * @param {{ message: string }} payload
 */
export async function refineCurriculumWithAi(id, payload) {
  if (USE_MOCK) {
    await delay(900)
    const current = loadMockCurricula().find((row) => row.id === Number(id))
    if (!current) throw new Error('Curriculum not found')

    const { scriptJson, reply } = simulateRefinement(current, payload.message)
    const messages = [
      ...(current.refinementMessages ?? []),
      {
        id: `u-${Date.now()}`,
        role: 'user',
        content: payload.message,
        createdAt: new Date().toISOString(),
      },
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      },
    ]

    return updateMockCurriculum(id, {
      scriptJson,
      refinementMessages: messages,
      version: current.version + 1,
    })
  }

  const { data } = await api.post(`/admin/curriculum/${id}/refine`, payload)
  return data.data
}

/**
 * @param {number} id
 * @param {{ status: string }} payload
 */
export async function updateCurriculumStatus(id, payload) {
  if (USE_MOCK) {
    await delay(300)
    const patch = { status: payload.status }
    if (payload.status === 'PUBLISHED') {
      patch.version = (loadMockCurricula().find((r) => r.id === id)?.version ?? 0) + 1
    }
    return updateMockCurriculum(id, patch)
  }

  const { data } = await api.patch(`/admin/curriculum/${id}`, payload)
  return data.data
}

export async function deleteCurriculum(id) {
  if (USE_MOCK) {
    await delay(300)
    const items = loadMockCurricula().filter((row) => row.id !== Number(id))
    const { saveMockCurricula } = await import('./curriculum-mock-data')
    saveMockCurricula(items)
    return { id, removed: true }
  }

  const { data } = await api.delete(`/admin/curriculum/${id}`)
  return data.data
}
