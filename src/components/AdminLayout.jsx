import Sidebar from './Sidebar'
import AdminUserDropdown from './AdminUserDropdown'

export default function AdminLayout({
  title = 'Admin Dashboard',
  userSubtitle,
  children,
}) {
  return (
    <div
      className="min-h-screen flex bg-[#111023]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pt-[64px] md:pt-0 pb-[72px] md:pb-0">
        {/* Top bar (desktop) */}
        <header className="hidden md:flex h-20 px-6 lg:px-10 items-center justify-between border-b border-white/5 bg-[#111023] sticky top-0 z-30">
          <h1 className="text-white text-base lg:text-lg font-semibold uppercase tracking-[0.18em]">
            {title}
          </h1>

          <AdminUserDropdown />
        </header>

        {/* Page */}
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
