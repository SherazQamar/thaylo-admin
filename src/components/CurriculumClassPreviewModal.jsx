import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, Play, X } from 'lucide-react'
import {
  CLASS_DURATION_MINUTES,
  buildClassSteps,
  formatClassDuration,
} from '../lib/curriculum-class-timing'

/**
 * Full-screen class preview modal — simulates the 15-minute student experience before publish.
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   scriptJson: import('../lib/curriculum-mock-data').CurriculumScriptJson;
 *   title?: string;
 *   initialLessonIndex?: number;
 * }} props
 */
export default function CurriculumClassPreviewModal({
  open,
  onClose,
  scriptJson,
  title,
  initialLessonIndex = 0,
}) {
  const lessons = scriptJson?.lessons ?? []
  const [lessonIndex, setLessonIndex] = useState(initialLessonIndex)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (open) {
      setLessonIndex(initialLessonIndex)
      setStepIndex(0)
    }
  }, [open, initialLessonIndex])

  const lesson = lessons[lessonIndex]
  const steps = useMemo(() => buildClassSteps(lesson), [lesson])
  const currentStep = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex >= steps.length - 1

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-black/75"
        onClick={onClose}
        aria-label="Close class preview"
      />
      <div
        className="relative w-full max-w-5xl max-h-[92vh] rounded-3xl flex flex-col overflow-hidden border border-white/10 shadow-2xl"
        style={{ backgroundColor: '#1a1830' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-preview-title"
      >
        <div className="shrink-0 px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#00CED1]/15 flex items-center justify-center shrink-0">
              <Play size={18} className="text-[#00CED1]" />
            </div>
            <div className="min-w-0">
              <h3 id="class-preview-title" className="text-white font-bold text-lg truncate">
                Class preview
              </h3>
              <p className="text-white/50 text-xs truncate">
                {title ?? scriptJson?.metadata?.title ?? 'Curriculum'} ·{' '}
                {CLASS_DURATION_MINUTES} min per lesson
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00CED1]/10 text-[#00CED1] text-xs font-semibold px-3 py-1.5">
              <Clock size={12} />
              {CLASS_DURATION_MINUTES} min class
            </span>
            <select
              value={lessonIndex}
              onChange={(e) => {
                setLessonIndex(Number(e.target.value))
                setStepIndex(0)
              }}
              className="rounded-xl bg-white/5 border border-white/10 text-white text-xs px-3 py-2 outline-none focus:border-[#00CED1]/40 max-w-[200px]"
            >
              {lessons.map((l, i) => (
                <option key={l.key} value={i} className="bg-[#252338]">
                  Lesson {l.order}: {l.elementTitle ?? l.title}
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

        {lessons.length === 0 || steps.length === 0 ? (
          <div className="flex-1 p-10 text-center text-white/40 text-sm">
            No lesson content to preview. Extract lessons from your document first.
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
            <aside className="lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 p-4 overflow-y-auto scrollbar-thaylo max-h-[200px] lg:max-h-none">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3 font-semibold">
                Class timeline · {CLASS_DURATION_MINUTES} min
              </p>
              <ul className="space-y-1">
                {steps.map((step, index) => {
                  const active = index === stepIndex
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => setStepIndex(index)}
                        className={
                          'w-full text-left rounded-xl px-3 py-2 transition-colors ' +
                          (active
                            ? 'bg-[#00CED1]/15 border border-[#00CED1]/30'
                            : 'hover:bg-white/5 border border-transparent')
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={
                              'text-xs font-medium leading-snug ' +
                              (active ? 'text-white' : 'text-white/70')
                            }
                          >
                            {step.label}
                          </span>
                          <span className="shrink-0 text-[10px] text-[#00CED1] font-semibold tabular-nums">
                            {formatClassDuration(step.durationMinutes)}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/30 mt-0.5 tabular-nums">
                          {formatClassDuration(step.startMinute)} –{' '}
                          {formatClassDuration(step.endMinute)}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </aside>

            <div className="flex-1 min-h-0 flex flex-col">
              <div className="shrink-0 px-5 py-3 border-b border-white/5 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#00CED1] font-semibold uppercase tracking-wider">
                  Step {stepIndex + 1} of {steps.length}
                </span>
                <span className="text-white/30">·</span>
                <span className="text-white/70">{currentStep?.label}</span>
                <span className="text-white/30">·</span>
                <span className="text-[#00CED1]">
                  {formatClassDuration(currentStep?.durationMinutes ?? 0)} this section
                </span>
                {currentStep?.meta && (
                  <span className="ml-auto text-white/40 bg-white/5 rounded-full px-2 py-0.5">
                    {currentStep.meta}
                  </span>
                )}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thaylo p-6">
                <div className="max-w-2xl mx-auto rounded-2xl bg-[#252338]/80 border border-white/5 p-6">
                  <p className="text-white/90 text-base leading-relaxed whitespace-pre-wrap select-text">
                    {currentStep?.content}
                  </p>
                </div>
              </div>

              <div className="shrink-0 px-5 py-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="text-center">
                  <p className="text-white/40 text-xs">
                    Class time {formatClassDuration(currentStep?.startMinute ?? 0)} –{' '}
                    {formatClassDuration(currentStep?.endMinute ?? 0)} of{' '}
                    {CLASS_DURATION_MINUTES} min
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => setStepIndex((s) => Math.min(steps.length - 1, s + 1))}
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
            This is how the student will experience the class. Close when ready and publish when
            content looks correct.
          </p>
        </div>
      </div>
    </div>
  )
}
