import { useEffect, useRef, useState } from 'react'
import {
  X,
  Upload,
  FileText,
  ChevronRight,
  ChevronLeft,
  BookOpen,
} from 'lucide-react'
import {
  CURRICULUM_BETA_INFO_MESSAGE,
  CURRICULUM_BETA_LESSON_LIMIT,
  CURRICULUM_STATUS_LABELS,
  createCurriculumFromParsed,
  parseCurriculumDocument,
} from '../lib/curriculum-api'

const STEPS = ['Upload', 'Review', 'Create draft']

function ProcessingProgressBar({ active, label, hint }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!active) {
      setProgress(0)
      return undefined
    }

    setProgress(6)
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current
        const step = current < 50 ? 4 + Math.random() * 5 : 1.5 + Math.random() * 3
        return Math.min(92, current + step)
      })
    }, 700)

    return () => window.clearInterval(interval)
  }, [active])

  if (!active) return null

  return (
    <div className="rounded-2xl border border-[#00CED1]/20 bg-[#00CED1]/5 px-4 py-4 space-y-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-white/70 font-medium">{label}</span>
        <span className="text-[#00CED1] font-semibold tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
      <div
        className="h-2.5 rounded-full bg-white/10 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#00CED1] to-[#60D624] transition-[width] duration-500 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
      {hint && <p className="text-white/40 text-xs leading-relaxed">{hint}</p>}
    </div>
  )
}

