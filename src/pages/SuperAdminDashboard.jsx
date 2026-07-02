import {
  ChevronDown,
  FileText,
  ChevronRight,
} from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'

const STATS = [
  { label: 'Total Students', value: '23746', delta: '-2%', up: false },
  { label: 'Active Sessions', value: '23746', delta: '-2%', up: false },
  { label: 'Way Finders Active', value: '23746', delta: '+2%', up: true },
  { label: 'Alerts', value: '15', delta: '+2%', up: true },
  { label: 'Revenue', value: '$ 2,3746', delta: '+7%', up: true },
]

const ALERT_BARS = [
  { label: 'Reading', value: 65 },
  { label: 'Writing', value: 40 },
  { label: 'Vocabulary', value: 80 },
]

const QUICK = [
  { tag: 'Admin', label: 'Create Admin' },
  { tag: 'Alerts', label: 'View alerts' },
  { tag: 'Setting', label: 'View System Setting' },
]

function StatCard({ label, value, delta, up }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: '#313044' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-xs">{label}</span>
        <span
          className={
            'text-[11px] font-semibold inline-flex items-center gap-0.5 ' +
            (up ? 'text-[#60D624]' : 'text-[#FF7B7B]')
          }
        >
          {delta}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d={up ? 'M1 9L9 1M9 1H3M9 1V7' : 'M1 1L9 9M9 9H3M9 9V3'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      <p className="text-white text-2xl font-bold leading-none">{value}</p>
    </div>
  )
}

