import { useState } from 'react'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Sprout,
} from 'lucide-react'
import AdminLayout from '../components/AdminLayout'

const PARENTS = [
  {
    id: 1,
    name: 'Alex Filler',
    email: 'alexfiller@gmail.com',
    childs: 2,
    status: 'Inactive',
    plan: 'Free Trial',
    planSub: 'Ending 7th Jun, 2026',
    children: [
      {
        name: 'Alex Filler',
        grade: 'Grade 4',
        stage: 'Plant stage 3',
        mastered: '3 of 5 mastered',
        confidence: 'Medium',
        module: 'Module: Math',
        lastActive: 'Last active: Today',
        note: 'Ayan is seeing big imrovement',
      },
      {
        name: 'Alex Filler',
        grade: 'Grade 4',
        stage: 'Plant stage 3',
        mastered: '3 of 5 mastered',
        confidence: 'Medium',
        module: 'Module: Math',
        lastActive: 'Last active: Today',
        note: 'Ayan is seeing big imrovement',
      },
    ],
  },
  {
    id: 2,
    name: 'Amenda',
    email: 'alexfiller@gmail.com',
    childs: 3,
    status: 'Active',
    plan: 'Standard Plan',
    planSub: 'Ending 7th Jun, 2026',
    children: [],
  },
  {
    id: 3,
    name: 'Filler Charl',
    email: 'alexfiller@gmail.com',
    childs: 3,
    status: 'Inactive',
    plan: 'Free Trial',
    planSub: 'Sign up 30 days left',
    children: [],
  },
  {
    id: 4,
    name: 'Mark Zaker',
    email: 'alexfiller@gmail.com',
    childs: 3,
    status: 'Inactive',
    plan: 'Free Trial',
    planSub: 'Ending 7th Jun, 2026',
    children: [],
  },
  {
    id: 5,
    name: 'Filler Charl',
    email: 'alexfiller@gmail.com',
    childs: 3,
    status: 'Active',
    plan: 'Free Trial',
    planSub: 'Ending 7th Jun, 2026',
    children: [],
  },
]

function StatusBadge({ status }) {
  const isActive = status === 'Active'
  return (
    <span
      className={
        'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium ' +
        (isActive
          ? 'border-[#00CED1] text-[#00CED1] bg-[#00CED1]/5'
          : 'border-[#FF7B7B] text-[#FF7B7B] bg-[#FF7B7B]/5')
      }
    >
      {status}
    </span>
  )
}

function PlanBox({ plan, sub }) {
  return (
    <div
      className="rounded-2xl px-5 py-2.5 text-center"
      style={{ minWidth: '180px', backgroundColor: '#525162' }}
    >
      <p className="text-white text-sm font-semibold">{plan}</p>
      <p className="text-white/60 text-xs mt-0.5">{sub}</p>
    </div>
  )
}

function OpenChatLink() {
  return (
    <button
      type="button"
      className="text-right hover:underline"
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: '13.5px',
        lineHeight: '18px',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        color: '#00CED1',
      }}
    >
      Open Chat
    </button>
  )
}

function ChildPill({ title, sub }) {
  return (
    <div
      className="rounded-2xl px-5 py-2.5 text-center"
      style={{ minWidth: '170px', backgroundColor: '#525162' }}
    >
      <p className="text-white text-sm font-semibold leading-tight whitespace-nowrap">
        {title}
      </p>
      <p className="text-white/60 text-xs mt-0.5 whitespace-nowrap">{sub}</p>
    </div>
  )
}

