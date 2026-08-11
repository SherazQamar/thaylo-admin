import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Send, ChevronDown, Search, Flag, Info } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import InfoTooltip from '../components/InfoTooltip'
import { adminQueryKeys, fetchAdminReports } from '../lib/admin-api'
import { useNotifyError } from '../hooks/useNotifyError'

const RANGE_OPTIONS = [
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
]

const MASTERY_COLORS = {
  masteredFirstTime: '#FFC542',
  masteredSecondTime: '#00CED1',
  masteredThirdTime: '#8B5CF6',
  supportNeeded: '#FF7B7B',
}

function formatChange(value) {
  if (value == null || Number.isNaN(value)) return '—'
  const rounded = Math.round(value * 10) / 10
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded}%`
}

function formatRelativeTime(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function initialsFromName(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function StatCard({ label, value, changePercent, hint }) {
  const up = (changePercent ?? 0) >= 0
  return (
    <div
      className="rounded-[18px] p-4 flex items-center gap-2.5 h-[88px]"
      style={{ backgroundColor: '#313044' }}
    >
      <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0">
        <Send size={22} className="text-[#00CED1] -rotate-12" />
      </div>
      <div className="min-w-0 flex flex-col gap-0.5">
        <p
          className="text-white font-medium inline-flex items-center gap-1.5"
          style={{ fontSize: '11px', lineHeight: '16px' }}
        >
          <span className="truncate">{label}</span>
          {hint ? <InfoTooltip content={hint} align="left" /> : null}
        </p>
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-white text-2xl font-semibold leading-none">{value}</span>
          <span className={`text-[11px] font-semibold ${up ? 'text-[#60D624]' : 'text-[#FF7B7B]'}`}>
            {formatChange(changePercent)}
          </span>
        </div>
      </div>
    </div>
  )
}

function DateRangeFilter({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Report date range"
        className="appearance-none rounded-full bg-white/[0.06] border border-white/5 pl-4 pr-9 py-2 text-white/80 text-sm hover:bg-white/[0.1] outline-none focus:border-[#00CED1]/40"
      >
        {RANGE_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key} className="bg-[#313044]">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
      />
    </div>
  )
}

function LearningActivityChart({ points }) {
  const W = 700
  const H = 280
  const PAD_X = 30
  const PAD_TOP = 30
  const PAD_BOTTOM = 36

  const series = useMemo(() => {
    if (!points?.length) return null
    const max = Math.max(1, ...points.map((p) => p.completedLessons))
    const mapped = points.map((p, i) => {
      const x =
        points.length === 1
          ? W / 2
          : PAD_X + (i * (W - PAD_X * 2)) / (points.length - 1)
      const y = PAD_TOP + ((max - p.completedLessons) / max) * (H - PAD_TOP - PAD_BOTTOM)
      return { ...p, x, y }
    })
    const path = mapped
      .map((p, i, arr) => {
        if (i === 0) return `M ${p.x} ${p.y}`
        const prev = arr[i - 1]
        const cx1 = prev.x + (p.x - prev.x) / 2
        const cy1 = prev.y
        const cx2 = prev.x + (p.x - prev.x) / 2
        const cy2 = p.y
        return `C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`
      })
      .join(' ')
    return { mapped, path }
  }, [points])

  return (
    <div className="rounded-2xl p-6 flex-1" style={{ backgroundColor: '#313044' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-lg font-semibold inline-flex items-center gap-2">
          Learning Activity Trend
          <InfoTooltip
            content="How many lessons students finished each day in the selected date range."
            align="left"
          />
        </h3>
        <span className="flex items-center gap-2 text-[#00CED1] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00CED1]" />
          Completed Lessons
        </span>
      </div>
      <p className="text-white/50 text-sm">Daily student lesson engagement</p>

      {!series ? (
        <p className="text-white/40 text-sm py-16 text-center">No completed lessons in this range.</p>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-[260px] mt-4"
          role="img"
          aria-label="Learning activity trend"
        >
          <path
            d={series.path}
            fill="none"
            stroke="#00CED1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {series.mapped.map((p) => (
            <text
              key={`${p.label}-${p.x}`}
              x={p.x}
              y={H - 10}
              textAnchor="middle"
              fontSize="12"
              fill="rgba(255,255,255,0.5)"
              fontFamily="Inter, sans-serif"
            >
              {p.label}
            </text>
          ))}
        </svg>
      )}
    </div>
  )
}

function SupportIndicators({ indicators }) {
  const rows = [
    {
      label: 'Academic',
      value: indicators?.academic ?? 0,
      bar: 'bg-[#FF7B7B]',
    },
    {
      label: 'Engagement',
      value: indicators?.engagement ?? 0,
      bar: 'bg-[#00CED1]',
    },
    {
      label: 'Social Emotional',
      value: indicators?.socialEmotional ?? 0,
      bar: 'bg-[#00CED1]',
    },
  ]
  const max = Math.max(1, ...rows.map((r) => r.value))

  return (
    <div
      className="rounded-2xl p-6 w-full lg:w-[360px] shrink-0"
      style={{ backgroundColor: '#313044' }}
    >
      <h3 className="text-white text-lg font-semibold inline-flex items-center gap-2">
        Support Indicators
        <InfoTooltip
          content="Counts of academic, engagement, and social-emotional flags in the selected date range. Bar sizes are relative within this panel."
          align="left"
        />
      </h3>
      <p className="text-white/40 text-xs mt-1">
        Flags indicate support needs, not failure. Scoped to{' '}
        <span className="text-[#00CED1]">{indicators?.rangeLabel ?? 'selected range'}</span>.
      </p>

      <div className="mt-5 flex flex-col gap-5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/70 text-sm">{r.label}</span>
              <span className="text-white text-sm font-semibold">{r.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full ${r.bar}`}
                style={{ width: `${(r.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white/[0.04] border border-white/5 p-3 text-xs">
        <p className="text-white/80 flex items-center gap-2">
          <Info size={14} className="text-white/40 shrink-0" />
          Engagement flags
        </p>
        <p className="text-white/50 mt-1 leading-relaxed">
          {indicators?.insight ?? 'Loading insight for the selected date range…'}
        </p>
      </div>
    </div>
  )
}

function TimePerModule({ modules }) {
  const max = Math.max(1, ...(modules?.map((m) => m.avgMinutes) ?? [0]))
  const peak = modules?.reduce(
    (best, m, i) => (m.avgMinutes > (modules[best]?.avgMinutes ?? -1) ? i : best),
    0,
  )

  return (
    <div className="rounded-2xl p-6 flex-1" style={{ backgroundColor: '#313044' }}>
      <h3 className="text-white text-lg font-semibold inline-flex items-center gap-2">
        Average Time Spent per Module This Week
        <InfoTooltip
          content="Average lesson time this week, grouped by subject (ELA, Math, and others)."
          align="left"
        />
      </h3>
      <p className="text-white/40 text-xs mt-1">
        Average session minutes by subject for the current week
      </p>

      <div className="mt-6 flex items-end justify-around h-[200px] gap-3">
        {(modules ?? []).map((m, i) => {
          const height = Math.max(4, (m.avgMinutes / max) * 100)
          const active = i === peak && m.avgMinutes > 0
          return (
            <div key={m.module} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <span className="text-white/50 text-[10px]">
                {m.avgMinutes > 0 ? `${Math.round(m.avgMinutes)}m` : '—'}
              </span>
              <div
                className={`w-full rounded-md ${active ? 'bg-[#00CED1]' : 'bg-[#1c5a5d]'}`}
                style={{ height: `${height}%` }}
                title={`${m.module}: ${m.avgMinutes} min avg`}
              />
              <span className="text-white/60 text-[10px] text-center leading-tight">
                {m.module}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MasteryProfile({ profile }) {
  const segments = [
    {
      key: 'masteredFirstTime',
      label: 'Mastered first time',
      value: profile?.masteredFirstTime ?? 0,
      color: MASTERY_COLORS.masteredFirstTime,
    },
    {
      key: 'masteredSecondTime',
      label: 'Mastered second time',
      value: profile?.masteredSecondTime ?? 0,
      color: MASTERY_COLORS.masteredSecondTime,
    },
    {
      key: 'masteredThirdTime',
      label: 'Mastered third time',
      value: profile?.masteredThirdTime ?? 0,
      color: MASTERY_COLORS.masteredThirdTime,
    },
    {
      key: 'supportNeeded',
      label: 'Support needed',
      value: profile?.supportNeeded ?? 0,
      color: MASTERY_COLORS.supportNeeded,
    },
  ]

  const total = profile?.total ?? segments.reduce((sum, s) => sum + s.value, 0)
  const C = 2 * Math.PI * 60
  let offset = 0

  return (
    <div
      className="rounded-2xl p-6 w-full lg:w-[420px] shrink-0"
      style={{ backgroundColor: '#313044' }}
    >
      <h3 className="text-white text-lg font-semibold inline-flex items-center gap-2">
        Mastery Profile
        <InfoTooltip
          content="How finished lessons turned out in this range: passed on 1st, 2nd, or 3rd try, versus lessons that still need support."
          align="left"
        />
      </h3>
      <p className="text-white/40 text-xs mt-1">Completed lesson outcomes in the selected range</p>

      <div className="mt-5 flex items-center gap-6">
        <div className="relative w-[140px] h-[140px] shrink-0">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            {total === 0 ? (
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="14"
              />
            ) : (
              segments.map((s) => {
                const pct = (s.value / total) * 100
                const dash = (pct / 100) * C
                const circle = (
                  <circle
                    key={s.key}
                    cx="70"
                    cy="70"
                    r="60"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="14"
                    strokeDasharray={`${dash} ${C - dash}`}
                    strokeDashoffset={-offset}
                  />
                )
                offset += dash
                return circle
              })
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-2xl font-bold leading-none">{total}</span>
            <span className="text-white/50 text-[10px] uppercase tracking-wider mt-1">
              Lessons
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          {segments.map((s) => {
            const pct = total === 0 ? 0 : Math.round((s.value / total) * 100)
            return <Legend key={s.key} color={s.color} label={s.label} value={`${pct}%`} />
          })}
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-white/70 text-sm min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="truncate">{label}</span>
      </span>
      <span className="text-white text-sm font-semibold shrink-0">{value}</span>
    </div>
  )
}

function StudentBreakdown({ students }) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return students ?? []
    return (students ?? []).filter((s) => {
      const hay = `${s.name} ${s.grade ?? ''} ${s.wayfinderName ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [students, search])

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: '#313044' }}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h3 className="text-white text-lg font-semibold">Student Breakdown</h3>

        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="search"
            placeholder="Search Students"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[260px] pl-9 pr-4 py-2 rounded-full bg-white/[0.06] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/40"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs">
              <th className="text-left font-normal py-2 px-3">Student</th>
              <th className="text-left font-normal py-2 px-3">Grade</th>
              <th className="text-left font-normal py-2 px-3">Wayfinder</th>
              <th className="text-left font-normal py-2 px-3">Status</th>
              <th className="text-left font-normal py-2 px-3">Last Active</th>
              <th className="text-left font-normal py-2 px-3">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-white/40">
                  No students to show.
                </td>
              </tr>
            )}
            {filtered.map((s, i) => (
              <tr
                key={s.id}
                className={`transition-colors ${i === 0 ? 'bg-white/[0.04]' : ''}`}
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]">
                      {initialsFromName(s.name)}
                    </span>
                    <span className="text-white font-medium">{s.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-white/70">{s.grade ?? '—'}</td>
                <td className="py-3 px-3 text-white/70">{s.wayfinderName ?? '—'}</td>
                <td className="py-3 px-3">
                  <StatusPill status={s.status} />
                </td>
                <td className="py-3 px-3 text-white/60 text-xs">
                  {formatRelativeTime(s.lastActiveAt)}
                </td>
                <td className="py-3 px-3">
                  {s.flags > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-[#FF7B7B] text-xs font-semibold">
                      <Flag size={12} fill="#FF7B7B" />
                      {s.flags}
                    </span>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-[#60D624]/15 text-[#60D624] text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-[#FFC542]/15 text-[#FFC542] text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
      Idle
    </span>
  )
}

export default function Reports() {
  const [range, setRange] = useState('30d')
  const [exportMessage, setExportMessage] = useState(null)

  const reportsQuery = useQuery({
    queryKey: adminQueryKeys.reports({ range }),
    queryFn: () => fetchAdminReports({ range }),
  })
  useNotifyError(reportsQuery.error, reportsQuery.isError)

  const data = reportsQuery.data

  function handleExport() {
    if (!data?.students?.length) {
      setExportMessage('No student rows to export for this range.')
      return
    }

    const headers = [
      'Student',
      'Grade',
      'Wayfinder',
      'Status',
      'Last Active',
      'Flags',
    ]
    const rows = data.students.map((s) => [
      s.name,
      s.grade ?? '',
      s.wayfinderName ?? '',
      s.status,
      s.lastActiveAt ?? '',
      String(s.flags ?? 0),
    ])

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `thaylo-admin-reports-${data.rangeKey}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setExportMessage(`Exported ${data.students.length} students (${data.rangeLabel}).`)
  }

  return (
    <AdminLayout title="Reports" userSubtitle="Admin">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-white text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-white/50 text-sm">
            Understand learning, engagement, and wellbeing
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={reportsQuery.isLoading || !data}
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-7 py-2.5 transition-colors disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {exportMessage ? (
        <p className="mt-3 text-[#00CED1] text-xs">{exportMessage}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <DateRangeFilter value={range} onChange={setRange} />
        <span className="text-white/35 text-xs">
          Support indicators and mastery follow this date range. Module times are always this week.
        </span>
      </div>

      {reportsQuery.isError && (
        <p className="mt-4 text-white/50 text-sm">Unable to load reports right now.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
        {(data?.stats ?? [
          { label: 'Active Students', value: '—', changePercent: null, hint: 'Loading…' },
          { label: 'Lessons Completed', value: '—', changePercent: null, hint: 'Loading…' },
          { label: 'Support Flags', value: '—', changePercent: null, hint: 'Loading…' },
          { label: 'Avg Session Time', value: '—', changePercent: null, hint: 'Loading…' },
        ]).map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-5 mt-5">
        <LearningActivityChart points={data?.learningActivity ?? []} />
        <SupportIndicators indicators={data?.supportIndicators} />
      </div>

      <div className="flex flex-col lg:flex-row gap-5 mt-5">
        <TimePerModule modules={data?.avgTimePerModuleThisWeek} />
        <MasteryProfile profile={data?.masteryProfile} />
      </div>

      <div className="mt-5">
        <StudentBreakdown students={data?.students ?? []} />
      </div>
    </AdminLayout>
  )
}
