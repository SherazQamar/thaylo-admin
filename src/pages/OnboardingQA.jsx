import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Trash2, Eye, MessageCircleQuestion, ClipboardList } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import ListPagination from '../components/ListPagination'
import OnboardingUploadWizard from '../components/OnboardingUploadWizard'
import OnboardingWalkthroughModal from '../components/OnboardingWalkthroughModal'
import OnboardingResultsModal from '../components/OnboardingResultsModal'
import { notify } from '../lib/notify'
import { useNotifyError } from '../hooks/useNotifyError'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import {
  ONBOARDING_AUDIENCE_LABELS,
  ONBOARDING_STATUS_LABELS,
  ONBOARDING_TIMING_LABELS,
  deleteOnboardingWalkthrough,
  fetchOnboardingWalkthrough,
  fetchOnboardingWalkthroughs,
  onboardingQueryKeys,
  updateOnboardingWalkthrough,
} from '../lib/onboarding-api'

const TIMING_TABS = [
  { value: 'IMMEDIATE', label: 'Immediate', sub: 'Right after signup' },
  { value: 'AFTER_TWO_WEEKS', label: 'After 2 weeks', sub: 'Follow-up onboarding' },
]

const AUDIENCE_FILTERS = [
  { value: '', label: 'All audiences' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'COMBINED', label: 'Parent + Student' },
]

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
]

function StatusBadge({ status }) {
  const styles = {
    DRAFT: 'border-white/20 text-white/60 bg-white/5',
    PUBLISHED: 'border-[#00CED1] text-[#00CED1] bg-[#00CED1]/10',
    ARCHIVED: 'border-[#FF7B7B]/40 text-[#FF7B7B] bg-[#FF7B7B]/10',
  }

  return (
    <span
      className={
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ' +
        (styles[status] ?? styles.DRAFT)
      }
    >
      {ONBOARDING_STATUS_LABELS[status] ?? status}
    </span>
  )
}

function AudienceBadge({ audience }) {
  const styles = {
    PARENT: 'border-[#60D624]/30 text-[#60D624] bg-[#60D624]/10',
    STUDENT: 'border-[#00CED1]/30 text-[#00CED1] bg-[#00CED1]/10',
    COMBINED: 'border-[#FFC542]/30 text-[#FFC542] bg-[#FFC542]/10',
  }

  return (
    <span
      className={
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ' +
        (styles[audience] ?? 'border-white/10 text-white/70 bg-white/5')
      }
    >
      {ONBOARDING_AUDIENCE_LABELS[audience] ?? audience}
    </span>
  )
}

function AudienceBadges({ item }) {
  const audiences = item.audiences?.length
    ? item.audiences
    : item.audience
      ? [item.audience]
      : []

  return (
    <div className="flex flex-wrap gap-1.5">
      {audiences.map((audience) => (
        <AudienceBadge key={audience} audience={audience} />
      ))}
    </div>
  )
}

function formatShowWindow(item) {
  if (!item.showFrom || !item.showUntil) return '—'
  const from = new Date(item.showFrom)
  const until = new Date(item.showUntil)
  if (Number.isNaN(from.getTime()) || Number.isNaN(until.getTime())) return '—'

  const opts = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }
  return `${from.toLocaleString(undefined, opts)} → ${until.toLocaleString(undefined, opts)}`
}

function formatEstimatedMinutes(item) {
  if (item.parentEstimatedMinutes != null && item.estimatedMinutes != null) {
    return `${item.estimatedMinutes} / ${item.parentEstimatedMinutes}`
  }

  return item.estimatedMinutes ?? '—'
}

function formatAudienceLabel(item) {
  const audiences = item.audiences?.length
    ? item.audiences
    : item.audience
      ? [item.audience]
      : []

  return audiences.map((audience) => ONBOARDING_AUDIENCE_LABELS[audience] ?? audience).join(' · ')
}

function ViewContentModal({ open, item, onClose }) {
  if (!open || !item) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl p-6"
        style={{ backgroundColor: '#252338' }}
      >
        <h3 className="text-white text-xl font-bold">{item.title}</h3>
        <p className="text-white/50 text-sm mt-1 mb-4">
          {ONBOARDING_TIMING_LABELS[item.timing]} · {formatAudienceLabel(item)}
        </p>
        {item.tone && (
          <p className="text-white/60 text-sm mb-4">
            <span className="text-white/40">Tone:</span> {item.tone}
          </p>
        )}
        <pre className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed rounded-2xl bg-black/20 p-4">
          {item.content}
        </pre>
      </div>
    </div>
  )
}

