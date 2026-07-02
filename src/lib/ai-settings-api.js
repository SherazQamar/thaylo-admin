import { isAxiosError } from 'axios'
import { api } from './api'
import { getApiErrorMessage } from './auth-api'

export const aiSettingsQueryKeys = {
  all: ['ai-settings'],
  detail: () => [...aiSettingsQueryKeys.all, 'detail'],
  elevenLabsVoices: () => [...aiSettingsQueryKeys.all, 'elevenlabs-voices'],
}

export async function fetchAiSettings() {
  const { data } = await api.get('/admin/ai-settings')
  return data.data
}

export async function fetchElevenLabsVoices() {
  const { data } = await api.get('/admin/ai-settings/elevenlabs-voices')
  return data.data
}

export async function updateAiSettings(payload) {
  const { data } = await api.patch('/admin/ai-settings', payload)
  return data.data
}

export async function testAiVoice({ text, voice } = {}) {
  const response = await api.post(
    '/admin/ai-settings/test-voice',
    { text, voice },
    { responseType: 'blob' },
  )
  return response.data
}

export async function getAiVoiceTestErrorMessage(error) {
  if (!isAxiosError(error)) {
    return getApiErrorMessage(error)
  }

  const data = error.response?.data
  if (data instanceof Blob) {
    try {
      const text = await data.text()
      const parsed = JSON.parse(text)
      if (typeof parsed.message === 'string') return parsed.message
      if (Array.isArray(parsed.message)) return parsed.message.join(', ')
    } catch {
      // fall through
    }
  }

  return getApiErrorMessage(error)
}

export const VOICE_ENGINES = [
  { value: 'elevenlabs', label: 'ElevenLabs (recommended)' },
  { value: 'browser', label: 'Browser voice (device-dependent)' },
]

export const ELEVENLABS_MODELS = [
  { value: 'eleven_multilingual_v2', label: 'Multilingual v2' },
  { value: 'eleven_turbo_v2_5', label: 'Turbo v2.5 (faster)' },
]

export const DEFAULT_ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'
export const DEFAULT_ELEVENLABS_VOICE_NAME = 'Rachel'

export const CLIENT_ELEVENLABS_VOICE_ID = 'gJx1vCzNCD1EQHT212Ls'
export const CLIENT_ELEVENLABS_VOICE_NAME = 'Client Calyx voice'

export const CLIENT_VOICE_LIBRARY_URL =
  'https://elevenlabs.io/app/voice-library?voiceId=gJx1vCzNCD1EQHT212Ls'

export const FREE_TIER_FALLBACK_CATALOG = {
  freeVoices: [
    { voiceId: DEFAULT_ELEVENLABS_VOICE_ID, name: DEFAULT_ELEVENLABS_VOICE_NAME, category: 'premade', description: 'Calm, young American female', apiAvailable: true },
    { voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'premade', description: 'Soft, young American female', apiAvailable: true },
    { voiceId: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', category: 'premade', description: 'Emotional, young American female', apiAvailable: true },
    { voiceId: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', category: 'premade', description: 'Pleasant, British female', apiAvailable: true },
    { voiceId: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', category: 'premade', description: 'Warm, British female', apiAvailable: true },
    { voiceId: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', category: 'premade', description: 'Warm, American female', apiAvailable: true },
    { voiceId: 'LcfcDJNUP1GQjkzn1xUU', name: 'Emily', category: 'premade', description: 'Calm, American female', apiAvailable: true },
    { voiceId: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace', category: 'premade', description: 'Gentle, American Southern female', apiAvailable: true },
    { voiceId: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'premade', description: 'Deep American narrator', apiAvailable: true },
    { voiceId: 'ErXwobaYiN019PkySvjV', name: 'Antoni', category: 'premade', description: 'Well-rounded American male', apiAvailable: true },
    { voiceId: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', category: 'premade', description: 'Warm, British male', apiAvailable: true },
    { voiceId: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', category: 'premade', description: 'Deep, British male', apiAvailable: true },
    { voiceId: 'ZQe5CZNOzWyzPSCn5a3c', name: 'James', category: 'premade', description: 'Calm, Australian male', apiAvailable: true },
    { voiceId: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', category: 'premade', description: 'Articulate, American male', apiAvailable: true },
    { voiceId: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', category: 'premade', description: 'Casual, Australian male', apiAvailable: true },
  ],
  paidVoices: [],
  clientVoice: {
    voiceId: CLIENT_ELEVENLABS_VOICE_ID,
    name: CLIENT_ELEVENLABS_VOICE_NAME,
    category: 'library',
    description: 'Saved for when the client upgrades ElevenLabs',
    apiAvailable: false,
  },
}
