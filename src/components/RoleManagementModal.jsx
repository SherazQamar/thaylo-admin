import { Plus, Pencil, Trash2, Bot, User } from 'lucide-react'

const PEOPLE = [
  {
    name: 'Alex Filler',
    email: 'alexfiller@gmail.com',
    role: 'Super Admin',
    access: 'Owner (Full Access)',
    accessColor: '#FF6F6F',
    actions: false,
    avatarType: 'gradient',
  },
  {
    name: 'Alex Filler',
    email: 'alexfiller@gmail.com',
    role: 'Admin',
    access: 'Restricted Access',
    accessColor: '#00CED1',
    actions: true,
    avatarType: 'gradient',
  },
  {
    name: 'Alex Filler',
    email: 'alexfiller@gmail.com',
    role: 'Wayfinder',
    access: 'Restricted Access',
    accessColor: '#00CED1',
    actions: true,
    avatarType: 'bot',
  },
  {
    name: 'Alex Filler',
    email: 'alexfiller@gmail.com',
    role: 'Wayfinder',
    access: 'Invited',
    accessColor: '#FFFFFF',
    actions: true,
    avatarType: 'user',
  },
]

function Avatar({ type }) {
  if (type === 'gradient') {
    return (
      <div className="w-10 h-10 rounded-full shrink-0 bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
    )
  }
  if (type === 'bot') {
    return (
      <div className="w-10 h-10 rounded-full shrink-0 bg-[#1c1b2e] border border-white/10 flex items-center justify-center">
        <Bot size={18} className="text-[#00CED1]" strokeWidth={1.75} />
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-full shrink-0 bg-white/[0.08] flex items-center justify-center">
      <User size={18} className="text-white/60" strokeWidth={1.75} />
    </div>
  )
}

export default function RoleManagementModal({ open, onClose, onAdd }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-[720px] rounded-3xl p-7"
        style={{ backgroundColor: '#313044' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-white text-xl font-bold">Role Management</h3>
            <p className="text-white/50 text-sm mt-1">
              Manage system roles for all administrators and wayfinders.
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 text-[#00CED1] text-sm font-semibold hover:underline"
          >
            <span className="w-6 h-6 rounded-full bg-[#00CED1]/15 border border-[#00CED1]/40 flex items-center justify-center">
              <Plus size={14} strokeWidth={2.5} />
            </span>
            Add
          </button>
        </div>

        {/* People list */}
        <div className="flex flex-col gap-2 mt-5">
          {PEOPLE.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                padding: '12px 16px',
              }}
            >
              <Avatar type={p.avatarType} />
              <div className="flex-1 min-w-0 grid grid-cols-[1.4fr_0.8fr_auto] items-center gap-4">
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {p.name}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5 truncate">
                    {p.email}
                  </p>
                </div>
                <p className="text-[#00CED1] text-xs">{p.role}</p>
                <span
                  className="inline-flex items-center justify-center rounded-full border text-[11px] font-medium px-3 py-1 w-fit whitespace-nowrap"
                  style={{
                    borderColor: p.accessColor,
                    color: p.accessColor,
                    backgroundColor: p.accessColor + '15',
                  }}
                >
                  {p.access}
                </span>
              </div>

              {p.actions ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#00CED1] hover:bg-[#00CED1]/10"
                    aria-label="Edit"
                  >
                    <Pencil size={13} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#00CED1] hover:bg-[#00CED1]/10"
                    aria-label="Delete"
                  >
                    <Trash2 size={13} strokeWidth={1.75} />
                  </button>
                </div>
              ) : (
                <div className="w-[60px] shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-full bg-white/[0.06] text-white text-sm font-semibold hover:bg-white/[0.1] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
