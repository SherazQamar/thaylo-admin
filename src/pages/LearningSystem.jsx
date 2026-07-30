import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import InfoTooltip from '../components/InfoTooltip'
import { useNotifyError } from '../hooks/useNotifyError'
import {
  CURRICULUM_STATUS_LABELS,
  curriculumQueryKeys,
  fetchCurricula,
  fetchCurriculum,
} from '../lib/curriculum-api'
import {
  fetchSuperAdminInsights,
  superAdminQueryKeys,
} from '../lib/super-admin-api'

const TABS = ['CONTENT', 'MODULE', 'LESSON']

function reteachBracketLabel(ratePercent) {
  const rate = Number(ratePercent)
  if (!Number.isFinite(rate)) return '—'
  if (rate < 15) return 'Low'
  if (rate < 36) return 'Medium'
  return 'High'
}

function StatCard({ label, value, hint }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{ backgroundColor: '#313044' }}
    >
      <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0">
        <Send size={20} className="text-[#00CED1] -rotate-12" />
      </div>
      <div>
        <p className="text-white/60 text-xs inline-flex items-center gap-1.5">
          <span>{label}</span>
          {hint ? <InfoTooltip content={hint} align="left" /> : null}
        </p>
        <p className="text-white text-xl font-bold mt-1">{value}</p>
      </div>
    </div>
  )
}

function lessonCountFromCurriculum(item) {
  const lessons = item?.scriptJson?.lessons
  return Array.isArray(lessons) ? lessons.length : 0
}

