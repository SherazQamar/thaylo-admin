/**
 * @param {string} questionType
 * @param {Record<string, unknown>} value
 */
export function formatOnboardingAnswerValue(questionType, value = {}) {
  if (typeof value.selectedOption === 'string' && value.selectedOption) {
    return value.selectedOption
  }
  if (typeof value.text === 'string' && value.text.trim()) {
    return value.text.trim()
  }
  if (Array.isArray(value.selectedOptions) && value.selectedOptions.length > 0) {
    return value.selectedOptions.join(', ')
  }
  if (questionType === 'ICON_MATRIX' && Array.isArray(value.selectedOptions)) {
    return value.selectedOptions.length
      ? value.selectedOptions.join(', ')
      : 'No items selected'
  }
  try {
    return JSON.stringify(value)
  } catch {
    return '—'
  }
}
