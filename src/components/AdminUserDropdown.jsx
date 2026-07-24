import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { logoutAdmin } from '../lib/auth-session'
import { useAuthStore } from '../stores/auth.store'

function formatRoleLabel(role) {
  if (role === 'SUPER_ADMIN') return 'Super Admin'
  if (role === 'ADMIN') return 'Admin'
  return role ?? 'Admin'
}

/**
 * @param {{ showLabel?: boolean, menuPlacement?: 'bottom' | 'top' }} props
 */
export default function AdminUserDropdown({
  showLabel = false,
  menuPlacement = 'bottom',
}) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const displayName = user?.name ?? 'Admin'
  const displayEmail = user?.email ?? ''
  const roleLabel = formatRoleLabel(user?.role)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    setOpen(false)
    logoutAdmin()
    navigate('/')
  }

  const menuPosition =
    menuPlacement === 'top'
      ? 'bottom-full mb-2 left-0 right-0 w-full'
      : 'right-0 top-full mt-2 w-[220px]'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-3 rounded-full hover:bg-white/5 transition-colors cursor-pointer ${
          showLabel
            ? 'w-full pl-1.5 pr-3 py-2 justify-between'
            : 'pl-1.5 pr-3 py-1.5'
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex items-center gap-3 min-w-0">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="block w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <span className="block w-9 h-9 rounded-full bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] flex-shrink-0" />
          )}
          <span className="text-left leading-tight min-w-0">
            <span className="block text-white text-[13px] font-semibold truncate">
              {displayName}
            </span>
            <span className="block text-white/50 text-[11px]">{roleLabel}</span>
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`text-white/50 transition-transform duration-200 flex-shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute ${menuPosition} rounded-xl overflow-hidden z-50 shadow-lg border border-white/10`}
          style={{ backgroundColor: '#313044' }}
          role="menu"
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white text-sm font-semibold">{displayName}</p>
            <p className="text-white/50 text-xs mt-0.5 break-all">{displayEmail}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors cursor-pointer"
            role="menuitem"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-[#EF4444] text-sm font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}
