import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Cpu, Play, Save, Volume2 } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import InfoTooltip from '../components/InfoTooltip'
import PasswordInput from '../components/PasswordInput'
import { notify } from '../lib/notify'
import { useNotifyError } from '../hooks/useNotifyError'
import {
  AI_SETTINGS_FIELD_RANGES,
  clampValue,
} from '../lib/ai-settings-ranges'
import {
  CLIENT_ELEVENLABS_VOICE_ID,
  CLIENT_ELEVENLABS_VOICE_NAME,
  CLIENT_VOICE_LIBRARY_URL,
  DEFAULT_ELEVENLABS_VOICE_ID,
  DEFAULT_ELEVENLABS_VOICE_NAME,
  ELEVENLABS_MODELS,
  FREE_TIER_FALLBACK_CATALOG,
  aiSettingsQueryKeys,
  fetchAiSettings,
  fetchElevenLabsVoices,
  getAiVoiceTestErrorMessage,
  testAiVoice,
  updateAiSettings,
} from '../lib/ai-settings-api'

function Card({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#313044] p-6">
      <div className="border-b border-white/10 pb-4 mb-5">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-white/50 text-sm mt-1">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function Label({ children, info }) {
  return (
    <span className="flex items-center gap-1.5 mb-2">
      <span className="block text-white text-sm font-semibold">{children}</span>
      {info ? <InfoTooltip content={info} label={`About ${children}`} align="left" /> : null}
    </span>
  )
}

function TextInput({ className = '', ...rest }) {
  return (
    <input
      {...rest}
      className={
        'w-full px-4 py-3 rounded-xl bg-[#111023] text-white text-sm outline-none border border-white/10 placeholder:text-white/40 focus:border-[#00CED1] ' +
        className
      }
    />
  )
}

function TextArea({ className = '', ...rest }) {
  return (
    <textarea
      {...rest}
      className={
        'w-full px-4 py-3 rounded-xl bg-[#111023] text-white text-sm outline-none border border-white/10 placeholder:text-white/40 focus:border-[#00CED1] resize-y min-h-[96px] ' +
        className
      }
    />
  )
}

function SelectInput({ children, ...rest }) {
  return (
    <select
      {...rest}
      className="w-full px-4 py-3 rounded-xl bg-[#111023] text-white text-sm outline-none border border-white/10 focus:border-[#00CED1]"
    >
      {children}
    </select>
  )
}

function RangeField({ label, value, min, max, step, onChange, hint, info, disabled = false }) {
  return (
    <div className={disabled ? 'opacity-70' : undefined}>
      <div className="flex items-center justify-between mb-2">
        <Label info={info}>{label}</Label>
        <span className="text-[#00CED1] text-sm font-semibold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#00CED1] disabled:cursor-not-allowed"
      />
      <p className="text-white/40 text-xs mt-1">
        {disabled
          ? 'Fixed at 15 minutes for now — class timing will use this in a future update.'
          : `Allowed: ${min} – ${max}${hint ? ` · ${hint}` : ''}`}
      </p>
    </div>
  )
}

function VoiceChip({ voice, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-xl border px-3 py-2.5 text-left transition-colors ' +
        (active
          ? 'border-[#00CED1] bg-[#00CED1]/15 text-white'
          : 'border-white/10 bg-[#111023] text-white/80 hover:border-[#00CED1]/40')
      }
    >
      <span className="block text-sm font-semibold">{voice.name}</span>
      {voice.description && (
        <span className="block text-[11px] text-white/45 mt-0.5">{voice.description}</span>
      )}
    </button>
  )
}

