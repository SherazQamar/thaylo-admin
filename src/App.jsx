import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminAuthGuard from './components/AdminAuthGuard'
import RoleGuard from './components/RoleGuard'
import AdminSignIn from './pages/AdminSignIn'
import AdminDashboard from './pages/AdminDashboard'
import ParentManagement from './pages/ParentManagement'
import WayfinderManagement from './pages/WayfinderManagement'
import StudentManagement from './pages/StudentManagement'
import StudentDetail from './pages/StudentDetail'
import Reports from './pages/Reports'
import AlertsCenter from './pages/AlertsCenter'
import AlertInsights from './pages/AlertInsights'
import Settings from './pages/Settings'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import AllUsersManagement from './pages/AllUsersManagement'
import LearningSystem from './pages/LearningSystem'
import OnboardingQA from './pages/OnboardingQA'
import CurriculumList from './pages/CurriculumList'
import CurriculumRefinement from './pages/CurriculumRefinement'
import Insights from './pages/Insights'
import AiControl from './pages/AiControl'
import BillingPlans from './pages/BillingPlans'
import SuperAdminPlaceholder from './pages/SuperAdminPlaceholder'
import SecurityLogs from './pages/SecurityLogs'
import NotFound from './pages/NotFound'
import {
  ADMIN_ONLY_ROLES,
  SUPER_ADMIN_ONLY_ROLES,
} from './lib/portal-auth'

function ProtectedRoute({ allowedRoles, children }) {
  return (
    <AdminAuthGuard>
      <RoleGuard allowedRoles={allowedRoles}>{children}</RoleGuard>
    </AdminAuthGuard>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminSignIn />} />

        {/* Admin portal */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY_ROLES}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parents"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY_ROLES}>
              <ParentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY_ROLES}>
              <StudentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/:id"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY_ROLES}>
              <StudentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wayfinders"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY_ROLES}>
              <WayfinderManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY_ROLES}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY_ROLES}>
              <AlertsCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts/insights"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY_ROLES}>
              <AlertInsights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ONLY_ROLES}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Super Admin portal */}
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/users"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <AllUsersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/learning"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <LearningSystem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/onboarding"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <OnboardingQA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/curriculum"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <CurriculumList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/curriculum/:id"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <CurriculumRefinement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/insights"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <Insights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/ai"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <AiControl />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/billing"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <BillingPlans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/settings"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <SuperAdminPlaceholder title="System Settings" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/security"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <SecurityLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/support"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <SuperAdminPlaceholder title="Support" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/account"
          element={
            <ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY_ROLES}>
              <SuperAdminPlaceholder title="Account" />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
