import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import SuperAdminLayout from '../components/SuperAdminLayout'
import { getApiErrorMessage } from '../lib/auth-api'
import { SUBJECT_COLORS, SUBJECT_MODULES } from '../lib/subject-colors'
import {
  fetchSuperAdminDashboard,
  SUPER_DASHBOARD_POLL_INTERVAL_MS,
  superAdminQueryKeys,
} from '../lib/super-admin-api'

const QUICK = [
  { tag: 'Admin', label: 'Create Admin', href: '/super-admin/users' },
  { tag: 'Alerts', label: 'View alerts', href: '/super-admin/insights' },
  { tag: 'Setting', label: 'View System Setting', href: '/super-admin/settings' },
]

function formatDelta(changePercent) {
  if (changePercent == null) return null
  const up = changePercent >= 0
  const abs = Math.abs(changePercent)
  const label = Number.isInteger(abs) ? `${abs}%` : `${abs.toFixed(1)}%`
  return { up, label: `${up ? '+' : '-'}${label}` }
}

function StatCard({ label, value, changePercent }) {
  const delta = formatDelta(changePercent)
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: '#313044' }}>
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="text-white/60 text-xs">{label}</span>
        {delta && (
          <span
            className={
              'text-[11px] font-semibold inline-flex items-center gap-0.5 shrink-0 ' +
              (delta.up ? 'text-[#60D624]' : 'text-[#FF7B7B]')
            }
          >
            {delta.label}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d={delta.up ? 'M1 9L9 1M9 1H3M9 1V7' : 'M1 1L9 9M9 9H3M9 9V3'}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
      <p className="text-white text-2xl font-bold leading-none">{value}</p>
    </div>
  )
}

function SubjectLegend({ subjects = SUBJECT_MODULES }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-white/70">
      {subjects.map((subject) => (
        <span key={subject} className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: SUBJECT_COLORS[subject] }}
          />
          {subject}
        </span>
      ))}
    </div>
  )
}

