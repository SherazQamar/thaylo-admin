import { useId, useState } from 'react'
import { Info } from 'lucide-react'

/**
 * @param {{ content: string; label?: string; className?: string; align?: 'left' | 'center' | 'right' }} props
 */
export default function InfoTooltip({
  content,
  label = 'More information',
  className = '',
  align = 'center',
}) {
  const tooltipId = useId()
  const [open, setOpen] = useState(false)

  const alignClass =
    align === 'left'
      ? 'left-0 translate-x-0'
      : align === 'right'
        ? 'right-0 translate-x-0'
        : 'left-1/2 -translate-x-1/2'

  return (
    <span className={`relative inline-flex align-middle ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? tooltipId : undefined}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white/45 hover:text-[#00CED1] transition-colors"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Info size={15} strokeWidth={2} />
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute top-full z-50 mt-2 w-[min(300px,calc(100vw-2rem))] rounded-xl border border-white/10 bg-[#252338] px-3 py-2.5 text-left text-xs leading-relaxed text-white/80 shadow-xl ${alignClass}`}
        >
          {content}
        </span>
      )}
    </span>
  )
}
