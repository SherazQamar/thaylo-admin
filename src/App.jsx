import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminAuthGuard from './components/AdminAuthGuard'
import AdminSignIn from './pages/AdminSignIn'
import AdminDashboard from './pages/AdminDashboard'
import ParentManagement from './pages/ParentManagement'
import WayfinderManagement from './pages/WayfinderManagement'
import Reports from './pages/Reports'
import AlertsCenter from './pages/AlertsCenter'
import AlertInsights from './pages/AlertInsights'
import Settings from './pages/Settings'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import AllUsersManagement from './pages/AllUsersManagement'
import LearningSystem from './pages/LearningSystem'
import Insights from './pages/Insights'

function ProtectedRoute({ children }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminSignIn />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/parents" element={<ParentManagement />} />
        <Route path="/wayfinders" element={<WayfinderManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/alerts" element={<AlertsCenter />} />
        <Route path="/alerts/insights" element={<AlertInsights />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/super-admin/dashboard"
          element={<SuperAdminDashboard />}
        />
        <Route
          path="/super-admin/users"
          element={<AllUsersManagement />}
        />
        <Route
          path="/super-admin/learning"
          element={<LearningSystem />}
        />
        <Route
          path="/super-admin/insights"
          element={<Insights />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