function PlatformActivityChart() {
  // Synthesized bars per month (3 series, positive & negative) to match design
  const months = [
    {
      m: 'Jan',
      bars: [
        { color: '#00CED1', h: 22, y: 0 },
        { color: '#FFC542', h: 14, y: 0 },
        { color: '#00CED1', h: 36, y: 0 },
        { color: '#FF7B7B', h: 18, y: -1 },
      ],
    },
    {
      m: 'Feb',
      bars: [
        { color: '#00CED1', h: 28, y: 0 },
        { color: '#00CED1', h: 18, y: 0 },
        { color: '#FFC542', h: 14, y: 0 },
        { color: '#00CED1', h: 20, y: -1 },
      ],
    },
    {
      m: 'Mar',
      bars: [
        { color: '#FF7B7B', h: 26, y: -1 },
        { color: '#FFC542', h: 32, y: -1 },
        { color: '#00CED1', h: 10, y: 0 },
      ],
    },
    {
      m: 'Apr',
      bars: [
        { color: '#FFC542', h: 22, y: -1 },
        { color: '#FF7B7B', h: 18, y: -1 },
        { color: '#FFC542', h: 10, y: 0 },
        { color: '#00CED1', h: 8, y: 0 },
      ],
    },
    {
      m: 'Mai',
      bars: [
        { color: '#00CED1', h: 18, y: 0 },
        { color: '#FF7B7B', h: 26, y: -1 },
        { color: '#FFC542', h: 12, y: 0 },
      ],
    },
    {
      m: 'Jun',
      bars: [
        { color: '#FFC542', h: 16, y: 0 },
        { color: '#00CED1', h: 28, y: 0 },
        { color: '#FF7B7B', h: 14, y: -1 },
        { color: '#00CED1', h: 36, y: 0 },
      ],
    },
  ]

  const Y_LABELS = [60, 20, -20, -60]

  return (
    <div
      className="rounded-2xl p-6 flex-1"
      style={{ backgroundColor: '#313044' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">Platform Activity</h3>
        <button className="flex items-center gap-1.5 text-white/60 text-xs">
          This Week
          <ChevronDown size={12} />
        </button>
      </div>

      <div className="flex">
        {/* Y axis */}
        <div className="flex flex-col justify-between text-white/40 text-xs pr-3 py-2">
          {Y_LABELS.map((y) => (
            <span key={y}>{y}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="flex-1 relative">
          {/* zero line */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-white/10"
            style={{ top: 'calc(50% - 0.5px)' }}
          />
          <div className="flex justify-around items-center h-[160px]">
            {months.map((mo) => (
              <div key={mo.m} className="flex items-center gap-1">
                {mo.bars.map((b, i) => {
                  const isNeg = b.y < 0
                  return (
                    <span
                      key={i}
                      className="rounded-full"
                      style={{
                        backgroundColor: b.color,
                        width: '6px',
                        height: `${b.h}px`,
                        transform: isNeg
                          ? `translateY(${b.h / 2 + 4}px)`
                          : `translateY(-${b.h / 2 + 4}px)`,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          {/* X axis */}
          <div className="flex justify-around text-white/40 text-xs mt-2">
            {months.map((mo) => (
              <span key={mo.m}>{mo.m}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-white/70">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFC542]" />
          Content
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7B7B]" />
          Content
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00CED1]" />
          Content
        </span>
      </div>
    </div>
  )
}

function LearningTrendsDonut() {
  const segments = [
    { v: 35, color: '#00CED1' },
    { v: 15, color: '#FFC542' },
    { v: 50, color: '#FF7B7B' },
  ]
  const R = 60
  const C = 2 * Math.PI * R
  let offset = 0

  return (
    <div
      className="rounded-2xl p-6 flex-1"
      style={{ backgroundColor: '#313044' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">Learning Trends</h3>
        <button className="flex items-center gap-1.5 text-white/60 text-xs">
          This Week
          <ChevronDown size={12} />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-[180px] h-[180px] shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            {segments.map((s, i) => {
              const dash = (s.v / 100) * C
              const circle = (
                <circle
                  key={i}
                  cx="80"
                  cy="80"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="22"
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={-offset}
                />
              )
              offset += dash
              return circle
            })}
            {/* Percent labels */}
            <text
              x="80"
              y="20"
              textAnchor="middle"
              fontSize="11"
              fill="white"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
              transform="rotate(90 80 80)"
            >
              35%
            </text>
            <text
              x="20"
              y="125"
              textAnchor="middle"
              fontSize="11"
              fill="white"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
              transform="rotate(90 80 80)"
            >
              15%
            </text>
            <text
              x="135"
              y="125"
              textAnchor="middle"
              fontSize="11"
              fill="white"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
              transform="rotate(90 80 80)"
            >
              50%
            </text>
          </svg>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <span className="flex items-center gap-2 text-white/70 text-sm">
            <span className="w-2 h-2 rounded-full bg-[#00CED1]" />
            Content
          </span>
          <span className="flex items-center gap-2 text-white/70 text-sm">
            <span className="w-2 h-2 rounded-full bg-[#FFC542]" />
            Content
          </span>
          <span className="flex items-center gap-2 text-white/70 text-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF7B7B]" />
            Content
          </span>
        </div>
      </div>
    </div>
  )
}

function AlertsTrends() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: '#313044' }}
    >
      <h3 className="text-white text-lg font-semibold">Alerts Trends</h3>

      <div className="mt-5 flex flex-col gap-4">
        {ALERT_BARS.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">{b.label}</span>
              <span className="text-[#00CED1] text-sm">{b.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00CED1]"
                style={{ width: `${b.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickAccess() {
  return (
    <div>
      <h3 className="text-white text-lg font-semibold mb-4">Quick Access</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK.map((q) => (
          <button
            key={q.tag}
            type="button"
            className="text-left rounded-2xl p-5 hover:bg-white/[0.02] transition-colors"
            style={{ backgroundColor: '#313044' }}
          >
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <FileText size={14} />
              <span>{q.tag}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-white text-base font-semibold">
              {q.label}
              <ChevronRight size={16} className="text-white/60" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SuperAdminDashboard() {
  return (
    <SuperAdminLayout title="Super Admin Dashboard" userSubtitle="Wayfinder">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Two charts */}
      <div className="flex flex-col lg:flex-row gap-5 mt-5">
        <PlatformActivityChart />
        <LearningTrendsDonut />
      </div>

      {/* Alerts Trends */}
      <div className="mt-5">
        <AlertsTrends />
      </div>

      {/* Quick Access */}
      <div className="mt-7">
        <QuickAccess />
      </div>
    </SuperAdminLayout>
  )
}
