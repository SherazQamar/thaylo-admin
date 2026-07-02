/** Mirror of thaylo-be ai-settings-ranges.ts for admin UI sliders. */
import { api } from './api'

export const AI_SETTINGS_FIELD_RANGES = {
  elevenlabs: {
    speed: {
      min: 0.7,
      max: 1.2,
      step: 0.05,
      default: 1,
      label: 'Speaking speed',
      hint: '1.0 is normal speed. ElevenLabs API allows 0.7 – 1.2.',
    },
    stability: {
      min: 0,
      max: 1,
      step: 0.05,
      default: 0.5,
      label: 'Stability',
      hint: 'Higher = more consistent delivery.',
    },
    similarityBoost: {
      min: 0,
      max: 1,
      step: 0.05,
      default: 0.75,
      label: 'Similarity boost',
      hint: 'Higher = closer to the reference voice.',
    },
  },
  browser: {
    rate: {
      min: 0.5,
      max: 2,
      step: 0.05,
      default: 1,
      label: 'Speech rate',
      hint: '1.0 is normal browser TTS speed.',
    },
    pitch: {
      min: 0.5,
      max: 2,
      step: 0.05,
      default: 1,
      label: 'Pitch',
      hint: '1.0 is the default pitch.',
    },
  },
  pacing: {
    pauseMs: {
      min: 0,
      max: 2000,
      step: 50,
      default: 400,
      label: 'Pause between lines (ms)',
    },
    wordMs: {
      min: 30,
      max: 120,
      step: 5,
      default: 55,
      label: 'Words pacing (ms per word)',
      hint: 'Used when voice is muted.',
    },
    classDurationMinutes: {
      min: 10,
      max: 30,
      step: 1,
      default: 15,
      label: 'Default class length (minutes)',
    },
  },
  llm: {
    onboardingTemperature: {
      min: 0,
      max: 2,
      step: 0.05,
      default: 0.7,
      label: 'Onboarding temperature',
      hint: 'Lower = more predictable responses.',
    },
    classroomTemperature: {
      min: 0,
      max: 2,
      step: 0.05,
      default: 0.7,
      label: 'Classroom temperature',
      hint: 'Lower = more predictable responses.',
    },
  },
}

export function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export async function fetchAiSettingsFieldRanges() {
  const { data } = await api.get('/admin/ai-settings/field-ranges')
  return data.data.ranges
}
