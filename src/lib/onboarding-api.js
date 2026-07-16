import { api } from './api'
import { getAdminToken } from './auth-cookies'

export const ONBOARDING_PAGE_SIZE = 10

/** @typedef {'IMMEDIATE' | 'AFTER_TWO_WEEKS'} OnboardingTiming */
/** @typedef {'PARENT' | 'STUDENT' | 'COMBINED'} OnboardingAudience */
/** @typedef {'DRAFT' | 'PUBLISHED' | 'ARCHIVED'} OnboardingWalkthroughStatus */
/** @typedef {'PARENT' | 'STUDENT' | 'BOTH'} OnboardingAudienceSelection */

/**
 * @typedef {{
 *   key: string;
 *   order: number;
 *   prompt: string;
 *   type: string;
 *   options?: string[];
 *   subItems?: string[];
 *   requiresResponse?: boolean;
 *   notes?: string;
 * }} ParsedQuestion
 */

/**
 * @typedef {{
 *   metadata: {
 *     title: string;
 *     assessmentNumber?: number;
 *     timingHint?: string;
 *     studentLengthMinutes?: number;
 *     parentLengthMinutes?: number;
 *     tone?: string;
 *   };
 *   studentSection?: { intro?: string; avatarFraming?: string; questions: ParsedQuestion[] };
 *   parentSection?: { intro?: string; questions: ParsedQuestion[] };
 * }} ParsedOnboardingDocument
 */

/**
 * @typedef {{
 *   rawText: string;
 *   sourceDocUrl?: string;
 *   parsed: ParsedOnboardingDocument;
 * }} ParseDocumentResult
 */

export const onboardingQueryKeys = {
  list: (params) => ['admin', 'onboarding-walkthroughs', params],
  detail: (id) => ['admin', 'onboarding-walkthroughs', id],
}

export const ONBOARDING_TIMING_LABELS = {
  IMMEDIATE: 'Immediate (after signup)',
  AFTER_TWO_WEEKS: 'After 2 weeks',
}

export const ONBOARDING_AUDIENCE_LABELS = {
  PARENT: 'Parent',
  STUDENT: 'Student',
  COMBINED: 'Combined',
}

export const ONBOARDING_STATUS_LABELS = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
}

export const QUESTION_TYPE_LABELS = {
  MCQ: 'Multiple choice',
  OPEN_TEXT: 'Open text',
  OPEN_THEN_MCQ: 'Open then options',
  ICON_MATRIX: 'Icon / skill matrix',
  AVATAR_MESSAGE: 'Avatar message (no answer)',
}

function withDefaultPagination(params = {}) {
  return {
    page: params.page ?? 1,
    limit: ONBOARDING_PAGE_SIZE,
    ...(params.search ? { search: params.search } : {}),
    ...(params.timing ? { timing: params.timing } : {}),
    ...(params.audience ? { audience: params.audience } : {}),
    ...(params.status ? { status: params.status } : {}),
  }
}

function unwrapPaginated(body) {
  return { items: body.data ?? [], meta: body.meta ?? null }
}

export async function fetchOnboardingWalkthroughs(params = {}) {
  const { data } = await api.get('/admin/onboarding-walkthroughs', {
    params: withDefaultPagination(params),
  })
  return unwrapPaginated(data)
}

export async function fetchOnboardingWalkthrough(id) {
  const { data } = await api.get(`/admin/onboarding-walkthroughs/${id}`)
  return data.data
}

/**
 * @param {File} file
 * @returns {Promise<ParseDocumentResult>}
 */
export async function parseOnboardingDocument(file) {
  const formData = new FormData()
  formData.append('file', file)

  const token = getAdminToken()
  const baseURL = api.defaults.baseURL

  const response = await fetch(`${baseURL}/admin/onboarding-walkthroughs/parse-document`, {
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
 *   parsed: ParsedOnboardingDocument;
 *   rawText: string;
 *   sourceDocUrl?: string;
 *   audienceSelection: OnboardingAudienceSelection;
 *   timing: OnboardingTiming;
 *   sortOrder?: number;
 *   status?: OnboardingWalkthroughStatus;
 *   showFrom?: string;
 *   showUntil?: string;
 * }} payload
 */
export async function publishParsedOnboarding(payload) {
  const { data } = await api.post('/admin/onboarding-walkthroughs/publish-parsed', payload)
  return data.data
}

export async function updateOnboardingWalkthrough(id, payload) {
  const { data } = await api.patch(`/admin/onboarding-walkthroughs/${id}`, payload)
  return data.data
}

export async function deleteOnboardingWalkthrough(id) {
  const { data } = await api.delete(`/admin/onboarding-walkthroughs/${id}`)
  return data.data
}
