import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Cpu, Play, Save, Volume2 } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import { getApiErrorMessage } from '../lib/auth-api'
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
  VOICE_ENGINES,
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

function Label({ children }) {
  return (
    <span className="block text-white text-sm font-semibold mb-2">{children}</span>
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

function RangeField({ label, value, min, max, step, onChange, hint }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>{label}</Label>
        <span className="text-[#00CED1] text-sm font-semibold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#00CED1]"
      />
      <p className="text-white/40 text-xs mt-1">
        Allowed: {min} – {max}
        {hint ? ` · ${hint}` : ''}
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
    personaName: settings?.persona?.name ?? 'Calyx',
    defaultTone: settings?.persona?.defaultTone ?? '',
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
    'Hello! I am Calyx. I am excited to learn with you today.',
  )
  const [statusMessage, setStatusMessage] = useState(null)
  const [saveFeedback, setSaveFeedback] = useState(null)
  const [isTestingVoice, setIsTestingVoice] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: aiSettingsQueryKeys.detail(),
    queryFn: fetchAiSettings,
  })

  const {
    data: voiceCatalog = FREE_TIER_FALLBACK_CATALOG,
    isLoading: voicesLoading,
    error: voicesError,
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

  const usingClientLibraryVoice = form?.elevenLabsVoiceId === form?.reservedClientVoiceId
  const selectedVoiceUnavailable = selectedVoice && !selectedVoice.apiAvailable

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
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
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
        message: 'Settings saved successfully. Calyx will use these values in live classes.',
      })
    },
    onError: (err) => {
      setSaveFeedback({
        type: 'error',
        message: getApiErrorMessage(err, 'Unable to save AI settings.'),
      })
    },
  })

  const payload = useMemo(() => {
    if (!form) return null
    return {
      persona: {
        name: form.personaName.trim(),
        defaultTone: form.defaultTone.trim(),
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
      llm: {
        onboardingTemperature: form.onboardingTemperature,
        classroomTemperature: form.classroomTemperature,
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

  function activateClientVoice() {
    selectVoice({
      voiceId: form.reservedClientVoiceId,
      name: form.reservedClientVoiceName,
    })
    setStatusMessage(
      'Client voice selected. Test it after upgrading ElevenLabs — it will not work on a free API plan until then.',
    )
  }

  function handleElevenLabsVoiceChange(voiceId) {
    const voice = allSelectableVoices.find((item) => item.voiceId === voiceId)
    if (voice) {
      selectVoice(voice)
    }
  }

  async function handleTestVoice() {
    if (!form) return
    setIsTestingVoice(true)
    setStatusMessage(null)

    try {
      if (form.engine === 'elevenlabs') {
        const blob = await testAiVoice({
          text: testText,
          voice: payload.voice,
        })
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.onended = () => URL.revokeObjectURL(url)
        audio.onerror = () => URL.revokeObjectURL(url)
        await audio.play()
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
      window.speechSynthesis.speak(utterance)
      setStatusMessage('Voice preview played using browser TTS.')
    } catch (err) {
      setStatusMessage(await getAiVoiceTestErrorMessage(err))
    } finally {
      setIsTestingVoice(false)
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
            <h2 className="text-white font-semibold">Global Calyx configuration</h2>
            <p className="text-white/60 text-sm mt-1">
              These settings apply to live classes, onboarding, and future AI runtime flows.
              Curriculum content stays in Curriculum Studio; this panel controls how Calyx delivers it.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-[#FF7B7B]/30 bg-[#FF7B7B]/10 px-4 py-3 text-[#FF7B7B] text-sm">
            {getApiErrorMessage(error, 'Unable to load AI settings.')}
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

        <Card
          title="Calyx persona"
          description="Default personality when a lesson or walkthrough does not override tone."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label>Assistant name</Label>
              <TextInput
                value={form.personaName}
                onChange={(event) => updateField('personaName', event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Default tone</Label>
              <TextArea
                value={form.defaultTone}
                onChange={(event) => updateField('defaultTone', event.target.value)}
                placeholder="warm, encouraging, and clear"
              />
            </div>
          </div>
        </Card>

        <Card
          title="Voice"
          description="ElevenLabs is recommended for a consistent Calyx voice across all student devices."
        >
          <div className="grid gap-5">
            <div>
              <Label>Voice engine</Label>
              <SelectInput
                value={form.engine}
                onChange={(event) => updateField('engine', event.target.value)}
              >
                {VOICE_ENGINES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </div>

            {form.engine === 'elevenlabs' ? (
              <>
                {(usingClientLibraryVoice || selectedVoiceUnavailable) && (
                  <div className="rounded-xl border border-[#FFC542]/30 bg-[#FFC542]/10 px-4 py-3 text-sm text-[#FFC542]">
                    <p className="font-medium">
                      The active voice is not available on your current ElevenLabs API plan.
                    </p>
                    <p className="mt-1 text-[#FFC542]/90">
                      Pick any free premade voice below for now. The client voice stays saved for
                      when they upgrade.
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

                <div>
                  <Label>Free ElevenLabs voices (use until client upgrades)</Label>
                  <p className="text-white/45 text-xs mb-3">
                    These premade voices work on free API plans. Click one to set it as Calyx&apos;s
                    active voice.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {freeVoices.map((voice) => (
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
                  {voicesError && (
                    <p className="text-[#FFC542]/90 text-xs mt-2">
                      Could not refresh from ElevenLabs. Showing built-in free voice catalog.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-[#111023] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold">Client voice (saved for later)</p>
                      <p className="text-white/50 text-xs mt-1">
                        {form.reservedClientVoiceName} · {form.reservedClientVoiceId}
                      </p>
                      <a
                        href={CLIENT_VOICE_LIBRARY_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00CED1] text-xs underline mt-1 inline-block"
                      >
                        Open client voice in ElevenLabs
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={activateClientVoice}
                      className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 hover:border-[#00CED1]/40 hover:text-[#00CED1]"
                    >
                      Set as active (after upgrade)
                    </button>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <Label>Active voice (dropdown)</Label>
                    <SelectInput
                      value={form.elevenLabsVoiceId}
                      onChange={(event) => handleElevenLabsVoiceChange(event.target.value)}
                      disabled={voicesLoading}
                    >
                      <optgroup label="Free API voices">
                        {freeVoices.map((voice) => (
                          <option key={voice.voiceId} value={voice.voiceId}>
                            {voice.name}
                          </option>
                        ))}
                      </optgroup>
                      {paidVoices.length > 0 && (
                        <optgroup label="Other voices (may need paid plan)">
                          {paidVoices.map((voice) => (
                            <option key={voice.voiceId} value={voice.voiceId}>
                              {voice.name} ({voice.category})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Client voice">
                        <option value={form.reservedClientVoiceId}>
                          {form.reservedClientVoiceName} — after upgrade
                        </option>
                      </optgroup>
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
                  />
                  <RangeField
                    label={ranges.elevenlabs.similarityBoost.label}
                    value={form.similarityBoost}
                    min={ranges.elevenlabs.similarityBoost.min}
                    max={ranges.elevenlabs.similarityBoost.max}
                    step={ranges.elevenlabs.similarityBoost.step}
                    onChange={(value) => updateField('similarityBoost', value)}
                    hint={ranges.elevenlabs.similarityBoost.hint}
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
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#00CED1]/40 bg-[#00CED1]/10 px-5 py-2.5 text-sm font-semibold text-[#00CED1] hover:bg-[#00CED1]/20 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {isTestingVoice ? 'Playing…' : 'Test voice'}
              </button>
            </div>
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
            />
            <RangeField
              label={ranges.pacing.wordMs.label}
              value={form.wordMs}
              min={ranges.pacing.wordMs.min}
              max={ranges.pacing.wordMs.max}
              step={ranges.pacing.wordMs.step}
              onChange={(value) => updateField('wordMs', value)}
              hint={ranges.pacing.wordMs.hint}
            />
            <RangeField
              label={ranges.pacing.classDurationMinutes.label}
              value={form.classDurationMinutes}
              min={ranges.pacing.classDurationMinutes.min}
              max={ranges.pacing.classDurationMinutes.max}
              step={ranges.pacing.classDurationMinutes.step}
              onChange={(value) => updateField('classDurationMinutes', value)}
            />
          </div>
        </Card>

        <Card
          title="LLM behavior"
          description="Temperature for AI-generated responses. Lower = more predictable."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <RangeField
              label={ranges.llm.onboardingTemperature.label}
              value={form.onboardingTemperature}
              min={ranges.llm.onboardingTemperature.min}
              max={ranges.llm.onboardingTemperature.max}
              step={ranges.llm.onboardingTemperature.step}
              onChange={(value) => updateField('onboardingTemperature', value)}
              hint={ranges.llm.onboardingTemperature.hint}
            />
            <RangeField
              label={ranges.llm.classroomTemperature.label}
              value={form.classroomTemperature}
              min={ranges.llm.classroomTemperature.min}
              max={ranges.llm.classroomTemperature.max}
              step={ranges.llm.classroomTemperature.step}
              onChange={(value) => updateField('classroomTemperature', value)}
              hint={ranges.llm.classroomTemperature.hint}
            />
          </div>
        </Card>

        <div className="flex flex-col items-end gap-3">
          {saveFeedback && (
            <div
              className={
                'w-full rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ' +
                (saveFeedback.type === 'success'
                  ? 'border-[#60D624]/30 bg-[#60D624]/10 text-[#60D624]'
                  : 'border-[#FF7B7B]/30 bg-[#FF7B7B]/10 text-[#FF7B7B]')
              }
            >
              {saveFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : null}
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
