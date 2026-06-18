import { useState } from 'react'
import { Send, Plus } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import AssignChildModal from '../components/AssignChildModal'

const QUICK_ACTIONS = [
  { label: 'Add Student' },
  { label: 'Assign Wayfinder' },
  { label: 'Generate Report' },
  { label: 'Send Annoucement' },
]

const ACTIVITY = [
  { text: 'New Student added : Sarah Connor', time: '2 hours ago' },
  { text: 'James logged in', time: '2 hours ago' },
  { text: 'James logged in', time: '2 hours ago' },
  { text: 'New Student added : Sarah Connor', time: '2 hours ago' },
]

const STATS = [
  { label: 'Total Active Students', value: '4', sub: '+5% from last month' },
  { label: 'Active Sessions', value: '2', sub: 'Currently ongoing' },
  { label: 'Pending Alerts', value: '2', sub: 'Needs attention' },
  { label: 'Wayfinders Active', value: '2', sub: 'Ready to assist' },
]

// 7 monthly mastery points (Jan–Jul). The peak/dip pattern matches the screenshot.
const MASTERY = [
  { m: 'Jan', v: 42 },
  { m: 'Feb', v: 64 },
  { m: 'Mar', v: 36 },
  { m: 'Apr', v: 50 },
  { m: 'May', v: 44 },
  { m: 'Jun', v: 72 },
  { m: 'Jul', v: 80 },
]

const ALERTS = [
  {
    title: 'Student Struggling',
    text: 'Bob Smith has failed the Math Module 3 times.',
    date: '29/01/2026',
  },
  {
    title: 'SEL Red Flag',
    text: 'Diana Prince reported low mood for 3 consecutive days.',
    date: '29/01/2026',
  },
  {
    title: 'Parent Message',
    text: 'Martha Johnson requested a meeting regarding Alice.',
    date: '27/01/2026',
  },
]

function StatCard({ label, value, sub }) {
  return (
    <div
      className="rounded-[18px] bg-[#313044] p-4 flex items-center gap-2.5 h-[88px]"
    >
      <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0">
        <Send size={22} className="text-[#00CED1] -rotate-12" />
      </div>
      <div className="min-w-0 flex flex-col gap-0.5">
        <p
          className="text-white font-medium"
          style={{
            fontSize: '11px',
            lineHeight: '16px',
            letterSpacing: '0%',
          }}
        >
          {label}
        </p>
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-white text-2xl font-semibold leading-none">
            {value}
          </span>
          <span
            className="text-white/50 font-medium truncate"
            style={{ fontSize: '11px', lineHeight: '16px' }}
          >
            {sub}
          </span>
        </div>
      </div>
    </div>
  )
}

