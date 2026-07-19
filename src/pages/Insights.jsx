import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Send, Search } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import { getApiErrorMessage } from '../lib/auth-api'
import {
  fetchSuperAdminInsights,
  superAdminQueryKeys,
} from '../lib/super-admin-api'

const TABS = ['REPORT', 'ALERT']

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
        <h2 className="text-white text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-white/50 text-sm">{sub}</p>
      </div>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/5 pl-4 pr-3 py-2 text-white/80 text-sm">
      <span className="text-white/45 text-xs uppercase tracking-wider">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-white text-sm outline-none max-w-[220px]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#313044]">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function StatCard({ label, value, hint }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{ backgroundColor: '#313044' }}
      title={hint}
    >
      <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0">
        <Send size={20} className="text-[#00CED1] -rotate-12" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/60 text-xs">{label}</p>
        <p className="text-white text-xl font-bold leading-none mt-1">{value}</p>
      </div>
    </div>
  )
}

function ModulePerformance({ families, moduleLabel, studentCount }) {
  const visible = (families ?? []).filter((f) => f.percent > 0 || f.started > 0)
  const chartSegments =
    visible.length > 0
      ? visible
      : (families ?? []).map((f) => ({ ...f, percent: 0 }))

  const totalPercent = chartSegments.reduce((sum, f) => sum + (f.percent || 0), 0)
  const normalized =
    totalPercent > 0
      ? chartSegments.map((f) => ({
          ...f,
          slice: (f.percent / totalPercent) * 100,
        }))
      : chartSegments.map((f) => ({
          ...f,
          slice: 100 / Math.max(1, chartSegments.length),
        }))

  const R = 60
  const C = 2 * Math.PI * R
  let offset = 0

  return (
    <div className="rounded-2xl p-6 flex-1" style={{ backgroundColor: '#313044' }}>
      <div className="flex items-center gap-6">
        <div className="relative w-[180px] h-[180px] shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            {normalized.map((s) => {
              const dash = (s.slice / 100) * C
              const circle = (
                <circle
                  key={s.family}
                  cx="80"
                  cy="80"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="18"
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={-offset}
                  opacity={totalPercent > 0 || s.started > 0 ? 1 : 0.35}
                />
              )
              offset += dash
              return circle
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-2xl font-bold leading-none">
              {studentCount}
            </span>
            <span className="text-white/50 text-[10px] uppercase tracking-wider mt-1">
              Starts
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white text-base font-semibold mb-1">Module Performance</h3>
          <p className="text-white/40 text-xs mb-3">
            Skill families · {moduleLabel || '4th ELA'}
          </p>
          <div className="flex flex-col gap-2.5">
            {(families ?? []).map((f) => (
              <div key={f.family} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-white/70 text-sm min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: f.color }}
                  />
                  <span className="truncate">{f.family}</span>
                </span>
                <span className="text-white text-sm font-semibold tabular-nums shrink-0">
                  {f.started > 0 ? `${f.percent}%` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HighestReteachLessons({ lessons }) {
  const rows = lessons ?? []
  const maxRate = Math.max(1, ...rows.map((l) => l.reteachRatePercent))

  return (
    <div className="rounded-2xl p-6 flex-1" style={{ backgroundColor: '#313044' }}>
      <h3 className="text-white text-base font-semibold">
        Lessons Needing Most Reteach
      </h3>
      <p className="text-white/40 text-xs mt-1 mb-5">
        Highest reteach rates within the selected module — useful for revision targeting
      </p>

      {rows.length === 0 ? (
        <p className="text-white/40 text-sm py-10 text-center">No lesson activity yet.</p>
      ) : (
        <div className="mt-2 flex items-end justify-around h-[180px] gap-2">
          {rows.map((l) => {
            const h =
              l.started === 0
                ? 8
                : Math.max(10, Math.round((l.reteachRatePercent / maxRate) * 100))
            return (
              <div
                key={l.lessonKey}
                className="flex-1 flex flex-col items-center gap-2 min-w-0"
                title={`Lesson ${l.lessonOrder}: ${l.lessonTitle} — ${l.reteachRatePercent}% reteach (${l.reteachCount}/${l.started})`}
              >
                <span className="text-[#00CED1] text-[10px] font-semibold tabular-nums">
                  {l.started > 0 ? `${Math.round(l.reteachRatePercent)}%` : '0%'}
                </span>
                <div
                  className="w-full rounded-md bg-[#00CED1]"
                  style={{
                    height: `${h}%`,
                    opacity: l.started > 0 ? 1 : 0.25,
                  }}
                />
                <span className="text-white/60 text-[10px] text-center leading-tight truncate w-full">
                  L{l.lessonOrder}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DetailedTable({ rows }) {
  return (
    <div className="rounded-2xl p-6 mt-5" style={{ backgroundColor: '#313044' }}>
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
            {(rows ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-white/40 text-sm">
                  No lesson attempts match these filters yet.
                </td>
              </tr>
            )}
            {(rows ?? []).map((r, i) => (
              <tr
                key={`${r.student}-${r.lesson}-${i}`}
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
                    (r.reteach === 'Yes' ? 'text-[#FFC542]' : 'text-[#60D624]')
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
  const [range, setRange] = useState('all')
  const [grade, setGrade] = useState('4')
  const [module, setModule] = useState('ELA')
  const [lesson, setLesson] = useState('')

  const params = useMemo(
    () => ({
      range,
      grade,
      module,
      ...(lesson ? { lesson } : {}),
    }),
    [range, grade, module, lesson],
  )

  const insightsQuery = useQuery({
    queryKey: superAdminQueryKeys.insights(params),
    queryFn: () => fetchSuperAdminInsights(params),
  })

  const data = insightsQuery.data
  const startedCount = (data?.skillFamilies ?? []).reduce(
    (sum, f) => sum + (f.started ?? 0),
    0,
  )

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

      {insightsQuery.isLoading && (
        <p className="text-white/50 text-sm mt-6">Loading insights…</p>
      )}
      {insightsQuery.isError && (
        <p className="text-[#FF7B7B] text-sm mt-6">
          {getApiErrorMessage(insightsQuery.error)}
        </p>
      )}

      {!insightsQuery.isLoading && !insightsQuery.isError && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {(data?.stats ?? []).map((s) => (
              <StatCard
                key={s.key}
                label={s.label}
                value={s.value}
                hint={s.hint}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <FilterSelect
              label="Range"
              value={range}
              onChange={setRange}
              options={[
                { value: 'all', label: 'All time' },
                { value: '7d', label: 'Last 7 days' },
                { value: '30d', label: 'Last 30 days' },
                { value: '90d', label: 'Last 90 days' },
              ]}
            />
            <FilterSelect
              label="Grade"
              value={grade}
              onChange={setGrade}
              options={(data?.filters?.grades ?? ['4']).map((g) => ({
                value: g,
                label: g === '4' ? '4th' : g,
              }))}
            />
            <FilterSelect
              label="Module"
              value={module}
              onChange={setModule}
              options={(data?.filters?.modules ?? ['ELA']).map((m) => ({
                value: m,
                label: m,
              }))}
            />
            <FilterSelect
              label="Lesson"
              value={lesson}
              onChange={setLesson}
              options={[
                { value: '', label: 'All lessons' },
                ...(data?.filters?.lessons ?? []).map((l) => ({
                  value: l.key,
                  label: l.label,
                })),
              ]}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-5 mt-5">
            <ModulePerformance
              families={data?.skillFamilies}
              moduleLabel={data?.moduleLabel}
              studentCount={startedCount}
            />
            <HighestReteachLessons lessons={data?.highestReteachLessons} />
          </div>

          <DetailedTable rows={data?.detailRows} />
        </>
      )}
    </>
  )
}

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
          <p className="text-white text-sm font-semibold leading-tight">{ALERT_ITEM.title}</p>
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
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
        <h4 className="text-white text-sm font-semibold">{title}</h4>
      </div>
      {Array.from({ length: items }).map((_, i) => (
        <AlertItem key={i} tag={tag} dotColor={dotColor} />
      ))}
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
    </button>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {SUMMARY.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{ backgroundColor: '#313044' }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-white text-base">{s.label}</span>
            </div>
            <span className="text-white text-xl font-bold">{s.count}</span>
          </div>
        ))}
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
        <AlertColumn
          title="High Alert Feed"
          dotColor="#FF6F6F"
          items={3}
          tag={<CriticalRiskTag />}
        />
        <AlertColumn title="Medium" dotColor="#FFC542" items={2} tag={<MediumTag />} />
        <AlertColumn title="Low" dotColor="#00CED1" items={2} tag={<MediumTag />} />
      </div>
    </>
  )
}

export default function Insights() {
  const [tab, setTab] = useState('REPORT')

  return (
    <SuperAdminLayout title="Insights" userSubtitle="Super Admin">
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
