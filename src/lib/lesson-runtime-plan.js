/** @typedef {'teach' | 'practice' | 'quick_check'} ClassPhase */

export const LESSON_CONTENT_DURATION_MINUTES = 15

export const PHASE_LABELS = {
  teach: 'Lesson',
  practice: 'Practice',
  quick_check: 'Quick Check',
}

export const PHASE_BADGE_CLASS = {
  teach: 'bg-[#00CED1]/15 text-[#00CED1] border-[#00CED1]/30',
  practice: 'bg-[#FFC542]/15 text-[#FFC542] border-[#FFC542]/30',
  quick_check: 'bg-[#FF7B7B]/15 text-[#FF7B7B] border-[#FF7B7B]/30',
}

export const INTERACTION_TYPE_LABELS = {
  single_choice: 'Single choice',
  word_pick: 'Word pick',
  word_ladder: 'Word ladder',
}

/**
 * @param {unknown} value
 * @returns {value is import('./curriculum-mock-data').LessonRuntimePlan}
 */
export function isLessonRuntimePlan(value) {
  if (!value || typeof value !== 'object') return false
  const plan = /** @type {{ version?: number; segments?: unknown[] }} */ (value)
  return plan.version === 1 && Array.isArray(plan.segments) && plan.segments.length > 0
}

/** @param {number | undefined} minute */
export function formatPlanMinute(minute) {
  if (minute == null || !Number.isFinite(minute)) return '—'
  const totalSeconds = Math.round(minute * 60)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * @param {{ startMinute?: number; endMinute?: number }} segment
 * @param {number} index
 * @param {number} totalSegments
 * @param {number} totalMinutes
 */
export function segmentTimeLabel(segment, index, totalSegments, totalMinutes) {
  if (
    segment.startMinute != null &&
    segment.endMinute != null &&
    Number.isFinite(segment.startMinute) &&
    Number.isFinite(segment.endMinute)
  ) {
    return `${formatPlanMinute(segment.startMinute)} – ${formatPlanMinute(segment.endMinute)}`
  }

  const slice = totalMinutes / Math.max(totalSegments, 1)
  const start = index * slice
  const end = Math.min(totalMinutes, (index + 1) * slice)
  return `~${formatPlanMinute(start)} – ${formatPlanMinute(end)}`
}
