import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import AdminUserDropdown from './AdminUserDropdown'
import Breadcrumbs from './Breadcrumbs'
import { getAdminBreadcrumbs } from '../lib/breadcrumb-routes'

export default function AdminLayout({
  title = 'Admin Dashboard',
  userSubtitle: _userSubtitle,
  breadcrumbs,
  children,
}) {
  const { pathname } = useLocation()
  const breadcrumbItems = breadcrumbs ?? getAdminBreadcrumbs(pathname)

  return (
    <div
      className="min-h-screen flex bg-[#111023]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pt-[64px] md:pt-0 pb-[72px] md:pb-0">
        {/* Top bar (desktop) */}
        <header className="hidden md:flex h-auto min-h-20 px-6 lg:px-10 py-4 items-center justify-between border-b border-white/5 bg-[#111023] sticky top-0 z-30">
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-white text-base lg:text-lg font-semibold uppercase tracking-[0.18em]">
              {title}
            </h1>
            {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} />}
          </div>

          <AdminUserDropdown />
        </header>

        {/* Page */}
        <main className="flex-1 p-6 lg:p-10">
          {breadcrumbItems && (
            <div className="md:hidden mb-4">
              <Breadcrumbs items={breadcrumbItems} />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
