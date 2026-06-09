import SuperAdminSidebar from './SuperAdminSidebar'
import AdminUserDropdown from './AdminUserDropdown'

export default function SuperAdminLayout({
  title = 'Super Admin Dashboard',
  children,
}) {
  return (
    <div
      className="min-h-screen flex bg-[#111023]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <SuperAdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 pt-[64px] md:pt-0 pb-[72px] md:pb-0">
        <header className="hidden md:flex h-20 px-6 lg:px-10 items-center justify-between border-b border-white/5 bg-[#111023] sticky top-0 z-30">
          <h1 className="text-white text-base lg:text-lg font-semibold uppercase tracking-[0.18em]">
            {title}
          </h1>

          <AdminUserDropdown />
        </header>

        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
