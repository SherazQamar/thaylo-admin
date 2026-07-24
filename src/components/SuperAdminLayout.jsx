import { useLocation } from 'react-router-dom'
import SuperAdminSidebar from './SuperAdminSidebar'
import AdminUserDropdown from './AdminUserDropdown'
import Breadcrumbs from './Breadcrumbs'
import { getSuperAdminBreadcrumbs } from '../lib/breadcrumb-routes'

export default function SuperAdminLayout({
  title = 'Super Admin Dashboard',
  breadcrumbs,
  children,
}) {
  const { pathname } = useLocation()
  const breadcrumbItems = breadcrumbs ?? getSuperAdminBreadcrumbs(pathname)

  return (
    <div
      className="min-h-dvh flex bg-[#111023]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <SuperAdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 pt-[56px] pb-[72px] md:pt-0 md:pb-0">
        <header className="hidden md:flex h-auto min-h-20 px-6 lg:px-10 py-4 items-center justify-between border-b border-white/5 bg-[#111023] sticky top-0 z-30">
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-white text-base lg:text-lg font-semibold uppercase tracking-[0.18em]">
              {title}
            </h1>
            {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} />}
          </div>

          <AdminUserDropdown />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="md:hidden mb-5">
            <h1 className="text-white text-[15px] font-semibold uppercase tracking-[0.16em] mb-2">
              {title}
            </h1>
            {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} />}
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
