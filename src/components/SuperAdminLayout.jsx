import { ChevronDown } from 'lucide-react'
import SuperAdminSidebar from './SuperAdminSidebar'

export default function SuperAdminLayout({
  title = 'Super Admin Dashboard',
  userSubtitle = 'Wayfinder',
  children,
}) {
  return (
    <div
      className="min-h-screen flex bg-[#111023]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <SuperAdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 pt-[64px] md:pt-0">
        <header className="hidden md:flex h-20 px-6 lg:px-10 items-center justify-between border-b border-white/5 bg-[#111023] sticky top-0 z-30">
          <h1 className="text-white text-base lg:text-lg font-semibold uppercase tracking-[0.18em]">
            {title}
          </h1>

          <button
            type="button"
            className="flex items-center gap-3 rounded-full pl-1.5 pr-3 py-1.5 hover:bg-white/5 transition-colors"
          >
            <span className="block w-9 h-9 rounded-full bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6]" />
            <span className="text-left leading-tight">
              <span className="block text-white text-[13px] font-semibold">
                Alex Filler
              </span>
              <span className="block text-white/50 text-[11px]">
                {userSubtitle}
              </span>
            </span>
            <ChevronDown size={16} className="text-white/50" />
          </button>
        </header>

        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
