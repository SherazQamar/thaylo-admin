import { X, ArrowRight } from 'lucide-react'

const ACTIONS = [
  'Contact assigned Wayfinder',
  'Message parent',
  'View student analytics',
]

export default function RoleManagementDrawer({ open, onClose, onActionClick }) {
  return (
    <>
      <div
        className={
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ' +
          (open ? 'opacity-100' : 'opacity-0 pointer-events-none')
        }
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={
          'fixed top-0 right-0 z-50 h-full w-full max-w-[400px] flex flex-col transition-transform duration-300 ease-out ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
        style={{ backgroundColor: '#313044', fontFamily: 'Inter, sans-serif' }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-white text-lg font-bold">Role Management</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex-1 overflow-y-auto">
          <p className="text-white/70 text-sm leading-relaxed">
            Manage system roles for all administrators
            <br />
            and wayfinders.
          </p>

          <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mt-5">
            Recommended Actions
          </p>

          <div className="flex flex-col gap-2 mt-3">
            {ACTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={onActionClick}
                className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left bg-white/[0.05] hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <span className="text-white text-sm">{a}</span>
                <ArrowRight
                  size={16}
                  className="text-white/60 shrink-0"
                  strokeWidth={1.75}
                />
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-xl border border-[#00CED1] text-[#00CED1] text-sm font-semibold hover:bg-[#00CED1]/10 transition-colors"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-xl bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023] text-sm font-semibold transition-colors"
            >
              Mark Resolved
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
