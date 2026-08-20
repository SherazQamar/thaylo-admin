import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { fetchLessonAnswerKey } from '../lib/curriculum-api'

function typeLabel(type) {
  if (type === 'word_ladder' || type === 'sort' || type === 'repair') return 'Word ladder / order'
  if (type === 'word_pick') return 'Word pick'
  if (type === 'single_choice' || type === 'MCQ') return 'Single choice'
  return type || 'Question'
}

function AnswerItemCard({ item }) {
  const orderLabels = item.correctOrderLabels ?? []
  const hasOrder = orderLabels.length > 0
  // For ladders, chips are just the word bank — don't paint them all teal in correct order.
  const displayOptions = hasOrder
    ? [...(item.options ?? [])].sort((a, b) => a.label.localeCompare(b.label))
    : item.options ?? []

  return (
    <div className="rounded-xl border border-white/10 bg-[#111023]/40 p-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-white/85 text-sm font-semibold">{typeLabel(item.type)}</p>
        {item.phase && (
          <span className="text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 bg-white/5 text-white/45">
            {item.phase}
          </span>
        )}
      </div>
      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{item.prompt}</p>

      {displayOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayOptions.map((opt) => {
            const isCorrect = !hasOrder && opt.correct === true
            return (
              <span
                key={opt.id}
                className={
                  'text-xs rounded-full px-3 py-1 border ' +
                  (isCorrect
                    ? 'bg-[#00CED1]/15 text-[#00CED1] border-[#00CED1]/30'
                    : 'bg-white/5 text-white/60 border-white/10')
                }
              >
                {opt.label}
              </span>
            )
          })}
        </div>
      )}

      {hasOrder ? (
        <p className="text-xs text-[#00CED1]">
          Correct order: <span className="font-semibold">{orderLabels.join(' → ')}</span>
        </p>
      ) : item.correctLabel ? (
        <p className="text-xs text-[#00CED1]">
          Correct: <span className="font-semibold">{item.correctLabel}</span>
        </p>
      ) : (
        <p className="text-xs text-white/40">No correct answer marked</p>
      )}
    </div>
  )
}

function Section({ title, hint, count, children, emptyText }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
      <div>
        <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold">
          {title}
          {typeof count === 'number' ? ` · ${count}` : ''}
        </p>
        {hint && <p className="text-white/35 text-xs mt-1 leading-relaxed">{hint}</p>}
      </div>
      {count === 0 ? <p className="text-white/40 text-sm">{emptyText}</p> : children}
    </div>
  )
}

export default function LessonAnswerKeyModal({
  open,
  onClose,
  curriculumId,
  lessonKey,
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'lesson-answer-key', curriculumId, lessonKey],
    queryFn: () => fetchLessonAnswerKey(curriculumId, lessonKey),
    enabled: Boolean(open && curriculumId && lessonKey),
  })

  if (!open) return null

  const lessonTests = data?.lessonTests ?? []
  const documentAssessments = data?.documentAssessments ?? data?.assessments ?? []
  const pretestQuestions = data?.pretestQuestions ?? []
  const quickChecks = lessonTests.filter((i) => i.source === 'lesson_quick_check')
  const practiceItems = lessonTests.filter((i) => i.source === 'lesson_practice')

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-label="Close answer key"
      />

      <div
        className="relative w-full max-w-6xl max-h-[92vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
        style={{ backgroundColor: '#1a1830' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-white font-bold text-lg truncate">Lesson answer key</h3>
            <p className="text-white/50 text-xs truncate mt-1">
              {data?.lessonTitle ?? lessonKey ?? ''} · {lessonKey}
            </p>
          </div>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
          {isLoading && (
            <div className="text-white/50 text-sm text-center py-10">Loading…</div>
          )}

          {isError && (
            <div className="text-[#FF7B7B] text-sm text-center py-10">
              Failed to load answer key.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <Section
                title="Lesson tests (AI plan quick-check)"
                hint="These are the scored questions students answer during the live class (minutes 12–15)."
                count={quickChecks.length}
                emptyText="No quick-check interactions in this lesson’s AI plan yet. Generate AI lesson plans first."
              >
                <div className="space-y-3">
                  {quickChecks.map((item) => (
                    <AnswerItemCard key={item.key} item={item} />
                  ))}
                </div>
              </Section>

              <Section
                title="Guided practice (AI plan)"
                hint="Practice items from the lesson plan (formative — not always used for pass %)."
                count={practiceItems.length}
                emptyText="No practice interactions found in this lesson’s AI plan."
              >
                <div className="space-y-3">
                  {practiceItems.map((item) => (
                    <AnswerItemCard key={item.key} item={item} />
                  ))}
                </div>
              </Section>

              <Section
                title="Pre-test questions"
                hint="What the child sees before class (Bloom Ahead). Always 4–6 questions built from quick-checks, practice, and instructional examples."
                count={pretestQuestions.length}
                emptyText="No pre-test questions generated for this lesson."
              >
                <div className="space-y-3">
                  {pretestQuestions.map((item) => (
                    <AnswerItemCard key={item.key} item={item} />
                  ))}
                </div>
              </Section>

              <Section
                title="Document assessments"
                hint="Only filled when the uploaded curriculum Word file itself listed assessment questions. Heading-only extracts often leave this empty — use Lesson tests above instead."
                count={documentAssessments.length}
                emptyText="None in the uploaded document for this lesson (normal for current Grade 4 ELA extracts)."
              >
                <div className="space-y-3">
                  {documentAssessments.map((item) => (
                    <AnswerItemCard key={item.key} item={item} />
                  ))}
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
