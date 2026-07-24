import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Smile,
  GraduationCap,
  MessageSquare,
  FileText,
  AlertTriangle,
  UserCircle2,
  Menu,
  X,
} from 'lucide-react'
import logo from '../assets/logo.png'
import AdminUserDropdown from './AdminUserDropdown'
import { adminQueryKeys, fetchAdminAlerts } from '../lib/admin-api'
import {
  countUnreadAdminAlerts,
  pruneAdminAlertLocalState,
} from '../lib/admin-alert-read'
import { useAuthStore } from '../stores/auth.store'

const NAV = [
  {
    label: 'DASHBOARD',
    href: '/admin-dashboard',
    matchPaths: ['/admin-dashboard'],
    Icon: LayoutDashboard,
    mobileBottom: true,
  },
  {
    label: 'PARENT',
    href: '/parents',
    matchPaths: ['/parents', '/parent'],
    Icon: Smile,
    mobileBottom: true,
  },
  {
    label: 'STUDENTS',
    href: '/students',
    matchPaths: ['/students'],
    Icon: GraduationCap,
    mobileBottom: true,
  },
  {
    label: 'WAYFINDERS',
    href: '/wayfinders',
    matchPaths: ['/wayfinders'],
    Icon: MessageSquare,
    mobileBottom: true,
  },
  {
    label: 'REPORTS',
    href: '/reports',
    matchPaths: ['/reports'],
    Icon: FileText,
    mobileBottom: false,
  },
  {
    label: 'ALERTS CENTER',
    href: '/alerts',
    matchPaths: ['/alerts'],
    Icon: AlertTriangle,
    showAlertBadge: true,
    mobileBottom: true,
  },
  {
    label: 'SETTINGS',
    href: '/settings',
    matchPaths: ['/settings'],
    Icon: UserCircle2,
    mobileBottom: false,
  },
]

function isActiveItem(pathname, item) {
  return item.matchPaths
    ? item.matchPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))
    : pathname === item.href
}

function formatBadgeCount(count) {
  if (count > 99) return '99+'
  return String(count)
}

export default function Sidebar() {
  const { pathname } = useLocation()
  const [collapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const userId = useAuthStore((s) => s.user?.id)

  const alertsQuery = useQuery({
    queryKey: adminQueryKeys.alerts(),
    queryFn: fetchAdminAlerts,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  })

  const alertCount = useMemo(() => {
    if (!alertsQuery.data) return 0
    pruneAdminAlertLocalState(userId, alertsQuery.data)
    return countUnreadAdminAlerts(alertsQuery.data, userId)
  }, [alertsQuery.data, userId])

  const mobileBottomItems = NAV.filter((item) => item.mobileBottom)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex h-screen sticky top-0 bg-[#313044] flex-col transition-all duration-300 ${
          collapsed ? 'w-[80px]' : 'w-[250px]'
        }`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="px-5 pt-6 pb-8 flex items-center gap-2.5">
          <img
            src={logo}
            alt="Thaylo"
            width={48}
            height={48}
            className={`object-contain transition-all duration-300 ${
              collapsed ? 'w-8 h-8' : 'w-10 h-10'
            }`}
          />
          {!collapsed && (
            <div className="leading-none">
              <span
                className="block text-[18px] font-medium tracking-[0.08em]"
                style={{
                  background: 'linear-gradient(90deg, #60D624, #00A19A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                THAYLO
              </span>
              <span className="block text-[7px] tracking-[0.2em] text-[#60D624]/70 uppercase mt-0.5">
                GLOBAL AI SCHOOL
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = isActiveItem(pathname, item)
            const badge =
              item.showAlertBadge && alertCount > 0 ? alertCount : null

            return (
              <Link
                key={item.label}
                to={item.href}
                className={`relative flex items-center gap-3 rounded-xl transition-all duration-200 ${
                  collapsed ? 'justify-center px-3 py-3.5' : 'px-4 py-3.5'
                } ${
                  active
                    ? 'bg-[#111023] text-[#00CED1] border-l-[5px] border-[#00CED1]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex-shrink-0">
                  <item.Icon
                    size={22}
                    strokeWidth={1.75}
                    className={active ? 'text-[#00CED1]' : 'text-white/60'}
                  />
                </span>
                {!collapsed && (
                  <span className="text-[13px] font-medium tracking-wider flex-1">
                    {item.label}
                  </span>
                )}
                {badge != null && !collapsed && (
                  <span className="ml-auto min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#FF6F6F] text-white text-[10px] font-bold flex items-center justify-center">
                    {formatBadgeCount(badge)}
                  </span>
                )}
                {badge != null && collapsed && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6F6F]" />
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#111023] px-4 pb-3 flex items-center justify-between"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Thaylo"
            width={40}
            height={40}
            className="w-8 h-8 object-contain"
          />
          <div className="leading-none">
            <span
              className="block text-[16px] font-medium tracking-[0.08em]"
              style={{
                background: 'linear-gradient(90deg, #60D624, #00A19A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              THAYLO
            </span>
            <span className="block text-[6px] tracking-[0.2em] text-[#60D624]/70 uppercase mt-0.5">
              GLOBAL AI SCHOOL
            </span>
          </div>
        </div>
        <button
          type="button"
          className="text-white/70 hover:text-white cursor-pointer p-1"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
        </button>
      </div>

      {/* Mobile slide-out menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 cursor-pointer"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute top-0 right-0 h-full w-[280px] max-w-[85vw] bg-[#313044] shadow-xl flex flex-col px-4 overflow-hidden"
            style={{
              paddingTop:
                'calc(max(0.75rem, env(safe-area-inset-top, 0px)) + 52px)',
              paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
            }}
          >
            <nav className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 pb-4">
              {NAV.map((item) => {
                const active = isActiveItem(pathname, item)
                const badge =
                  item.showAlertBadge && alertCount > 0 ? alertCount : null
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`relative flex items-center gap-3 rounded-xl px-4 py-3.5 transition-colors ${
                      active
                        ? 'bg-[#111023] text-[#00CED1]'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.Icon
                      size={22}
                      strokeWidth={1.75}
                      className={active ? 'text-[#00CED1]' : 'text-white/60'}
                    />
                    <span className="text-[13px] font-medium tracking-wider flex-1">
                      {item.label}
                    </span>
                    {badge != null && (
                      <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#FF6F6F] text-white text-[10px] font-bold flex items-center justify-center">
                        {formatBadgeCount(badge)}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
            <div className="pt-4 border-t border-white/10 shrink-0">
              <AdminUserDropdown showLabel menuPlacement="top" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation — 5 primary destinations */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111023] flex items-center justify-between px-5 pt-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
      >
        {mobileBottomItems.map((item) => {
          const active = isActiveItem(pathname, item)
          const showDot = item.showAlertBadge && alertCount > 0
          return (
            <Link
              key={item.label}
              to={item.href}
              aria-label={
                showDot ? `${item.label} (${alertCount} alerts)` : item.label
              }
              className="relative flex items-center justify-center size-8"
            >
              <item.Icon
                size={26}
                strokeWidth={1.75}
                className={active ? 'text-[#00CED1]' : 'text-white/45'}
              />
              {showDot && (
                <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#FF6F6F] text-white text-[8px] font-bold flex items-center justify-center">
                  {formatBadgeCount(alertCount)}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
