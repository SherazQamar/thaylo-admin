import { ChevronDown, MapPin, Users, AlertCircle, Info } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'

const FILTERS = [
  'Date Range: Last 7 Days',
  'Alert Type: All',
  'Grade: All',
  'Status: Active',
]

const STATS = [
  {
    label: 'Active Alerts',
    value: '42',
    delta: '+8%',
    bar: '#FFC542',
    width: '65%',
  },
  {
    label: 'Resolved',
    value: '128',
    delta: '+12%',
    bar: '#00CED1',
    width: '85%',
  },
  {
    label: 'Avg Response Time',
    value: '6 hrs',
    delta: '+18%',
    bar: '#FF7B7B',
    width: '55%',
  },
  {
    label: 'Escalations',
    value: '8',
    delta: '+8%',
    bar: '#60D624',
    width: '40%',
  },
]

const INSIGHTS = [
  {
    name: 'Fatima (G4)',
    badge: 'Engagement Drop Observed',
    badgeColor: '#FFC542',
    accent: '#FFC542',
    desc:
      "Fatima's interaction with digital math modules has decreased by 40% over the last 3 days. Usually highly active in morning sessions.",
    actions: ['Acknowledge', 'Add Note'],
    avatarBg: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
    time: '2h ago',
    icon: <AlertCircle size={12} className="text-[#FFC542]" />,
  },
  {
    name: 'Ali (G2)',
    badge: 'Potential Learning Struggle',
    badgeColor: '#FF6F6F',
    accent: '#FF6F6F',
    desc:
      "Multiple attempts detected on 'Reading Comprehension: Unit 4'. Consistent difficulty with inferential questions noted.",
    actions: ['Assign Support', 'Flag for Counselor'],
    avatarBg: 'linear-gradient(135deg,#F59E0B,#EC4899)',
    time: '5h ago',
    icon: <AlertCircle size={12} className="text-[#FF6F6F]" />,
  },
]

const RECOMMENDED = [
  {
    icon: MapPin,
    color: '#00CED1',
    title: 'Review G4 Math Pace',
    sub: '3 students flagging for drop in activity',
  },
  {
    icon: Users,
    color: '#00CED1',
    title: 'Peer Support Group',
    sub: 'Identify students for Reading buddies',
  },
]

function StatCard({ label, value, delta, bar, width }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: '#313044' }}
    >
      <p className="text-white/60 text-xs">{label}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-white text-3xl font-bold leading-none">
          {value}
        </span>
        <span className="text-[#60D624] text-xs font-semibold inline-flex items-center gap-1">
          {delta}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 9L9 1M9 1H3M9 1V7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width, backgroundColor: bar }}
        />
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

function InsightCard({ i }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ backgroundColor: '#313044' }}
    >
      {/* Left accent strip */}
      <span
        className="absolute left-0 top-0 bottom-0"
        style={{ width: '4px', backgroundColor: i.accent }}
      />

      <div className="p-5 pl-6">
        <div className="flex items-start gap-4">
          {/* Avatar with small alert dot */}
          <div className="relative shrink-0">
            <div
              className="w-12 h-12 rounded-full"
              style={{ background: i.avatarBg }}
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#313044] border-2 border-[#313044] flex items-center justify-center"
              style={{ backgroundColor: i.accent + '33' }}
            >
              {i.icon}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-white text-base font-semibold leading-tight">
                  {i.name}
                </p>
                <p
                  className="text-sm font-semibold mt-1"
                  style={{ color: i.badgeColor }}
                >
                  {i.badge}
                </p>
              </div>
              <span className="text-white/50 text-xs rounded-full bg-white/[0.06] px-2.5 py-1 shrink-0">
                {i.time}
              </span>
            </div>

            <p className="text-white/60 text-sm mt-2 leading-relaxed">
              {i.desc}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                type="button"
                className="rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-xs font-semibold px-4 py-1.5 transition-colors"
              >
                {i.actions[0]}
              </button>
              <button
                type="button"
                className="rounded-full border border-[#00CED1] text-[#00CED1] hover:bg-[#00CED1]/10 text-xs font-semibold px-4 py-1.5 transition-colors"
              >
                {i.actions[1]}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertDistribution() {
  // Segments arranged decoratively (separated 4 pieces like the design)
  // The design shows 3 categories: Engagement 40%, Learning 35%, SEL 25%
  // We render a stylized 4-piece donut with gaps so it looks like the screenshot.
  const segments = [
    { v: 40, color: '#FFC542' }, // Engagement
    { v: 35, color: '#FF7B7B' }, // Learning
    { v: 25, color: '#00CED1' }, // SEL
  ]
  const R = 50
  const C = 2 * Math.PI * R
  const GAP = 6
  let offset = 0

  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: '#313044' }}
    >
      <p className="text-white text-sm font-semibold">Alert Distribution</p>

      <div className="flex items-center justify-center mt-2">
        <div className="relative w-[200px] h-[200px]">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            {segments.map((s, i) => {
              const dash = (s.v / 100) * C - GAP
              const circle = (
                <circle
                  key={i}
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="14"
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                />
              )
              offset += dash + GAP
              return circle
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-2xl font-bold leading-none">
              178
            </span>
            <span className="text-white/50 text-[10px] uppercase tracking-wider mt-1">
              Total
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
        <span className="flex items-center gap-2 text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFC542]" />
          Engagement <span className="text-white/50 ml-auto">40%</span>
        </span>
        <span className="flex items-center gap-2 text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7B7B]" />
          Learning <span className="text-white/50 ml-auto">35%</span>
        </span>
        <span className="flex items-center gap-2 text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00CED1]" />
          SEL <span className="text-white/50 ml-auto">25%</span>
        </span>
      </div>
    </div>
  )
}

function RecommendedActions() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: '#313044' }}
    >
      <p className="text-white text-sm font-semibold">Recommended Actions</p>

      <div className="mt-4 flex flex-col gap-3">
        {RECOMMENDED.map((r) => (
          <div key={r.title} className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#00CED1]/15 border border-[#00CED1]/30 flex items-center justify-center shrink-0">
              <r.icon size={16} className="text-[#00CED1]" />
            </span>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium leading-tight">
                {r.title}
              </p>
              <p className="text-white/50 text-xs mt-0.5">{r.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WayfinderLoad() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: '#313044' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-white text-sm font-semibold">Wayfinder Load</p>
        <Info size={14} className="text-white/40" />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/70 text-xs">Admin Capacity</span>
          <span className="text-white text-xs font-semibold">72%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#00CED1]"
            style={{ width: '72%' }}
          />
        </div>
        <p className="text-white/50 text-xs mt-3">
          Next peak expected in 4 days (Mid-term review)
        </p>
      </div>
    </div>
  )
}

export default function AlertInsights() {
  return (
    <AdminLayout title="Wayfinder Management" userSubtitle="Super Admin">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-white text-3xl font-bold tracking-tight">
            Alerts Center
          </h2>
          <p className="text-white/50 text-sm">
            Supporting students through timely insights
          </p>
        </div>
        <button
          type="button"
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-6 py-2.5 transition-colors"
        >
          Resolve all
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

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 mt-6">
        {/* Urgent Insights */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Urgent Insights</h3>
            <button
              type="button"
              className="text-[#00CED1] text-sm font-medium hover:underline"
            >
              View History
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {INSIGHTS.map((i) => (
              <InsightCard key={i.name} i={i} />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <AlertDistribution />
          <RecommendedActions />
          <WayfinderLoad />
        </div>
      </div>
    </AdminLayout>
  )
}
