import { useEffect, useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

const TIMING_OPTIONS = [
  { value: 'IMMEDIATE', label: 'Immediate (after signup)' },
  { value: 'AFTER_TWO_WEEKS', label: 'After 2 weeks' },
]

const AUDIENCE_OPTIONS = [
  { value: 'PARENT', label: 'Parent' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'COMBINED', label: 'Combined (parent + student)' },
]

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
]

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-white text-sm font-medium mb-1.5">{label}</span>
      {hint && <span className="block text-white/40 text-xs mb-2">{hint}</span>}
      {children}
    </label>
  )
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/30"
    />
  )
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/30 resize-y min-h-[180px]"
    />
  )
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none px-4 py-3 pr-10 rounded-2xl bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
      >
        {placeholder && (
          <option value="" className="bg-[#313044]">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#313044]">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
      />
    </div>
  )
}

const EMPTY_FORM = {
  title: '',
  description: '',
  timing: 'IMMEDIATE',
  audience: 'PARENT',
  sortOrder: '0',
  status: 'DRAFT',
  estimatedMinutes: '',
  tone: '',
  content: '',
}

/**
 * @param {{
 *   open: boolean;
 *   mode: 'create' | 'edit';
 *   initial?: import('../lib/onboarding-api').OnboardingWalkthroughDetail | null;
 *   defaultTiming?: import('../lib/onboarding-api').OnboardingTiming;
 *   onClose: () => void;
 *   onSubmit?: (payload: import('../lib/onboarding-api').OnboardingWalkthroughPayload) => void | Promise<void>;
 *   isSubmitting?: boolean;
 *   error?: string;
 * }} props
 */
export default function OnboardingWalkthroughModal({
  open,
  mode,
  initial,
  defaultTiming = 'IMMEDIATE',
  onClose,
  onSubmit,
  isSubmitting,
  error,
}) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
      return
    }

    if (mode === 'edit' && initial) {
      setForm({
        title: initial.title ?? '',
        description: initial.description ?? '',
        timing: initial.timing ?? 'IMMEDIATE',
        audience: initial.audience ?? 'PARENT',
        sortOrder: String(initial.sortOrder ?? 0),
        status: initial.status === 'ARCHIVED' ? 'DRAFT' : initial.status,
        estimatedMinutes:
          initial.estimatedMinutes != null ? String(initial.estimatedMinutes) : '',
        tone: initial.tone ?? '',
        content: initial.content ?? '',
      })
      return
    }

    setForm({ ...EMPTY_FORM, timing: defaultTiming })
  }, [open, mode, initial, defaultTiming])

  if (!open) return null

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const sortOrder = Number(form.sortOrder)
    const estimatedMinutes = form.estimatedMinutes
      ? Number(form.estimatedMinutes)
      : undefined

    await onSubmit?.({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      timing: form.timing,
      audience: form.audience,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      status: form.status,
      content: form.content.trim(),
      tone: form.tone.trim() || undefined,
      estimatedMinutes:
        estimatedMinutes && Number.isFinite(estimatedMinutes)
          ? estimatedMinutes
          : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 lg:p-8"
        style={{ backgroundColor: '#252338' }}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-white text-xl font-bold">
              {mode === 'edit' ? 'Edit Onboarding Q&A' : 'Add Onboarding Q&A'}
            </h2>
            <p className="text-white/50 text-sm mt-1">
              Content is stored in the database for the AI service to generate onboarding sessions.
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

        {error && (
          <div className="mb-4 rounded-2xl border border-[#FF7B7B]/30 bg-[#FF7B7B]/10 px-4 py-3 text-[#FF7B7B] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title">
              <TextInput
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Technology Comfort & Access"
                required
              />
            </Field>

            <Field label="Sort order" hint="Lower numbers appear first in the onboarding sequence.">
              <TextInput
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => updateField('sortOrder', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Short description (optional)">
            <TextInput
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief summary for admins"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="When to show">
              <SelectInput
                value={form.timing}
                onChange={(e) => updateField('timing', e.target.value)}
                options={TIMING_OPTIONS}
              />
            </Field>

            <Field label="Audience">
              <SelectInput
                value={form.audience}
                onChange={(e) => updateField('audience', e.target.value)}
                options={AUDIENCE_OPTIONS}
              />
            </Field>

            <Field label="Status">
              <SelectInput
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                options={STATUS_OPTIONS}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Estimated minutes (optional)">
              <TextInput
                type="number"
                min="1"
                value={form.estimatedMinutes}
                onChange={(e) => updateField('estimatedMinutes', e.target.value)}
                placeholder="5"
              />
            </Field>

            <Field label="Tone (optional)">
              <TextInput
                value={form.tone}
                onChange={(e) => updateField('tone', e.target.value)}
                placeholder="Curious, normalizing, zero shame"
              />
            </Field>
          </div>

          <Field
            label="Onboarding content"
            hint="Paste the full walkthrough script — questions, options, avatar notes. The AI reads this from the database."
          >
            <TextArea
              value={form.content}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="Student Questions (AI Avatar)&#10;1. What device do you usually use..."
              required
            />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#00CED1] text-[#111023] text-sm font-semibold hover:bg-[#00B8BB] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create walkthrough'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
