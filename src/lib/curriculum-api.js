import { api } from './api'
import { getAdminToken } from './auth-cookies'
import {
  createMockCurriculumFromParse,
  loadMockCurricula,
  simulateRefinement,
  updateMockCurriculum,
} from './curriculum-mock-data'

export const CURRICULUM_PAGE_SIZE = 10

/** Super Admin can extract 5–60 lessons from an uploaded curriculum document. */
export const CURRICULUM_MIN_LESSON_LIMIT = 5
export const CURRICULUM_BETA_LESSON_LIMIT = 60

export const CURRICULUM_BETA_INFO_MESSAGE =
  'Choose how many lessons to extract (5–60). Use 60 for the full Grade 4 ELA track.'

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
 * Returns per-lesson pre-test + assessment answer key for admin review.
 * @param {number} curriculumId
 * @param {string} lessonKey
 */
export async function fetchLessonAnswerKey(curriculumId, lessonKey) {
  const { data } = await api.get(
    `/admin/curriculum/${curriculumId}/lesson-answer-key`,
    { params: { lessonKey } },
  )
  return data.data
}

/**
 * @param {File} file
 * @param {number} [lessonLimit]
 */
export async function parseCurriculumDocument(file, lessonLimit = CURRICULUM_BETA_LESSON_LIMIT) {
  const count = Math.min(
    CURRICULUM_BETA_LESSON_LIMIT,
    Math.max(
      CURRICULUM_MIN_LESSON_LIMIT,
      Math.round(Number(lessonLimit) || CURRICULUM_MIN_LESSON_LIMIT),
    ),
  )
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

    const lessons = Array.from({ length: count }, (_, index) => {
      const stub = elementStubs[index] ?? {
        element: '',
        elementTitle: `Lesson ${index + 1}`,
      }
      return {
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
      }
    })

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
          betaLessonLimit: count,
          documentScope: `Lessons 1–${count} extracted from upload`,
        },
        lessons,
      },
    }
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('lessonLimit', String(count))

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

export async function updateCurriculumScript(id, scriptJson) {
  const { data } = await api.patch(`/admin/curriculum/${id}`, { scriptJson })
  return data.data
}

/**
 * Pre-generate shared AI lesson runtime plans (before publish).
 * @param {number} id
 */
export async function generateCurriculumRuntimes(id) {
  if (USE_MOCK) {
    await delay(2500)
    const current = loadMockCurricula().find((row) => row.id === Number(id))
    if (!current) throw new Error('Curriculum not found')

    const scriptJson = structuredClone(current.scriptJson)
    for (const lesson of scriptJson?.lessons ?? []) {
      lesson.runtimePlan = {
        version: 1,
        totalMinutes: 15,
        teachUntilMinute: 12,
        segments: [
          {
            id: `${lesson.key}-teach`,
            phase: 'teach',
            title: lesson.title ?? 'Lesson',
            narrationScript: 'Mock narration for preview.',
            lines: ['Mock blackboard line'],
          },
        ],
      }
    }

    return {
      curriculum: updateMockCurriculum(id, {
        version: current.version + 1,
        scriptJson,
      }),
      results: (scriptJson?.lessons ?? []).map((lesson) => ({
        key: lesson.key,
        runtimePlan: lesson.runtimePlan,
      })),
    }
  }

  const { data } = await api.post(`/admin/curriculum/${id}/generate-runtimes`)
  return data.data
}

export function countLessonsWithRuntime(scriptJson) {
  const lessons = scriptJson?.lessons ?? []
  return lessons.filter((lesson) => {
    const plan = lesson?.runtimePlan
    return plan?.version === 1 && Array.isArray(plan.segments) && plan.segments.length > 0
  }).length
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