function PlatformActivityChart({ activity }) {
  const days = activity?.days ?? []
  const maxStudents = useMemo(() => {
    let max = 1
    for (const day of days) {
      for (const subject of SUBJECT_MODULES) {
        max = Math.max(max, day.bySubject?.[subject] ?? 0)
      }
    }
    return max
  }, [days])

  const yTicks = useMemo(() => {
    const top = Math.max(1, Math.ceil(maxStudents))
    if (top <= 3) return [top, Math.max(0, top - 1), 0]
    return [top, Math.round(top / 2), 0]
  }, [maxStudents])

  const chartH = 160

  return (
    <div className="rounded-2xl p-6 flex-1" style={{ backgroundColor: '#313044' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white text-lg font-semibold">Platform Activity</h3>
          <p className="text-white/40 text-xs mt-1">
            Distinct students per subject per day
          </p>
        </div>
        <span className="text-white/60 text-xs">{activity?.rangeLabel ?? 'This Week'}</span>
      </div>

      {days.length === 0 ? (
        <p className="text-white/40 text-sm py-10 text-center">No activity this week.</p>
      ) : (
        <div className="flex">
          <div className="flex flex-col justify-between text-white/40 text-xs pr-3 py-1 h-[160px]">
            {yTicks.map((y) => (
              <span key={y}>{y}</span>
            ))}
          </div>

          <div className="flex-1">
            <div className="flex justify-around items-end h-[160px] gap-1 border-b border-white/10">
              {days.map((day) => (
                <div
                  key={day.date}
                  className="flex items-end justify-center gap-0.5 flex-1 min-w-0"
                  title={day.date}
                >
                  {SUBJECT_MODULES.map((subject) => {
                    const count = day.bySubject?.[subject] ?? 0
                    const h =
                      count <= 0
                        ? 0
                        : Math.max(4, Math.round((count / maxStudents) * chartH))
                    return (
                      <span
                        key={subject}
                        className="rounded-t-full w-[5px] sm:w-[6px] shrink-0"
                        style={{
                          backgroundColor: SUBJECT_COLORS[subject],
                          height: `${h}px`,
                          opacity: count > 0 ? 1 : 0.15,
                        }}
                        title={`${subject}: ${count} student${count === 1 ? '' : 's'}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-around text-white/40 text-xs mt-2">
              {days.map((day) => (
                <span key={day.date} className="flex-1 text-center truncate">
                  {day.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <SubjectLegend />
    </div>
  )
}

function TimeInContentAreaDonut({ segments }) {
  const visible = (segments ?? []).filter((s) => s.percent > 0)
  const R = 60
  const C = 2 * Math.PI * R
  let offset = 0

  const labelPositions = [
    { x: 80, y: 18 },
    { x: 138, y: 70 },
    { x: 125, y: 130 },
    { x: 35, y: 130 },
    { x: 22, y: 70 },
  ]

  return (
    <div className="rounded-2xl p-6 flex-1" style={{ backgroundColor: '#313044' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white text-lg font-semibold">Time in Content Area</h3>
          <p className="text-white/40 text-xs mt-1">Share of platform time by subject</p>
        </div>
        <span className="text-white/60 text-xs">This Week</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-[180px] h-[180px] shrink-0">
          {visible.length === 0 ? (
            <div className="w-full h-full rounded-full border-[22px] border-white/10 flex items-center justify-center">
              <span className="text-white/40 text-xs">No data</span>
            </div>
          ) : (
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
              {visible.map((s, i) => {
                const dash = (s.percent / 100) * C
                const circle = (
                  <circle
                    key={s.subject}
                    cx="80"
                    cy="80"
                    r={R}
                    fill="none"
                    stroke={SUBJECT_COLORS[s.subject]}
                    strokeWidth="22"
                    strokeDasharray={`${dash} ${C - dash}`}
                    strokeDashoffset={-offset}
                  />
                )
                offset += dash
                return circle
              })}
              {visible.map((s, i) => {
                if (s.percent < 8) return null
                const pos = labelPositions[i % labelPositions.length]
                return (
                  <text
                    key={`label-${s.subject}`}
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    fontSize="11"
                    fill="white"
                    fontWeight="600"
                    transform="rotate(90 80 80)"
                  >
                    {Math.round(s.percent)}%
                  </text>
                )
              })}
            </svg>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2.5">
          {SUBJECT_MODULES.map((subject) => {
            const row = segments?.find((s) => s.subject === subject)
            const percent = row?.percent ?? 0
            return (
              <span key={subject} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: SUBJECT_COLORS[subject] }}
                  />
                  {subject}
                </span>
                <span className="text-white/50 text-xs tabular-nums">
                  {percent > 0 ? `${percent}%` : '—'}
                </span>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AlertsTrendsBySubject({ rows }) {
  const maxPercent = Math.max(1, ...(rows ?? []).map((r) => r.percent))

  return (
    <div className="rounded-2xl p-6" style={{ backgroundColor: '#313044' }}>
      <div className="mb-1">
        <h3 className="text-white text-lg font-semibold">Alerts Trends by Subject</h3>
        <p className="text-white/40 text-xs mt-1">Lesson-failure alerts this week</p>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {SUBJECT_MODULES.map((subject) => {
          const row = rows?.find((r) => r.subject === subject)
          const percent = row?.percent ?? 0
          const count = row?.count ?? 0
          const width = maxPercent > 0 ? (percent / maxPercent) * 100 : 0
          return (
            <div key={subject}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-sm flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: SUBJECT_COLORS[subject] }}
                  />
                  {subject}
                </span>
                <span className="text-sm" style={{ color: SUBJECT_COLORS[subject] }}>
                  {count > 0 ? `${percent}% · ${count}` : '0%'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${width}%`,
                    backgroundColor: SUBJECT_COLORS[subject],
                    opacity: count > 0 ? 1 : 0.25,
                  }}
                />
              </div>
            </div>
          )
        })}
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
          <Link
            key={q.tag}
            to={q.href}
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
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function SuperAdminDashboard() {
  const dashboardQuery = useQuery({
    queryKey: superAdminQueryKeys.dashboard(),
    queryFn: fetchSuperAdminDashboard,
    refetchInterval: SUPER_DASHBOARD_POLL_INTERVAL_MS,
  })

  const data = dashboardQuery.data

  return (
    <SuperAdminLayout title="Super Admin Dashboard" userSubtitle="Super Admin">
      {dashboardQuery.isLoading && (
        <p className="text-white/50 text-sm py-6">Loading dashboard…</p>
      )}
      {dashboardQuery.isError && (
        <p className="text-[#FF7B7B] text-sm py-6">{getApiErrorMessage(dashboardQuery.error)}</p>
      )}

      {!dashboardQuery.isLoading && !dashboardQuery.isError && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(data?.stats ?? []).map((s) => (
              <StatCard
                key={s.key}
                label={s.label}
                value={s.displayValue}
                changePercent={s.changePercent}
              />
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-5 mt-5">
            <PlatformActivityChart activity={data?.platformActivity} />
            <TimeInContentAreaDonut segments={data?.timeInContentArea} />
          </div>

          <div className="mt-5">
            <AlertsTrendsBySubject rows={data?.alertsBySubject} />
          </div>

          <div className="mt-7">
            <QuickAccess />
          </div>
        </>
      )}
    </SuperAdminLayout>
  )
}
