/** Mirror of thaylo-be ai-settings-ranges.ts for admin UI sliders. */
import { api } from './api'

export const AI_SETTINGS_FIELD_RANGES = {
  elevenlabs: {
    stability: {
      min: 0,
      max: 1,
      step: 0.05,
      default: 0.5,
      label: 'Stability',
      hint: 'Higher = more consistent delivery.',
      info: 'Controls how steady Calyx sounds. Lower values add more variation between sentences; higher values keep the voice more even. Example: 0.3 = expressive storytelling, 0.8 = calm, consistent teaching.',
    },
    similarityBoost: {
      min: 0,
      max: 1,
      step: 0.05,
      default: 0.75,
      label: 'Similarity boost',
      hint: 'Higher = closer to the reference voice.',
      info: 'How closely the generated voice matches the selected ElevenLabs voice profile. Example: 0.5 = softer match, 0.9 = very close to the original Calyx voice.',
    },
    speed: {
      min: 0.7,
      max: 1.2,
      step: 0.05,
      default: 1,
      label: 'Speaking speed',
      hint: '1.0 is normal speed. ElevenLabs API allows 0.7 – 1.2.',
      info: 'Adjusts how fast Calyx speaks during classes and onboarding. Example: 0.85 = slower for younger learners, 1.1 = quicker explanations.',
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
      info: 'Adds a short pause after each blackboard line before the next one appears. Example: 200 ms = fast flow, 800 ms = more time to read each line.',
    },
    wordMs: {
      min: 30,
      max: 120,
      step: 5,
      default: 55,
      label: 'Words pacing (ms per word)',
      hint: 'Used when voice is muted.',
      info: 'Controls how quickly text is revealed when narration is muted or unavailable. Example: 40 ms/word = faster captions, 80 ms/word = slower reading pace.',
    },
    classDurationMinutes: {
      min: 10,
      max: 30,
      step: 1,
      default: 15,
      label: 'Default class length (minutes)',
      info: 'Sets the expected length for a live class session. Example: 15 minutes = standard lesson block; 25 minutes = longer deep-dive class.',
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
      info: 'Controls creativity during onboarding Q&A. Lower values keep Calyx focused and predictable; higher values allow more varied follow-up wording. Example: 0.4 = strict script-like replies, 1.0 = warmer conversational tone.',
    },
    classroomTemperature: {
      min: 0,
      max: 2,
      step: 0.05,
      default: 0.7,
      label: 'Classroom temperature',
      hint: 'Lower = more predictable responses.',
      info: 'Controls creativity during live class chat and teaching. Lower values keep explanations consistent; higher values make responses more flexible. Example: 0.5 = structured lesson delivery, 0.9 = more adaptive explanations.',
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
