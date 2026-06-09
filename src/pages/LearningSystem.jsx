import { useState } from 'react'
import { Send, Pencil, Eye, UserRound } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'

const TABS = ['CONTENT', 'MODULE', 'LESSON']

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
        <p className="text-white text-xl font-bold leading-tight mt-1">
          {value}
        </p>
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
      {title && (
        <h3 className="text-white text-lg font-semibold mb-5">{title}</h3>
      )}
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
        <h2 className="text-white text-3xl font-bold tracking-tight">
          {title}
        </h2>
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

function ActionIcons({ items }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {items.map((It, i) => (
        <button
          key={i}
          type="button"
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

const MODULES = [
  { name: 'Reading', lessons: 8, avg: '72%', status: 'Active' },
  { name: 'Reading', lessons: 8, avg: '72%', status: 'Active' },
]

function ContentView() {
  return (
    <>
      <Header
        title="Content"
        sub="Overview of Thaylo Global AI School Parent Management."
        right={<PrimaryButton>Add Module</PrimaryButton>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <StatCard label="Modules" value="6" />
        <StatCard label="total Lessons" value="42" />
        <StatCard label="Avg Completion" value="68%" />
      </div>

      <Card title="Modules List">
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
            {MODULES.map((m, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor:
                    i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                }}
              >
                <Td className="text-white/80">{m.name}</Td>
                <Td className="text-white/70">{m.lessons}</Td>
                <Td className="text-white/70">{m.avg}</Td>
                <Td>
                  <ActiveBadge />
                </Td>
                <Td align="right">
                  <ActionIcons items={[Pencil, Eye, UserRound]} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

/* ============================================================
   MODULE tab
============================================================ */

const LESSONS = [
  {
    name: 'Lesson1 :Into to theme',
    type: 'AI Lesson',
    duration: '15 min',
    avg: '75%',
    status: 'Active',
  },
  {
    name: 'Lesson1 :Into to theme',
    type: 'AI Lesson',
    duration: '15 min',
    avg: '75%',
    status: 'Active',
  },
]

function ModuleView() {
  return (
    <>
      <Header
        title="Module Detail View"
        sub="Overview of Thaylo Global AI School Parent Management."
        right={
          <>
            <PrimaryButton>Edit Module</PrimaryButton>
            <OutlineButton>Add Lesson</OutlineButton>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <StatCard label="Lesson" value="8" />
        <StatCard label="Avg Score" value="72%" />
        <StatCard label="Reteach Rate" value="Medium" />
      </div>

      <Card title="Lesson  List">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
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
            {LESSONS.map((l, i) => (
              <tr
                key={i}
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
                  <ActionIcons items={[Pencil, Eye]} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}

/* ============================================================
   LESSON tab
============================================================ */

const FLOW = [
  { n: 1, title: 'Tech AI' },
  { n: 2, title: 'Formative Check' },
  { n: 3, title: 'Reteach (if needed)' },
  { n: 4, title: 'Final Check' },
  { n: 5, title: 'Bloom Buddy (SEL)' },
]

const FLOW_DESC =
  'System triggered automatic retries for most, but 4 require manual intervention.'

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

function LessonView() {
  return (
    <>
      <Header
        title="Lesson: Intro to Theme"
        sub="Reading – Theme & Evidence : Duration: 15 mins"
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
        <StatCard label="Reteach Rate" value="Medium" />
      </div>

      <Card title="Lesson Flow">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {FLOW.map((f) => (
            <div key={f.n}>
              <div className="flex items-baseline gap-2">
                <span className="text-[#FFC542] text-base font-bold">
                  {f.n}
                </span>
                <span className="text-white text-sm font-semibold">
                  {f.title}
                </span>
              </div>
              <p className="text-white/50 text-xs mt-2 leading-relaxed">
                {FLOW_DESC}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">
            Learning Objective
          </h3>
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

      {tab === 'CONTENT' && <ContentView />}
      {tab === 'MODULE' && <ModuleView />}
      {tab === 'LESSON' && <LessonView />}
    </SuperAdminLayout>
  )
}
