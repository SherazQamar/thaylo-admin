import { Send, ChevronDown, Search, Flag, ChevronRight, ChevronLeft, Info } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'

const FILTERS = ['Last 30 Days', 'Grade 4', 'WayFinder', 'Status']

const STATS = [
  { label: 'Active Students', value: '1,284', delta: '+8%', up: true },
  { label: 'Lessons Completed', value: '3,942', delta: '-2%', up: false },
  { label: 'Support Flags', value: '42', delta: '+0.5%', up: true },
  { label: 'Avg Session Time', value: '14 min', delta: '+5.0%', up: true },
]

const STUDENTS = [
  { initials: 'FG', initialsBg: '#f97316', name: 'Fatima G.', grade: 'Grade 4', wf: 'Mr. Harrison', status: 'Active', last: '2h ago', flags: 1 },
  { initials: 'SM', initialsBg: '#3b82f6', name: 'Sarah M.', grade: 'Grade 4', wf: 'Mr. Harrison', status: 'Idle', last: '2d ago', flags: 0 },
  { initials: 'LP', initialsBg: '#8b5cf6', name: 'Lucas P.', grade: 'Grade 4', wf: 'Ms. Chen', status: 'Active', last: '15m ago', flags: 0 },
]

function StatCard({ label, value, delta, up }) {
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
          className="text-white font-medium"
          style={{ fontSize: '11px', lineHeight: '16px' }}
        >
          {label}
        </p>
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-white text-2xl font-semibold leading-none">
            {value}
          </span>
          <span
            className={
              'text-[11px] font-semibold ' +
              (up ? 'text-[#60D624]' : 'text-[#FF7B7B]')
            }
          >
            {delta}
          </span>
        </div>
      </div>
    </div>
  )
}

function FilterPill({ label }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/5 pl-4 pr-3 py-2 text-white/80 text-sm hover:bg-white/[0.1]"
    >
      {label}
      <ChevronDown size={14} className="text-white/60" />
    </button>
  )
}

function LearningActivityChart() {
  const W = 700
  const H = 280
  const PAD_X = 30
  const PAD_TOP = 30
  const PAD_BOTTOM = 36

  const data = [
    { d: 'Mon', v: 18 },
    { d: 'Tue', v: 30 },
    { d: 'Wed', v: 20 },
    { d: 'Thu', v: 38 },
    { d: 'Fri', v: 76 },
    { d: 'Sat', v: 70 },
    { d: 'Sun', v: 60 },
  ]

  const points = data.map((p, i) => {
    const x = PAD_X + (i * (W - PAD_X * 2)) / (data.length - 1)
    const y = PAD_TOP + ((100 - p.v) / 100) * (H - PAD_TOP - PAD_BOTTOM)
    return { ...p, x, y }
  })

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

  return (
    <div
      className="rounded-2xl p-6 flex-1"
      style={{ backgroundColor: '#313044' }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-lg font-semibold">
          Learning Activity Trend
        </h3>
        <span className="flex items-center gap-2 text-[#00CED1] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00CED1]" />
          Completed Lessons
        </span>
      </div>
      <p className="text-white/50 text-sm">Daily student lesson engagement</p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-[260px] mt-4"
      >
        <path
          d={path}
          fill="none"
          stroke="#00CED1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p) => (
          <text
            key={p.d}
            x={p.x}
            y={H - 10}
            textAnchor="middle"
            fontSize="12"
            fill="rgba(255,255,255,0.5)"
            fontFamily="Inter, sans-serif"
          >
            {p.d}
          </text>
        ))}
      </svg>
    </div>
  )
}

