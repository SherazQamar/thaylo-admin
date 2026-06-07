import { X, ArrowRight } from 'lucide-react'

export default function AlertDetailDrawer({
  open,
  alert,
  onClose,
  onMessageParent,
}) {
  const ACTIONS = [
    { label: 'Contact assigned Wayfinder' },
    { label: 'Message parent', onClick: onMessageParent },
    { label: 'View student analytics' },
  ]
  return (
    <>
      {/* Backdrop */}
      <div
        className={
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ' +
          (open ? 'opacity-100' : 'opacity-0 pointer-events-none')
        }
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={
          'fixed top-0 right-0 z-50 h-full w-full max-w-[400px] flex flex-col transition-transform duration-300 ease-out ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
        style={{
          backgroundColor: '#313044',
          fontFamily: 'Inter, sans-serif',
        }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-white text-lg font-bold">Alert Detail</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-t border-white/5" />

        {alert && (
          <div className="px-6 py-5 flex-1 overflow-y-auto">
            {/* Title + priority */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-white text-xl font-bold leading-tight">
                {alert.title}
              </h3>
              {alert.priority && (
                <span
                  className="inline-flex items-center justify-center rounded-full border"
                  style={{
                    borderColor: alert.accent,
                    color: alert.accent,
                    backgroundColor: alert.accent + '15',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '100%',
                    padding: '5px 12px',
                  }}
                >
                  {alert.priority}
                </span>
              )}
            </div>

            <p className="text-white/40 text-xs mt-1.5">{alert.date}</p>

            <div className="border-t border-white/5 my-4" />

            <p className="text-white/70 text-sm leading-relaxed">
              {alert.text}
            </p>

            {/* Recommended actions */}
            <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider mt-6">
              Recommended Actions
            </p>

            <div className="flex flex-col gap-2 mt-3">
              {ACTIONS.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.onClick}
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left bg-white/[0.05] hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <span className="text-white text-sm">{a.label}</span>
                  <ArrowRight
                    size={16}
                    className="text-white/60 shrink-0"
                    strokeWidth={1.75}
                  />
                </button>
              ))}
            </div>

            {/* Footer buttons */}
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
        )}
      </aside>
    </>
  )
}
