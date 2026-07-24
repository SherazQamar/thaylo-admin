import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Info } from 'lucide-react'

/**
 * Hover/focus info icon used on admin & super-admin stats.
 * Tooltip is portaled and clamped to the viewport so it stays readable on mobile.
 *
 * @param {{
 *   content: string;
 *   label?: string;
 *   className?: string;
 *   align?: 'left' | 'center' | 'right';
 * }} props
 */
const VIEWPORT_MARGIN = 16
const GAP = 8
const CLOSE_DELAY_MS = 140

export default function InfoTooltip({
  content,
  label = 'More information',
  className = '',
  align = 'center',
}) {
  const tooltipId = useId()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [coords, setCoords] = useState(null)
  const buttonRef = useRef(null)
  const tooltipRef = useRef(null)
  const rootRef = useRef(null)
  const closeTimerRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const openTooltip = useCallback(() => {
    clearCloseTimer()
    setOpen(true)
  }, [clearCloseTimer])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setOpen(false)
      closeTimerRef.current = null
    }, CLOSE_DELAY_MS)
  }, [clearCloseTimer])

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  const updatePosition = useCallback(() => {
    const button = buttonRef.current
    const tip = tooltipRef.current
    if (!button || !tip) return

    const btn = button.getBoundingClientRect()
    const tipWidth = tip.offsetWidth
    const tipHeight = tip.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight

    let left
    if (align === 'left') {
      left = btn.left
    } else if (align === 'right') {
      left = btn.right - tipWidth
    } else {
      left = btn.left + btn.width / 2 - tipWidth / 2
    }
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - tipWidth - VIEWPORT_MARGIN))

    const spaceBelow = vh - btn.bottom - GAP - VIEWPORT_MARGIN
    const spaceAbove = btn.top - GAP - VIEWPORT_MARGIN
    let top
    if (spaceBelow >= tipHeight || spaceBelow >= spaceAbove) {
      top = btn.bottom + GAP
      if (top + tipHeight > vh - VIEWPORT_MARGIN) {
        top = Math.max(VIEWPORT_MARGIN, vh - tipHeight - VIEWPORT_MARGIN)
      }
    } else {
      top = btn.top - GAP - tipHeight
      if (top < VIEWPORT_MARGIN) {
        top = VIEWPORT_MARGIN
      }
    }

    setCoords({ top, left })
  }, [align])

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null)
      return
    }

    updatePosition()
    const frame = requestAnimationFrame(updatePosition)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event) => {
      const target = event.target
      if (!target) return
      if (rootRef.current?.contains(target)) return
      if (tooltipRef.current?.contains(target)) return
      clearCloseTimer()
      setOpen(false)
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        clearCloseTimer()
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, clearCloseTimer])

  if (!content?.trim()) return null

  const tooltip =
    open && mounted
      ? createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className="fixed z-[9999] max-w-[min(320px,calc(100vw-2rem))] w-[min(320px,calc(100vw-2rem))] rounded-xl border border-white/10 bg-[#252338] px-3 py-2.5 text-left text-xs leading-relaxed text-white/80 shadow-xl"
            style={{
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              visibility: coords ? 'visible' : 'hidden',
            }}
            onMouseEnter={openTooltip}
            onMouseLeave={scheduleClose}
          >
            {content}
          </span>,
          document.body,
        )
      : null

  return (
    <span
      ref={rootRef}
      className={`relative inline-flex align-middle shrink-0 ${className}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white/45 hover:text-[#00CED1] transition-colors"
        onMouseEnter={openTooltip}
        onMouseLeave={scheduleClose}
        onFocus={openTooltip}
        onClick={(e) => {
          e.stopPropagation()
          clearCloseTimer()
          setOpen((v) => !v)
        }}
      >
        <Info size={14} strokeWidth={2} />
      </button>
      {tooltip}
    </span>
  )
}
