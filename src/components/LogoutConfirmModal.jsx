export default function LogoutConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-[680px] rounded-2xl p-10 text-center"
        style={{ backgroundColor: '#313044' }}
      >
        {/* Icon block — door + arrow-right (logout) SVG */}
        <div className="flex justify-center">
          <div
            className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,123,123,0.18)' }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF7B7B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Door frame (left side) */}
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              {/* Arrow shaft */}
              <line x1="21" y1="12" x2="9" y2="12" />
              {/* Arrow head */}
              <polyline points="16 17 21 12 16 7" />
            </svg>
          </div>
        </div>

        <h3 className="text-white text-3xl font-bold mt-6">Log out</h3>
        <p className="text-white/60 text-base mt-2">
          Are you sure? You want to logout.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="py-3.5 rounded-xl border border-[#00CED1] text-[#00CED1] text-base font-semibold hover:bg-[#00CED1]/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="py-3.5 rounded-xl bg-[#FF7B7B] hover:bg-[#ff6b6b] text-white text-base font-semibold transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
