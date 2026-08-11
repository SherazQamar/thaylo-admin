import { useEffect, useMemo, useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import {
  formatPhoneInput,
  isValidPhoneDigits,
  normalizePhoneDigits,
  PHONE_INPUT_PLACEHOLDER,
  PHONE_VALIDATION_MESSAGE,
} from '../lib/phone'
import {
  WAYFINDER_HIRING_REGIONS,
  hiringRegionByCode,
} from '../lib/wayfinder-hiring-regions'
import { notify } from '../lib/notify'

const SPECIALTY_OPTIONS = ['Math Coach', 'Lead Mentor', 'Counselor']
const GRADE_OPTIONS = ['K4', 'K5', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10']

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-white text-sm font-medium mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/30"
    />
  )
}

function SelectInput({ value, onChange, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none px-4 py-3 pr-10 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
      >
        <option value="" className="bg-[#313044]">
          {placeholder}
        </option>
        {options.map((opt) => {
          const optionValue = typeof opt === 'string' ? opt : opt.value
          const optionLabel = typeof opt === 'string' ? opt : opt.label
          return (
            <option key={optionValue} value={optionValue} className="bg-[#313044]">
              {optionLabel}
            </option>
          )
        })}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
      />
    </div>
  )
}

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  specialty: '',
  gradeLevel: '',
  region: '',
  languagesSpoken: '',
  isActive: 'true',
}

/**
 * @param {{ open: boolean; onClose: () => void; onSubmit?: (payload: import('../lib/admin-api').CreateWayfinderPayload) => void | Promise<void>; isSubmitting?: boolean }} props
 */
export default function AddWayfinderModal({ open, onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM)

  const selectedRegion = useMemo(
    () => hiringRegionByCode(form.region),
    [form.region],
  )

  const regionOptions = useMemo(
    () =>
      WAYFINDER_HIRING_REGIONS.map((r) => ({
        value: r.code,
        label: r.label,
      })),
    [],
  )

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
    }
  }, [open])

  if (!open) return null

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isValidPhoneDigits(form.phone)) {
      notify.error(PHONE_VALIDATION_MESSAGE)
      return
    }

    if (!hiringRegionByCode(form.region)) {
      notify.error('Select the hiring / coverage region for this Wayfinder.')
      return
    }

    const languages = form.languagesSpoken
      .split(',')
      .map((lang) => lang.trim())
      .filter(Boolean)

    await onSubmit?.({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: normalizePhoneDigits(form.phone),
      specialty: form.specialty || undefined,
      gradeLevel: form.gradeLevel || undefined,
      region: form.region,
      languagesSpoken: languages.length ? languages : undefined,
      isActive: form.isActive === 'true',
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        className="relative w-full max-w-[560px] rounded-2xl border border-white/5 p-7"
        style={{ backgroundColor: '#313044' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white"
          aria-label="Close"
        >
          <X size={14} />
        </button>

        <h3 className="text-white text-xl font-bold">Add New Wayfinder</h3>

        <form onSubmit={handleSubmit} className="mt-5">
          <p className="text-white text-base font-semibold border-b border-white/10 pb-3">
            Wayfinder Information
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Field label="Full Name">
              <TextInput
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                required
              />
            </Field>
            <Field label="Phone Number">
              <TextInput
                type="tel"
                inputMode="numeric"
                placeholder={PHONE_INPUT_PLACEHOLDER}
                value={form.phone}
                maxLength={12}
                onChange={(e) => {
                  updateField('phone', formatPhoneInput(e.target.value))
                }}
                required
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Email Address">
              <TextInput
                type="email"
                placeholder="sarah@thaylo.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Field label="Hiring Region">
              <SelectInput
                value={form.region}
                onChange={(e) => {
                  updateField('region', e.target.value)
                }}
                placeholder="Select hiring region"
                options={regionOptions}
              />
            </Field>
            <Field label="Languages Spoken">
              <TextInput
                type="text"
                placeholder="English, Spanish"
                value={form.languagesSpoken}
                onChange={(e) => updateField('languagesSpoken', e.target.value)}
              />
            </Field>
          </div>
          <p className="mt-1.5 text-white/35 text-xs">
            Hiring region sets operational hours / timezone (not where they live). Separate
            languages with commas.
          </p>
          {selectedRegion && (
            <p className="mt-2 text-white/55 text-xs">
              Timezone: {selectedRegion.timeZoneLabel} ({selectedRegion.timeZone})
            </p>
          )}

          <p className="text-white text-base font-semibold border-b border-white/10 pb-3 mt-6">
            Role & Assignment
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Field label="Specialty">
              <SelectInput
                value={form.specialty}
                onChange={(e) => updateField('specialty', e.target.value)}
                placeholder="Select specialty"
                options={SPECIALTY_OPTIONS}
              />
            </Field>
            <Field label="Grade Level">
              <SelectInput
                value={form.gradeLevel}
                onChange={(e) => updateField('gradeLevel', e.target.value)}
                placeholder="Select grade"
                options={GRADE_OPTIONS}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Status">
              <div className="relative">
                <select
                  value={form.isActive}
                  onChange={(e) => updateField('isActive', e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
                >
                  <option value="true" className="bg-[#313044]">Active</option>
                  <option value="false" className="bg-[#313044]">Inactive</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-7">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-3 rounded-full bg-white/[0.05] text-white text-sm font-semibold hover:bg-white/[0.08] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold hover:bg-[#00B8BB] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating…' : 'Add Wayfinder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
