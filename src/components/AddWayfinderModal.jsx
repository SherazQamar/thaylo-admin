import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import {
  formatPhoneInput,
  isValidPhoneDigits,
  normalizePhoneDigits,
  PHONE_INPUT_PLACEHOLDER,
  PHONE_VALIDATION_MESSAGE,
} from '../lib/phone'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-white text-sm font-medium mb-1.5">
        {label}
      </span>
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

function SelectInput({ value, placeholder, ...rest }) {
  return (
    <div className="relative">
      <button
        type="button"
        {...rest}
        className="w-full text-left px-4 py-3 rounded-full bg-white/[0.05] text-sm border border-transparent flex items-center justify-between hover:bg-white/[0.07]"
      >
        <span className={value ? 'text-white' : 'text-white/40'}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className="text-white/40" />
      </button>
    </div>
  )
}

export default function AddWayfinderModal({ open, onClose, onSubmit }) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [grade, setGrade] = useState('')
  const [status, setStatus] = useState('Active')
  const [phoneError, setPhoneError] = useState('')

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()

    if (!isValidPhoneDigits(phone)) {
      setPhoneError(PHONE_VALIDATION_MESSAGE)
      return
    }

    setPhoneError('')
    onSubmit?.({
      fullName,
      phone: normalizePhoneDigits(phone),
      email,
      role,
      grade,
      status,
    })
    onClose?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

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

        {/* Wayfinder Information */}
        <form onSubmit={handleSubmit} className="mt-5">
          <p className="text-white text-base font-semibold border-b border-white/10 pb-3">
            Wayfinder Information
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Field label="Full Name">
              <TextInput
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>
            <Field label="Phone Number">
              <TextInput
                type="tel"
                inputMode="numeric"
                placeholder={PHONE_INPUT_PLACEHOLDER}
                value={phone}
                maxLength={12}
                onChange={(e) => {
                  setPhoneError('')
                  setPhone(formatPhoneInput(e.target.value))
                }}
              />
              {phoneError && (
                <p className="mt-1.5 text-xs text-[#FF6F6F]">{phoneError}</p>
              )}
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Email Address">
              <TextInput
                type="email"
                placeholder="AllexFiller705842@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </div>

          {/* Role & Assignment */}
          <p className="text-white text-base font-semibold border-b border-white/10 pb-3 mt-6">
            Role & Assignment
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Field label="Role">
              <SelectInput value={role} placeholder="Select Role" />
            </Field>
            <Field label="Grade Level">
              <SelectInput value={grade} placeholder="Select Grade" />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Status">
              <SelectInput value={status} placeholder="Active" />
            </Field>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-4 mt-7">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-full bg-white/[0.05] text-white text-sm font-semibold hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3 rounded-full bg-[#00CED1] text-[#111023] text-sm font-semibold hover:bg-[#00B8BB] transition-colors"
            >
              Add Wayfinder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
