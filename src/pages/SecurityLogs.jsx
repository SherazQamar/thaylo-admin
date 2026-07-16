import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import ListPagination from '../components/ListPagination'
import { getApiErrorMessage } from '../lib/auth-api'
import {
  fetchSystemLogs,
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
  const [page, setPage] = useState(1)
  const [levelFilter, setLevelFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const listParams = useMemo(
    () => ({
      page,
      ...(levelFilter ? { level: levelFilter } : {}),
      ...(categoryFilter ? { category: categoryFilter } : {}),
    }),
    [page, levelFilter, categoryFilter],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: systemLogQueryKeys.list(listParams),
    queryFn: () => fetchSystemLogs(listParams),
  })

  const items = data?.items ?? []
  const meta = data?.meta ?? null

  return (
    <SuperAdminLayout title="Security & Logs">
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#00CED1]/30 bg-[#00CED1]/10 px-4 py-3 text-[#00CED1] text-sm flex items-start gap-2">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>
            Operational errors from curriculum AI generation and other admin workflows appear here.
            Check this page when publish or generation fails.
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
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

        {isError && (
          <div className="rounded-2xl border border-[#FF7B7B]/30 bg-[#FF7B7B]/10 px-4 py-3 text-[#FF7B7B] text-sm">
            {getApiErrorMessage(error)}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-[#313044] overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-white/50 text-sm">Loading logs…</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-white/50 text-sm">No logs yet.</div>
          ) : (
            <ul className="divide-y divide-white/10">
              {items.map((item) => (
                <li key={item.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <LevelBadge level={item.level} />
                        <span className="text-white/40 text-xs">{item.category}</span>
                        <span className="text-white/30 text-xs">{formatTimestamp(item.createdAt)}</span>
                      </div>
                      <p className="text-white text-sm">{item.message}</p>
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
                    {item.level === 'ERROR' && (
                      <AlertTriangle size={18} className="text-[#FF7B7B] shrink-0" />
                    )}
                  </div>
                </li>
              ))}
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
