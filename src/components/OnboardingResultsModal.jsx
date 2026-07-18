import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, ChevronDown, ChevronRight, ClipboardList } from 'lucide-react'
import ListPagination from './ListPagination'
import { getApiErrorMessage } from '../lib/auth-api'
import { formatOnboardingAnswerValue } from '../lib/format-onboarding-answer'
import {
  ONBOARDING_AUDIENCE_LABELS,
  fetchOnboardingWalkthroughResults,
  onboardingQueryKeys,
} from '../lib/onboarding-api'

function toDateTimeLocalValue(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatWhen(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function ResultRow({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/[0.03]"
      >
        <span className="mt-1 text-white/50">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{item.respondentLabel}</p>
          <p className="text-white/45 text-xs mt-0.5">
            {ONBOARDING_AUDIENCE_LABELS[item.audience] ?? item.audience}
            {item.respondentEmail ? ` · ${item.respondentEmail}` : ''}
            {' · '}
            {item.answerCount} answer{item.answerCount === 1 ? '' : 's'}
          </p>
        </div>
        <span className="text-[#00CED1] text-xs shrink-0">{formatWhen(item.completedAt)}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
          {item.answers.length === 0 && (
            <p className="text-white/40 text-sm">No answers recorded.</p>
          )}
          {item.answers.map((answer) => (
            <div
              key={`${item.sessionId}-${answer.questionKey}`}
              className="rounded-xl bg-white/[0.04] px-3 py-2.5"
            >
              <p className="text-white/60 text-xs mb-1">{answer.questionTitle}</p>
              <p className="text-white text-sm">
                {formatOnboardingAnswerValue(answer.questionType, answer.value)}
              </p>
              {answer.transcript && (
                <p className="text-white/40 text-xs mt-1 italic">“{answer.transcript}”</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * @param {{
 *   open: boolean;
 *   walkthroughId: number | null;
 *   title?: string;
 *   surveyStart?: string | null;
 *   surveyEnd?: string | null;
 *   onClose: () => void;
 * }} props
 */
export default function OnboardingResultsModal({
  open,
  walkthroughId,
  title,
  surveyStart,
  surveyEnd,
  onClose,
}) {
  const [page, setPage] = useState(1)
  const [audience, setAudience] = useState('')
  const [from, setFrom] = useState('')
  const [until, setUntil] = useState('')

  useEffect(() => {
    if (!open) return
    setPage(1)
    setAudience('')
    setFrom(toDateTimeLocalValue(surveyStart))
    setUntil(toDateTimeLocalValue(surveyEnd))
  }, [open, walkthroughId, surveyStart, surveyEnd])

  const params = useMemo(
    () => ({
      page,
      ...(from && until ? { from, until } : {}),
      ...(audience ? { audience } : {}),
    }),
    [page, from, until, audience],
  )

  const resultsQuery = useQuery({
    queryKey: onboardingQueryKeys.results(walkthroughId, params),
    queryFn: () => fetchOnboardingWalkthroughResults(walkthroughId, params),
    enabled: open && !!walkthroughId,
  })

  if (!open || !walkthroughId) return null

  const data = resultsQuery.data
  const results = data?.results ?? []
  const summary = data?.summary
  const range = data?.range

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6"
        style={{ backgroundColor: '#252338' }}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00CED1]/10 flex items-center justify-center shrink-0">
              <ClipboardList size={18} className="text-[#00CED1]" />
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">
                {title ?? data?.walkthroughTitle ?? 'Survey feedback'}
              </h3>
              <p className="text-white/50 text-sm mt-1">
                Parent and student answers for this Q&A
                {range?.source === 'survey_window'
                  ? ' (filtered to the survey window)'
                  : range?.source === 'custom'
                    ? ' (custom range)'
                    : ' (all completions)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="rounded-2xl bg-white/[0.04] px-4 py-3">
            <p className="text-white/45 text-xs">Total completions</p>
            <p className="text-white text-xl font-bold mt-1">
              {summary?.totalCompletions ?? '—'}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] px-4 py-3">
            <p className="text-white/45 text-xs">Parents</p>
            <p className="text-white text-xl font-bold mt-1">
              {summary?.parentCompletions ?? '—'}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.04] px-4 py-3">
            <p className="text-white/45 text-xs">Students</p>
            <p className="text-white text-xl font-bold mt-1">
              {summary?.studentCompletions ?? '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <label className="block">
            <span className="text-white/60 text-xs">From</span>
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                setPage(1)
              }}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
            />
          </label>
          <label className="block">
            <span className="text-white/60 text-xs">Until</span>
            <input
              type="datetime-local"
              value={until}
              min={from || undefined}
              onChange={(e) => {
                setUntil(e.target.value)
                setPage(1)
              }}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
            />
          </label>
          <label className="block">
            <span className="text-white/60 text-xs">Audience</span>
            <select
              value={audience}
              onChange={(e) => {
                setAudience(e.target.value)
                setPage(1)
              }}
              className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40"
            >
              <option value="" className="bg-[#313044]">
                All
              </option>
              <option value="PARENT" className="bg-[#313044]">
                Parents
              </option>
              <option value="STUDENT" className="bg-[#313044]">
                Students
              </option>
            </select>
          </label>
        </div>

        {(data?.surveyStart || data?.surveyEnd) && (
          <p className="text-white/40 text-xs mb-4">
            Scheduled survey window: {formatWhen(data.surveyStart)} →{' '}
            {formatWhen(data.surveyEnd)}
          </p>
        )}

        {resultsQuery.isError && (
          <div className="rounded-2xl border border-[#FF7B7B]/30 bg-[#FF7B7B]/10 px-4 py-3 text-[#FF7B7B] text-sm mb-4">
            {getApiErrorMessage(resultsQuery.error)}
          </div>
        )}

        {resultsQuery.isLoading && (
          <p className="text-white/40 text-sm py-8 text-center">Loading feedback…</p>
        )}

        {!resultsQuery.isLoading && !resultsQuery.isError && results.length === 0 && (
          <p className="text-white/40 text-sm py-8 text-center">
            No completed feedback in this time range yet.
          </p>
        )}

        <div className="space-y-3">
          {results.map((item) => (
            <ResultRow key={item.sessionId} item={item} />
          ))}
        </div>

        <ListPagination
          meta={data?.meta ?? null}
          onPageChange={setPage}
          isLoading={resultsQuery.isFetching}
          itemLabel="responses"
        />
      </div>
    </div>
  )
}