function ChildRow({ c }) {
  return (
    <div className="grid grid-cols-[200px_160px_180px_190px_1fr] items-center gap-4">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
        <div className="min-w-0">
          <p className="text-white text-base font-semibold leading-tight">
            {c.name}
          </p>
          <p className="text-white/40 text-sm mt-0.5">{c.grade}</p>
        </div>
      </div>

      {/* Plant stage */}
      <div className="flex items-center gap-3">
        <span
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: '#525162',
            border: '2px solid #00CED1',
          }}
        >
          <Sprout size={20} className="text-[#00CED1]" strokeWidth={1.75} />
        </span>
        <div className="leading-tight">
          <p className="text-white text-sm font-medium">{c.stage}</p>
          <p className="text-[#00CED1] text-xs mt-0.5">{c.mastered}</p>
        </div>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2">
        <div
          className="rounded-2xl px-4 py-2.5 flex items-center gap-2.5"
          style={{ backgroundColor: '#525162' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00CED1]" />
          <span className="text-white text-[11px] leading-tight">
            In Lesson
            <br />
            Confidence
          </span>
          <span
            className="rounded-full bg-[#FFC542] text-[#111023] text-[10px] font-semibold px-2 py-0.5"
            style={{ letterSpacing: '0.4px' }}
          >
            {c.confidence}
          </span>
        </div>
      </div>

      {/* Module pill */}
      <ChildPill title={c.module} sub={c.lastActive} />

      {/* Note — same lighter pill as Module pill */}
      <div
        className="rounded-2xl px-5 py-2.5 text-center"
        style={{ backgroundColor: '#525162' }}
      >
        <p className="text-white/80 text-xs leading-snug">{c.note}</p>
      </div>
    </div>
  )
}

function ParentRow({ p, expanded, onToggle }) {
  return (
    <div className={expanded ? 'pb-4' : ''}>
      {/* Main row */}
      <div
        className="grid items-center gap-4 px-5 py-4"
        style={{ gridTemplateColumns: '1.4fr 0.7fr 0.7fr 1.2fr 0.9fr auto' }}
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
          <div className="min-w-0">
            <p className="text-white text-base font-semibold leading-tight truncate">
              {p.name}
            </p>
            <p className="text-white/40 text-xs mt-0.5 truncate">{p.email}</p>
          </div>
        </div>

        {/* Childs count */}
        <p className="text-[#00CED1] text-sm font-medium">{p.childs} Childs</p>

        {/* Status */}
        <div>
          <StatusBadge status={p.status} />
        </div>

        {/* Plan */}
        <PlanBox plan={p.plan} sub={p.planSub} />

        {/* Open chat */}
        <OpenChatLink />

        {/* Actions */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#00CED1] hover:bg-[#00CED1]/10"
            aria-label="Edit"
          >
            <Pencil size={15} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#00CED1] hover:bg-[#00CED1]/10"
            aria-label="Delete"
          >
            <Trash2 size={15} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="w-8 h-8 rounded-full bg-[#00CED1]/15 border border-[#00CED1]/30 flex items-center justify-center text-[#00CED1] hover:bg-[#00CED1]/25"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronUp size={15} strokeWidth={2} />
            ) : (
              <ChevronDown size={15} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Expanded children — Figma spec: 24px radius, 24px padding, 24px gap, #FFFFFF 5% bg */}
      {expanded && p.children.length > 0 && (
        <div
          className="mx-5 mt-1 relative flex flex-col"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '24px',
            gap: '24px',
          }}
        >
          {/* Tree connector line */}
          <span className="absolute left-[-10px] top-0 bottom-0 w-px bg-white/10 hidden lg:block" />
          {p.children.map((c, i) => (
            <ChildRow key={i} c={c} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ParentManagement() {
  const [expandedId, setExpandedId] = useState(1)

  return (
    <AdminLayout title="Parent Management" userSubtitle="Super Admin">
      <div className="space-y-2">
        <h2 className="text-white text-3xl font-bold tracking-tight">
          Parent Management
        </h2>
        <p className="text-white/50 text-sm">
          Overview of Thaylo Global AI School Parent Management.
        </p>
      </div>

      {/* Directory card — Figma: radius 18px, bg #313044 */}
      <div
        className="mt-6 bg-[#313044] p-6"
        style={{ borderRadius: '18px' }}
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-white text-lg font-semibold">Parent Directory</h3>

          <div className="flex items-center gap-3">
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

            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/5 pl-4 pr-3 py-2 text-white/80 text-sm hover:bg-white/[0.1]"
            >
              Risk
              <ChevronDown size={14} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Rows — one continuous list with thin dividers */}
        <div className="flex flex-col divide-y divide-white/5">
          {PARENTS.map((p) => (
            <ParentRow
              key={p.id}
              p={p}
              expanded={expandedId === p.id}
              onToggle={() =>
                setExpandedId(expandedId === p.id ? null : p.id)
              }
            />
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
