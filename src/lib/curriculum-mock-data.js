/** @typedef {'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED'} CurriculumStatus */

/**
 * @typedef {{
 *   key: string;
 *   order: number;
 *   prompt: string;
 *   type: string;
 *   options?: string[];
 *   notes?: string;
 * }} CurriculumQuestion
 */

/**
 * @typedef {{
 *   metadata: {
 *     title: string;
 *     subject?: string;
 *     gradeLevel?: string;
 *     expectationCode?: string;
 *     expectationTitle?: string;
 *     estimatedMinutes?: number;
 *     tone?: string;
 *     betaMode?: boolean;
 *     betaLessonLimit?: number;
 *     documentScope?: string;
 *   };
 *   lessons: CurriculumLesson[];
 * }} CurriculumScriptJson
 */

/**
 * @typedef {{
 *   key: string;
 *   order: number;
 *   title: string;
 *   element?: string;
 *   elementTitle?: string;
 *   studentLanguage?: string;
 *   concept?: string;
 *   terms?: string[];
 *   prerequisites?: string[];
 *   attemptType?: 'first_teach' | 're_teach' | 'repair';
 *   flow?: Record<string, { type: string; content: string; tool?: string; interaction?: string; questionCount?: number; passThreshold?: number; notes?: string }>;
 *   objectives?: string[];
 *   teachBlocks?: { type: string; content: string }[];
 *   questions: CurriculumQuestion[];
 * }} CurriculumLesson
 */

/**
 * @typedef {{
 *   id: number;
 *   title: string;
 *   slug: string;
 *   subject: string;
 *   gradeLevel: string;
 *   status: CurriculumStatus;
 *   version: number;
 *   lessonCount: number;
 *   estimatedMinutes?: number | null;
 *   tone?: string | null;
 *   sourceDocUrl?: string | null;
 *   updatedAt: string;
 *   createdAt: string;
 * }} CurriculumListItem
 */

/**
 * @typedef {CurriculumListItem & {
 *   description?: string | null;
 *   scriptJson: CurriculumScriptJson;
 *   rawText?: string;
 *   refinementMessages?: RefinementMessage[];
 * }} CurriculumDetail
 */

/** @typedef {{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }} RefinementMessage */

export const SAMPLE_PARSED_SCRIPT = {
  metadata: {
    title: 'Introduction to Fractions',
    subject: 'Mathematics',
    gradeLevel: 'Grade 4',
    estimatedMinutes: 25,
    tone: 'Warm, encouraging, zero shame',
  },
  lessons: [
    {
      key: 'lesson-1',
      order: 1,
      title: 'What is a fraction?',
      objectives: ['Understand numerator and denominator', 'Identify parts of a whole'],
      teachBlocks: [
        {
          type: 'explain',
          content:
            'A fraction shows parts of a whole. The top number is the numerator — how many parts you have. The bottom is the denominator — how many equal parts the whole is split into.',
        },
      ],
      questions: [
        {
          key: 'q1',
          order: 1,
          prompt: 'Which picture shows one half shaded?',
          type: 'MCQ',
          options: ['A', 'B', 'C', 'D'],
        },
        {
          key: 'q2',
          order: 2,
          prompt: 'In the fraction 3/4, what does the 4 represent?',
          type: 'OPEN_TEXT',
        },
      ],
    },
    {
      key: 'lesson-2',
      order: 2,
      title: 'Comparing fractions',
      objectives: ['Compare fractions with the same denominator'],
      teachBlocks: [
        {
          type: 'explain',
          content:
            'When denominators match, compare numerators. The bigger numerator means a larger fraction.',
        },
      ],
      questions: [
        {
          key: 'q3',
          order: 1,
          prompt: 'Which is larger: 2/5 or 4/5?',
          type: 'MCQ',
          options: ['2/5', '4/5', 'They are equal'],
        },
      ],
    },
  ],
}

const MOCK_STORAGE_KEY = 'thaylo-admin-curriculum-mock'

function nowIso() {
  return new Date().toISOString()
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** @returns {CurriculumDetail[]} */
export function loadMockCurricula() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(MOCK_STORAGE_KEY)
    if (!raw) return seedMockCurricula()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : seedMockCurricula()
  } catch {
    return seedMockCurricula()
  }
}

/** @param {CurriculumDetail[]} items */
export function saveMockCurricula(items) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(items))
}

