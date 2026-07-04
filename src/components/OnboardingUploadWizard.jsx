import { useEffect, useRef, useState } from 'react'
import {
  X,
  Upload,
  FileText,
  ChevronRight,
  ChevronLeft,
  Users,
  GraduationCap,
  UserRound,
} from 'lucide-react'
import {
  ONBOARDING_STATUS_LABELS,
  ONBOARDING_TIMING_LABELS,
  QUESTION_TYPE_LABELS,
  parseOnboardingDocument,
  publishParsedOnboarding,
} from '../lib/onboarding-api'
import InfoTooltip from './InfoTooltip'

const STEPS = ['Upload', 'Review', 'Publish']

const AUDIENCE_OPTIONS = [
  {
    value: 'STUDENT',
    label: 'Student only',
    description: 'Publish student / AI avatar questions from this document',
    info: 'These questions will only appear on the student dashboard during child onboarding.',
    Icon: GraduationCap,
  },
  {
    value: 'PARENT',
    label: 'Parent only',
    description: 'Publish parent / caregiver questions from this document',
    info: 'These questions will only appear on the parent dashboard during parent onboarding.',
    Icon: UserRound,
  },
  {
    value: 'BOTH',
    label: 'Both',
    description: 'Create separate student and parent walkthroughs from one upload',
    info: 'Student questions appear on the student dashboard. Parent questions appear on the parent dashboard after the student section is completed.',
    Icon: Users,
  },
]

function QuestionPreviewCard({ question }) {
  return (
    <div className="rounded-2xl bg-black/20 border border-white/5 p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <p className="text-white text-sm font-medium leading-relaxed">
          {question.order}. {question.prompt}
        </p>
        <span className="shrink-0 text-[10px] uppercase tracking-wider text-[#00CED1] bg-[#00CED1]/10 px-2 py-1 rounded-full">
          {QUESTION_TYPE_LABELS[question.type] ?? question.type}
        </span>
      </div>

      {question.options?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {question.options.map((opt) => (
            <span
              key={opt}
              className="text-xs text-white/70 bg-white/5 rounded-full px-3 py-1"
            >
              {opt}
            </span>
          ))}
        </div>
      )}

      {question.subItems?.length > 0 && (
        <div className="space-y-1 pt-1">
          {question.subItems.map((item) => (
            <p key={item} className="text-white/50 text-xs pl-3 border-l border-white/10">
              {item}
            </p>
          ))}
        </div>
      )}

      {question.notes && (
        <p className="text-white/40 text-xs italic">{question.notes}</p>
      )}
    </div>
  )
}

function SectionPreview({ title, section }) {
  if (!section?.questions?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-white/40 text-sm">
        No {title.toLowerCase()} questions detected in this document.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-white font-semibold">{title}</h4>
        {section.avatarFraming && (
          <p className="text-white/50 text-xs mt-1">Avatar: {section.avatarFraming}</p>
        )}
        {section.intro && (
          <p className="text-white/50 text-xs mt-1">{section.intro}</p>
        )}
      </div>
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {section.questions.map((q) => (
          <QuestionPreviewCard key={q.key} question={q} />
        ))}
      </div>
    </div>
  )
}

/**
 * @param {{
 *   open: boolean;
 *   defaultTiming?: import('../lib/onboarding-api').OnboardingTiming;
 *   onClose: () => void;
 *   onPublished?: () => void;
 * }} props
 */
