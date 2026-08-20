import { useEffect, useRef, useState } from 'react'
import { X, Upload, FileText, ChevronRight, ChevronLeft } from 'lucide-react'
import {
  ADDENDA_INFO_MESSAGE,
  attemptLabel,
  createAddendumFromParsed,
  parseAddendaDocument,
} from '../lib/addenda-api'
import { notify } from '../lib/notify'

const STEPS = ['Upload', 'Review']

function ProcessingProgressBar({ active, label, hint, complete = false }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!active) {
      setProgress(0)
      return undefined
    }

    if (complete) {
      setProgress(100)
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
  }, [active, complete])

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

function ExtractedLessonCard({ lesson }) {
  return (
    <div className="rounded-2xl bg-black/20 border border-white/5 p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-white font-semibold text-sm">{lesson.title || lesson.key}</p>
        <span className="shrink-0 text-[10px] uppercase tracking-wider text-[#00CED1] bg-[#00CED1]/10 px-2 py-0.5 rounded-full">
          {attemptLabel(lesson.attemptNumber)}
        </span>
      </div>
      {lesson.studentLanguage && (
        <p className="text-white/70 text-xs leading-relaxed">{lesson.studentLanguage}</p>
      )}
      {lesson.concept && (
        <p className="text-white/45 text-xs">Concept: {lesson.concept}</p>
      )}
      <p className="text-white/35 text-[11px]">
        {lesson.key} · {lesson.documentLength?.toLocaleString?.() ?? 0} characters extracted
      </p>
    </div>
  )
}

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   onCreated?: (item: { id: number }) => void;
 * }} props
 */
export default function AddendaUploadWizard({ open, onClose, onCreated }) {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState(null)
  const [parseResult, setParseResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState(null)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setStep(0)
      setFile(null)
      setParseResult(null)
      setLoading(false)
      setLoadingPhase(null)
      setLoadingComplete(false)
    }
  }, [open])

  if (!open) return null

  async function handleParse() {
    if (!file) return
    setLoading(true)
    setLoadingPhase('parse')
    try {
      const result = await parseAddendaDocument(file)
      setParseResult(result)
      setStep(1)
    } catch (err) {
      notify.error(err, 'Failed to parse addenda document')
    } finally {
      setLoading(false)
      setLoadingPhase(null)
    }
  }

  async function handleCreateDraft() {
    if (!parseResult) return
    setLoading(true)
    setLoadingComplete(false)
    setLoadingPhase('create')
    try {
      const created = await createAddendumFromParsed({
        parsed: parseResult.parsed,
        rawText: parseResult.rawText,
        sourceDocUrl: parseResult.sourceDocUrl,
      })
      setLoadingComplete(true)
      await new Promise((resolve) => window.setTimeout(resolve, 300))
      onCreated?.(created)
      onClose()
    } catch (err) {
      notify.error(err, 'Failed to save addenda draft')
      setLoadingPhase(null)
      setLoadingComplete(false)
    } finally {
      setLoading(false)
    }
  }

  const extraction = parseResult?.extraction
  const progressLabel =
    loadingPhase === 'create'
      ? 'Saving extracted addenda…'
      : 'Extracting lessons and retries…'
  const progressHint =
    loadingPhase === 'create'
      ? 'Saving the extracted lesson and retry blocks so you can review them before publishing.'
      : 'Reading LESSON and RETRY headers from the Word document. This usually takes 20–90 seconds.'

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
            <h3 className="text-white text-lg font-bold">Upload addenda</h3>
            <p className="text-white/50 text-sm mt-0.5">
              Extract every first-teach lesson and retry from the addenda document
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

        <div className="px-6 pt-4 flex gap-2">
          {STEPS.map((label, index) => (
            <div
              key={label}
              className={
                'flex-1 h-1.5 rounded-full ' +
                (index <= step ? 'bg-[#00CED1]' : 'bg-white/10')
              }
            />
          ))}
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          {step === 0 && !loading && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#00CED1]/30 bg-[#00CED1]/10 px-4 py-3 text-[#00CED1] text-sm">
                {ADDENDA_INFO_MESSAGE}
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
                <p className="text-white/40 text-sm mt-1">Addenda Lessons document</p>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {step === 1 && parseResult && !loading && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#313044] p-4 flex items-start gap-3">
                <FileText size={20} className="text-[#00CED1] shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">
                    {parseResult.parsed?.metadata?.title ?? 'Addenda document'}
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    {parseResult.parsed?.metadata?.subject} ·{' '}
                    {parseResult.parsed?.metadata?.gradeLevel} ·{' '}
                    {extraction?.primaryLessonCount ?? 0} lesson(s) ·{' '}
                    {extraction?.retryCount ?? 0} retry variant(s) · max attempt{' '}
                    {extraction?.maxAttemptNumber ?? 1}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#313044]/80 px-4 py-3 text-white/55 text-sm">
                <strong className="text-white/75">Continue</strong> saves a draft. Open it to
                inspect every extracted block, then publish so student retries use this document.
              </div>

              {extraction?.coverage?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {extraction.coverage.map((row) => (
                    <span
                      key={row.lessonKey}
                      className="rounded-full bg-white/5 text-white/70 text-xs px-3 py-1"
                    >
                      {row.lessonKey}: attempts {row.attempts.join(', ')}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {(extraction?.lessons ?? parseResult.parsed?.lessons ?? []).map(
                  (lesson, index) => (
                  <ExtractedLessonCard
                    key={`${lesson.key || 'lesson'}-${lesson.attemptNumber || 1}-${index}`}
                    lesson={lesson}
                  />
                ))}
              </div>
            </div>
          )}

          {loading && (step === 0 || step === 1) && (
            <ProcessingProgressBar
              active
              complete={loadingComplete}
              label={progressLabel}
              hint={progressHint}
            />
          )}
        </div>

        {!loading && (
          <div className="px-6 py-4 border-t border-white/5 flex justify-between gap-3">
            <button
              type="button"
              onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/60 hover:text-white"
            >
              <ChevronLeft size={16} />
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step === 0 ? (
              <button
                type="button"
                onClick={handleParse}
                disabled={!file}
                className="inline-flex items-center gap-2 rounded-xl bg-[#00CED1] text-[#111023] text-sm font-semibold px-5 py-2.5 hover:bg-[#00B8BB] disabled:opacity-40"
              >
                Extract data
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateDraft}
                className="inline-flex items-center gap-2 rounded-xl bg-[#00CED1] text-[#111023] text-sm font-semibold px-5 py-2.5 hover:bg-[#00B8BB]"
              >
                Save draft
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