export default function LearningSystem() {
  const [tab, setTab] = useState('CONTENT')
  const [selectedId, setSelectedId] = useState(null)
  const [selectedLessonKey, setSelectedLessonKey] = useState(null)

  const listQuery = useQuery({
    queryKey: curriculumQueryKeys.list({ page: 1, limit: 50 }),
    queryFn: () => fetchCurricula({ page: 1, limit: 50 }),
  })
  useNotifyError(listQuery.error, listQuery.isError)

  const detailQuery = useQuery({
    queryKey: curriculumQueryKeys.detail(selectedId),
    queryFn: () => fetchCurriculum(selectedId),
    enabled: !!selectedId,
  })

  const insightsQuery = useQuery({
    queryKey: superAdminQueryKeys.insights({ range: '30d', grade: '4', module: 'ELA' }),
    queryFn: () => fetchSuperAdminInsights({ range: '30d', grade: '4', module: 'ELA' }),
  })

  const curricula = listQuery.data?.items ?? []
  const selected = detailQuery.data ?? curricula.find((c) => c.id === selectedId) ?? null
  const lessons = useMemo(() => {
    const rows = selected?.scriptJson?.lessons
    return Array.isArray(rows) ? rows : []
  }, [selected])

  const selectedLesson =
    lessons.find((l) => (l.key || l.id || l.title) === selectedLessonKey) ?? lessons[0]

  const completionStat = insightsQuery.data?.stats?.find((s) =>
    /completion/i.test(s.label),
  )
  const reteachStat = insightsQuery.data?.stats?.find((s) => /reteach/i.test(s.label))
  const avgStat = insightsQuery.data?.stats?.find((s) => /avg|score|master/i.test(s.label))

  return (
    <SuperAdminLayout title="Learning System" userSubtitle="Super Admin">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-2">
        <div>
          <h2 className="text-white text-3xl font-bold tracking-tight">Learning System</h2>
          <p className="text-white/50 text-sm mt-1">
            Live overview of curricula, modules, and lessons from the curriculum CMS.
          </p>
        </div>
        <Link
          to="/super-admin/curriculum"
          className="rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-5 py-2.5"
        >
          Open Curriculum CMS
        </Link>
      </div>

      <div className="flex items-center gap-6 sm:gap-8 border-b border-white/5 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 mb-6 overflow-x-auto">
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

      {listQuery.isLoading ? (
        <p className="text-white/50 text-sm">Loading curricula…</p>
      ) : null}
      {listQuery.isError ? (
        <p className="text-white/50 text-sm">Unable to load curricula right now.</p>
      ) : null}

      {tab === 'CONTENT' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Avg / Mastery"
              value={avgStat?.value ?? insightsQuery.data?.stats?.[0]?.value ?? '—'}
              hint={
                avgStat?.hint ??
                'Share of finished lessons that students passed (last 30 days, Grade 4 ELA). Same measure as Insights → Report.'
              }
            />
            <StatCard
              label="Completion Rate"
              value={completionStat?.value ?? '—'}
              hint={
                completionStat?.hint ??
                'Share of started lessons that students finished (last 30 days, Grade 4 ELA).'
              }
            />
            <StatCard
              label="Reteach"
              value={
                reteachStat?.value ??
                reteachBracketLabel(
                  insightsQuery.data?.highestReteachLessons?.[0]?.reteachRatePercent,
                )
              }
              hint={
                reteachStat?.hint ??
                'How often students need another try. Low is under 15%, Medium 15–35%, High above 35%.'
              }
            />
          </div>

          <div className="mt-6 rounded-2xl p-6" style={{ backgroundColor: '#313044' }}>
            <h3 className="text-white text-lg font-semibold mb-4">Modules / Curricula</h3>
            {curricula.length === 0 ? (
              <p className="text-white/50 text-sm">
                No curricula yet. Upload content in Curriculum CMS.
              </p>
            ) : (
              <div className="space-y-2">
                {curricula.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(c.id)
                      setTab('MODULE')
                    }}
                    className="w-full text-left rounded-xl px-4 py-3 hover:bg-white/[0.04] transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-white text-sm font-semibold">{c.title}</p>
                        <p className="text-white/45 text-xs mt-1">
                          Grade {c.gradeLevel ?? '—'} · {c.subject ?? '—'} ·{' '}
                          {lessonCountFromCurriculum(c)} lessons
                        </p>
                      </div>
                      <span className="text-[#00CED1] text-xs font-semibold">
                        {CURRICULUM_STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'MODULE' && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#313044' }}>
          {!selectedId ? (
            <p className="text-white/50 text-sm">Select a curriculum from Content.</p>
          ) : detailQuery.isLoading ? (
            <p className="text-white/50 text-sm">Loading module…</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-white text-xl font-bold">{selected?.title}</h3>
                  <p className="text-white/45 text-sm mt-1">
                    Grade {selected?.gradeLevel ?? '—'} · {selected?.subject ?? '—'} ·{' '}
                    {lessons.length} lessons
                  </p>
                </div>
                <Link
                  to={`/super-admin/curriculum/${selectedId}`}
                  className="text-[#00CED1] text-sm font-semibold hover:underline"
                >
                  Refine / Edit
                </Link>
              </div>
              <div className="space-y-2">
                {lessons.map((lesson, idx) => {
                  const key = lesson.key || lesson.id || lesson.title || String(idx)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedLessonKey(key)
                        setTab('LESSON')
                      }}
                      className="w-full text-left rounded-xl px-4 py-3 hover:bg-white/[0.04]"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <p className="text-white text-sm font-semibold">
                        {idx + 1}. {lesson.title || key}
                      </p>
                      {lesson.objective || lesson.learningObjective ? (
                        <p className="text-white/45 text-xs mt-1 line-clamp-1">
                          {lesson.objective || lesson.learningObjective}
                        </p>
                      ) : null}
                    </button>
                  )
                })}
                {lessons.length === 0 ? (
                  <p className="text-white/50 text-sm">No lessons in this curriculum yet.</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'LESSON' && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#313044' }}>
          {!selectedLesson ? (
            <p className="text-white/50 text-sm">Select a lesson from Module.</p>
          ) : (
            <>
              <h3 className="text-white text-xl font-bold">
                {selectedLesson.title || selectedLesson.key || 'Lesson'}
              </h3>
              <p className="text-white/45 text-sm mt-2">
                {selectedLesson.objective ||
                  selectedLesson.learningObjective ||
                  'No learning objective provided.'}
              </p>
              {Array.isArray(selectedLesson.questions) && selectedLesson.questions.length > 0 ? (
                <div className="mt-5">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
                    Questions ({selectedLesson.questions.length})
                  </p>
                  <div className="space-y-2">
                    {selectedLesson.questions.slice(0, 8).map((q, i) => (
                      <div
                        key={q.id || i}
                        className="rounded-xl px-4 py-3 text-white/70 text-sm"
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                      >
                        {q.prompt || q.question || `Question ${i + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-sm mt-4">No questions listed for this lesson.</p>
              )}
            </>
          )}
        </div>
      )}
    </SuperAdminLayout>
  )
}
