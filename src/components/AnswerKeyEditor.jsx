import { useMemo, useState } from 'react'
import { notify } from '../lib/notify'

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? {}))
}

function slugify(value, fallback) {
  const v = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return v || fallback
}

function collectLessons(scriptJson) {
  return Array.isArray(scriptJson?.lessons) ? scriptJson.lessons : []
}

function asOptions(interaction) {
  return Array.isArray(interaction?.options) ? interaction.options : []
}

function normalizeOption(option, index) {
  if (!option || typeof option !== 'object') {
    return {
      id: `opt-${index + 1}`,
      label: `Option ${index + 1}`,
      correct: false,
    }
  }
  return {
    id: String(option.id ?? `opt-${index + 1}`),
    label: String(option.label ?? `Option ${index + 1}`),
    correct: option.correct === true,
  }
}

function toOrderText(value) {
  return Array.isArray(value) ? value.join(', ') : ''
}

function pretestFromLesson(lesson) {
  const out = []
  const segments = Array.isArray(lesson?.runtimePlan?.segments)
    ? lesson.runtimePlan.segments
    : []

  segments.forEach((segment, segmentIndex) => {
    if (segment?.phase !== 'quick_check') return
    const ix = segment?.interaction
    if (!ix) return
    const options = asOptions(ix).map(normalizeOption)
    const correct = options.find((o) => o.correct)
    out.push({
      key: `runtime-${segment.id ?? segmentIndex}`,
      source: 'Runtime quick_check',
      prompt: ix.prompt || segment.title || `Quick check ${segmentIndex + 1}`,
      type: ix.type || 'single_choice',
      correct: Array.isArray(ix.correctOrder) && ix.correctOrder.length
        ? ix.correctOrder.join(' -> ')
        : (correct?.label ?? 'No correct option set'),
    })
  })

  const assessments = [
    ...(Array.isArray(lesson?.assessments) ? lesson.assessments : []),
    ...(Array.isArray(lesson?.questions) ? lesson.questions : []),
  ]
  assessments.forEach((item, index) => {
    const rawOptions = Array.isArray(item?.options) ? item.options : []
    if (!rawOptions.length) return
    let correct = ''
    if (rawOptions[0] && typeof rawOptions[0] === 'object') {
      const opts = rawOptions.map(normalizeOption)
      correct = opts.find((o) => o.correct)?.label ?? opts[0]?.label ?? ''
    } else {
      correct = String(rawOptions[0] ?? '')
    }
    out.push({
      key: `assessment-${item?.key ?? index}`,
      source: 'Lesson assessment',
      prompt: item?.prompt || `Assessment ${index + 1}`,
      type: item?.type || 'MCQ',
      correct,
    })
  })

  return out
}