export default function OnboardingUploadWizard({
  open,
  defaultTiming = 'IMMEDIATE',
  onClose,
  onPublished,
}) {
  const fileInputRef = useRef(null)
  const [step, setStep] = useState(0)
  const [file, setFile] = useState(null)
  const [parseResult, setParseResult] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState('')

  const [audienceSelection, setAudienceSelection] = useState('BOTH')
  const [timing, setTiming] = useState(defaultTiming)
  const [status, setStatus] = useState('DRAFT')
  const [sortOrder, setSortOrder] = useState('0')

  useEffect(() => {
    if (!open) {
      setStep(0)
      setFile(null)
      setParseResult(null)
      setError('')
      setAudienceSelection('BOTH')
      setTiming(defaultTiming)
      setStatus('DRAFT')
      setSortOrder('0')
    }
  }, [open, defaultTiming])

  if (!open) return null

  async function handleFileSelect(selectedFile) {
    if (!selectedFile) return
    setFile(selectedFile)
    setError('')
    setIsParsing(true)

    try {
      const result = await parseOnboardingDocument(selectedFile)
      setParseResult(result)
      setStep(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse document')
      setParseResult(null)
    } finally {
      setIsParsing(false)
    }
  }

  async function handlePublish() {
    if (!parseResult) return
    setError('')
    setIsPublishing(true)

    try {
      await publishParsedOnboarding({
        parsed: parseResult.parsed,
        rawText: parseResult.rawText,
        sourceDocUrl: parseResult.sourceDocUrl,
        audienceSelection,
        timing,
        status,
        sortOrder: Number(sortOrder) || 0,
      })
      onPublished?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish')
    } finally {
      setIsPublishing(false)
    }
  }

  const parsed = parseResult?.parsed
  const canSelectStudent = !!parsed?.studentSection?.questions?.length
  const canSelectParent = !!parsed?.parentSection?.questions?.length

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 lg:p-8"
        style={{ backgroundColor: '#252338' }}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-white text-xl font-bold">Upload onboarding document</h2>
            <p className="text-white/50 text-sm mt-1">
              Upload a Word document — we parse questions and options, then you choose the audience.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((label, index) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ' +
                  (index <= step
                    ? 'bg-[#00CED1] text-[#111023]'
                    : 'bg-white/10 text-white/40')
                }
              >
                {index + 1}
              </div>
              <span
                className={
                  'text-xs font-medium hidden sm:inline ' +
                  (index <= step ? 'text-white' : 'text-white/40')
                }
              >
                {label}
              </span>
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-white/10 mx-1" />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-[#FF7B7B]/30 bg-[#FF7B7B]/10 px-4 py-3 text-[#FF7B7B] text-sm">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-4">
            <div
              className={
                'rounded-3xl border-2 border-dashed p-10 text-center transition-colors ' +
                (isParsing
                  ? 'border-[#00CED1]/40 bg-[#00CED1]/5'
                  : 'border-white/10 hover:border-[#00CED1]/30')
              }
            >
              <Upload size={36} className="mx-auto text-[#00CED1] mb-4" />
              <p className="text-white font-medium">Drop your .docx or .txt file here</p>
              <p className="text-white/40 text-sm mt-2">
                We extract questions, options, and avatar notes automatically
              </p>
              <button
                type="button"
                disabled={isParsing}
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00CED1] text-[#111023] text-sm font-semibold px-5 py-2.5 disabled:opacity-50"
              >
                <FileText size={16} />
                {isParsing ? 'Parsing…' : 'Choose file'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              {file && (
                <p className="text-white/50 text-xs mt-4">{file.name}</p>
              )}
            </div>
          </div>
        )}

        {step === 1 && parsed && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-[#313044] p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider">Title</p>
                <p className="text-white font-semibold mt-1">{parsed.metadata?.title}</p>
              </div>
              {parsed.metadata?.timingHint && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Timing</p>
                  <p className="text-white/80 text-sm mt-1">{parsed.metadata.timingHint}</p>
                </div>
              )}
              {parsed.metadata?.tone && (
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Tone</p>
                  <p className="text-white/80 text-sm mt-1">{parsed.metadata.tone}</p>
                </div>
              )}
              <div className="flex gap-4">
                {parsed.metadata?.studentLengthMinutes != null && (
                  <div>
                    <p className="text-white/40 text-xs">Student</p>
                    <p className="text-[#00CED1] font-semibold">
                      {parsed.metadata.studentLengthMinutes} min
                    </p>
                  </div>
                )}
                {parsed.metadata?.parentLengthMinutes != null && (
                  <div>
                    <p className="text-white/40 text-xs">Parent</p>
                    <p className="text-[#00CED1] font-semibold">
                      {parsed.metadata.parentLengthMinutes} min
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SectionPreview title="Student questions" section={parsed.studentSection} />
              <SectionPreview title="Parent questions" section={parsed.parentSection} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm"
              >
                <ChevronLeft size={16} />
                Re-upload
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl bg-[#00CED1] text-[#111023] text-sm font-semibold"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && parsed && (
          <div className="space-y-5">
            <div>
              <h3 className="text-white font-semibold mb-2">Who is this walkthrough for?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AUDIENCE_OPTIONS.map((opt) => {
                  const disabled =
                    (opt.value === 'STUDENT' && !canSelectStudent) ||
                    (opt.value === 'PARENT' && !canSelectParent) ||
                    (opt.value === 'BOTH' && (!canSelectStudent || !canSelectParent))
                  const active = audienceSelection === opt.value

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => setAudienceSelection(opt.value)}
                      className={
                        'rounded-2xl p-4 text-left border transition-all disabled:opacity-40 ' +
                        (active
                          ? 'border-[#00CED1] bg-[#00CED1]/10'
                          : 'border-white/10 bg-[#313044] hover:border-white/20')
                      }
                    >
                      <opt.Icon
                        size={22}
                        className={active ? 'text-[#00CED1]' : 'text-white/50'}
                      />
                      <div className="flex items-center gap-1.5 mt-3">
                        <p className="text-white font-semibold">{opt.label}</p>
                        <InfoTooltip content={opt.info} label={`About ${opt.label}`} align="left" />
                      </div>
                      <p className="text-white/50 text-xs mt-1">{opt.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-white text-sm font-medium">When to show</span>
                <select
                  value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  className="mt-1.5 w-full px-4 py-3 rounded-2xl bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
                >
                  {Object.entries(ONBOARDING_TIMING_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-[#313044]">
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-white text-sm font-medium">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1.5 w-full px-4 py-3 rounded-2xl bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
                >
                  {['DRAFT', 'PUBLISHED'].map((value) => (
                    <option key={value} value={value} className="bg-[#313044]">
                      {ONBOARDING_STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-white text-sm font-medium">Sort order</span>
                <input
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="mt-1.5 w-full px-4 py-3 rounded-2xl bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
                />
              </label>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm"
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                type="button"
                disabled={isPublishing}
                onClick={handlePublish}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00CED1] text-[#111023] text-sm font-semibold disabled:opacity-50"
              >
                {isPublishing ? 'Publishing…' : 'Publish walkthrough'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
