import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react'
import {
  INTERACTION_TYPE_LABELS,
  LESSON_CONTENT_DURATION_MINUTES,
  PHASE_BADGE_CLASS,
  PHASE_LABELS,
  formatPlanMinute,
  isLessonRuntimePlan,
  segmentTimeLabel,
} from '../lib/lesson-runtime-plan'

function PhaseBadge({ phase }) {
  return (
    <span
      className={
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ' +
        (PHASE_BADGE_CLASS[phase] ?? PHASE_BADGE_CLASS.teach)
      }
    >
      {PHASE_LABELS[phase] ?? phase}
    </span>
  )
}

function InteractionPreview({ interaction, phase }) {
  if (!interaction) return null

  const showHints = phase === 'quick_check'
  const isWordLadder = interaction.type === 'word_ladder'
  const correctOrder = interaction.correctOrder ?? []

  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
          Student interaction
        </p>
        <span className="text-[10px] rounded-full bg-white/10 text-white/60 px-2 py-0.5">
          {INTERACTION_TYPE_LABELS[interaction.type] ?? interaction.type}
        </span>
      </div>

      <p className="text-white text-sm font-semibold leading-relaxed">{interaction.prompt}</p>

      {isWordLadder ? (
        <div className="space-y-3">
          <p className="text-white/50 text-xs">Drag-and-drop words (student view)</p>
          <div className="flex flex-wrap gap-2">
            {interaction.options.map((option) => (
              <span
                key={option.id}
                className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white font-medium"
              >
                {option.label}
                {showHints && option.hint?.trim() && (
                  <span className="block text-[10px] text-white/45 mt-1 font-normal">
                    Hint: {option.hint.trim()}
                  </span>
                )}
              </span>
            ))}
          </div>
          {correctOrder.length > 0 && (
            <p className="text-xs text-[#00CED1]">
              Correct order (weak → strong):{' '}
              {correctOrder
                .map((id) => interaction.options.find((opt) => opt.id === id)?.label ?? id)
                .join(' → ')}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {interaction.options.map((option) => {
            const isCorrect = option.correct === true
            return (
              <div
                key={option.id}
                className={
                  'rounded-xl border px-3 py-2.5 ' +
                  (isCorrect
                    ? 'border-[#00CED1]/50 bg-[#00CED1]/10'
                    : 'border-white/15 bg-white/5')
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm text-white font-medium">{option.label}</span>
                  {isCorrect && (
                    <span className="shrink-0 text-[10px] font-semibold text-[#00CED1] uppercase">
                      Correct
                    </span>
                  )}
                </div>
                {showHints && option.hint?.trim() && (
                  <p className="text-[11px] text-white/50 mt-1.5 leading-snug">
                    Hint: {option.hint.trim()}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BlackboardPreview({ segment }) {
  const lines = segment.lines ?? []
  const bullets = segment.bulletPoints ?? []

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#2d4a3e] min-h-[220px]">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #1a3d32 0%, #0f2922 45%, #0a1f1a 100%)',
        }}
      />
      <div className="relative z-10 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#00CED1]/20 border border-[#00CED1]/40 flex items-center justify-center text-[#00CED1] text-sm font-bold">
            AI
          </div>
          <div>
            <p className="text-[11px] text-white/50">AI Instructor — Blackboard</p>
            <p className="text-white font-bold text-base">{segment.title}</p>
          </div>
        </div>

        <div className="space-y-2 text-[#E8F5E9] text-sm leading-relaxed">
          {lines.length === 0 && bullets.length === 0 && !segment.interaction && (
            <p className="text-white/35 italic text-sm">No board lines — narration only.</p>
          )}
          {lines.map((line) => (
            <p key={line} className="font-medium">
              {line}
            </p>
          ))}
          {bullets.length > 0 && (
            <ul className="space-y-1.5 pl-1">
              {bullets.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="text-[#7dd3a8] mt-0.5 text-[10px]">●</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {segment.interaction && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-[#E8F5E9] text-sm font-semibold">{segment.interaction.prompt}</p>
            <p className="text-white/40 text-xs mt-1">
              Interactive step — full options shown below.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Walk through AI-generated runtimePlan.segments (what the child experiences in live class).
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   scriptJson: import('../lib/curriculum-mock-data').CurriculumScriptJson;
 *   title?: string;
 *   initialLessonIndex?: number;
 * }} props
 */
export default function CurriculumAiPlanPreviewModal({
  open,
  onClose,
  scriptJson,
  title,
  initialLessonIndex = 0,
}) {
  const lessons = scriptJson?.lessons ?? []
  const [lessonIndex, setLessonIndex] = useState(initialLessonIndex)
  const [segmentIndex, setSegmentIndex] = useState(0)

  useEffect(() => {
    if (open) {
      setLessonIndex(initialLessonIndex)
      setSegmentIndex(0)
    }
  }, [open, initialLessonIndex])

  const lesson = lessons[lessonIndex]
  const runtimePlan = isLessonRuntimePlan(lesson?.runtimePlan) ? lesson.runtimePlan : null
  const segments = runtimePlan?.segments ?? []
  const totalMinutes = runtimePlan?.totalMinutes ?? LESSON_CONTENT_DURATION_MINUTES
  const teachUntil = runtimePlan?.teachUntilMinute ?? 12
  const currentSegment = segments[segmentIndex]
  const isFirst = segmentIndex === 0
  const isLast = segmentIndex >= segments.length - 1

  const lessonsWithPlan = useMemo(
    () =>
      lessons
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => isLessonRuntimePlan(item?.runtimePlan)),
    [lessons],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-label="Close AI lesson plan preview"
      />
      <div
        className="relative w-full max-w-6xl max-h-[94vh] rounded-3xl flex flex-col overflow-hidden border border-[#00CED1]/20 shadow-2xl"
        style={{ backgroundColor: '#1a1830' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-plan-preview-title"
      >
        <div className="shrink-0 px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#00CED1]/15 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-[#00CED1]" />
            </div>
            <div className="min-w-0">
              <h3 id="ai-plan-preview-title" className="text-white font-bold text-lg truncate">
                AI lesson plan preview
              </h3>
              <p className="text-white/50 text-xs truncate">
                {title ?? scriptJson?.metadata?.title ?? 'Curriculum'} · student live-class script
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00CED1]/10 text-[#00CED1] text-xs font-semibold px-3 py-1.5">
              <Clock size={12} />
              {totalMinutes} min · assess at {formatPlanMinute(teachUntil)}
            </span>
            {runtimePlan?.generationType && (
              <span className="text-[10px] uppercase tracking-wider text-white/40 bg-white/5 rounded-full px-2 py-1">
                {runtimePlan.generationType}
              </span>
            )}
            <select
              value={lessonIndex}
              onChange={(e) => {
                setLessonIndex(Number(e.target.value))
                setSegmentIndex(0)
              }}
              className="rounded-xl bg-white/5 border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#00CED1]/40 max-w-[220px]"
            >
              {lessons.map((l, i) => (
                <option key={l.key} value={i} className="bg-[#252338]">
                  Lesson {l.order}: {l.elementTitle ?? l.title}
                  {!isLessonRuntimePlan(l.runtimePlan) ? ' (no AI plan)' : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!runtimePlan || segments.length === 0 ? (
          <div className="flex-1 p-10 text-center space-y-3">
            <p className="text-white/70 text-sm">
              No AI lesson plan for this lesson yet.
            </p>
            <p className="text-white/40 text-xs max-w-md mx-auto leading-relaxed">
              Click <strong className="text-[#00CED1]">Generate AI lesson plans</strong> on Class
              setup, then return here to walk through narration and interactions segment by segment.
            </p>
            {lessonsWithPlan.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setLessonIndex(lessonsWithPlan[0].index)
                  setSegmentIndex(0)
                }}
                className="text-[#00CED1] text-sm font-semibold hover:underline"
              >
                Jump to Lesson {lessonsWithPlan[0].item.order} (has AI plan)
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
            <aside className="lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 p-4 overflow-y-auto scrollbar-thaylo max-h-[220px] lg:max-h-none">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3 font-semibold">
                Segments · {segments.length} steps
              </p>
              <ul className="space-y-1">
                {segments.map((segment, index) => {
                  const active = index === segmentIndex
                  return (
                    <li key={segment.id}>
                      <button
                        type="button"
                        onClick={() => setSegmentIndex(index)}
                        className={
                          'w-full text-left rounded-xl px-3 py-2.5 transition-colors ' +
                          (active
                            ? 'bg-[#00CED1]/15 border border-[#00CED1]/30'
                            : 'hover:bg-white/5 border border-transparent')
                        }
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <PhaseBadge phase={segment.phase} />
                          <span className="text-[10px] text-white/35 tabular-nums">
                            {segmentTimeLabel(segment, index, segments.length, totalMinutes)}
                          </span>
                        </div>
                        <p
                          className={
                            'text-xs font-medium leading-snug ' +
                            (active ? 'text-white' : 'text-white/70')
                          }
                        >
                          {segment.title}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </aside>

            <div className="flex-1 min-h-0 flex flex-col">
              <div className="shrink-0 px-5 py-3 border-b border-white/5 flex flex-wrap items-center gap-2">
                <span className="text-white/40 text-xs">
                  Step {segmentIndex + 1} of {segments.length}
                </span>
                <PhaseBadge phase={currentSegment.phase} />
                <span className="text-white font-semibold text-sm">{currentSegment.title}</span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thaylo p-5 space-y-4">
                {segmentIndex === 0 && lesson?.instructorIntro?.trim() && (
                  <div className="rounded-xl border border-[#00CED1]/25 bg-[#00CED1]/5 p-4">
                    <div className="flex items-center gap-2 text-[#00CED1] text-xs font-semibold uppercase tracking-wider mb-2">
                      <MessageSquare size={14} />
                      Class opener
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {lesson.instructorIntro.trim()}
                    </p>
                  </div>
                )}

                <BlackboardPreview segment={currentSegment} />

                <div className="rounded-xl border border-white/10 bg-[#252338]/80 p-4">
                  <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                    <Volume2 size={14} className="text-[#00CED1]" />
                    Instructor narration (spoken aloud)
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap select-text">
                    {currentSegment.narrationScript}
                  </p>
                </div>

                {currentSegment.interaction && (
                  <InteractionPreview
                    interaction={currentSegment.interaction}
                    phase={currentSegment.phase}
                  />
                )}
              </div>

              <div className="shrink-0 px-5 py-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => setSegmentIndex((s) => Math.max(0, s - 1))}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <p className="text-white/40 text-xs text-center hidden sm:block">
                  Admin preview — correct answers and hints are visible for review
                </p>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => setSegmentIndex((s) => Math.min(segments.length - 1, s + 1))}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#00CED1] text-[#111023] hover:bg-[#00B8BB] disabled:opacity-30"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="shrink-0 px-5 py-3 border-t border-white/10 bg-black/20 text-center">
          <p className="text-white/40 text-xs">
            This mirrors the child&apos;s live class (runtimePlan segments). Use{' '}
            <span className="text-white/55">Preview class</span> to review extracted document
            sections instead.
          </p>
        </div>
      </div>
    </div>
  )
}
