import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Smile,
  GraduationCap,
  MessageSquare,
  FileText,
  AlertTriangle,
  UserCircle2,
  Menu,
} from 'lucide-react'
import logo from '../assets/logo.png'

const NAV = [
  {
    label: 'DASHBOARD',
    href: '/admin-dashboard',
    matchPaths: ['/admin-dashboard'],
    Icon: LayoutDashboard,
  },
  {
    label: 'PARENT',
    href: '/parents',
    matchPaths: ['/parents', '/parent'],
    Icon: Smile,
  },
  {
    label: 'STUDENTS',
    href: '/students',
    matchPaths: ['/students'],
    Icon: GraduationCap,
  },
  {
    label: 'WAYFINDERS',
    href: '/wayfinders',
    matchPaths: ['/wayfinders'],
    Icon: MessageSquare,
  },
  {
    label: 'REPORTS',
    href: '/reports',
    matchPaths: ['/reports'],
    Icon: FileText,
  },
  {
    label: 'ALERTS CENTER',
    href: '/alerts',
    matchPaths: ['/alerts'],
    Icon: AlertTriangle,
    badge: 6,
  },
  {
    label: 'SETTINGS',
    href: '/settings',
    matchPaths: ['/settings'],
    Icon: UserCircle2,
  },
]

function isActiveItem(pathname, item) {
  return item.matchPaths
    ? item.matchPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))
    : pathname === item.href
}

export default function Sidebar() {
  const { pathname } = useLocation()
  const [collapsed] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex h-screen sticky top-0 bg-[#313044] flex-col transition-all duration-300 ${
          collapsed ? 'w-[80px]' : 'w-[250px]'
        }`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Logo */}
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

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = isActiveItem(pathname, item)
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
                {item.badge && !collapsed && (
                  <span className="ml-auto min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#FF6F6F] text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                {item.badge && collapsed && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6F6F]" />
                )}
              </Link>
            )
          })}
        </nav>

      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#111023] px-4 py-3 flex items-center justify-between">
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
        <button className="text-white/60" aria-label="Open menu">
          <Menu size={24} strokeWidth={2} />
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#313044] border-t border-white/10 flex items-center justify-around px-2 py-2">
        {NAV.map((item) => {
          const active = isActiveItem(pathname, item)
          return (
            <Link
              key={item.label}
              to={item.href}
              aria-label={item.label}
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                active ? 'text-[#00CED1] bg-[#111023]' : 'text-white/40'
              }`}
            >
              <item.Icon size={22} strokeWidth={1.75} />
            </Link>
          )
        })}
      </nav>
    </>
  )
}
