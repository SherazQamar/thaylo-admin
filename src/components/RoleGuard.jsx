import { Navigate } from 'react-router-dom'
import { getHomePathForRole } from '../lib/portal-auth'
import { useAuthStore } from '../stores/auth.store'

/**
 * @param {{ allowedRoles: string[]; children: import('react').ReactNode }} props
 */
export default function RoleGuard({ allowedRoles, children }) {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return children
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePathForRole(user.role)} replace />
  }

  return children
}