/** @returns {CurriculumDetail[]} */
function seedMockCurricula() {
  const createdAt = nowIso()
  const items = [
    {
      id: 1,
      title: 'Introduction to Fractions',
      slug: 'introduction-to-fractions',
      subject: 'Mathematics',
      gradeLevel: 'Grade 4',
      status: 'DRAFT',
      version: 1,
      lessonCount: 2,
      estimatedMinutes: 25,
      tone: 'Warm, encouraging, zero shame',
      sourceDocUrl: null,
      description: 'Parsed from fractions-unit-grade4.docx',
      scriptJson: SAMPLE_PARSED_SCRIPT,
      rawText: 'Sample document text for Introduction to Fractions…',
      refinementMessages: [
        {
          id: 'm1',
          role: 'assistant',
          content:
            "I've structured your document into 2 lessons with teaching blocks and check-for-understanding questions. Tell me what you'd like to refine.",
          createdAt: createdAt,
        },
      ],
      createdAt,
      updatedAt: createdAt,
    },
  ]
  saveMockCurricula(items)
  return items
}

/** @param {Partial<CurriculumDetail>} input */
export function createMockCurriculumFromParse(input) {
  const items = loadMockCurricula()
  const nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1
  const title = input.scriptJson?.metadata?.title ?? input.title ?? 'Untitled curriculum'
  const createdAt = nowIso()

  /** @type {CurriculumDetail} */
  const item = {
    id: nextId,
    title,
    slug: `${slugify(title)}-${nextId}`,
    subject: input.scriptJson?.metadata?.subject ?? input.subject ?? 'General',
    gradeLevel: input.scriptJson?.metadata?.gradeLevel ?? input.gradeLevel ?? '—',
    status: 'DRAFT',
    version: 1,
    lessonCount: input.scriptJson?.lessons?.length ?? 0,
    estimatedMinutes: input.scriptJson?.metadata?.estimatedMinutes ?? null,
    tone: input.scriptJson?.metadata?.tone ?? null,
    sourceDocUrl: input.sourceDocUrl ?? null,
    description: input.description ?? 'Uploaded from document',
    scriptJson: input.scriptJson ?? { metadata: { title }, lessons: [] },
    rawText: input.rawText ?? '',
    refinementMessages: [
      {
        id: `m-${Date.now()}`,
        role: 'assistant',
        content:
          "Document parsed successfully. I've drafted lessons and questions — use the chat to refine tone, difficulty, or structure before publishing.",
        createdAt,
      },
    ],
    createdAt,
    updatedAt: createdAt,
  }

  items.unshift(item)
  saveMockCurricula(items)
  return item
}

/** @param {number} id @param {Partial<CurriculumDetail>} patch */
export function updateMockCurriculum(id, patch) {
  const items = loadMockCurricula()
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return null

  const current = items[index]
  const scriptJson = patch.scriptJson ?? current.scriptJson
  const updated = {
    ...current,
    ...patch,
    scriptJson,
    lessonCount: scriptJson.lessons?.length ?? current.lessonCount,
    estimatedMinutes:
      scriptJson.metadata?.estimatedMinutes ?? current.estimatedMinutes,
    tone: scriptJson.metadata?.tone ?? current.tone,
    title: scriptJson.metadata?.title ?? patch.title ?? current.title,
    subject: scriptJson.metadata?.subject ?? patch.subject ?? current.subject,
    gradeLevel:
      scriptJson.metadata?.gradeLevel ?? patch.gradeLevel ?? current.gradeLevel,
    updatedAt: nowIso(),
  }

  items[index] = updated
  saveMockCurricula(items)
  return updated
}

/** Simulated AI refinement — applies light edits for UI testing */
export function simulateRefinement(curriculum, userMessage) {
  const lower = userMessage.toLowerCase()
  /** @type {CurriculumScriptJson} */
  const scriptJson = structuredClone(curriculum.scriptJson)
  let reply =
    "I've noted your feedback. Review the lesson preview on the left — highlights show what changed."

  if (lower.includes('simpl') || lower.includes('easier')) {
    if (scriptJson.lessons[0]?.teachBlocks?.[0]) {
      scriptJson.lessons[0].teachBlocks[0].content +=
        ' Think of it like sharing a pizza equally with friends.'
    }
    reply =
      'I simplified the opening explanation in Lesson 1 and added a pizza analogy. Check the teach block preview.'
  } else if (lower.includes('emotional') || lower.includes('encourag')) {
    scriptJson.metadata.tone = 'Extra warm, validating, celebrates small wins'
    reply =
      'Updated the curriculum tone to be more emotionally supportive. Calyx will use gentler encouragement during delivery.'
  } else if (lower.includes('question') && lower.includes('add')) {
    const lesson = scriptJson.lessons[0]
    if (lesson) {
      lesson.questions.push({
        key: `q-${Date.now()}`,
        order: lesson.questions.length + 1,
        prompt: 'Can you think of a fraction in everyday life?',
        type: 'OPEN_TEXT',
        notes: 'Added per admin request',
      })
    }
    reply = 'Added a reflective open question to Lesson 1. Review the questions list.'
  } else if (lower.includes('remove') || lower.includes('delete')) {
    reply =
      'Tell me which lesson or question number to remove, and I will update the draft.'
  }

  return { scriptJson, reply }
}
