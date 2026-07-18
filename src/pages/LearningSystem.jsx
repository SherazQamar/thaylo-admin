import { useMemo, useState } from 'react'
import { Send, Pencil, Eye, UserRound } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'

const TABS = ['CONTENT', 'MODULE', 'LESSON']
const PAGE_SUB = 'Overview of Current Learning.'

/**
 * Module = one complete subject area within a grade (e.g. 4th ELA).
 * Demo ships a single module.
 */
const DEMO_MODULE = {
  name: '4th ELA',
  grade: '4',
  subject: 'ELA',
  lessons: 60,
  avg: '72%',
  status: 'Active',
}

/**
 * Avg completion = students who completed ÷ students who started
 * (lesson-level; module avg is the mean of its lesson completion rates).
 */
/**
 * Reteach rate = % of lesson starts that required a retake (attempt 2+).
 * Brackets: Low <15%, Medium 15–35%, High >35%.
 */
const RETEACH_BRACKETS = [
  { label: 'Low', maxExclusive: 15 },
  { label: 'Medium', maxExclusive: 36 },
  { label: 'High', maxExclusive: Infinity },
]

export function reteachBracketLabel(ratePercent) {
  const rate = Number(ratePercent)
  if (!Number.isFinite(rate)) return '—'
  const hit = RETEACH_BRACKETS.find((b) => rate < b.maxExclusive)
  return hit?.label ?? '—'
}

const FOURTH_ELA_LESSON_TITLES = [
  'Intensity Scaling',
  'Contextual Fit',
  'Negative/Positive Weight',
  'Synonym Substitution',
  'Precision Check',
  'Plot Summary',
  'Universal Truth identification',
  'Theme Extraction',
  'Abstract Categorization',
  'Cross-Story Theme',
  'Fact Sorting',
  'Claim Construction',
  'Source Integration',
  'Contrast Detection',
  'Combined Truth',
  'Sentence Labeling',
  'Length Balancing',
  'Cadence Control',
  'Complex Joining',
  'Rhythm Revision',
  'Word Choice Clues',
  'Evidence Selection',
  'Point of View Labeling',
  'Audience Intent',
  'Bias Awareness',
  'First Person Perspective',
  'Person Perspective',
  'Perspective Shifting',
  'Internal Monologue',
  'Voice Consistency',
  'Multiple Affixes',
  'Domain Root Mapping',
  'Meaning Synthesis',
  'Spelling Logic',
  'Word Transformation',
  'Tone Identification',
  'Purpose Detection',
  'Key Point Extraction',
  'Visual/Oral Link',
  'Respectful Critique',
  'Example Integration',
  'Detail Relevance',
  'Elaboration',
  'Logical Sequencing',
  'Transitioning',
  'Environment Mapping',
  'Catalyst Identification',
  'Cultural Norms',
  'Comparative Geography',
  'Global Empathy',
  'Evidence Variety',
  'Logical Connection',
  'Counter-Thought Awareness',
  'Formal Tone',
  'Closing Call',
  'Author Verification',
  'Date Check',
  'Fact vs. Ad',
  'Purpose Verification',
  'Cross-Checking',
]

const MODULE_LESSONS = FOURTH_ELA_LESSON_TITLES.map((title, index) => ({
  n: index + 1,
  name: `Lesson ${index + 1}: ${title}`,
  type: 'AI Lesson',
  duration: '15 min',
  avg: '75%',
  status: 'Active',
}))

/* ============================================================
   Atoms
============================================================ */

function StatCard({ label, value }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{ backgroundColor: '#313044' }}
    >
      <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0">
        <Send size={20} className="text-[#00CED1] -rotate-12" />
      </div>
      <div>
        <p className="text-white/60 text-xs">{label}</p>
        <p className="text-white text-xl font-bold leading-tight mt-1">{value}</p>
      </div>
    </div>
  )
}

function ActiveBadge({ children = 'Active' }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full border border-[#00CED1] text-[#00CED1] bg-[#00CED1]/10 px-3 py-1 text-xs font-medium">
      {children}
    </span>
  )
}

function Card({ title, children }) {
  return (
    <div
      className="mt-5 rounded-2xl p-6"
      style={{ backgroundColor: '#313044', borderRadius: '18px' }}
    >
      {title && <h3 className="text-white text-lg font-semibold mb-5">{title}</h3>}
      {children}
    </div>
  )
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-6 py-2.5 transition-colors"
      style={{ borderRadius: '10px' }}
    >
      {children}
    </button>
  )
}

function OutlineButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-[#00CED1] text-[#00CED1] hover:bg-[#00CED1]/10 text-sm font-semibold px-6 py-2.5 transition-colors"
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

function Th({ children, align = 'left' }) {
  return (
    <th
      className={
        'py-3 px-4 text-white/60 text-xs uppercase tracking-wider font-semibold ' +
        (align === 'right' ? 'text-right' : 'text-left')
      }
    >
      {children}
    </th>
  )
}

function Td({ children, align = 'left', className = '' }) {
  return (
    <td
      className={
        'py-3.5 px-4 text-sm ' +
        (align === 'right' ? 'text-right ' : '') +
        className
      }
    >
      {children}
    </td>
  )
}

function ActionIcons({ items, onClick }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {items.map((It, i) => (
        <button
          key={i}
          type="button"
          onClick={onClick}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[#00CED1] hover:bg-[#00CED1]/10"
          aria-label="Action"
        >
          <It size={14} strokeWidth={1.75} />
        </button>
      ))}
    </div>
  )
}

/* ============================================================
   CONTENT tab
============================================================ */

function ContentView({ onOpenModule }) {
  return (
    <>
      <Header
        title="Content"
        sub={PAGE_SUB}
        right={<PrimaryButton>Add Module</PrimaryButton>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <StatCard label="Total Modules" value="1" />
        <StatCard label="Total Lessons" value={String(DEMO_MODULE.lessons)} />
        <StatCard label="Avg Completion" value="68%" />
      </div>

      <Card title="Modules List">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr>
                <Th>Module Name</Th>
                <Th>Lessons</Th>
                <Th>Mastery Avg</Th>
                <Th>Status</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <Td className="text-white/80">{DEMO_MODULE.name}</Td>
                <Td className="text-white/70">{DEMO_MODULE.lessons}</Td>
                <Td className="text-white/70">{DEMO_MODULE.avg}</Td>
                <Td>
                  <ActiveBadge />
                </Td>
                <Td align="right">
                  <ActionIcons
                    items={[Pencil, Eye, UserRound]}
                    onClick={onOpenModule}
                  />
                </Td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

/* ============================================================
   MODULE tab
============================================================ */

function ModuleView({ onOpenLesson }) {
  return (
    <>
      <Header
        title="Module Detail View"
        sub={PAGE_SUB}
        right={
          <>
            <PrimaryButton>Edit Module</PrimaryButton>
            <OutlineButton>Add Lesson</OutlineButton>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <StatCard label="Lessons" value={String(DEMO_MODULE.lessons)} />
        <StatCard label="Avg Score" value="72%" />
        <StatCard label="Reteach Rate" value={reteachBracketLabel(22)} />
      </div>

      <Card title="Lesson List">
        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="sticky top-0 bg-[#313044]">
              <tr>
                <Th>Lesson Name</Th>
                <Th>Type</Th>
                <Th>Duration</Th>
                <Th>Avg Score</Th>
                <Th>Status</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {MODULE_LESSONS.map((l, i) => (
                <tr
                  key={l.n}
                  style={{
                    backgroundColor:
                      i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                  }}
                >
                  <Td className="text-white/80">{l.name}</Td>
                  <Td className="text-white/70">{l.type}</Td>
                  <Td className="text-white/70">{l.duration}</Td>
                  <Td className="text-white/70">{l.avg}</Td>
                  <Td>
                    <ActiveBadge />
                  </Td>
                  <Td align="right">
                    <ActionIcons
                      items={[Pencil, Eye]}
                      onClick={() => onOpenLesson?.(l)}
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

/* ============================================================
   LESSON tab
============================================================ */

const FLOW = [
  { n: 1, title: 'Teach' },
  { n: 2, title: 'Formative Check' },
  { n: 3, title: 'Reteach (if needed)' },
  { n: 4, title: 'Final Check' },
  { n: 5, title: 'Bloom Buddy (SEL)' },
]

const OBJECTIVES = [
  {
    time: '14:21:05',
    text: 'Students will identify the theme of a short passage using supporting evidence.',
  },
  {
    time: '14:19:56',
    text: '[BACKUP] Incremental snapshot #ARC-99201 completed. Verified integrity (SHA-256).',
  },
]

function LessonView({ lesson }) {
  const active = lesson ?? MODULE_LESSONS[0]

  return (
    <>
      <Header
        title={`Lesson: ${active.name.replace(/^Lesson \d+:\s*/, '')}`}
        sub={`${DEMO_MODULE.name} · Duration: ${active.duration}`}
        right={
          <>
            <PrimaryButton>Edit Lesson</PrimaryButton>
            <OutlineButton>Preview Lesson</OutlineButton>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <StatCard label="Avg Score" value="75%" />
        <StatCard label="Completion Rate" value="82%" />
        <StatCard label="Reteach Rate" value={reteachBracketLabel(22)} />
      </div>

      <Card title="Lesson Flow">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {FLOW.map((f) => (
            <div key={f.n} className="flex items-baseline gap-2">
              <span className="text-[#FFC542] text-base font-bold">{f.n}</span>
              <span className="text-white text-sm font-semibold">{f.title}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">Learning Objective</h3>
          <span className="flex items-center gap-1.5 text-[#00CED1] text-xs font-semibold tracking-wider">
            LIVE
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {OBJECTIVES.map((o, i) => (
            <div
              key={i}
              className="rounded-xl flex items-center gap-4 px-4 py-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              <span className="text-[#00CED1] text-xs font-mono shrink-0">
                [{o.time}]
              </span>
              <span className="text-white/70 text-xs">{o.text}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

/* ============================================================
   Page
============================================================ */

export default function LearningSystem() {
  const [tab, setTab] = useState('CONTENT')
  const [selectedLesson, setSelectedLesson] = useState(MODULE_LESSONS[0])

  const openModule = () => setTab('MODULE')
  const openLesson = (lesson) => {
    setSelectedLesson(lesson)
    setTab('LESSON')
  }

  const tabs = useMemo(() => TABS, [])

  return (
    <SuperAdminLayout title="Learning System" userSubtitle="Super Admin">
      <div className="flex items-center gap-8 border-b border-white/5 -mx-6 lg:-mx-10 px-6 lg:px-10 mb-6 overflow-x-auto">
        {tabs.map((t) => {
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

      {tab === 'CONTENT' && <ContentView onOpenModule={openModule} />}
      {tab === 'MODULE' && <ModuleView onOpenLesson={openLesson} />}
      {tab === 'LESSON' && <LessonView lesson={selectedLesson} />}
    </SuperAdminLayout>
  )
}
