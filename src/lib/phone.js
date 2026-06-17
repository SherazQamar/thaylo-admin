export const PHONE_DIGIT_LENGTH = 10
export const PHONE_VALIDATION_MESSAGE =
  'Phone number must be exactly 10 digits'
export const PHONE_INPUT_PLACEHOLDER = '123 456 7890'

export function normalizePhoneDigits(value) {
  if (!value) return ''

  let digits = String(value).replace(/\D/g, '')

  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1)
  }

  return digits.slice(0, PHONE_DIGIT_LENGTH)
}

export function isValidPhoneDigits(value) {
  return normalizePhoneDigits(value).length === PHONE_DIGIT_LENGTH
}

export function formatPhoneDisplay(value) {
  const digits = normalizePhoneDigits(value ?? '')
  if (!digits) return '—'
  if (digits.length !== PHONE_DIGIT_LENGTH) {
    const trimmed = String(value ?? '').trim()
    return trimmed || '—'
  }

  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

export function formatPhoneInput(value) {
  const digits = normalizePhoneDigits(value)
  if (!digits) return ''

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`

  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}
