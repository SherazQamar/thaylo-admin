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
  Settings,
  ShieldCheck,
  LifeBuoy,
  UserCircle2,
  Menu,
} from 'lucide-react'
import logo from '../assets/logo.png'

const NAV = [
  {
    label: 'DASHBOARD',
    href: '/super-admin/dashboard',
    matchPaths: ['/super-admin/dashboard'],
    Icon: LayoutDashboard,
  },
  {
    label: 'USER MANAGEMENT',
    href: '/super-admin/users',
    matchPaths: ['/super-admin/users'],
    Icon: Users,
  },
  {
    label: 'LEARNING SYSTEM',
    href: '/super-admin/learning',
    matchPaths: ['/super-admin/learning'],
    Icon: GraduationCap,
  },
  {
    label: 'CURRICULUM',
    href: '/super-admin/curriculum',
    matchPaths: ['/super-admin/curriculum'],
    Icon: BookOpen,
  },
  {
    label: 'ONBOARDING Q&A',
    href: '/super-admin/onboarding',
    matchPaths: ['/super-admin/onboarding'],
    Icon: MessageCircleQuestion,
  },
  {
    label: 'INSIGHTS',
    href: '/super-admin/insights',
    matchPaths: ['/super-admin/insights'],
    Icon: BarChart3,
  },
  {
    label: 'AI CONTROL',
    href: '/super-admin/ai',
    matchPaths: ['/super-admin/ai'],
    Icon: Cpu,
  },
  {
    label: 'BILLING & PLANS',
    href: '/super-admin/billing',
    matchPaths: ['/super-admin/billing'],
    Icon: FileText,
  },
  {
    label: 'SYSTEM SETTING',
    href: '/super-admin/settings',
    matchPaths: ['/super-admin/settings'],
    Icon: Settings,
  },
  {
    label: 'SECURITY & LOGS',
    href: '/super-admin/security',
    matchPaths: ['/super-admin/security'],
    Icon: ShieldCheck,
  },
  {
    label: 'SUPPORT',
    href: '/super-admin/support',
    matchPaths: ['/super-admin/support'],
    Icon: LifeBuoy,
  },
  {
    label: 'ACCOUNT',
    href: '/super-admin/account',
    matchPaths: ['/super-admin/account'],
    Icon: UserCircle2,
  },
]

function isActiveItem(pathname, item) {
  return item.matchPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

export default function SuperAdminSidebar() {
  const { pathname } = useLocation()

  return (
    <>
      <aside
        className="hidden md:flex h-screen sticky top-0 bg-[#313044] flex-col w-[250px] overflow-y-auto"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Logo */}
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

        {/* Navigation */}
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#111023] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Thaylo"
            width={40}
            height={40}
            className="w-8 h-8 object-contain"
          />
          <span className="text-[16px] font-medium text-white">THAYLO</span>
        </div>
        <button className="text-white/60" aria-label="Open menu">
          <Menu size={24} strokeWidth={2} />
        </button>
      </div>
    </>
  )
}