function buildFormState(settings) {
  const engine = settings?.voice?.engine ?? 'elevenlabs'
  const eleven = AI_SETTINGS_FIELD_RANGES.elevenlabs
  const browser = AI_SETTINGS_FIELD_RANGES.browser
  const pacing = AI_SETTINGS_FIELD_RANGES.pacing
  const llm = AI_SETTINGS_FIELD_RANGES.llm

  const rate =
    engine === 'elevenlabs'
      ? clampValue(settings?.voice?.rate ?? eleven.speed.default, eleven.speed.min, eleven.speed.max)
      : clampValue(settings?.voice?.rate ?? browser.rate.default, browser.rate.min, browser.rate.max)

  return {
    instructorName: settings?.instructor?.name ?? 'AI Instructor',
    instructorTagline: settings?.instructor?.tagline ?? 'your learning guide',
    instructorTone: settings?.instructor?.defaultTone ?? '',
    bloomBuddyName: settings?.bloomBuddy?.name ?? settings?.persona?.name ?? 'Calyx',
    bloomBuddyTagline: settings?.bloomBuddy?.tagline ?? 'your Bloom Buddy',
    bloomBuddyTone: settings?.bloomBuddy?.defaultTone ?? settings?.persona?.defaultTone ?? '',
    engine,
    elevenLabsVoiceId: settings?.voice?.elevenLabsVoiceId ?? DEFAULT_ELEVENLABS_VOICE_ID,
    elevenLabsVoiceName: settings?.voice?.elevenLabsVoiceName ?? DEFAULT_ELEVENLABS_VOICE_NAME,
    reservedClientVoiceId:
      settings?.voice?.reservedClientVoiceId ?? CLIENT_ELEVENLABS_VOICE_ID,
    reservedClientVoiceName:
      settings?.voice?.reservedClientVoiceName ?? CLIENT_ELEVENLABS_VOICE_NAME,
    elevenLabsModelId: settings?.voice?.elevenLabsModelId ?? 'eleven_multilingual_v2',
    browserVoiceName: settings?.voice?.browserVoiceName ?? '',
    rate,
    pitch: clampValue(settings?.voice?.pitch ?? browser.pitch.default, browser.pitch.min, browser.pitch.max),
    lang: settings?.voice?.lang ?? 'en-US',
    stability: clampValue(
      settings?.voice?.stability ?? eleven.stability.default,
      eleven.stability.min,
      eleven.stability.max,
    ),
    similarityBoost: clampValue(
      settings?.voice?.similarityBoost ?? eleven.similarityBoost.default,
      eleven.similarityBoost.min,
      eleven.similarityBoost.max,
    ),
    pauseMs: clampValue(settings?.pacing?.pauseMs ?? pacing.pauseMs.default, pacing.pauseMs.min, pacing.pauseMs.max),
    wordMs: clampValue(settings?.pacing?.wordMs ?? pacing.wordMs.default, pacing.wordMs.min, pacing.wordMs.max),
    classDurationMinutes: clampValue(
      settings?.pacing?.classDurationMinutes ?? pacing.classDurationMinutes.default,
      pacing.classDurationMinutes.min,
      pacing.classDurationMinutes.max,
    ),
    avatarProvider: settings?.avatar?.provider === 'heygen' ? 'heygen' : 'none',
    heygenAvatarId: settings?.avatar?.heygenAvatarId ?? '',
    heygenVoiceId: settings?.avatar?.heygenVoiceId ?? '',
    heygenApiKey: settings?.avatar?.heygenApiKey ?? '',
    onboardingTemperature: clampValue(
      settings?.llm?.onboardingTemperature ?? llm.onboardingTemperature.default,
      llm.onboardingTemperature.min,
      llm.onboardingTemperature.max,
    ),
    classroomTemperature: clampValue(
      settings?.llm?.classroomTemperature ?? llm.classroomTemperature.default,
      llm.classroomTemperature.min,
      llm.classroomTemperature.max,
    ),
    bloomBuddyTemperature: clampValue(
      settings?.llm?.bloomBuddyTemperature ?? llm.bloomBuddyTemperature?.default ?? 0.6,
      llm.bloomBuddyTemperature?.min ?? 0,
      llm.bloomBuddyTemperature?.max ?? 2,
    ),
  }
}

function serializeFormSnapshot(formState) {
  return JSON.stringify(formState)
}