function LessonPreviewCard({ lesson }) {
  return (
    <div className="rounded-2xl bg-black/20 border border-white/5 p-4 space-y-3">
      <div>
        <p className="text-white font-semibold text-sm">
          {lesson.order}. {lesson.title}
        </p>
        {lesson.objectives?.length > 0 && (
          <ul className="mt-2 space-y-1">
            {lesson.objectives.map((obj) => (
              <li key={obj} className="text-white/50 text-xs pl-3 border-l border-[#00CED1]/30">
                {obj}
              </li>
            ))}
          </ul>
        )}
      </div>

      {lesson.teachBlocks?.map((block, index) => (
        <div key={index} className="rounded-xl bg-white/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#00CED1] mb-1">
            {block.type}
          </p>
          <p className="text-white/70 text-xs leading-relaxed">{block.content}</p>
        </div>
      ))}

      {lesson.questions?.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Questions</p>
          {lesson.questions.map((q) => (
            <p key={q.key} className="text-white/60 text-xs">
              {q.order}. {q.prompt}{' '}
              <span className="text-[#00CED1]">({q.type})</span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   onCreated?: (item: import('../lib/curriculum-mock-data').CurriculumDetail) => void;
 * }} props
 */
export default function CurriculumUploadWizard({ open, onClose, onCreated }) {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState(null)
  const [parseResult, setParseResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setStep(0)
      setFile(null)
      setParseResult(null)
      setError('')
      setLoading(false)
    }
  }, [open])

  if (!open) return null

  async function handleParse() {
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const result = await parseCurriculumDocument(file)
      setParseResult(result)
      setStep(1)
    } catch (err) {
      setError(err.message || 'Failed to parse document')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!parseResult) return
    setError('')
    setLoading(true)
    try {
      const created = await createCurriculumFromParsed({
        parsed: parseResult.parsed,
        rawText: parseResult.rawText,
        sourceDocUrl: parseResult.sourceDocUrl,
      })
      onCreated?.(created)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create curriculum draft')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        disabled={loading}
        aria-label="Close"
      />
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl flex flex-col"
        style={{ backgroundColor: '#252338' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h3 className="text-white text-lg font-bold">Upload class curriculum</h3>
            <p className="text-white/50 text-sm mt-0.5">
              Extract lessons from your Word document into structured class content
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-white/5 flex gap-2">
          {STEPS.map((label, index) => (
            <span
              key={label}
              className={
                'text-xs font-semibold px-3 py-1 rounded-full ' +
                (step === index
                  ? 'bg-[#00CED1] text-[#111023]'
                  : 'bg-white/5 text-white/40')
              }
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="rounded-2xl border border-[#FF7B7B]/30 bg-[#FF7B7B]/10 px-4 py-3 text-[#FF7B7B] text-sm">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#00CED1]/30 bg-[#00CED1]/10 px-4 py-3 text-[#00CED1] text-sm">
                <strong>Beta:</strong> {CURRICULUM_BETA_INFO_MESSAGE}
              </div>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full rounded-2xl border-2 border-dashed border-white/10 hover:border-[#00CED1]/40 p-10 text-center transition-colors"
              >
                <Upload size={32} className="mx-auto text-[#00CED1] mb-3" />
                <p className="text-white font-medium">
                  {file ? file.name : 'Drop a .docx file or click to browse'}
                </p>
                <p className="text-white/40 text-sm mt-1">Class content document</p>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {step === 1 && parseResult && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#313044] p-4 flex items-start gap-3">
                <FileText size={20} className="text-[#00CED1] shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">
                    {parseResult.parsed.metadata.title}
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    {parseResult.parsed.metadata.subject} ·{' '}
                    {parseResult.parsed.metadata.gradeLevel}
                    {parseResult.parsed.metadata.expectationCode &&
                      ` · ${parseResult.parsed.metadata.expectationCode}`}{' '}
                    · {parseResult.parsed.lessons.length} of {CURRICULUM_BETA_LESSON_LIMIT}{' '}
                    beta lesson(s)
                  </p>
                  {parseResult.parsed.metadata.documentScope && (
                    <p className="text-[#00CED1]/80 text-xs mt-1">
                      {parseResult.parsed.metadata.documentScope}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {parseResult.parsed.lessons.map((lesson) => (
                  <LessonPreviewCard key={lesson.key} lesson={lesson} />
                ))}
              </div>
            </div>
          )}

          {step === 2 && parseResult && (
            <div className="rounded-2xl bg-[#313044] p-5 space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen size={22} className="text-[#00CED1]" />
                <div>
                  <p className="text-white font-semibold">Ready to create draft</p>
                  <p className="text-white/50 text-sm">
                    Status will be <strong className="text-white/70">Draft</strong>. You will
                    preview the 15-minute class experience, then publish when ready.
                  </p>
                </div>
              </div>
              <p className="text-white/40 text-xs">
                {CURRICULUM_STATUS_LABELS.DRAFT} → refine →{' '}
                {CURRICULUM_STATUS_LABELS.IN_REVIEW} → {CURRICULUM_STATUS_LABELS.PUBLISHED}
              </p>
            </div>
          )}
        </div>

        {(loading && (step === 0 || step === 2)) && (
          <div className="shrink-0 px-6 pb-3">
            <ProcessingProgressBar
              active
              label={
                step === 0
                  ? 'Extracting lessons from document…'
                  : 'Creating curriculum draft…'
              }
              hint={
                step === 0
                  ? 'Reading your file and structuring Lessons 1–5. This usually takes 30–60 seconds.'
                  : 'Saving extracted lessons to your curriculum library.'
              }
            />
          </div>
        )}

        <div className="px-6 py-4 border-t border-white/5 flex justify-between gap-3">
          <button
            type="button"
            onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/60 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step === 0 && (
            <button
              type="button"
              onClick={handleParse}
              disabled={!file || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00CED1] text-[#111023] px-5 py-2.5 text-sm font-semibold hover:bg-[#00B8BB] disabled:opacity-50"
            >
              {loading ? 'Parsing…' : 'Parse document'}
              <ChevronRight size={16} />
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00CED1] text-[#111023] px-5 py-2.5 text-sm font-semibold hover:bg-[#00B8BB]"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00CED1] text-[#111023] px-5 py-2.5 text-sm font-semibold hover:bg-[#00B8BB] disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create draft & open studio'}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
