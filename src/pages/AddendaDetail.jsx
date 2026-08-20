import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  Loader2,
} from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import { notify } from '../lib/notify'
import { useNotifyError } from '../hooks/useNotifyError'
import {
  ADDENDA_INFO_MESSAGE,
  ADDENDA_STATUS_LABELS,
  addendaQueryKeys,
  attemptLabel,
  fetchAddendum,
  updateAddendumStatus,
} from '../lib/addenda-api'

const SUPER_ADMIN_ROOT = {
  href: '/super-admin/dashboard',
  label: 'Super Admin Dashboard',
}

function StatusBadge({ status }) {
  const styles = {
    DRAFT: 'border-white/20 text-white/60 bg-white/5',
    IN_REVIEW: 'border-[#FFC542]/40 text-[#FFC542] bg-[#FFC542]/10',
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
      {ADDENDA_STATUS_LABELS[status] ?? status}
    </span>
  )
}

function AttemptCard({ lesson, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const [showFull, setShowFull] = useState(false)
  const preview = lesson.documentPreview ?? ''
  const truncated = preview.length >= 1200 && !showFull

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.03] text-left"
      >
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{lesson.title}</p>
          <p className="text-white/40 text-xs mt-0.5">
            {lesson.key} · {attemptLabel(lesson.attemptNumber)}
            {lesson.hasRuntimePlan ? ' · runtime plan present' : ''}
          </p>
        </div>
        {open ? (
          <ChevronDown size={18} className="text-white/40 shrink-0" />
        ) : (
          <ChevronRight size={18} className="text-white/40 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 py-4 space-y-3 border-t border-white/5">
          {lesson.studentLanguage && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#00CED1] mb-1 font-semibold">
                Student language
              </p>
              <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">
                {lesson.studentLanguage}
              </p>
            </div>
          )}
          {lesson.concept && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#00CED1] mb-1 font-semibold">
                Core concept
              </p>
              <p className="text-white/75 text-sm">{lesson.concept}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#00CED1] mb-1 font-semibold">
              Extracted document text ({lesson.documentLength?.toLocaleString?.() ?? 0} chars)
            </p>
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap select-text">
              {truncated ? `${preview}…` : preview}
            </p>
            {preview.length >= 1200 && (
              <button
                type="button"
                onClick={() => setShowFull((v) => !v)}
                className="mt-2 text-[#00CED1] text-xs font-semibold"
              >
                {showFull ? 'Show less' : 'Show more of extracted text'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AddendaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addendumId = Number(id)
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false)
  const [showRawJson, setShowRawJson] = useState(false)
  const [selectedLessonKey, setSelectedLessonKey] = useState('')

  const breadcrumbs = useMemo(
    () => [
      SUPER_ADMIN_ROOT,
      { href: '/super-admin/addenda', label: 'Addenda' },
      { href: `/super-admin/addenda/${id}`, label: 'Extracted data' },
    ],
    [id],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: addendaQueryKeys.detail(addendumId),
    queryFn: () => fetchAddendum(addendumId),
    enabled: Number.isFinite(addendumId),
  })
  useNotifyError(error, isError)

  const statusMutation = useMutation({
    mutationFn: (status) => updateAddendumStatus(addendumId, { status }),
    onSuccess: async (_result, status) => {
      await queryClient.invalidateQueries({ queryKey: addendaQueryKeys.detail(addendumId) })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'curriculum-addenda'] })
      if (status === 'PUBLISHED') {
        setPublishConfirmOpen(false)
        notify.success('Addenda published. Student retries will use this document.')
      }
    },
  })
  useNotifyError(statusMutation.error, statusMutation.isError)

  const extraction = data?.extraction
  const coverage = extraction?.coverage ?? []
  const activeLessonKey = selectedLessonKey || coverage[0]?.lessonKey || ''
  const visibleLessons = (extraction?.lessons ?? []).filter(
    (lesson) =>
      !activeLessonKey ||
      lesson.key === activeLessonKey ||
      lesson.parentLessonKey === activeLessonKey,
  )

  const isPublished = data?.status === 'PUBLISHED'
  const isArchived = data?.status === 'ARCHIVED'

  return (
    <SuperAdminLayout title="Addenda — Extracted data" breadcrumbs={breadcrumbs}>
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Link
              to="/super-admin/addenda"
              className="mt-1 w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white shrink-0"
              aria-label="Back to addenda list"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-white text-2xl font-bold">Extracted addenda</h2>
                {data?.status && <StatusBadge status={data.status} />}
                {data?.version != null && (
                  <span className="text-white/40 text-xs">v{data.version}</span>
                )}
              </div>
              <p className="text-white/50 text-sm mt-1">
                {data?.title ?? 'Review every lesson and retry extracted from the document.'}
              </p>
            </div>
            {data && !isArchived && (
              <div className="flex flex-wrap gap-2">
                {isPublished ? (
                  <button
                    type="button"
                    onClick={() => statusMutation.mutate('ARCHIVED')}
                    disabled={statusMutation.isPending}
                    className="rounded-xl border border-[#FF7B7B]/40 text-[#FF7B7B] text-sm font-semibold px-4 py-2.5 hover:bg-[#FF7B7B]/10 disabled:opacity-40"
                  >
                    Archive
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPublishConfirmOpen(true)}
                    disabled={statusMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00CED1] text-[#111023] text-sm font-semibold px-4 py-2.5 hover:bg-[#00B8BB] disabled:opacity-40"
                  >
                    {statusMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                    Publish for students
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#00CED1]/30 bg-[#00CED1]/10 px-4 py-3 text-[#00CED1] text-sm flex items-start gap-2">
            <Info size={16} className="shrink-0 mt-0.5" />
            <span>{ADDENDA_INFO_MESSAGE}</span>
          </div>
        </div>

        {isError && (
          <p className="text-white/50 text-sm">
            Unable to load this addendum.{' '}
            <button
              type="button"
              onClick={() => navigate('/super-admin/addenda')}
              className="text-[#00CED1] underline text-xs"
            >
              Back to list
            </button>
          </p>
        )}

        {isLoading && (
          <div
            className="rounded-2xl p-10 text-center text-white/40 text-sm"
            style={{ backgroundColor: '#313044' }}
          >
            Loading extracted addenda…
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-start">
            <div className="xl:col-span-1 space-y-3">
              <div className="rounded-2xl p-4" style={{ backgroundColor: '#313044' }}>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-3">
                  Extraction summary
                </p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/50">Lessons</dt>
                    <dd className="text-white font-semibold">
                      {extraction?.primaryLessonCount ?? data.lessonCount}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/50">Retry variants</dt>
                    <dd className="text-white font-semibold">
                      {extraction?.retryCount ?? data.retryCount}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/50">Max attempt</dt>
                    <dd className="text-white font-semibold">
                      {extraction?.maxAttemptNumber ?? data.maxAttemptNumber}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/50">Subject</dt>
                    <dd className="text-white">{data.subject}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/50">Grade</dt>
                    <dd className="text-white">{data.gradeLevel}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl p-3 space-y-1" style={{ backgroundColor: '#313044' }}>
                <p className="text-white/40 text-[10px] uppercase tracking-wider px-1 mb-2">
                  Lessons
                </p>
                {coverage.map((row) => {
                  const active = row.lessonKey === activeLessonKey
                  return (
                    <button
                      key={row.lessonKey}
                      type="button"
                      onClick={() => setSelectedLessonKey(row.lessonKey)}
                      className={
                        'w-full text-left rounded-xl px-3 py-2.5 ' +
                        (active ? 'bg-[#00CED1]/15' : 'hover:bg-white/[0.04]')
                      }
                    >
                      <p className={'text-sm font-semibold ' + (active ? 'text-white' : 'text-white/80')}>
                        {row.title}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">
                        Attempts {row.attempts.join(', ')}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="xl:col-span-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-white font-semibold">Extracted attempts</p>
                <button
                  type="button"
                  onClick={() => setShowRawJson((v) => !v)}
                  className="text-xs text-[#00CED1] font-semibold"
                >
                  {showRawJson ? 'Hide raw JSON' : 'View raw extracted JSON'}
                </button>
              </div>

              {showRawJson ? (
                <pre
                  className="rounded-2xl p-4 text-[11px] text-white/70 overflow-auto max-h-[70vh] whitespace-pre-wrap"
                  style={{ backgroundColor: '#313044' }}
                >
                  {JSON.stringify(data.scriptJson, null, 2)}
                </pre>
              ) : (
                visibleLessons.map((lesson, index) => (
                  <AttemptCard
                    key={lesson.key}
                    lesson={lesson}
                    defaultOpen={index === 0}
                  />
                ))
              )}

            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={publishConfirmOpen}
        onClose={() => setPublishConfirmOpen(false)}
        onConfirm={() => statusMutation.mutate('PUBLISHED')}
        title="Publish addenda?"
        message="This version becomes the retry source for students in this subject and grade. Other published addenda for the same scope will be archived. Extra attempts are used only if they exist in the uploaded document."
        confirmLabel="Publish"
        isLoading={statusMutation.isPending}
        icon={<CheckCircle2 className="text-[#00CED1]" size={36} />}
      />
    </SuperAdminLayout>
  )
}