export default function OnboardingQA() {
  const queryClient = useQueryClient()
  const [timingTab, setTimingTab] = useState('IMMEDIATE')
  const [audienceFilter, setAudienceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 300)

  const [wizardOpen, setWizardOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [resultsTarget, setResultsTarget] = useState(null)

  const listParams = useMemo(
    () => ({
      page,
      timing: timingTab,
      ...(audienceFilter ? { audience: audienceFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, timingTab, audienceFilter, statusFilter, debouncedSearch],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: onboardingQueryKeys.list(listParams),
    queryFn: () => fetchOnboardingWalkthroughs(listParams),
  })
  useNotifyError(error, isError)

  const { data: editingItem, isFetching: isLoadingEdit } = useQuery({
    queryKey: onboardingQueryKeys.detail(editingId),
    queryFn: () => fetchOnboardingWalkthrough(editingId),
    enabled: modalOpen && !!editingId,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateOnboardingWalkthrough(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'onboarding-walkthroughs'] })
      setModalOpen(false)
      setEditingId(null)
    },
    onError: (err) => notify.error(err),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOnboardingWalkthrough,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'onboarding-walkthroughs'] })
    },
  })

  const items = data?.items ?? []
  const meta = data?.meta ?? null

  function openCreate() {
    setWizardOpen(true)
  }

  function openEdit(item) {
    const editId = item.studentWalkthroughId ?? item.parentWalkthroughId ?? item.id
    setEditingId(editId)
    setModalOpen(true)
  }

  async function handleSubmit(payload) {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, payload })
    }
  }

  async function handleDelete(item) {
    const isCombined = (item.audiences?.length ?? 0) > 1 || item.combinedGroupKey
    const message =
      item.status === 'DRAFT'
        ? isCombined
          ? `Delete "${item.title}" for both parent and student? This cannot be undone.`
          : `Delete "${item.title}"? This cannot be undone.`
        : isCombined
          ? `Archive "${item.title}" for both parent and student? Published walkthroughs are archived, not permanently deleted.`
          : `Archive "${item.title}"? Published walkthroughs are archived, not permanently deleted.`

    if (!window.confirm(message)) return
    await deleteMutation.mutateAsync(item.id)
  }

  return (
    <SuperAdminLayout title="Onboarding Q&A">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#00CED1]/10 flex items-center justify-center">
                <MessageCircleQuestion size={22} className="text-[#00CED1]" />
              </div>
              <div>
                <h2 className="text-white text-3xl font-bold tracking-tight">Onboarding Q&A</h2>
                <p className="text-white/50 text-sm mt-1">
                  Manage AI walkthrough content and schedule feedback survey windows.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00CED1] text-[#111023] text-sm font-semibold px-5 py-2.5 hover:bg-[#00B8BB]"
          >
            <Plus size={16} />
            Add from document
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIMING_TABS.map((tab) => {
            const active = timingTab === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setTimingTab(tab.value)
                  setPage(1)
                }}
                className={
                  'rounded-2xl p-5 text-left border transition-all ' +
                  (active
                    ? 'border-[#00CED1] bg-[#00CED1]/10'
                    : 'border-white/5 bg-[#313044] hover:border-white/10')
                }
              >
                <p className={active ? 'text-[#00CED1] font-semibold' : 'text-white font-semibold'}>
                  {tab.label}
                </p>
                <p className="text-white/50 text-sm mt-1">{tab.sub}</p>
              </button>
            )
          })}
        </div>

        <div
          className="rounded-2xl p-5 lg:p-6"
          style={{ backgroundColor: '#313044' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-5">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by title or slug..."
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white/[0.05] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/30"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {AUDIENCE_FILTERS.map((filter) => {
                const active = audienceFilter === filter.value
                return (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={() => {
                      setAudienceFilter(filter.value)
                      setPage(1)
                    }}
                    className={
                      'rounded-full px-4 py-2 text-xs font-semibold transition-colors ' +
                      (active
                        ? 'bg-[#00CED1] text-[#111023]'
                        : 'bg-white/5 text-white/60 hover:text-white')
                    }
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {STATUS_FILTERS.map((filter) => {
              const active = statusFilter === filter.value
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => {
                    setStatusFilter(filter.value)
                    setPage(1)
                  }}
                  className={
                    'rounded-full px-4 py-2 text-xs font-semibold transition-colors ' +
                    (active
                      ? 'bg-white text-[#111023]'
                      : 'bg-white/5 text-white/60 hover:text-white')
                  }
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          {isError && (
            <p className="text-white/50 text-sm mb-4">Unable to load onboarding Q&amp;A right now.</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 px-4 text-left text-white/60 text-xs uppercase tracking-wider font-semibold">
                    Title
                  </th>
                  <th className="py-3 px-4 text-left text-white/60 text-xs uppercase tracking-wider font-semibold">
                    Audience
                  </th>
                  <th className="py-3 px-4 text-left text-white/60 text-xs uppercase tracking-wider font-semibold">
                    Survey window
                  </th>
                  <th className="py-3 px-4 text-left text-white/60 text-xs uppercase tracking-wider font-semibold">
                    Order
                  </th>
                  <th className="py-3 px-4 text-left text-white/60 text-xs uppercase tracking-wider font-semibold">
                    Est. min
                  </th>
                  <th className="py-3 px-4 text-left text-white/60 text-xs uppercase tracking-wider font-semibold">
                    Status
                  </th>
                  <th className="py-3 px-4 text-right text-white/60 text-xs uppercase tracking-wider font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-white/40 text-sm">
                      Loading walkthroughs…
                    </td>
                  </tr>
                )}

                {!isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-white/40 text-sm">
                      No walkthroughs match these filters. Try another audience, status, or search term.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  items.map((item) => (
                    <tr key={item.combinedGroupKey ?? item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-4 px-4">
                        <p className="text-white font-semibold">{item.title}</p>
                        <p className="text-white/40 text-xs mt-0.5">{item.slug}</p>
                      </td>
                      <td className="py-4 px-4">
                        <AudienceBadges item={item} />
                      </td>
                      <td className="py-4 px-4 text-white/70 text-sm whitespace-nowrap">
                        {formatShowWindow(item)}
                      </td>
                      <td className="py-4 px-4 text-white/70 text-sm">{item.sortOrder}</td>
                      <td className="py-4 px-4 text-white/70 text-sm">
                        {formatEstimatedMinutes(item)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setResultsTarget({
                                id:
                                  item.studentWalkthroughId ??
                                  item.parentWalkthroughId ??
                                  item.id,
                                title: item.title,
                                surveyStart: item.showFrom ?? null,
                                surveyEnd: item.showUntil ?? null,
                              })
                            }
                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-[#00CED1]"
                            aria-label="View feedback results"
                            title="View feedback results"
                          >
                            <ClipboardList size={14} />
                          </button>
                          {item.status !== 'ARCHIVED' && (
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-[#00CED1]"
                              aria-label="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              const viewId =
                                item.studentWalkthroughId ??
                                item.parentWalkthroughId ??
                                item.id
                              const detail = await fetchOnboardingWalkthrough(viewId)
                              setViewItem({
                                ...detail,
                                audiences: item.audiences,
                              })
                            }}
                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-[#00CED1]"
                            aria-label="View content"
                          >
                            <Eye size={14} />
                          </button>
                          {item.status !== 'ARCHIVED' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              disabled={deleteMutation.isPending}
                              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-[#FF7B7B]"
                              aria-label="Delete or archive"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isLoading={isLoading}
            itemLabel="walkthroughs"
          />
        </div>
      </div>

      <OnboardingUploadWizard
        open={wizardOpen}
        defaultTiming={timingTab}
        onClose={() => setWizardOpen(false)}
        onPublished={async () => {
          await queryClient.invalidateQueries({ queryKey: ['admin', 'onboarding-walkthroughs'] })
        }}
      />

      <OnboardingWalkthroughModal
        open={modalOpen}
        mode="edit"
        initial={editingItem}
        defaultTiming={timingTab}
        onClose={() => {
          setModalOpen(false)
          setEditingId(null)
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending || isLoadingEdit}
      />

      <ViewContentModal
        open={!!viewItem}
        item={viewItem}
        onClose={() => setViewItem(null)}
      />

      <OnboardingResultsModal
        open={!!resultsTarget}
        walkthroughId={resultsTarget?.id ?? null}
        title={resultsTarget?.title}
        surveyStart={resultsTarget?.surveyStart}
        surveyEnd={resultsTarget?.surveyEnd}
        onClose={() => setResultsTarget(null)}
      />
    </SuperAdminLayout>
  )
}
