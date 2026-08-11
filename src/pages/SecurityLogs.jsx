import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import ListPagination from '../components/ListPagination'
import { notify } from '../lib/notify'
import { useNotifyError } from '../hooks/useNotifyError'
import {
  fetchSystemLogs,
  resolveSystemLog,
  SYSTEM_LOG_LEVEL_LABELS,
  SYSTEM_LOG_LEVEL_STYLES,
  systemLogQueryKeys,
} from '../lib/system-logs-api'

const LEVEL_FILTERS = [
  { value: '', label: 'All levels' },
  { value: 'ERROR', label: 'Error' },
  { value: 'WARN', label: 'Warning' },
  { value: 'INFO', label: 'Info' },
]

const CATEGORY_FILTERS = [
  { value: '', label: 'All categories' },
  { value: 'CURRICULUM_RUNTIME', label: 'Curriculum AI runtime' },
]

const STATUS_FILTERS = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All' },
]

function LevelBadge({ level }) {
  return (
    <span
      className={
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ' +
        (SYSTEM_LOG_LEVEL_STYLES[level] ?? SYSTEM_LOG_LEVEL_STYLES.INFO)
      }
    >
      {SYSTEM_LOG_LEVEL_LABELS[level] ?? level}
    </span>
  )
}

function formatTimestamp(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function formatFailureError(error) {
  if (!error || typeof error !== 'string') return 'Unknown error'

  const trimmed = error.trim()
  if (!trimmed.startsWith('[')) return trimmed

  try {
    const issues = JSON.parse(trimmed)
    if (!Array.isArray(issues) || issues.length === 0) return trimmed

    return issues
      .slice(0, 4)
      .map((issue) => {
        const path = Array.isArray(issue.path) && issue.path.length > 0
          ? issue.path.join('.')
          : 'root'
        return `${path}: ${issue.message ?? 'invalid value'}`
      })
      .join('\n')
  } catch {
    return trimmed
  }
}

function LogDetails({ details }) {
  const [open, setOpen] = useState(false)

  if (!details || typeof details !== 'object') {
    return null
  }

  const failures = Array.isArray(details.failures) ? details.failures : []

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-xs text-[#00CED1] hover:underline"
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {open ? 'Hide details' : 'Show details'}
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70 space-y-2">
          {details.curriculumTitle && (
            <p>
              <span className="text-white/40">Curriculum:</span> {details.curriculumTitle}
            </p>
          )}
          {details.context && (
            <p>
              <span className="text-white/40">Context:</span> {details.context}
            </p>
          )}
          {failures.length > 0 && (
            <div>
              <p className="text-white/40 mb-1">Lesson failures:</p>
              <ul className="space-y-1">
                {failures.map((item) => (
                  <li key={item.key} className="rounded-lg bg-white/5 px-2 py-1">
                    <span className="text-white/80 font-medium">{item.key}</span>
                    {item.error ? (
                      <span className="text-[#FF7B7B] whitespace-pre-wrap">
                        {' '}
                        — {formatFailureError(item.error)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-white/50">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function SecurityLogs() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [levelFilter, setLevelFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('open')
  const [message, setMessage] = useState(null)

  const listParams = useMemo(
    () => ({
      page,
      status: statusFilter,
      ...(levelFilter ? { level: levelFilter } : {}),
      ...(categoryFilter ? { category: categoryFilter } : {}),
    }),
    [page, levelFilter, categoryFilter, statusFilter],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: systemLogQueryKeys.list(listParams),
    queryFn: () => fetchSystemLogs(listParams),
  })
  useNotifyError(error, isError)

  const resolveMutation = useMutation({
    mutationFn: (id) => resolveSystemLog(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: systemLogQueryKeys.all })
      setMessage('Log marked as resolved.')
    },
    onError: (err) => {
      setMessage(null)
      notify.error(err)
    },
  })

  const items = data?.items ?? []
  const meta = data?.meta ?? null

  return (
    <SuperAdminLayout title="Security & Logs">
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#00CED1]/30 bg-[#00CED1]/10 px-4 py-3 text-[#00CED1] text-sm flex items-start gap-2">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>
            These are real operational logs (for example curriculum AI generation failures). Use{' '}
            <strong className="font-semibold">Mark resolved</strong> after you fix the underlying
            issue. Open logs show by default.
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-white/10 bg-[#313044] px-3 py-2 text-sm text-white"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(event) => {
              setLevelFilter(event.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-white/10 bg-[#313044] px-3 py-2 text-sm text-white"
          >
            {LEVEL_FILTERS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-white/10 bg-[#313044] px-3 py-2 text-sm text-white"
          >
            {CATEGORY_FILTERS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {message ? (
          <div className="rounded-2xl border border-[#00CED1]/30 bg-[#00CED1]/10 px-4 py-3 text-sm text-[#00CED1]">
            {message}
          </div>
        ) : null}

        {isError && !isLoading ? (
          <p className="text-white/50 text-sm">Unable to load logs right now.</p>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-[#313044] overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-white/50 text-sm">Loading logs…</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-white/50 text-sm">No logs yet.</div>
          ) : (
            <ul className="divide-y divide-white/10">
              {items.map((item) => {
                const isResolved = !!item.resolvedAt
                return (
                  <li key={item.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <LevelBadge level={item.level} />
                          {isResolved ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#60D624]/40 text-[#60D624] bg-[#60D624]/10 px-3 py-1 text-xs font-medium">
                              <CheckCircle2 size={12} />
                              Resolved
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-[#FFC542]/40 text-[#FFC542] bg-[#FFC542]/10 px-3 py-1 text-xs font-medium">
                              Open
                            </span>
                          )}
                          <span className="text-white/40 text-xs">{item.category}</span>
                          <span className="text-white/30 text-xs">
                            {formatTimestamp(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-white text-sm">{item.message}</p>
                        {isResolved ? (
                          <p className="text-white/40 text-xs mt-1">
                            Resolved {formatTimestamp(item.resolvedAt)}
                          </p>
                        ) : null}
                        {item.curriculumId != null && (
                          <Link
                            to={`/super-admin/curriculum/${item.curriculumId}`}
                            className="inline-block mt-2 text-xs text-[#00CED1] hover:underline"
                          >
                            Open curriculum #{item.curriculumId}
                          </Link>
                        )}
                        <LogDetails details={item.details} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.level === 'ERROR' && !isResolved ? (
                          <AlertTriangle size={18} className="text-[#FF7B7B]" />
                        ) : null}
                        {!isResolved ? (
                          <button
                            type="button"
                            onClick={() => resolveMutation.mutate(item.id)}
                            disabled={resolveMutation.isPending}
                            className="rounded-full border border-[#00CED1]/40 text-[#00CED1] hover:bg-[#00CED1]/10 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                          >
                            Mark resolved
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {meta && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            itemLabel="logs"
          />
        )}
      </div>
    </SuperAdminLayout>
  )
}
