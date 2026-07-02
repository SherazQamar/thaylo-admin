/**
 * Themed confirmation dialog — replaces native window.confirm in admin UI.
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   onConfirm: () => void;
 *   title: string;
 *   message: string;
 *   confirmLabel?: string;
 *   cancelLabel?: string;
 *   variant?: 'primary' | 'danger';
 *   icon?: import('react').ReactNode;
 *   isLoading?: boolean;
 * }} props
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  icon,
  isLoading = false,
}) {
  if (!open) return null

  const confirmClass =
    variant === 'danger'
      ? 'bg-[#FF7B7B] hover:bg-[#ff6b6b] text-white'
      : 'bg-[#00CED1] hover:bg-[#00B8BB] text-[#111023]'

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4"
      style={{ fontFamily: 'Inter, sans-serif' }}
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        disabled={isLoading}
        aria-label="Close dialog"
      />

      <div
        className="relative w-full max-w-[480px] rounded-2xl p-8 text-center border border-white/10 shadow-2xl"
        style={{ backgroundColor: '#313044' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
      >
        {icon && <div className="flex justify-center">{icon}</div>}

        <h3 id="confirm-modal-title" className="text-white text-2xl font-bold mt-5">
          {title}
        </h3>
        <p id="confirm-modal-message" className="text-white/60 text-sm mt-2 leading-relaxed">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-3 rounded-xl border border-[#00CED1] text-[#00CED1] text-sm font-semibold hover:bg-[#00CED1]/10 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={
              'py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ' +
              confirmClass
            }
          >
            {isLoading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
