/** Standard live class length per lesson (minutes). */
export const CLASS_DURATION_MINUTES = 15

/** Relative weight per section label for time allocation. */
const WEIGHT_BY_LABEL = {
  'Student Language': 1,
  Prerequisites: 1.5,
  'Instructional Core': 4,
  'Practice Examples': 3,
  'Mastery Marker': 2,
  'Lesson Content': 3,
  'Element Gateway (Pre-assessment)': 2,
  Hook: 1,
  Recap: 1,
  'Core Instruction (I Do)': 3.5,
  'Guided Practice (We Do)': 2.5,
  'Second Pass (You Do)': 2,
  'Clarifying Questions': 1,
  'Readiness Check': 0.5,
  'Final Performance': 2.5,
  'Wrap-Up': 1,
}

function weightForLabel(label) {
  if (label.startsWith('Assessment')) return 2
  return WEIGHT_BY_LABEL[label] ?? 2
}

/**
 * @param {import('./curriculum-mock-data').CurriculumLesson | undefined} lesson
 * @param {number} [totalMinutes]
 */
export function buildClassSteps(lesson, totalMinutes = CLASS_DURATION_MINUTES) {
  if (!lesson) return []

  const sections = lesson.sections ?? []
  const assessments = lesson.assessments ?? lesson.questions ?? []

  const rawSteps = [
    ...sections.map((s) => ({
      id: s.id,
      label: s.label,
      content: s.content,
    })),
    ...assessments.map((q, i) => ({
      id: `assessment-${q.key ?? i}`,
      label: `Assessment ${q.order}`,
      content: q.prompt,
      meta: q.type,
    })),
  ]

  if (rawSteps.length === 0) return []

  const weights = rawSteps.map((s) => weightForLabel(s.label))
  const totalWeight = weights.reduce((sum, w) => sum + w, 0) || 1

  let allocated = 0
  const steps = rawSteps.map((step, index) => {
    const isLast = index === rawSteps.length - 1
    let durationMinutes = isLast
      ? totalMinutes - allocated
      : Math.round(((weights[index] / totalWeight) * totalMinutes) * 4) / 4

    durationMinutes = Math.max(0.5, durationMinutes)
    allocated += durationMinutes

    return { ...step, durationMinutes }
  })

  const sum = steps.reduce((acc, s) => acc + s.durationMinutes, 0)
  if (steps.length > 0 && Math.abs(sum - totalMinutes) > 0.05) {
    steps[steps.length - 1].durationMinutes = Math.max(
      0.5,
      steps[steps.length - 1].durationMinutes + (totalMinutes - sum),
    )
  }

  let elapsed = 0
  return steps.map((step) => {
    const startMinute = elapsed
    elapsed += step.durationMinutes
    return {
      ...step,
      startMinute,
      endMinute: elapsed,
    }
  })
}

/** @param {number} minutes */
export function formatClassDuration(minutes) {
  const totalSeconds = Math.round(minutes * 60)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  if (m === 0) return `${s}s`
  if (s === 0) return `${m} min`
  return `${m} min ${s}s`
}