export default function AnswerKeyEditor({
  scriptJson,
  title = 'Answer key',
  onSave,
  saveLabel = 'Save answer key',
  readOnly = false,
}) {
  const [draft, setDraft] = useState(() => clone(scriptJson))
  const [saving, setSaving] = useState(false)

  const lessons = useMemo(() => collectLessons(draft), [draft])

  function setCorrectOption(lessonIndex, segmentIndex, optionId) {
    setDraft((prev) => {
      const next = clone(prev)
      const options =
        next?.lessons?.[lessonIndex]?.runtimePlan?.segments?.[segmentIndex]?.interaction?.options
      if (!Array.isArray(options)) return prev
      options.forEach((opt) => {
        if (!opt || typeof opt !== 'object') return
        opt.correct = String(opt.id) === String(optionId)
      })
      return next
    })
  }

  function setCorrectOrderText(lessonIndex, segmentIndex, rawValue) {
    setDraft((prev) => {
      const next = clone(prev)
      const interaction =
        next?.lessons?.[lessonIndex]?.runtimePlan?.segments?.[segmentIndex]?.interaction
      if (!interaction || typeof interaction !== 'object') return prev
      interaction.correctOrder = rawValue
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
      return next
    })
  }

  function setCorrectOrderFromOptions(lessonIndex, segmentIndex, mode = 'listed') {
    setDraft((prev) => {
      const next = clone(prev)
      const interaction =
        next?.lessons?.[lessonIndex]?.runtimePlan?.segments?.[segmentIndex]?.interaction
      if (!interaction || typeof interaction !== 'object') return prev
      const options = asOptions(interaction).map(normalizeOption)
      const ids =
        mode === 'alpha'
          ? options
              .slice()
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((opt) => opt.id)
          : options.map((opt) => opt.id)
      interaction.correctOrder = ids
      return next
    })
  }

  async function handleSave() {
    if (!onSave || readOnly) return
    try {
      setSaving(true)
      await onSave(draft)
      notify.success('Answer key updated')
    } catch (error) {
      notify.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ backgroundColor: '#313044' }}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-white font-semibold">{title}</h3>
        {!readOnly && onSave && (
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg bg-[#00CED1] text-[#111023] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving…' : saveLabel}
          </button>
        )}
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-auto pr-1">
        {lessons.map((lesson, lessonIndex) => {
          const segments = Array.isArray(lesson?.runtimePlan?.segments)
            ? lesson.runtimePlan.segments
            : []
          const quickChecks = segments
            .map((segment, segmentIndex) => ({ segment, segmentIndex }))
            .filter(({ segment }) => segment?.phase === 'quick_check' && segment?.interaction)
          const pretestRows = pretestFromLesson(lesson)
          return (
            <div key={lesson?.key ?? `lesson-${lessonIndex}`} className="rounded-xl border border-white/10 p-3 space-y-3">
              <p className="text-white font-semibold text-sm">
                {lesson?.title || lesson?.key || `Lesson ${lessonIndex + 1}`}
              </p>

              {pretestRows.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[#00CED1] text-[11px] uppercase tracking-wider font-semibold">
                    Pre-test source answers
                  </p>
                  {pretestRows.map((row) => (
                    <div key={row.key} className="rounded-lg bg-black/20 p-2">
                      <p className="text-white/80 text-xs">{row.prompt}</p>
                      <p className="text-white/50 text-[11px]">
                        {row.source} · {row.type} · Correct: {row.correct}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {quickChecks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[#00CED1] text-[11px] uppercase tracking-wider font-semibold">
                    Lesson quick-check answer key
                  </p>
                  {quickChecks.map(({ segment, segmentIndex }, i) => {
                    const interaction = segment.interaction
                    const options = asOptions(interaction).map(normalizeOption)
                    const orderText = toOrderText(interaction?.correctOrder)
                    return (
                      <div key={segment?.id ?? `${lessonIndex}-${segmentIndex}`} className="rounded-lg bg-black/20 p-2 space-y-2">
                        <p className="text-white/80 text-xs">
                          {interaction?.prompt || segment?.title || `Quick check ${i + 1}`}
                        </p>
                        {options.length > 0 && (
                          <div className="space-y-1">
                            {options.map((opt) => (
                              <div key={slugify(opt.id, opt.label)} className="flex items-center justify-between gap-2 text-xs text-white/75">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`qc-${lessonIndex}-${segmentIndex}`}
                                    checked={opt.correct === true}
                                    disabled={readOnly}
                                    onChange={() =>
                                      setCorrectOption(lessonIndex, segmentIndex, opt.id)
                                    }
                                  />
                                  <span>{opt.label}</span>
                                </label>
                                <button
                                  type="button"
                                  disabled={readOnly}
                                  onClick={() =>
                                    setCorrectOrderText(
                                      lessonIndex,
                                      segmentIndex,
                                      orderText ? `${orderText}, ${opt.id}` : opt.id,
                                    )
                                  }
                                  className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70 hover:bg-white/20 disabled:opacity-40"
                                  title="Append this id to correct order"
                                >
                                  id: {opt.id}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {(interaction?.type === 'word_ladder' ||
                          interaction?.type === 'sort' ||
                          interaction?.type === 'repair') && (
                          <div>
                            <p className="text-white/50 text-[11px] mb-1">
                              Correct order ids (comma separated)
                            </p>
                            <input
                              value={orderText}
                              disabled={readOnly}
                              onChange={(e) =>
                                setCorrectOrderText(
                                  lessonIndex,
                                  segmentIndex,
                                  e.target.value,
                                )
                              }
                              className="w-full rounded-md bg-[#111023] border border-white/10 px-2 py-1 text-xs text-white"
                            />
                            <div className="mt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={readOnly}
                                onClick={() =>
                                  setCorrectOrderFromOptions(
                                    lessonIndex,
                                    segmentIndex,
                                    'listed',
                                  )
                                }
                                className="rounded bg-white/10 px-2 py-1 text-[10px] text-white/70 hover:bg-white/20 disabled:opacity-40"
                              >
                                Use listed option id order
                              </button>
                              <button
                                type="button"
                                disabled={readOnly}
                                onClick={() =>
                                  setCorrectOrderFromOptions(
                                    lessonIndex,
                                    segmentIndex,
                                    'alpha',
                                  )
                                }
                                className="rounded bg-white/10 px-2 py-1 text-[10px] text-white/70 hover:bg-white/20 disabled:opacity-40"
                              >
                                Use A→Z option id order
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
