import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Send, Plus, RefreshCw } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import InfoTooltip from '../components/InfoTooltip'
import AssignChildModal from '../components/AssignChildModal'
import {
  adminQueryKeys,
  DASHBOARD_POLL_INTERVAL_MS,
  fetchAdminDashboard,
} from '../lib/admin-api'
import { getApiErrorMessage } from '../lib/auth-api'

const QUICK_ACTIONS = [
  { label: 'View Students', href: '/students' },
  { label: 'Assign Wayfinder', action: 'assign' },
  { label: 'Generate Report', href: '/reports' },
  { label: 'Open Alerts', href: '/alerts' },
]

const CORAL = '#FF7B61'
const TEAL = '#00CED1'

function formatRelativeTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatShortDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatSignedPercent(value) {
  if (value == null || Number.isNaN(value)) return 'No prior month data'
  const rounded = Math.round(value * 10) / 10
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded}% from last month`
}

function formatDurationMinutes(value) {
  if (value == null || Number.isNaN(value)) return '—'
  if (value < 60) return `${Math.round(value)}m`
  const hours = Math.floor(value / 60)
  const mins = Math.round(value % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function StatCard({ label, value, sub, onClick, clickHint, hint }) {
  const interactive = typeof onClick === 'function'
  const Comp = interactive ? 'button' : 'div'

  return (
    <Comp
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      title={clickHint}
      className={[
        'rounded-[18px] bg-[#313044] p-4 flex items-center gap-2.5 h-[88px] w-full text-left',
        interactive
          ? 'hover:bg-[#3a3950] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00CED1]/50'
          : '',
      ].join(' ')}
    >
      <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0">
        <Send size={22} className="text-[#00CED1] -rotate-12" />
      </div>
      <div className="min-w-0 flex flex-col gap-0.5">
        <p
          className="text-white font-medium inline-flex items-center gap-1.5"
          style={{ fontSize: '11px', lineHeight: '16px', letterSpacing: '0%' }}
        >
          <span className="truncate">{label}</span>
          {hint ? <InfoTooltip content={hint} align="left" /> : null}
        </p>
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-white text-2xl font-semibold leading-none">{value}</span>
          <span
            className="text-white/50 font-medium truncate"
            style={{ fontSize: '11px', lineHeight: '16px' }}
          >
            {sub}
          </span>
        </div>
      </div>
    </Comp>
  )
}

function EngagementChart({ points }) {
  const W = 1000
  const H = 280
  const PAD_X = 24
  const PAD_TOP = 36
  const PAD_BOTTOM = 36

  const series = useMemo(() => {
    if (!points?.length) return null

    const mauValues = points.map((p) => p.monthlyActiveUsers)
    const timeValues = points.map((p) => p.avgDailyTimeMinutes)
    const maxMau = Math.max(1, ...mauValues)
    const maxTime = Math.max(1, ...timeValues)
    const maxY = Math.max(maxMau, maxTime)

    const toPoint = (value, i) => {
      const x = PAD_X + (i * (W - PAD_X * 2)) / Math.max(1, points.length - 1)
      const y = PAD_TOP + ((maxY - value) / maxY) * (H - PAD_TOP - PAD_BOTTOM)
      return { x, y, value }
    }

    const mau = points.map((p, i) => ({ ...toPoint(p.monthlyActiveUsers, i), label: p.month }))
    const time = points.map((p, i) => ({
      ...toPoint(p.avgDailyTimeMinutes, i),
      label: p.month,
    }))

    const smoothPath = (pts) =>
      pts
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

    const mauPath = smoothPath(mau)
    const timePath = smoothPath(time)
    const mauArea = `${mauPath} L ${mau[mau.length - 1].x} ${H - PAD_BOTTOM} L ${mau[0].x} ${H - PAD_BOTTOM} Z`

    const peakIdx = mau.reduce(
      (best, p, i) => (p.value >= mau[best].value ? i : best),
      0,
    )

    return { mau, time, mauPath, timePath, mauArea, peak: mau[peakIdx] }
  }, [points])

  if (!series) {
    return (
      <div className="rounded-2xl bg-[#1c1b2e] border border-white/5 p-6 lg:p-7">
        <h3 className="text-white text-lg font-semibold inline-flex items-center gap-2">
          Platform Engagement Trends
          <InfoTooltip
            content="How many students used the app each month, and how long they typically spent learning each day."
            align="left"
          />
        </h3>
        <p className="text-white/50 text-sm mt-1">
          Monthly active users and average daily time spent
        </p>
        <p className="text-white/40 text-sm mt-10 text-center py-16">
          No engagement data yet. Activity will appear as students start courses.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-[#1c1b2e] border border-white/5 p-6 lg:p-7">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-white text-lg font-semibold inline-flex items-center gap-2">
            Platform Engagement Trends
            <InfoTooltip
              content="How many students used the app each month, and how long they typically spent learning each day."
              align="left"
            />
          </h3>
          <p className="text-white/50 text-sm mt-1">
            Monthly active users (students who attempted ≥1 course) and average daily time spent
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium shrink-0">
          <span className="inline-flex items-center gap-2 text-white/70">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: TEAL }} />
            Monthly active users
          </span>
          <span className="inline-flex items-center gap-2 text-white/70">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: CORAL }} />
            Avg daily time (min)
          </span>
        </div>
      </div>

      <div className="mt-6 -mx-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-[260px]"
          role="img"
          aria-label="Engagement trend chart"
        >
          <defs>
            <linearGradient id="mauFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TEAL} stopOpacity="0.45" />
              <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={series.mauArea} fill="url(#mauFill)" />
          <path
            d={series.mauPath}
            fill="none"
            stroke={TEAL}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={series.timePath}
            fill="none"
            stroke={CORAL}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <line
            x1={series.peak.x}
            x2={series.peak.x}
            y1={series.peak.y}
            y2={H - PAD_BOTTOM}
            stroke={TEAL}
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.5"
          />
          <circle
            cx={series.peak.x}
            cy={series.peak.y}
            r="6"
            fill="#111023"
            stroke={TEAL}
            strokeWidth="2"
          />
          <g transform={`translate(${series.peak.x - 22}, ${series.peak.y - 38})`}>
            <rect width="44" height="26" rx="13" fill={TEAL} />
            <text
              x="22"
              y="17"
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="#111023"
              fontFamily="Inter, sans-serif"
            >
              {series.peak.value}
            </text>
          </g>

          {series.mau.map((p) => (
            <text
              key={p.label}
              x={p.x}
              y={H - 10}
              textAnchor="middle"
              fontSize="13"
              fill="rgba(255,255,255,0.5)"
              fontFamily="Inter, sans-serif"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

function DailySessionOverview({ overview }) {
  const active = overview?.active ?? 0
  const completed = overview?.completedToday ?? 0
  const maxBar = Math.max(1, active, completed)

  const rows = [
    { label: 'Active', value: active, bar: 'bg-[#FF7B7B]', width: `${(active / maxBar) * 100}%` },
    {
      label: 'Completed today',
      value: completed,
      bar: 'bg-[#00CED1]',
      width: `${(completed / maxBar) * 100}%`,
    },
  ]

  return (
    <div className="rounded-2xl bg-[#313044] p-6 flex flex-col">
      <h3 className="text-white text-lg font-semibold inline-flex items-center gap-2">
        Daily Session Overview
        <InfoTooltip
          content="Students learning right now, lessons finished today, and the average time those finished lessons took."
          align="left"
        />
      </h3>

      <div
        className="mt-5 flex flex-col"
        style={{
          gap: '32px',
          paddingBottom: '32px',
          borderBottom: '1px solid #6D7580',
        }}
      >
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">{r.label}</span>
              <span className="text-white text-lg font-semibold">{r.value}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className={`h-full rounded-full ${r.bar}`} style={{ width: r.width }} />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-5 flex items-center">
        <div className="flex-1 flex items-baseline gap-2">
          <span className="text-white/60 text-xs">Live Sessions</span>
          <span className="text-white text-sm font-semibold">
            {overview?.liveSessions ?? 0}
          </span>
        </div>
        <div className="w-px h-6 bg-white/10 mx-4" />
        <div className="flex-1 flex items-baseline gap-2">
          <span className="text-white/60 text-xs">Average Duration</span>
          <span className="text-white text-sm font-semibold">
            {formatDurationMinutes(overview?.averageDurationMinutes)}
          </span>
        </div>
      </div>
    </div>
  )
}

function RecentAlerts({ alerts, onViewAll }) {
  return (
    <div className="rounded-2xl bg-[#313044] p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-white text-lg font-semibold">Recent Alerts</h3>
          <span
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#00CED1]/80"
            title="Auto-refreshes while you stay on this page"
          >
            <RefreshCw size={10} className="animate-spin [animation-duration:3s]" />
            Live
          </span>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-[#00CED1] text-xs font-semibold uppercase tracking-wider hover:underline"
        >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {alerts.length === 0 && (
          <p className="text-white/40 text-sm py-6 text-center">No active alerts right now.</p>
        )}
        {alerts.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-4 rounded-[12px] bg-white/[0.05]"
            style={{ padding: '17px 24px' }}
          >
            <div className="w-10 h-10 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-base font-semibold leading-tight">{a.title}</p>
              <p className="text-white/60 text-sm mt-1">{a.message}</p>
              <p className="text-white/35 text-xs mt-2">{formatShortDate(a.createdAt)}</p>
            </div>
            <button
              type="button"
              onClick={onViewAll}
              className="text-[#00CED1] text-xs font-semibold uppercase tracking-wider shrink-0 hover:underline mt-1"
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickActions({ onAssignWayfinder, onNavigate }) {
  return (
    <div className="rounded-2xl bg-[#313044] p-6">
      <h3 className="text-white text-lg font-semibold mb-5">Quick Actions</h3>

      <div className="flex flex-col gap-3">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => {
              if (a.action === 'assign') onAssignWayfinder?.()
              else if (a.href) onNavigate?.(a.href)
            }}
            className="flex items-center gap-4 rounded-[12px] bg-white/[0.05] hover:bg-white/[0.08] transition-colors text-left"
            style={{ padding: '14px 24px' }}
          >
            <div className="w-9 h-9 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
            <span className="flex-1 text-white text-sm font-semibold">{a.label}</span>
            <span className="w-7 h-7 rounded-full bg-[#00CED1]/15 border border-[#00CED1]/30 flex items-center justify-center shrink-0">
              <Plus size={14} className="text-[#00CED1]" strokeWidth={2.5} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function RecentActivity({ activity }) {
  return (
    <div className="rounded-2xl bg-[#313044] p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-white text-lg font-semibold">Recent Activity</h3>
          <span
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#00CED1]/80"
            title="Auto-refreshes while you stay on this page"
          >
            <RefreshCw size={10} className="animate-spin [animation-duration:3s]" />
            Live
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {activity.length === 0 && (
          <p className="text-white/40 text-sm py-6 text-center">No recent activity yet.</p>
        )}
        {activity.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-4 rounded-[12px] bg-white/[0.05]"
            style={{ padding: '14px 24px' }}
          >
            <div className="w-9 h-9 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-tight">{a.text}</p>
              <p className="text-white/40 text-xs mt-1">{formatRelativeTime(a.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [assignOpen, setAssignOpen] = useState(false)

  const dashboardQuery = useQuery({
    queryKey: adminQueryKeys.dashboard(),
    queryFn: fetchAdminDashboard,
    refetchInterval: DASHBOARD_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })

  const data = dashboardQuery.data
  const stats = data?.stats

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-white/50 text-sm">
            Overview of Thaylo Global AI School performance.
          </p>
        </div>
        {dashboardQuery.isFetching && !dashboardQuery.isLoading && (
          <p className="text-white/35 text-xs inline-flex items-center gap-1.5">
            <RefreshCw size={12} className="animate-spin" />
            Updating…
          </p>
        )}
      </div>

      {dashboardQuery.isError && (
        <div className="mt-4 rounded-xl px-4 py-3 text-sm bg-[#FF6F6F]/10 text-[#FF6F6F] border border-[#FF6F6F]/20">
          {getApiErrorMessage(dashboardQuery.error)}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        <StatCard
          label="Total Active Students This Month"
          value={dashboardQuery.isLoading ? '—' : String(stats?.activeStudentsThisMonth ?? 0)}
          sub={formatSignedPercent(stats?.activeStudentsChangePercent)}
          hint="Students who started at least one lesson this month. The % shows change compared with last month."
        />
        <StatCard
          label="Current Active Sessions"
          value={dashboardQuery.isLoading ? '—' : String(stats?.currentActiveSessions ?? 0)}
          sub="Currently ongoing"
          hint="Lessons that students are taking right now."
        />
        <StatCard
          label="Pending Alerts"
          value={dashboardQuery.isLoading ? '—' : String(stats?.pendingAlerts ?? 0)}
          sub="Needs attention"
          onClick={() => navigate('/alerts')}
          clickHint="Open Alerts Center"
          hint="Open alerts that still need attention (lesson struggles, wellbeing signals, unanswered parent messages, and similar). Click to open Alerts Center."
        />
        <StatCard
          label="Wayfinders Active"
          value={dashboardQuery.isLoading ? '—' : String(stats?.activeWayfinders ?? 0)}
          sub="Online now"
          onClick={() => navigate('/wayfinders?status=active')}
          clickHint="View wayfinders currently online"
          hint="Wayfinders who are currently online. Click to open the Wayfinders list filtered to online."
        />
      </div>

      <div className="mt-6">
        <EngagementChart points={data?.engagementTrend ?? []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <DailySessionOverview overview={data?.dailySessionOverview} />
        <RecentAlerts
          alerts={data?.recentAlerts ?? []}
          onViewAll={() => navigate('/alerts')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <QuickActions
          onAssignWayfinder={() => setAssignOpen(true)}
          onNavigate={(href) => navigate(href)}
        />
        <RecentActivity activity={data?.recentActivity ?? []} />
      </div>

      <AssignChildModal open={assignOpen} onClose={() => setAssignOpen(false)} />
    </AdminLayout>
  )
}
