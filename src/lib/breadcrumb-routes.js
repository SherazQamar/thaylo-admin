const ADMIN_ROOT = { href: '/admin-dashboard', label: 'Admin Dashboard' }
const SUPER_ADMIN_ROOT = {
  href: '/super-admin/dashboard',
  label: 'Super Admin Dashboard',
}

const ADMIN_BREADCRUMBS = {
  '/admin-dashboard': [ADMIN_ROOT],
  '/parents': [ADMIN_ROOT, { href: '/parents', label: 'Parent Management' }],
  '/students': [ADMIN_ROOT, { href: '/students', label: 'Student Management' }],
  '/wayfinders': [ADMIN_ROOT, { href: '/wayfinders', label: 'Wayfinder Management' }],
  '/reports': [ADMIN_ROOT, { href: '/reports', label: 'Reports' }],
  '/alerts': [ADMIN_ROOT, { href: '/alerts', label: 'Alerts Center' }],
  '/settings': [ADMIN_ROOT, { href: '/settings', label: 'Settings' }],
}

const SUPER_ADMIN_BREADCRUMBS = {
  '/super-admin/dashboard': [SUPER_ADMIN_ROOT],
  '/super-admin/users': [
    SUPER_ADMIN_ROOT,
    { href: '/super-admin/users', label: 'User Management' },
  ],
  '/super-admin/learning': [
    SUPER_ADMIN_ROOT,
    { href: '/super-admin/learning', label: 'Learning System' },
  ],
  '/super-admin/curriculum': [
    SUPER_ADMIN_ROOT,
    { href: '/super-admin/curriculum', label: 'Curriculum' },
  ],
  '/super-admin/addenda': [
    SUPER_ADMIN_ROOT,
    { href: '/super-admin/addenda', label: 'Addenda' },
  ],
  '/super-admin/onboarding': [
    SUPER_ADMIN_ROOT,
    { href: '/super-admin/onboarding', label: 'Onboarding Q&A' },
  ],
  '/super-admin/insights': [
    SUPER_ADMIN_ROOT,
    { href: '/super-admin/insights', label: 'Insights' },
  ],
  '/super-admin/ai': [
    SUPER_ADMIN_ROOT,
    { href: '/super-admin/ai', label: 'AI Control' },
  ],
  '/super-admin/billing': [
    SUPER_ADMIN_ROOT,
    { href: '/super-admin/billing', label: 'Billing & Plans' },
  ],
  '/super-admin/security': [
    SUPER_ADMIN_ROOT,
    { href: '/super-admin/security', label: 'Security & Logs' },
  ],
  '/super-admin/support': [
    SUPER_ADMIN_ROOT,
    { href: '/super-admin/support', label: 'Support' },
  ],
  '/super-admin/account': [
    SUPER_ADMIN_ROOT,
    { href: '/super-admin/account', label: 'Account' },
  ],
}

export function getAdminBreadcrumbs(pathname) {
  return ADMIN_BREADCRUMBS[pathname] ?? null
}

export function getSuperAdminBreadcrumbs(pathname) {
  return SUPER_ADMIN_BREADCRUMBS[pathname] ?? null
}
