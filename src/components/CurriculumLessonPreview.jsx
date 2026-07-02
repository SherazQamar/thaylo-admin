import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight, Play, Send } from 'lucide-react'
import {
  CURRICULUM_BETA_LESSON_LIMIT,
  CURRICULUM_QUESTION_TYPE_LABELS,
} from '../lib/curriculum-api'

function AssessmentRow({ question }) {
  return (
    <div className="rounded-xl bg-black/20 border border-white/5 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
          <span className="text-white/40">{question.order}.</span> {question.prompt}
        </p>
        <span className="shrink-0 text-[10px] uppercase tracking-wider text-[#00CED1] bg-[#00CED1]/10 px-2 py-0.5 rounded-full">
          {CURRICULUM_QUESTION_TYPE_LABELS[question.type] ?? question.type}
        </span>
      </div>
      {question.options?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {question.options.map((opt) => (
            <span
              key={opt}
              className="text-xs text-white/60 bg-white/5 rounded-full px-2.5 py-0.5"
            >
              {opt}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionBlock({ section }) {
  return (
    <div className="rounded-xl bg-[#111023]/60 border border-white/5 p-4">
      <p className="text-[10px] uppercase tracking-wider text-[#00CED1] mb-2 font-semibold">
        {section.label}
      </p>
      <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap select-text">
        {section.content}
      </p>
    </div>
  )
}

function LessonCard({ lesson, defaultOpen, onPreviewClass }) {
  const [open, setOpen] = useState(defaultOpen)
  const sections = lesson.sections ?? []
  const assessments = lesson.assessments ?? lesson.questions ?? []

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center justify-between gap-3 min-w-0 text-left hover:opacity-90"
        >
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              Lesson {lesson.order}: {lesson.title}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {lesson.element && `Element ${lesson.element}`}
              {lesson.elementTitle && ` · ${lesson.elementTitle}`}
              {sections.length > 0 && ` · ${sections.length} section(s)`}
              {assessments.length > 0 && ` · ${assessments.length} assessment(s)`}
            </p>
          </div>
          {open ? (
            <ChevronDown size={18} className="text-white/40 shrink-0" />
          ) : (
            <ChevronRight size={18} className="text-white/40 shrink-0" />
          )}
        </button>

        {onPreviewClass && (
          <button
            type="button"
            onClick={() => onPreviewClass(lesson.order - 1)}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-[#00CED1]/50 text-[#00CED1] px-3 py-2 text-xs font-semibold hover:bg-[#00CED1]/10"
            title={`Preview Lesson ${lesson.order} class`}
          >
            <Play size={12} />
            Preview class
          </button>
        )}
      </div>

      {open && (
        <div className="p-4 space-y-3 border-t border-white/5">
          {sections.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">
              No extracted sections. Re-upload the document or use Improve with AI to add content.
            </p>
          ) : (
            sections.map((section) => (
              <SectionBlock key={section.id} section={section} />
            ))
          )}

          {assessments.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Assessments (from document)
              </p>
              {assessments.map((q) => (
                <AssessmentRow key={q.key} question={q} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * @param {{
 *   scriptJson: import('../lib/curriculum-mock-data').CurriculumScriptJson;
 *   onPreviewClass?: (lessonIndex: number) => void;
 *   status?: string;
 *   isArchived?: boolean;
 *   statusPending?: boolean;
 *   onSubmitForReview?: () => void;
 *   onPublish?: () => void;
 * }} props
 */
export default function CurriculumLessonPreview({
  scriptJson,
  onPreviewClass,
  status,
  isArchived,
  statusPending,
  onSubmitForReview,
  onPublish,
}) {
  const [tab, setTab] = useState('lessons')
  const meta = scriptJson?.metadata
  const showWorkflow = !isArchived && (onSubmitForReview || onPublish)

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-4 border-b border-white/5">
        <div className="min-w-0 flex-1">
          <h3 className="text-white text-lg font-bold">{meta?.title ?? 'Untitled'}</h3>
          <p className="text-white/50 text-sm mt-1">
            {meta?.subject ?? '—'} · {meta?.gradeLevel ?? '—'}
            {meta?.expectationCode && ` · ${meta.expectationCode}`}
            {meta?.betaMode && ` · beta (${meta?.betaLessonLimit ?? CURRICULUM_BETA_LESSON_LIMIT} lessons)`}
          </p>
          {meta?.documentScope && (
            <p className="text-[#00CED1]/80 text-xs mt-1">{meta.documentScope}</p>
          )}
          <p className="text-white/40 text-xs mt-2">
            Extracted from your uploaded document — content shown as-is for class setup.
          </p>
        </div>

        {showWorkflow && (
          <div className="flex flex-wrap gap-2 shrink-0 lg:pt-0.5">
            {status === 'DRAFT' && onSubmitForReview && (
              <button
                type="button"
                disabled={statusPending}
                onClick={onSubmitForReview}
                className="inline-flex items-center gap-2 rounded-xl border border-[#FFC542]/50 text-[#FFC542] px-4 py-2 text-sm font-semibold hover:bg-[#FFC542]/10 disabled:opacity-50"
              >
                <Send size={14} />
                Submit for review
              </button>
            )}
            {(status === 'DRAFT' || status === 'IN_REVIEW') && onPublish && (
              <button
                type="button"
                disabled={statusPending}
                onClick={onPublish}
                className="inline-flex items-center gap-2 rounded-xl bg-[#00CED1] text-[#111023] px-4 py-2 text-sm font-semibold hover:bg-[#00B8BB] disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                Publish
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {[
          { id: 'lessons', label: 'Class content' },
          { id: 'json', label: 'Raw JSON' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={
              'rounded-full px-3 py-1 text-xs font-semibold ' +
              (tab === item.id
                ? 'bg-[#00CED1] text-[#111023]'
                : 'bg-white/5 text-white/50 hover:text-white')
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {tab === 'lessons' &&
          (scriptJson?.lessons?.length ? (
            scriptJson.lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.key}
                lesson={lesson}
                defaultOpen={index === 0}
                onPreviewClass={onPreviewClass}
              />
            ))
          ) : (
            <p className="text-white/40 text-sm text-center py-8">No lessons extracted yet.</p>
          ))}

        {tab === 'json' && (
          <pre className="text-xs text-white/70 bg-black/30 rounded-2xl p-4 overflow-x-auto whitespace-pre-wrap select-text">
            {JSON.stringify(scriptJson, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
