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
      label: 'Speaking speed (TTS fallback)',
      hint: 'ElevenLabs/browser only. Does not control LiveAvatar class speech.',
      info: 'Only used when LiveAvatar is off or fails. Live class avatar speed is managed by LiveAvatar (~0.85 for Grade 4).',
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
      default: 800,
      label: 'Pause between lines (ms)',
      hint: 'Extra breath between blackboard lines. Higher = easier for children.',
      info: 'Pause after each blackboard line before the next line starts. Example: 400 ms = quick, 800–1000 ms = child-friendly reading time.',
    },
    wordMs: {
      min: 30,
      max: 200,
      step: 5,
      default: 80,
      label: 'Words pacing (ms per word)',
      hint: 'Caption/TTS timing when avatar is off. LiveAvatar speech speed is set separately for child pace.',
      info: 'How quickly captions reveal when using TTS fallback or muted narration. LiveAvatar lip-sync uses speech events, not this slider.',
    },
    classDurationMinutes: {
      min: 5,
      max: 15,
      step: 1,
      default: 15,
      label: 'Live session timer (minutes)',
      info: 'Controls how long the live class runs (5–15 min). Teaching time is duration minus 3 minutes, then Quick Check. Lesson scripts and AI-generated content always stay at 15 minutes and are not affected by this setting.',
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
      info: 'Controls creativity during onboarding Q&A with the AI Instructor. Lower values keep responses focused and predictable; higher values allow more varied follow-up wording.',
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
    bloomBuddyTemperature: {
      min: 0,
      max: 2,
      step: 0.05,
      default: 0.6,
      label: 'Bloom Buddy temperature',
      hint: 'Lower = more predictable SEL responses.',
      info: 'Controls creativity during mood check-ins and emotional support chats. Lower values keep responses steady and reassuring; higher values allow more varied supportive wording.',
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