function SupportIndicators() {
  const rows = [
    { label: 'Academic', value: 12, bar: 'bg-[#FF7B7B]', width: '20%' },
    { label: 'Engagement', value: 18, bar: 'bg-[#00CED1]', width: '35%' },
    { label: 'Social Emotional', value: 12, bar: 'bg-[#00CED1]', width: '20%' },
  ]
  return (
    <div
      className="rounded-2xl p-6 w-full lg:w-[360px] shrink-0"
      style={{ backgroundColor: '#313044' }}
    >
      <h3 className="text-white text-lg font-semibold">Support Indicators</h3>
      <p className="text-white/40 text-xs mt-1">
        "Flags indicate support needs, not failure."
      </p>

      <div className="mt-5 flex flex-col gap-5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/70 text-sm">{r.label}</span>
              <span className="text-white text-sm font-semibold">
                {r.value}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full ${r.bar}`}
                style={{ width: r.width }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white/[0.04] border border-white/5 p-3 text-xs">
        <p className="text-white/80 flex items-center gap-2">
          <Info size={14} className="text-white/40" />
          Engagement flags increased
        </p>
        <p className="text-white/50 mt-1 leading-relaxed">
          by 4% this week. Mostly attributed to the introduction of Grade 5 SEL
          modules.
        </p>
      </div>
    </div>
  )
}

function TimePerModule() {
  const bars = [
    { l: 'Intro', h: 35, active: false },
    { l: 'Self', h: 30, active: false },
    { l: 'Growth', h: 75, active: true },
    { l: 'Conn', h: 38, active: false },
    { l: 'World', h: 32, active: false },
  ]
  return (
    <div
      className="rounded-2xl p-6 flex-1"
      style={{ backgroundColor: '#313044' }}
    >
      <h3 className="text-white text-lg font-semibold">Time Spent per Module</h3>

      <div className="mt-6 flex items-end justify-around h-[200px] gap-3">
        {bars.map((b) => (
          <div key={b.l} className="flex-1 flex flex-col items-center gap-2">
            <div
              className={
                'w-full rounded-md ' +
                (b.active ? 'bg-[#00CED1]' : 'bg-[#1c5a5d]')
              }
              style={{ height: `${b.h}%` }}
            />
            <span className="text-white/60 text-xs">{b.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MasteryProfile() {
  // Donut: Mastered 52% (yellow), Growing 34% (teal), Support Needed 14% (red)
  const segments = [
    { v: 52, color: '#FFC542' },
    { v: 34, color: '#00CED1' },
    { v: 14, color: '#FF7B7B' },
  ]
  const C = 2 * Math.PI * 60
  let offset = 0

  return (
    <div
      className="rounded-2xl p-6 w-full lg:w-[420px] shrink-0"
      style={{ backgroundColor: '#313044' }}
    >
      <h3 className="text-white text-lg font-semibold">Mastery Profile</h3>

      <div className="mt-5 flex items-center gap-6">
        <div className="relative w-[140px] h-[140px] shrink-0">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            {segments.map((s, i) => {
              const dash = (s.v / 100) * C
              const circle = (
                <circle
                  key={i}
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
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-2xl font-bold leading-none">
              1.2k
            </span>
            <span className="text-white/50 text-[10px] uppercase tracking-wider mt-1">
              Students
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <Legend color="#FFC542" label="Mastered" value="52%" />
          <Legend color="#00CED1" label="Growing" value="34%" />
          <Legend color="#FF7B7B" label="Support Needed" value="14%" />
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-white/70 text-sm">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        {label}
      </span>
      <span className="text-white text-sm font-semibold">{value}</span>
    </div>
  )
}

function StudentBreakdown() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: '#313044' }}
    >
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
            {STUDENTS.map((s, i) => (
              <tr
                key={i}
                className={
                  'transition-colors ' + (i === 0 ? 'bg-white/[0.04]' : '')
                }
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: s.initialsBg }}
                    >
                      {s.initials}
                    </span>
                    <span className="text-white font-medium">{s.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-white/70">{s.grade}</td>
                <td className="py-3 px-3 text-white/70">{s.wf}</td>
                <td className="py-3 px-3">
                  <StatusPill status={s.status} />
                </td>
                <td className="py-3 px-3 text-white/60 text-xs">{s.last}</td>
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

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
        <p className="text-white/40 text-xs">Showing 1-10 of 1,284 students</p>
        <div className="flex items-center gap-1">
          <PageBtn>
            <ChevronLeft size={14} />
          </PageBtn>
          <PageBtn active>1</PageBtn>
          <PageBtn>2</PageBtn>
          <PageBtn>3</PageBtn>
          <PageBtn>
            <ChevronRight size={14} />
          </PageBtn>
        </div>
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

function PageBtn({ active, children }) {
  return (
    <button
      type="button"
      className={
        'w-8 h-8 rounded-lg flex items-center justify-center text-xs ' +
        (active
          ? 'bg-[#00CED1] text-[#111023] font-semibold'
          : 'text-white/60 hover:bg-white/5')
      }
    >
      {children}
    </button>
  )
}

export default function Reports() {
  return (
    <AdminLayout title="Reports" userSubtitle="Super Admin">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-white text-3xl font-bold tracking-tight">
            Reports
          </h2>
          <p className="text-white/50 text-sm">
            Understand learning, engagement, and wellbeing
          </p>
        </div>
        <button
          type="button"
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-7 py-2.5 transition-colors"
        >
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mt-6">
        {FILTERS.map((f) => (
          <FilterPill key={f} label={f} />
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Learning Activity + Support Indicators */}
      <div className="flex flex-col lg:flex-row gap-5 mt-5">
        <LearningActivityChart />
        <SupportIndicators />
      </div>

      {/* Time per Module + Mastery Profile */}
      <div className="flex flex-col lg:flex-row gap-5 mt-5">
        <TimePerModule />
        <MasteryProfile />
      </div>

      {/* Student Breakdown */}
      <div className="mt-5">
        <StudentBreakdown />
      </div>
    </AdminLayout>
  )
}
