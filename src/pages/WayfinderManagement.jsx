import { useState } from 'react'
import { Search, ChevronDown, Pencil, Trash2, Plus } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import AddWayfinderModal from '../components/AddWayfinderModal'

const WAYFINDERS = [
  {
    id: 1,
    name: 'Alex Filler',
    email: 'alexfiller@gmail.com',
    students: 25,
    status: 'Inactive',
    role: 'Math Coach',
    performance: 90,
  },
  {
    id: 2,
    name: 'Amenda',
    email: 'alexfiller@gmail.com',
    students: 25,
    status: 'Active',
    role: 'Lead Mentor',
    performance: 70,
  },
  {
    id: 3,
    name: 'Filler Charl',
    email: 'alexfiller@gmail.com',
    students: 25,
    status: 'Inactive',
    role: 'Counselor',
    performance: 70,
  },
  {
    id: 4,
    name: 'Mark Zaker',
    email: 'alexfiller@gmail.com',
    students: 25,
    status: 'Inactive',
    role: 'Math Coach',
    performance: 20,
  },
  {
    id: 5,
    name: 'Filler Charl',
    email: 'alexfiller@gmail.com',
    students: 0,
    status: 'Active',
    role: 'Math Coach',
    performance: 10,
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

function RoleBadge({ role }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold text-[#111023]"
      style={{ backgroundColor: '#FFC542' }}
    >
      {role}
    </span>
  )
}

function PerformanceBar({ value }) {
  return (
    <div className="min-w-[220px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-white/60 text-xs">Performance</span>
        <span className="text-white text-lg font-semibold leading-none">
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#00CED1] relative"
          style={{ width: `${value}%` }}
        >
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#00CED1] border-2 border-[#313044]" />
        </div>
      </div>
    </div>
  )
}

function WayfinderRow({ w }) {
  return (
    <div
      className="grid items-center gap-4"
      style={{
        gridTemplateColumns: '1.5fr 0.8fr 0.7fr 0.9fr 1.4fr auto',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '17px 24px',
      }}
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
        <div className="min-w-0">
          <p className="text-white text-base font-semibold leading-tight truncate">
            {w.name}
          </p>
          <p className="text-white/40 text-xs mt-0.5 truncate">{w.email}</p>
        </div>
      </div>

      {/* Students count */}
      <p className="text-[#00CED1] text-sm font-medium">
        {w.students} Students
      </p>

      {/* Status */}
      <div>
        <StatusBadge status={w.status} />
      </div>

      {/* Role */}
      <div>
        <RoleBadge role={w.role} />
      </div>

      {/* Performance */}
      <PerformanceBar value={w.performance} />

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
      </div>
    </div>
  )
}

export default function WayfinderManagement() {
  const [addOpen, setAddOpen] = useState(false)
  return (
    <AdminLayout title="Wayfinder Management" userSubtitle="Super Admin">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-white text-3xl font-bold tracking-tight">
            Wayfinder Management
          </h2>
          <p className="text-white/50 text-sm">
            Overview of Thaylo Global AI School performance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold px-5 py-2.5 transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Wayfinder
        </button>
      </div>

      {/* Directory card */}
      <div
        className="mt-6 bg-[#313044] p-6"
        style={{ borderRadius: '18px' }}
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-white text-lg font-semibold">
            Wayfinder Directory
          </h3>

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

            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/5 pl-4 pr-3 py-2 text-white/80 text-sm hover:bg-white/[0.1]"
            >
              Grade
              <ChevronDown size={14} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Rows — each its own card per Figma spec (10px gap) */}
        <div className="flex flex-col" style={{ gap: '10px' }}>
          {WAYFINDERS.map((w) => (
            <WayfinderRow key={w.id} w={w} />
          ))}
        </div>
      </div>

      <AddWayfinderModal open={addOpen} onClose={() => setAddOpen(false)} />
    </AdminLayout>
  )
}
