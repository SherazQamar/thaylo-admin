import { useState } from 'react'
import { Send, ChevronDown, Search } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'

const TABS = ['REPORT', 'ALERT']

/* ============================================================
   Atoms
============================================================ */

function PrimaryButton({ children }) {
  return (
    <button
      type="button"
      className="bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-6 py-2.5"
      style={{ borderRadius: '10px' }}
    >
      {children}
    </button>
  )
}

function OutlineButton({ children }) {
  return (
    <button
      type="button"
      className="border border-[#00CED1] text-[#00CED1] hover:bg-[#00CED1]/10 text-sm font-semibold px-6 py-2.5"
      style={{ borderRadius: '10px' }}
    >
      {children}
    </button>
  )
}

function Header({ title, sub, right }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="text-white/50 text-sm">{sub}</p>
      </div>
      {right && <div className="flex items-center gap-3">{right}</div>}
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

function StatCard({ label, value, delta, up }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{ backgroundColor: '#313044' }}
    >
      <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0">
        <Send size={20} className="text-[#00CED1] -rotate-12" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/60 text-xs">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-white text-xl font-bold leading-none">
            {value}
          </span>
          {delta && (
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
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   REPORT tab
============================================================ */

function ModulePerformance() {
  const segments = [
    { v: 52, color: '#FFC542' },
    { v: 34, color: '#00CED1' },
    { v: 14, color: '#FF7B7B' },
  ]
  const R = 60
  const C = 2 * Math.PI * R
  let offset = 0

  return (
    <div
      className="rounded-2xl p-6 flex-1"
      style={{ backgroundColor: '#313044' }}
    >
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
                  strokeWidth="18"
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

        <div className="flex-1">
          <h3 className="text-white text-base font-semibold mb-3">
            Module Performance
          </h3>
          <div className="flex flex-col gap-2.5">
            <Row dot="#FFC542" label="Inference" value="52%" />
            <Row dot="#00CED1" label="Theme" value="34%" />
            <Row dot="#FF7B7B" label="Vocabulary" value="14%" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ dot, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-white/70 text-sm">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: dot }}
        />
        {label}
      </span>
      <span className="text-white text-sm font-semibold">{value}</span>
    </div>
  )
}

function LearningProgressChart() {
  const bars = [
    { l: 'Intro', h: 38, active: false },
    { l: 'Self', h: 60, active: false },
    { l: 'Growth', h: 92, active: true },
    { l: 'Comm', h: 50, active: false },
    { l: 'World', h: 44, active: false },
  ]
  return (
    <div
      className="rounded-2xl p-6 flex-1"
      style={{ backgroundColor: '#313044' }}
    >
      <h3 className="text-white text-base font-semibold">
        Learning Progress Over Time
      </h3>

      <div className="mt-5 flex items-end justify-around h-[180px] gap-3">
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

const REPORT_ROWS = [
  {
    student: 'Ahmed',
    module: 'Theme',
    lesson: 'L1',
    score: '80%',
    time: '14 min',
    reteach: 'No',
    status: 'Active',
  },
  {
    student: 'Ahmed',
    module: 'Theme',
    lesson: 'L1',
    score: '80%',
    time: '14 min',
    reteach: 'Yes',
    status: 'Active',
  },
]

function DetailedTable() {
  return (
    <div
      className="rounded-2xl p-6 mt-5"
      style={{ backgroundColor: '#313044' }}
    >
      <h3 className="text-white text-lg font-semibold mb-5">Detailed Table</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-white/60 text-xs uppercase tracking-wider">
              <th className="text-left font-semibold py-3 px-4">Student</th>
              <th className="text-left font-semibold py-3 px-4">Module</th>
              <th className="text-left font-semibold py-3 px-4">Lesson</th>
              <th className="text-left font-semibold py-3 px-4">Score</th>
              <th className="text-left font-semibold py-3 px-4">Time</th>
              <th className="text-left font-semibold py-3 px-4">Reteach</th>
              <th className="text-right font-semibold py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {REPORT_ROWS.map((r, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor:
                    i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                }}
              >
                <td className="py-3.5 px-4 text-white/80">{r.student}</td>
                <td className="py-3.5 px-4 text-white/70">{r.module}</td>
                <td className="py-3.5 px-4 text-white/70">{r.lesson}</td>
                <td className="py-3.5 px-4 text-white/80">{r.score}</td>
                <td className="py-3.5 px-4 text-white/70">{r.time}</td>
                <td
                  className={
                    'py-3.5 px-4 font-semibold ' +
                    (r.reteach === 'No' ? 'text-[#FF6F6F]' : 'text-[#60D624]')
                  }
                >
                  {r.reteach}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center justify-center rounded-full border border-[#00CED1] text-[#00CED1] bg-[#00CED1]/10 px-3 py-1 text-xs font-medium">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReportView() {
  return (
    <>
      <Header
        title="Reports"
        sub="Track student performance, learning trends, and outcomes"
        right={
          <>
            <PrimaryButton>Export PDF</PrimaryButton>
            <OutlineButton>Download CSV</OutlineButton>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Avg Mastery" value="92%" delta="+8%" up />
        <StatCard label="Completion" value="80%" delta="-2%" />
        <StatCard label="Avg Time" value="14 min" delta="+11.01%" up />
        <StatCard label="Reteach Rate" value="Medium" delta="+11.01%" up />
      </div>

      <div className="flex flex-wrap gap-3 mt-5">
        <FilterPill label="Date Range" />
        <FilterPill label="Grade" />
        <FilterPill label="Module" />
        <FilterPill label="Student" />
      </div>

      <div className="flex flex-col lg:flex-row gap-5 mt-5">
        <ModulePerformance />
        <LearningProgressChart />
      </div>

      <DetailedTable />
    </>
  )
}

/* ============================================================
   ALERT tab
============================================================ */

const SUMMARY = [
  { label: 'High', count: 5, color: '#FF6F6F' },
  { label: 'Medium', count: 12, color: '#FFC542' },
  { label: 'Low', count: 28, color: '#00CED1' },
]

const ALERT_ITEM = {
  title: 'Fatima Khan showing frustration',
  desc: '"3 consecutive SEL amber signals detected"',
  time: 'Time: 10 min ago',
}

function CriticalRiskTag() {
  return (
    <span
      className="inline-flex items-center justify-center rounded text-[10px] font-semibold px-2 py-0.5"
      style={{ backgroundColor: '#FF6F6F', color: '#FFFFFF' }}
    >
      Critical Risk
    </span>
  )
}

function MediumTag() {
  return (
    <span
      className="inline-flex items-center justify-center rounded text-[10px] font-semibold px-2 py-0.5"
      style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}
    >
      Medium
    </span>
  )
}

function AlertItem({ tag, dotColor }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-start gap-2">
        <span
          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
          style={{ backgroundColor: dotColor }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-tight">
            {ALERT_ITEM.title}
          </p>
          <p className="text-white/50 text-xs mt-1">{ALERT_ITEM.desc}</p>
          <div className="flex items-center gap-2 mt-2">
            {tag}
            <span className="text-white/40 text-[11px]">{ALERT_ITEM.time}</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              className="bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-xs font-semibold px-3 py-1.5 rounded-md"
            >
              Notify Parent
            </button>
            <button
              type="button"
              className="border border-[#00CED1] text-[#00CED1] hover:bg-[#00CED1]/10 text-xs font-semibold px-3 py-1.5 rounded-md"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertColumn({ title, dotColor, items, tag }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ backgroundColor: '#313044' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <h4 className="text-white text-sm font-semibold">{title}</h4>
      </div>
      {Array.from({ length: items }).map((_, i) => (
        <AlertItem key={i} tag={tag} dotColor={dotColor} />
      ))}
    </div>
  )
}

function AlertView() {
  return (
    <>
      <Header
        title="Alert Center"
        sub="Monitor critical student signals and system events"
        right={
          <>
            <PrimaryButton>Mark all Read</PrimaryButton>
            <OutlineButton>Setting</OutlineButton>
          </>
        }
      />

      <div className="flex flex-wrap gap-3 mt-6">
        <FilterPill label="Date Range" />
        <FilterPill label="Grade" />
        <FilterPill label="Module" />
        <FilterPill label="Student" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {SUMMARY.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{ backgroundColor: '#313044' }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-white text-base">{s.label}</span>
            </div>
            <span className="text-white text-xl font-bold">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 mt-5">
        <FilterPill label="Type" />
        <FilterPill label="Priority" />
        <FilterPill label="Status" />
        <FilterPill label="Date" />
        <div className="relative ml-auto">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="search"
            placeholder="Search User"
            className="w-[260px] pl-8 pr-4 py-2 rounded-full bg-white/[0.06] text-white text-sm outline-none border border-transparent focus:border-[#00CED1]/40 placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
        <AlertColumn
          title="High Alert Feed"
          dotColor="#FF6F6F"
          items={3}
          tag={<CriticalRiskTag />}
        />
        <AlertColumn
          title="Medium"
          dotColor="#FFC542"
          items={2}
          tag={<MediumTag />}
        />
        <AlertColumn
          title="Low"
          dotColor="#00CED1"
          items={2}
          tag={<MediumTag />}
        />
      </div>
    </>
  )
}

/* ============================================================
   Page
============================================================ */

export default function Insights() {
  const [tab, setTab] = useState('REPORT')

  return (
    <SuperAdminLayout
      title="Super Admin Dashboard"
      userSubtitle="Wayfinder"
    >
      <div className="flex items-center gap-8 border-b border-white/5 -mx-6 lg:-mx-10 px-6 lg:px-10 mb-6 overflow-x-auto">
        {TABS.map((t) => {
          const active = tab === t
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={
                'pb-3 text-[13px] font-semibold tracking-wider transition-colors border-b-2 -mb-px whitespace-nowrap ' +
                (active
                  ? 'text-[#00CED1] border-[#00CED1]'
                  : 'text-white/50 border-transparent hover:text-white')
              }
            >
              {t}
            </button>
          )
        })}
      </div>

      {tab === 'REPORT' && <ReportView />}
      {tab === 'ALERT' && <AlertView />}
    </SuperAdminLayout>
  )
}