export default function AiControl() {
  const ranges = AI_SETTINGS_FIELD_RANGES
  const queryClient = useQueryClient()
  const [form, setForm] = useState(null)
  const [savedFormSnapshot, setSavedFormSnapshot] = useState(null)
  const [browserVoices, setBrowserVoices] = useState([])
  const [testText, setTestText] = useState(
    'Hello! I am AI Instructor. I am excited to learn with you today.',
  )
  const [statusMessage, setStatusMessage] = useState(null)
  const [saveFeedback, setSaveFeedback] = useState(null)
  const [isTestingVoice, setIsTestingVoice] = useState(false)
  const [voiceTestPhase, setVoiceTestPhase] = useState(null)
  const [settingsTab, setSettingsTab] = useState("instructor")
  const voicePreviewRef = useRef(null)

  const { data, isLoading, error, isError } = useQuery({
    queryKey: aiSettingsQueryKeys.detail(),
    queryFn: fetchAiSettings,
  })
  useNotifyError(error, isError)

  const {
    data: voiceCatalog = FREE_TIER_FALLBACK_CATALOG,
    isLoading: voicesLoading,
    error: _voicesError,
  } = useQuery({
    queryKey: aiSettingsQueryKeys.elevenLabsVoices(),
    queryFn: fetchElevenLabsVoices,
    staleTime: 5 * 60 * 1000,
  })

  const freeVoices = voiceCatalog?.freeVoices?.length
    ? voiceCatalog.freeVoices
    : FREE_TIER_FALLBACK_CATALOG.freeVoices
  const paidVoices = voiceCatalog?.paidVoices ?? []
  const clientVoice = voiceCatalog?.clientVoice ?? FREE_TIER_FALLBACK_CATALOG.clientVoice

  const allSelectableVoices = useMemo(
    () => [...freeVoices, ...paidVoices, clientVoice],
    [freeVoices, paidVoices, clientVoice],
  )

  const selectedVoice = useMemo(
    () => allSelectableVoices.find((voice) => voice.voiceId === form?.elevenLabsVoiceId),
    [allSelectableVoices, form?.elevenLabsVoiceId],
  )

  // A voice is only flagged unavailable when it is not usable on the current
  // ElevenLabs plan (or it isn't present in the account at all).
  const selectedVoiceUnavailable = form?.elevenLabsVoiceId
    ? !selectedVoice || selectedVoice.apiAvailable === false
    : false

  // The "free credit" option only exposes the first 6 premade voices.
  const freeSixVoices = useMemo(() => freeVoices.slice(0, 6), [freeVoices])

  // The Voice engine dropdown presents three modes. Under the hood only two
  // backend engines exist ('browser' | 'elevenlabs'); the free/paid split is a
  // UI convenience: any ElevenLabs voice that is not one of the six free
  // premade voices is treated as the paid voice.
  const voiceMode = useMemo(() => {
    if (form?.engine === 'browser') return 'browser'
    const isFree = freeSixVoices.some((voice) => voice.voiceId === form?.elevenLabsVoiceId)
    return isFree ? 'elevenlabs-free' : 'elevenlabs-paid'
  }, [form?.engine, form?.elevenLabsVoiceId, freeSixVoices])

  useEffect(() => {
    if (data) {
      const nextForm = buildFormState(data)
      setForm(nextForm)
      setSavedFormSnapshot(serializeFormSnapshot(nextForm))
      setSaveFeedback(null)
    }
  }, [data])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices().filter((voice) =>
        voice.lang.toLowerCase().startsWith('en'),
      )
      setBrowserVoices(voices)
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      window.speechSynthesis.cancel()
    }
  }, [])

  useEffect(() => {
    return () => {
      const preview = voicePreviewRef.current
      if (preview?.type === 'audio') {
        preview.audio.pause()
        URL.revokeObjectURL(preview.url)
      }
    }
  }, [])

  const isDirty = useMemo(() => {
    if (!form || !savedFormSnapshot) return false
    return serializeFormSnapshot(form) !== savedFormSnapshot
  }, [form, savedFormSnapshot])

  const saveMutation = useMutation({
    mutationFn: updateAiSettings,
    onSuccess: (saved) => {
      queryClient.setQueryData(aiSettingsQueryKeys.detail(), saved)
      const nextForm = buildFormState(saved)
      setForm(nextForm)
      setSavedFormSnapshot(serializeFormSnapshot(nextForm))
      setSaveFeedback({
        type: 'success',
        message: 'Settings saved successfully. AI Instructor and Bloom Buddy will use these values.',
      })
      notify.success('Settings saved successfully.')
    },
    onError: (err) => {
      notify.error(err, 'Unable to save AI settings.')
    },
  })

  const payload = useMemo(() => {
    if (!form) return null
    return {
      instructor: {
        name: form.instructorName.trim(),
        tagline: form.instructorTagline.trim(),
        defaultTone: form.instructorTone.trim(),
      },
      bloomBuddy: {
        name: form.bloomBuddyName.trim(),
        tagline: form.bloomBuddyTagline.trim(),
        defaultTone: form.bloomBuddyTone.trim(),
      },
      voice: {
        engine: form.engine,
        elevenLabsVoiceId: form.elevenLabsVoiceId.trim(),
        elevenLabsVoiceName: form.elevenLabsVoiceName.trim(),
        reservedClientVoiceId: form.reservedClientVoiceId.trim(),
        reservedClientVoiceName: form.reservedClientVoiceName.trim(),
        elevenLabsModelId: form.elevenLabsModelId,
        browserVoiceName: form.browserVoiceName,
        browserVoiceUri:
          browserVoices.find((voice) => voice.name === form.browserVoiceName)?.voiceURI ?? '',
        rate: form.rate,
        pitch: form.pitch,
        lang: form.lang,
        stability: form.stability,
        similarityBoost: form.similarityBoost,
      },
      pacing: {
        pauseMs: form.pauseMs,
        wordMs: form.wordMs,
        classDurationMinutes: form.classDurationMinutes,
      },
      avatar: {
        provider: form.avatarProvider,
        enabled: form.avatarProvider !== 'none',
        heygenAvatarId: form.heygenAvatarId.trim(),
        heygenVoiceId: form.heygenVoiceId.trim(),
        heygenApiKey: form.heygenApiKey.trim(),
      },
      llm: {
        onboardingTemperature: form.onboardingTemperature,
        classroomTemperature: form.classroomTemperature,
        bloomBuddyTemperature: form.bloomBuddyTemperature,
      },
    }
  }, [form, browserVoices])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setStatusMessage(null)
    setSaveFeedback(null)
  }

  function applyRecommendedFreeVoice() {
    const recommended =
      freeVoices.find((voice) => voice.voiceId === DEFAULT_ELEVENLABS_VOICE_ID) ??
      freeVoices[0]

    if (!recommended) {
      setStatusMessage('No free API voice found on this ElevenLabs account.')
      return
    }

    selectVoice(recommended)
    setStatusMessage(`Selected ${recommended.name} — works on free ElevenLabs API plans. Save to apply.`)
  }

  function selectVoice(voice) {
    setForm((prev) => ({
      ...prev,
      elevenLabsVoiceId: voice.voiceId,
      elevenLabsVoiceName: voice.name,
    }))
    setStatusMessage(null)
    setSaveFeedback(null)
  }

  function handleVoiceModeChange(mode) {
    setStatusMessage(null)
    setSaveFeedback(null)

    if (mode === 'browser') {
      updateField('engine', 'browser')
      return
    }

    if (mode === 'elevenlabs-paid') {
      setForm((prev) => ({
        ...prev,
        engine: 'elevenlabs',
        elevenLabsVoiceId: prev.reservedClientVoiceId,
        elevenLabsVoiceName: prev.reservedClientVoiceName,
      }))
      return
    }

    // elevenlabs-free: keep the current free voice, otherwise fall back to the
    // recommended default (Bella).
    setForm((prev) => {
      const alreadyFree = freeSixVoices.some((voice) => voice.voiceId === prev.elevenLabsVoiceId)
      if (alreadyFree) {
        return { ...prev, engine: 'elevenlabs' }
      }
      const fallback =
        freeSixVoices.find((voice) => voice.voiceId === DEFAULT_ELEVENLABS_VOICE_ID) ??
        freeSixVoices[0]
      return {
        ...prev,
        engine: 'elevenlabs',
        elevenLabsVoiceId: fallback?.voiceId ?? prev.elevenLabsVoiceId,
        elevenLabsVoiceName: fallback?.name ?? prev.elevenLabsVoiceName,
      }
    })
  }

  function handleElevenLabsVoiceChange(voiceId) {
    const voice = allSelectableVoices.find((item) => item.voiceId === voiceId)
    if (voice) {
      selectVoice(voice)
    }
  }

  async function handleTestVoice() {
    if (!form || isTestingVoice) return

    function stopCurrentPreview() {
      if (voicePreviewRef.current?.type === 'audio') {
        voicePreviewRef.current.audio.pause()
        URL.revokeObjectURL(voicePreviewRef.current.url)
      } else if (voicePreviewRef.current?.type === 'speech') {
        window.speechSynthesis?.cancel()
      }
      voicePreviewRef.current = null
    }

    stopCurrentPreview()
    setIsTestingVoice(true)
    setVoiceTestPhase('loading')
    setStatusMessage(null)

    try {
      if (form.engine === 'elevenlabs') {
        const blob = await testAiVoice({
          text: testText,
          voice: payload.voice,
        })
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        voicePreviewRef.current = { type: 'audio', audio, url }

        setVoiceTestPhase('playing')
        await new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(url)
            voicePreviewRef.current = null
            resolve()
          }
          audio.onerror = () => {
            URL.revokeObjectURL(url)
            voicePreviewRef.current = null
            reject(new Error('Could not play the voice preview.'))
          }
          audio.play().catch(reject)
        })
        setStatusMessage('Voice preview played using ElevenLabs.')
        return
      }

      if (!window.speechSynthesis) {
        setStatusMessage('Browser speech is not available on this device.')
        return
      }

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(testText)
      utterance.rate = form.rate
      utterance.pitch = form.pitch
      utterance.lang = form.lang
      const selected = browserVoices.find((voice) => voice.name === form.browserVoiceName)
      if (selected) utterance.voice = selected
      voicePreviewRef.current = { type: 'speech', utterance }

      setVoiceTestPhase('playing')
      await new Promise((resolve) => {
        utterance.onend = () => {
          voicePreviewRef.current = null
          resolve()
        }
        utterance.onerror = () => {
          voicePreviewRef.current = null
          resolve()
        }
        window.speechSynthesis.speak(utterance)
      })
      setStatusMessage('Voice preview played using browser TTS.')
    } catch (err) {
      notify.error(await getAiVoiceTestErrorMessage(err))
    } finally {
      setIsTestingVoice(false)
      setVoiceTestPhase(null)
    }
  }

  function handleSave() {
    if (!payload || !isDirty || saveMutation.isPending) return
    setSaveFeedback(null)
    saveMutation.mutate(payload)
  }

  if (isLoading || !form) {
    return (
      <SuperAdminLayout title="AI Control">
        <div className="rounded-2xl border border-white/10 bg-[#313044] p-10 text-center text-white/60">
          Loading AI settings…
        </div>
      </SuperAdminLayout>
    )
  }

  return (
    <SuperAdminLayout title="AI Control">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-2xl border border-[#00CED1]/20 bg-[#00CED1]/10 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#00CED1]/20 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-[#00CED1]" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Global AI configuration</h2>
            <p className="text-white/60 text-sm mt-1">
              AI Instructor handles live classes and onboarding. Bloom Buddy handles SEL check-ins only.
              Curriculum content stays in Curriculum Studio.
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSettingsTab("instructor")}
            className={
              "px-4 py-2 rounded-full text-sm font-semibold transition-colors border " +
              (settingsTab === "instructor"
                ? "bg-[#00CED1]/15 border-[#00CED1]/50 text-white"
                : "bg-[#111023] border-white/10 text-white/60 hover:text-white/80 hover:border-[#00CED1]/40")
            }
          >
            AI instructor
          </button>
          <button
            type="button"
            onClick={() => setSettingsTab("bloom")}
            className={
              "px-4 py-2 rounded-full text-sm font-semibold transition-colors border " +
              (settingsTab === "bloom"
                ? "bg-[#00CED1]/15 border-[#00CED1]/50 text-white"
                : "bg-[#111023] border-white/10 text-white/60 hover:text-white/80 hover:border-[#00CED1]/40")
            }
          >
            Bloom Buddy
          </button>
        </div>

        {isError && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/60 text-sm">
            Unable to load AI settings right now.
          </div>
        )}

        {statusMessage && (
          <div className="rounded-xl border border-[#00CED1]/30 bg-[#00CED1]/10 px-4 py-3 text-[#00CED1] text-sm">
            {statusMessage}
          </div>
        )}

        {isDirty && !saveMutation.isPending && (
          <div className="rounded-xl border border-[#FFC542]/25 bg-[#FFC542]/10 px-4 py-3 text-[#FFC542] text-sm">
            You have unsaved changes.
          </div>
        )}

        {settingsTab === "instructor" ? (
          <Card
            title="AI Instructor"
            description="Teaches curriculum in live class and guides onboarding walkthroughs."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <TextInput
                  value={form.instructorName}
                  onChange={(event) => updateField('instructorName', event.target.value)}
                />
              </div>
              <div>
                <Label>Tagline</Label>
                <TextInput
                  value={form.instructorTagline}
                  onChange={(event) => updateField('instructorTagline', event.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Teaching tone</Label>
                <TextArea
                  value={form.instructorTone}
                  onChange={(event) => updateField('instructorTone', event.target.value)}
                  placeholder="clear, patient, and encouraging"
                />
              </div>
            </div>
          </Card>
        ) : null}

        {settingsTab === "bloom" ? (
          <Card
            title="Bloom Buddy (Calyx)"
            description="SEL only — mood check-ins and emotional support. Does not teach curriculum or onboarding."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label>Name</Label>
                <TextInput
                  value={form.bloomBuddyName}
                  onChange={(event) => updateField('bloomBuddyName', event.target.value)}
                />
              </div>
              <div>
                <Label>Tagline</Label>
                <TextInput
                  value={form.bloomBuddyTagline}
                  onChange={(event) => updateField('bloomBuddyTagline', event.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Support tone</Label>
                <TextArea
                  value={form.bloomBuddyTone}
                  onChange={(event) => updateField('bloomBuddyTone', event.target.value)}
                  placeholder="warm, gentle, and supportive"
                />
              </div>
            </div>
          </Card>
        ) : null}

        <Card
          title="Voice (TTS fallback / onboarding only)"
          description="Used when LiveAvatar is OFF, or if the avatar fails. These ElevenLabs settings do NOT control live class avatar speech."
        >
          <div className="grid gap-5">
            <div>
              <Label>Voice engine</Label>
              <SelectInput
                value={voiceMode}
                onChange={(event) => handleVoiceModeChange(event.target.value)}
              >
                <option value="browser">Browser based</option>
                <option value="elevenlabs-free">ElevenLabs — free credit voices</option>
                <option value="elevenlabs-paid">ElevenLabs — paid voice</option>
              </SelectInput>
            </div>

            {form.engine === 'elevenlabs' ? (
              <>
                {selectedVoiceUnavailable && (
                  <div className="rounded-xl border border-[#FFC542]/30 bg-[#FFC542]/10 px-4 py-3 text-sm text-[#FFC542]">
                    <p className="font-medium">
                      The active voice is not available on your current ElevenLabs API plan.
                    </p>
                    <p className="mt-1 text-[#FFC542]/90">
                      Add this voice to your ElevenLabs account, or pick a voice below. Free premade
                      voices always work.
                    </p>
                    <button
                      type="button"
                      onClick={applyRecommendedFreeVoice}
                      className="mt-3 inline-flex items-center rounded-full border border-[#FFC542]/40 px-4 py-2 text-xs font-semibold text-[#FFC542] hover:bg-[#FFC542]/10"
                    >
                      Use recommended free voice ({DEFAULT_ELEVENLABS_VOICE_NAME})
                    </button>
                  </div>
                )}

                {voiceMode === 'elevenlabs-free' && (
                  <>
                    <div>
                      <Label>Free ElevenLabs voices</Label>
                      <p className="text-white/45 text-xs mb-3">
                        Six premade voices that run on free ElevenLabs credits. Click one to set it
                        as Calyx&apos;s active voice.
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {freeSixVoices.map((voice) => (
                          <VoiceChip
                            key={voice.voiceId}
                            voice={voice}
                            active={form.elevenLabsVoiceId === voice.voiceId}
                            onClick={() => selectVoice(voice)}
                          />
                        ))}
                      </div>
                      {voicesLoading && (
                        <p className="text-white/40 text-xs mt-2">Loading voices from ElevenLabs…</p>
                      )}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <Label>Active voice (dropdown)</Label>
                        <SelectInput
                          value={form.elevenLabsVoiceId}
                          onChange={(event) => handleElevenLabsVoiceChange(event.target.value)}
                          disabled={voicesLoading}
                        >
                          {freeSixVoices.map((voice) => (
                            <option key={voice.voiceId} value={voice.voiceId}>
                              {voice.name}
                            </option>
                          ))}
                        </SelectInput>
                      </div>
                      <div>
                        <Label>Voice label</Label>
                        <TextInput
                          value={form.elevenLabsVoiceName}
                          onChange={(event) => updateField('elevenLabsVoiceName', event.target.value)}
                        />
                        <p className="text-white/40 text-xs mt-2">
                          Active voice ID: <span className="text-white/60">{form.elevenLabsVoiceId}</span>
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {voiceMode === 'elevenlabs-paid' && (
                  <>
                    <div className="rounded-xl border border-white/10 bg-[#111023] p-4">
                      <p className="text-white text-sm font-semibold">Paid ElevenLabs voice</p>
                      <p className="text-white/50 text-xs mt-1">
                        {form.elevenLabsVoiceName || 'Unnamed voice'} · {form.elevenLabsVoiceId}
                      </p>
                      <p className="text-xs mt-1">
                        {clientVoice?.apiAvailable ? (
                          <span className="text-[#3BE8B0]">
                            Available on your current ElevenLabs plan — ready to use.
                          </span>
                        ) : (
                          <span className="text-white/45">
                            Make sure this voice is in your ElevenLabs account and your API key can
                            use it, then press “Test voice”.
                          </span>
                        )}
                      </p>
                      <a
                        href={CLIENT_VOICE_LIBRARY_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00CED1] text-xs underline mt-1 inline-block"
                      >
                        Open this voice in ElevenLabs
                      </a>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <Label
                          info="Paste the exact voice ID of the paid voice from your ElevenLabs account."
                        >
                          Paid voice ID
                        </Label>
                        <TextInput
                          value={form.elevenLabsVoiceId}
                          placeholder="e.g. gJx1vCzNCD1EQHT212Ls"
                          onChange={(event) =>
                            updateField('elevenLabsVoiceId', event.target.value.trim())
                          }
                        />
                      </div>
                      <div>
                        <Label>Voice label</Label>
                        <TextInput
                          value={form.elevenLabsVoiceName}
                          onChange={(event) => updateField('elevenLabsVoiceName', event.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label>ElevenLabs model</Label>
                  <SelectInput
                    value={form.elevenLabsModelId}
                    onChange={(event) => updateField('elevenLabsModelId', event.target.value)}
                  >
                    {ELEVENLABS_MODELS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <RangeField
                    label={ranges.elevenlabs.stability.label}
                    value={form.stability}
                    min={ranges.elevenlabs.stability.min}
                    max={ranges.elevenlabs.stability.max}
                    step={ranges.elevenlabs.stability.step}
                    onChange={(value) => updateField('stability', value)}
                    hint={ranges.elevenlabs.stability.hint}
                    info={ranges.elevenlabs.stability.info}
                  />
                  <RangeField
                    label={ranges.elevenlabs.similarityBoost.label}
                    value={form.similarityBoost}
                    min={ranges.elevenlabs.similarityBoost.min}
                    max={ranges.elevenlabs.similarityBoost.max}
                    step={ranges.elevenlabs.similarityBoost.step}
                    onChange={(value) => updateField('similarityBoost', value)}
                    hint={ranges.elevenlabs.similarityBoost.hint}
                    info={ranges.elevenlabs.similarityBoost.info}
                  />
                </div>
              </>
            ) : (
              <div>
                <Label>Browser voice (English)</Label>
                <SelectInput
                  value={form.browserVoiceName}
                  onChange={(event) => updateField('browserVoiceName', event.target.value)}
                >
                  <option value="">Auto-select best English voice</option>
                  {browserVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </SelectInput>
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              {form.engine === 'elevenlabs' ? (
                <RangeField
                  label={ranges.elevenlabs.speed.label}
                  value={form.rate}
                  min={ranges.elevenlabs.speed.min}
                  max={ranges.elevenlabs.speed.max}
                  step={ranges.elevenlabs.speed.step}
                  onChange={(value) => updateField('rate', value)}
                  hint={ranges.elevenlabs.speed.hint}
                  info={ranges.elevenlabs.speed.info}
                />
              ) : (
                <>
                  <RangeField
                    label={ranges.browser.rate.label}
                    value={form.rate}
                    min={ranges.browser.rate.min}
                    max={ranges.browser.rate.max}
                    step={ranges.browser.rate.step}
                    onChange={(value) => updateField('rate', value)}
                    hint={ranges.browser.rate.hint}
                  />
                  <RangeField
                    label={ranges.browser.pitch.label}
                    value={form.pitch}
                    min={ranges.browser.pitch.min}
                    max={ranges.browser.pitch.max}
                    step={ranges.browser.pitch.step}
                    onChange={(value) => updateField('pitch', value)}
                    hint={ranges.browser.pitch.hint}
                  />
                </>
              )}
            </div>

            <div>
              <Label>Test phrase</Label>
              <TextArea
                value={testText}
                onChange={(event) => setTestText(event.target.value)}
              />
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isTestingVoice || saveMutation.isPending}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#00CED1]/40 bg-[#00CED1]/10 px-5 py-2.5 text-sm font-semibold text-[#00CED1] hover:bg-[#00CED1]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                {voiceTestPhase === 'loading'
                  ? 'Generating voice…'
                  : voiceTestPhase === 'playing'
                    ? 'Playing…'
                    : 'Test voice'}
              </button>
            </div>
          </div>
        </Card>

        <Card
          title="Live class avatar (HeyGen LiveAvatar)"
          description="Primary classroom voice + lip-sync. When this is on, LiveAvatar owns class speech. Super Admin Voice/ElevenLabs settings above are ignored for the avatar path."
        >
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-wide text-white/45">Provider</span>
              <select
                value={form.avatarProvider}
                onChange={(e) => updateField('avatarProvider', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#111023] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00CED1]/50"
              >
                <option value="none">None (voice only)</option>
                <option value="heygen">HeyGen (LiveAvatar)</option>
              </select>
            </label>

            {form.avatarProvider === 'heygen' ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-xs uppercase tracking-wide text-white/45">LiveAvatar Avatar ID (UUID)</span>
                    <input
                      type="text"
                      value={form.heygenAvatarId}
                      onChange={(e) => updateField('heygenAvatarId', e.target.value)}
                      placeholder="From app.liveavatar.com → Avatars"
                      className="w-full rounded-xl border border-white/10 bg-[#111023] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00CED1]/50"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs uppercase tracking-wide text-white/45">LiveAvatar Voice ID</span>
                    <input
                      type="text"
                      value={form.heygenVoiceId}
                      onChange={(e) => updateField('heygenVoiceId', e.target.value)}
                      placeholder="Unused — avatar default voice"
                      disabled
                      className="w-full rounded-xl border border-white/10 bg-[#111023] px-3 py-2.5 text-sm text-white/40 outline-none opacity-60"
                    />
                    <p className="text-[11px] text-white/40 leading-relaxed">
                      Class uses the voice already assigned to this LiveAvatar avatar (low-latency flash model).
                      Super Admin ElevenLabs Voice settings are not used in live class.
                    </p>
                  </label>
                </div>
                <label className="block space-y-1.5">
                  <span className="text-xs uppercase tracking-wide text-white/45">LiveAvatar API key</span>
                  <PasswordInput
                    value={form.heygenApiKey}
                    onChange={(e) => updateField('heygenApiKey', e.target.value)}
                    placeholder="From app.liveavatar.com API settings"
                    autoComplete="off"
                    toggleLabel="Toggle API key visibility"
                    className="w-full rounded-xl border border-white/10 bg-[#111023] px-3 py-2.5 text-sm text-white outline-none focus:border-[#00CED1]/50"
                  />
                </label>
                <p className="text-xs text-white/45 leading-relaxed">
                  Use <strong className="text-white/70">LiveAvatar</strong> at{' '}
                  <code className="text-white/70">app.liveavatar.com</code>.
                  Create/select an avatar, then paste its UUID and LiveAvatar API key here.
                  Classic HeyGen Streaming Avatar IDs / Trial tokens will not work.
                </p>
              </>
            ) : null}
          </div>
        </Card>

        <Card
          title="Teaching pace"
          description="Controls how quickly Calyx reveals blackboard lines and pauses between them."
        >
          <div className="grid gap-5 md:grid-cols-3">
            <RangeField
              label={ranges.pacing.pauseMs.label}
              value={form.pauseMs}
              min={ranges.pacing.pauseMs.min}
              max={ranges.pacing.pauseMs.max}
              step={ranges.pacing.pauseMs.step}
              onChange={(value) => updateField('pauseMs', value)}
              info={ranges.pacing.pauseMs.info}
            />
            <RangeField
              label={ranges.pacing.wordMs.label}
              value={form.wordMs}
              min={ranges.pacing.wordMs.min}
              max={ranges.pacing.wordMs.max}
              step={ranges.pacing.wordMs.step}
              onChange={(value) => updateField('wordMs', value)}
              hint={ranges.pacing.wordMs.hint}
              info={ranges.pacing.wordMs.info}
            />
            <RangeField
              label={ranges.pacing.classDurationMinutes.label}
              value={form.classDurationMinutes}
              min={ranges.pacing.classDurationMinutes.min}
              max={ranges.pacing.classDurationMinutes.max}
              step={ranges.pacing.classDurationMinutes.step}
              onChange={(value) => setForm((prev) => ({ ...prev, classDurationMinutes: value }))}
              info={ranges.pacing.classDurationMinutes.info}
            />
          </div>
        </Card>

        <Card
          title="LLM behavior"
          description="Temperature for AI-generated responses. Lower = more predictable."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {settingsTab === "instructor" ? (
              <>
                <RangeField
                  label={ranges.llm.onboardingTemperature.label}
                  value={form.onboardingTemperature}
                  min={ranges.llm.onboardingTemperature.min}
                  max={ranges.llm.onboardingTemperature.max}
                  step={ranges.llm.onboardingTemperature.step}
                  onChange={(value) => updateField('onboardingTemperature', value)}
                  hint={ranges.llm.onboardingTemperature.hint}
                  info={ranges.llm.onboardingTemperature.info}
                />
                <RangeField
                  label={ranges.llm.classroomTemperature.label}
                  value={form.classroomTemperature}
                  min={ranges.llm.classroomTemperature.min}
                  max={ranges.llm.classroomTemperature.max}
                  step={ranges.llm.classroomTemperature.step}
                  onChange={(value) => updateField('classroomTemperature', value)}
                  hint={ranges.llm.classroomTemperature.hint}
                  info={ranges.llm.classroomTemperature.info}
                />
              </>
            ) : (
              <RangeField
                label={ranges.llm.bloomBuddyTemperature.label}
                value={form.bloomBuddyTemperature}
                min={ranges.llm.bloomBuddyTemperature.min}
                max={ranges.llm.bloomBuddyTemperature.max}
                step={ranges.llm.bloomBuddyTemperature.step}
                onChange={(value) => updateField('bloomBuddyTemperature', value)}
                hint={ranges.llm.bloomBuddyTemperature.hint}
                info={ranges.llm.bloomBuddyTemperature.info}
              />
            )}
          </div>
        </Card>

        <div className="flex flex-col items-end gap-3">
          {saveFeedback?.type === 'success' && (
            <div
              className={
                'w-full rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ' +
                'border-[#60D624]/30 bg-[#60D624]/10 text-[#60D624]'
              }
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveFeedback.message}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saveMutation.isPending}
            className={
              'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ' +
              (saveFeedback?.type === 'success' && !isDirty
                ? 'bg-[#60D624] text-[#111023]'
                : 'bg-[#00CED1] text-[#111023] hover:opacity-90') +
              ' disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40'
            }
          >
            {saveMutation.isPending ? (
              <>
                <Save className="w-4 h-4 animate-pulse" />
                Saving…
              </>
            ) : saveFeedback?.type === 'success' && !isDirty ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save AI settings
              </>
            )}
          </button>

          {!isDirty && !saveMutation.isPending && !saveFeedback && (
            <p className="text-white/35 text-xs">No changes to save.</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#111023]/60 px-4 py-3 text-white/45 text-xs flex items-center gap-2">
          <Volume2 className="w-4 h-4 shrink-0" />
          ElevenLabs previews require `ELEVENLABS_API_KEY` on thaylo-ai and matching `AI_SERVICE_SECRET` on thaylo-be.
        </div>
      </div>
    </SuperAdminLayout>
  )
}
