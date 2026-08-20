import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BarChart3,
  MessageCircleQuestion,
  Cpu,
  FileText,
  BookOpen,
  Layers,
  ShieldCheck,
  LifeBuoy,
  UserCircle2,
  Menu,
  X,
} from 'lucide-react'
import logo from '../assets/logo.png'
import AdminUserDropdown from './AdminUserDropdown'

const NAV = [
  {
    label: 'DASHBOARD',
    href: '/super-admin/dashboard',
    matchPaths: ['/super-admin/dashboard'],
    Icon: LayoutDashboard,
    mobileBottom: true,
  },
  {
    label: 'USER MANAGEMENT',
    href: '/super-admin/users',
    matchPaths: ['/super-admin/users'],
    Icon: Users,
    mobileBottom: true,
  },
  {
    label: 'LEARNING SYSTEM',
    href: '/super-admin/learning',
    matchPaths: ['/super-admin/learning'],
    Icon: GraduationCap,
    mobileBottom: false,
  },
  {
    label: 'CURRICULUM',
    href: '/super-admin/curriculum',
    matchPaths: ['/super-admin/curriculum'],
    Icon: BookOpen,
    mobileBottom: true,
  },
  {
    label: 'ADDENDA',
    href: '/super-admin/addenda',
    matchPaths: ['/super-admin/addenda'],
    Icon: Layers,
    mobileBottom: false,
  },
  {
    label: 'ONBOARDING Q&A',
    href: '/super-admin/onboarding',
    matchPaths: ['/super-admin/onboarding'],
    Icon: MessageCircleQuestion,
    mobileBottom: false,
  },
  {
    label: 'INSIGHTS',
    href: '/super-admin/insights',
    matchPaths: ['/super-admin/insights'],
    Icon: BarChart3,
    mobileBottom: true,
  },
  {
    label: 'AI CONTROL',
    href: '/super-admin/ai',
    matchPaths: ['/super-admin/ai'],
    Icon: Cpu,
    mobileBottom: false,
  },
  {
    label: 'BILLING & PLANS',
    href: '/super-admin/billing',
    matchPaths: ['/super-admin/billing'],
    Icon: FileText,
    mobileBottom: false,
  },
  {
    label: 'SECURITY & LOGS',
    href: '/super-admin/security',
    matchPaths: ['/super-admin/security'],
    Icon: ShieldCheck,
    mobileBottom: false,
  },
  {
    label: 'SUPPORT',
    href: '/super-admin/support',
    matchPaths: ['/super-admin/support'],
    Icon: LifeBuoy,
    mobileBottom: false,
  },
  {
    label: 'ACCOUNT',
    href: '/super-admin/account',
    matchPaths: ['/super-admin/account'],
    Icon: UserCircle2,
    mobileBottom: true,
  },
]

function isActiveItem(pathname, item) {
  return item.matchPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

export default function SuperAdminSidebar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
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
      <aside
        className="hidden md:flex h-screen sticky top-0 bg-[#313044] flex-col w-[250px] overflow-y-auto"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="px-5 pt-6 pb-6 flex items-center gap-2.5">
          <img
            src={logo}
            alt="Thaylo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
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
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 pb-6">
          {NAV.map((item) => {
            const active = isActiveItem(pathname, item)
            return (
              <Link
                key={item.label}
                to={item.href}
                className={
                  'relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ' +
                  (active
                    ? 'bg-[#111023] text-[#00CED1] border-l-[5px] border-[#00CED1]'
                    : 'text-white/60 hover:text-white hover:bg-white/5')
                }
              >
                <item.Icon
                  size={22}
                  strokeWidth={1.75}
                  className={active ? 'text-[#00CED1]' : 'text-white/60'}
                />
                <span className="text-[12px] font-medium tracking-wider">
                  {item.label}
                </span>
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
              SUPER ADMIN
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

      {/* Mobile slide-out — full nav (many Super Admin destinations) */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 cursor-pointer"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute top-0 right-0 h-full w-[300px] max-w-[88vw] bg-[#313044] shadow-xl flex flex-col px-4 overflow-hidden"
            style={{
              paddingTop:
                'calc(max(0.75rem, env(safe-area-inset-top, 0px)) + 52px)',
              paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
            }}
          >
            <nav className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 pb-4">
              {NAV.map((item) => {
                const active = isActiveItem(pathname, item)
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`relative flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                      active
                        ? 'bg-[#111023] text-[#00CED1]'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.Icon
                      size={20}
                      strokeWidth={1.75}
                      className={active ? 'text-[#00CED1]' : 'text-white/60'}
                    />
                    <span className="text-[12px] font-medium tracking-wider">
                      {item.label}
                    </span>
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

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111023] flex items-center justify-between px-5 pt-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
      >
        {mobileBottomItems.map((item) => {
          const active = isActiveItem(pathname, item)
          return (
            <Link
              key={item.label}
              to={item.href}
              aria-label={item.label}
              className="relative flex items-center justify-center size-8"
            >
              <item.Icon
                size={26}
                strokeWidth={1.75}
                className={active ? 'text-[#00CED1]' : 'text-white/45'}
              />
            </Link>
          )
        })}
      </nav>
    </>
  )
}