function MasteryChart() {
  // SVG coordinate system
  const W = 1000
  const H = 280
  const PAD_X = 24
  const PAD_TOP = 30
  const PAD_BOTTOM = 36

  const points = MASTERY.map((p, i) => {
    const x = PAD_X + (i * (W - PAD_X * 2)) / (MASTERY.length - 1)
    const y = PAD_TOP + ((100 - p.v) / 100) * (H - PAD_TOP - PAD_BOTTOM)
    return { ...p, x, y }
  })

  // Smooth cubic Bezier through points
  const path = points
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

  const areaPath = `${path} L ${points[points.length - 1].x} ${H - PAD_BOTTOM} L ${points[0].x} ${H - PAD_BOTTOM} Z`

  const peak = points[3] // Apr — highlighted in screenshot

  return (
    <div className="rounded-2xl bg-[#1c1b2e] border border-white/5 p-6 lg:p-7">
      <h3 className="text-white text-lg font-semibold">
        Student Mastery Trends
      </h3>
      <p className="text-white/50 text-sm mt-1">
        Average mastery levels over the last 6 months
      </p>

      <div className="mt-6 -mx-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-[260px]"
        >
          <defs>
            <linearGradient id="masteryFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00CED1" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#00CED1" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#masteryFill)" />
          <path
            d={path}
            fill="none"
            stroke="#00CED1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Peak marker + tooltip on Apr */}
          <line
            x1={peak.x}
            x2={peak.x}
            y1={peak.y}
            y2={H - PAD_BOTTOM}
            stroke="#00CED1"
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.5"
          />
          <circle
            cx={peak.x}
            cy={peak.y}
            r="6"
            fill="#111023"
            stroke="#00CED1"
            strokeWidth="2"
          />
          <g transform={`translate(${peak.x - 22}, ${peak.y - 38})`}>
            <rect width="44" height="26" rx="13" fill="#00CED1" />
            <text
              x="22"
              y="17"
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="#111023"
              fontFamily="Inter, sans-serif"
            >
              {peak.v}
            </text>
          </g>

          {/* X labels */}
          {points.map((p) => (
            <text
              key={p.m}
              x={p.x}
              y={H - 10}
              textAnchor="middle"
              fontSize="13"
              fill="rgba(255,255,255,0.5)"
              fontFamily="Inter, sans-serif"
            >
              {p.m}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

function SessionOverview() {
  const rows = [
    { label: 'Upcoming', value: 15, bar: 'bg-[#FFC542]', width: '40%' },
    { label: 'Active', value: 48, bar: 'bg-[#FF7B7B]', width: '60%' },
    { label: 'Completed', value: 90, bar: 'bg-[#00CED1]', width: '90%' },
  ]
  return (
    <div className="rounded-2xl bg-[#313044] p-6 flex flex-col">
      <h3 className="text-white text-lg font-semibold">Session Overview</h3>

      {/* Progress bars block — bottom border = divider before stats row */}
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
              <span className="text-white text-lg font-semibold">
                {r.value}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full ${r.bar}`}
                style={{ width: r.width }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="pt-5 flex items-center">
        <div className="flex-1 flex items-baseline gap-2">
          <span className="text-white/60 text-xs">Live Sessions</span>
          <span className="text-white text-sm font-semibold">25</span>
        </div>
        <div className="w-px h-6 bg-white/10 mx-4" />
        <div className="flex-1 flex items-baseline gap-2">
          <span className="text-white/60 text-xs">Average Duration</span>
          <span className="text-white text-sm font-semibold">1h 15m</span>
        </div>
      </div>
    </div>
  )
}

function RecentAlerts() {
  return (
    <div className="rounded-2xl bg-[#313044] p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white text-lg font-semibold">Recent Alerts</h3>
        <button
          type="button"
          className="text-[#00CED1] text-xs font-semibold uppercase tracking-wider hover:underline"
        >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {ALERTS.map((a) => (
          <div
            key={a.title}
            className="flex items-start gap-4 rounded-[12px] bg-white/[0.05]"
            style={{ padding: '17px 24px' }}
          >
            <div className="w-10 h-10 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-base font-semibold leading-tight">
                {a.title}
              </p>
              <p className="text-white/60 text-sm mt-1">{a.text}</p>
              <p className="text-white/35 text-xs mt-2">{a.date}</p>
            </div>
            <button
              type="button"
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

function QuickActions({ onAssignWayfinder }) {
  return (
    <div className="rounded-2xl bg-[#313044] p-6">
      <h3 className="text-white text-lg font-semibold mb-5">Quick Actions</h3>

      <div className="flex flex-col gap-3">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.label === 'Assign Wayfinder' ? onAssignWayfinder : undefined}
            className="flex items-center gap-4 rounded-[12px] bg-white/[0.05] hover:bg-white/[0.08] transition-colors text-left"
            style={{ padding: '14px 24px' }}
          >
            <div className="w-9 h-9 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
            <span className="flex-1 text-white text-sm font-semibold">
              {a.label}
            </span>
            <span className="w-7 h-7 rounded-full bg-[#00CED1]/15 border border-[#00CED1]/30 flex items-center justify-center shrink-0">
              <Plus size={14} className="text-[#00CED1]" strokeWidth={2.5} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function RecentActivity() {
  return (
    <div className="rounded-2xl bg-[#313044] p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white text-lg font-semibold">Recent Activity</h3>
        <button
          type="button"
          className="text-[#00CED1] text-xs font-semibold uppercase tracking-wider hover:underline"
        >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {ACTIVITY.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-[12px] bg-white/[0.05]"
            style={{ padding: '14px 24px' }}
          >
            <div className="w-9 h-9 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-tight">
                {a.text}
              </p>
              <p className="text-white/40 text-xs mt-1">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [assignOpen, setAssignOpen] = useState(false)

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">
          Dashboard
        </h2>
        <p className="text-white/50 text-sm">
          Overview of Thaylo Global AI School performance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-6">
        <MasteryChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <SessionOverview />
        <RecentAlerts />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <QuickActions onAssignWayfinder={() => setAssignOpen(true)} />
        <RecentActivity />
      </div>

      <AssignChildModal open={assignOpen} onClose={() => setAssignOpen(false)} />
    </AdminLayout>
  )
}
